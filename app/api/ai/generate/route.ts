import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const {
      apiKey,
      model,
      prompt,
      variables = {},
      temperature = 0.7,
      maxTokens = 2000
    } = await req.json()

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Replace variables in the prompt
    let processedPrompt = prompt
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      processedPrompt = processedPrompt.replace(
        new RegExp(placeholder, 'g'),
        JSON.stringify(value, null, 2)
      )
    })

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Virtual Service Architect'
      },
      body: JSON.stringify({
        model: model || 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: processedPrompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenRouter API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to generate AI response', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const generatedContent = data.choices[0]?.message?.content

    if (!generatedContent) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: generatedContent,
      usage: data.usage
    })

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}