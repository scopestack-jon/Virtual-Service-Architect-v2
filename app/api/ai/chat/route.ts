import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const {
      apiKey,
      model,
      messages,
      temperature = 0.7,
      maxTokens = 1000
    } = await req.json()

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Add a system message for the VSA AI Assistant
    const systemMessage = {
      role: 'system',
      content: `You are an AI assistant for the Virtual Service Architect (VSA) platform. VSA is a project management tool for service businesses that features:

- Project management with scope, call recordings, and notes
- AI-powered project summaries and insights
- Service scope management and billing
- Call recording integration (Fireflies)
- Team collaboration tools

Help users with:
1. Understanding how to use VSA features
2. Project management best practices
3. Service scoping and estimations
4. General business consulting advice
5. Technical questions about the platform

Be helpful, professional, and concise. Focus on practical advice and actionable insights.`
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Virtual Service Architect AI Assistant'
      },
      body: JSON.stringify({
        model: model || 'anthropic/claude-3.5-sonnet',
        messages: [systemMessage, ...messages],
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
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}