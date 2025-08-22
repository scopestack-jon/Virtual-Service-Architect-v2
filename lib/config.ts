// Configuration file for ScopeStack API
export const config = {
  // Try to get API key from multiple sources
  scopeStackApiKey: (() => {
    // 1. Try environment variable first
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SCOPESTACK_API_KEY) {
      return process.env.NEXT_PUBLIC_SCOPESTACK_API_KEY
    }
    
    // 2. Try window global variable (from layout.tsx)
    if (typeof window !== 'undefined' && (window as any).SCOPESTACK_API_KEY) {
      return (window as any).SCOPESTACK_API_KEY
    }
    
    // 3. Try localStorage (for manual input)
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('SCOPESTACK_API_KEY')
      if (storedKey) {
        return storedKey
      }
    }
    
    // 4. Try window.__NEXT_DATA__ (Next.js internal)
    if (typeof window !== 'undefined' && (window as any).__NEXT_DATA__?.props?.env?.NEXT_PUBLIC_SCOPESTACK_API_KEY) {
      return (window as any).__NEXT_DATA__.props.env.NEXT_PUBLIC_SCOPESTACK_API_KEY
    }
    
    return null
  })(),
  
  scopeStackBaseUrl: "https://api.scopestack.io",
}

// Log configuration status
if (typeof window !== 'undefined') {
  console.log("🔑 ScopeStack Config:", {
    hasApiKey: !!config.scopeStackApiKey,
    keyLength: config.scopeStackApiKey?.length || 0,
    baseUrl: config.scopeStackBaseUrl,
    sources: {
      envVar: !!(typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SCOPESTACK_API_KEY),
      windowGlobal: !!(typeof window !== 'undefined' && (window as any).SCOPESTACK_API_KEY),
      localStorage: !!(typeof window !== 'undefined' && localStorage.getItem('SCOPESTACK_API_KEY')),
      nextData: !!(typeof window !== 'undefined' && (window as any).__NEXT_DATA__?.props?.env?.NEXT_PUBLIC_SCOPESTACK_API_KEY)
    }
  })
}
