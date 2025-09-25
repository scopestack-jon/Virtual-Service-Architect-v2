import { useState, useEffect, useRef } from 'react'

// Utility function to revive Date objects from JSON
function reviveDates(key: string, value: any): any {
  // Check if the value is a string that looks like a date
  if (typeof value === 'string') {
    // Match ISO date strings (e.g., "2024-09-20T00:00:00.000Z" or "2024-09-20")
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/

    // Also check for known date fields in our project structure
    const dateFields = ['date', 'lastUpdated', 'createdAt', 'updatedAt', 'uploadedAt']
    const isDateField = dateFields.some(field => key.toLowerCase().includes(field.toLowerCase()))

    if (dateRegex.test(value) || isDateField) {
      const date = new Date(value)
      // Only convert if it's a valid date
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }
  return value
}

export function useLocalStorage<T>(key: string, initialValue: T, debounceMs: number = 500) {
  // Ref to track if we're in initial load
  const isInitialLoad = useRef(true)
  // Ref to store debounce timer
  const debounceTimer = useRef<NodeJS.Timeout>()

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json with date revival or if none return initialValue
      return item ? JSON.parse(item, reviveDates) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Function to save to localStorage
  const saveToLocalStorage = (value: T) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
        console.log(`💾 Auto-saved ${key} to localStorage`)
      } catch (error) {
        console.warn(`Error saving to localStorage key "${key}":`, error)
      }
    }
  }

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Save state immediately
      setStoredValue(valueToStore)

      // Clear previous debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }

      // Set up debounced save to localStorage (skip during initial load)
      if (!isInitialLoad.current) {
        debounceTimer.current = setTimeout(() => {
          saveToLocalStorage(valueToStore)
        }, debounceMs)
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Auto-save effect for complex objects (debounced)
  useEffect(() => {
    if (isInitialLoad.current) {
      // Skip saving during initial load
      isInitialLoad.current = false
      return
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set up debounced save
    debounceTimer.current = setTimeout(() => {
      saveToLocalStorage(storedValue)
    }, debounceMs)

    // Cleanup function
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [storedValue, key, debounceMs])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  return [storedValue, setValue] as const
}

// Utility function to get localStorage usage info
export function getLocalStorageInfo() {
  if (typeof window === "undefined") return null

  try {
    const totalSize = JSON.stringify(localStorage).length
    const vsaProjectsSize = localStorage.getItem('vsa-projects')?.length || 0
    const vsaSelectedProjectSize = localStorage.getItem('vsa-selected-project-id')?.length || 0

    return {
      totalSize,
      vsaProjectsSize,
      vsaSelectedProjectSize,
      totalMB: (totalSize / (1024 * 1024)).toFixed(2),
      projectsMB: (vsaProjectsSize / (1024 * 1024)).toFixed(2)
    }
  } catch (error) {
    console.warn('Error getting localStorage info:', error)
    return null
  }
}

// Utility function to clear VSA data from localStorage
export function clearVSAData() {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem('vsa-projects')
    localStorage.removeItem('vsa-selected-project-id')
    console.log('🗑️ VSA localStorage data cleared')
    return true
  } catch (error) {
    console.warn('Error clearing VSA data:', error)
    return false
  }
}

// Utility function to fix corrupted VSA data with proper date restoration
export function fixCorruptedVSAData() {
  if (typeof window === "undefined") return false

  try {
    const projectsData = localStorage.getItem('vsa-projects')
    if (projectsData) {
      // Try to parse and re-save with proper date revival
      const projects = JSON.parse(projectsData, reviveDates)
      localStorage.setItem('vsa-projects', JSON.stringify(projects))
      console.log('🔧 Fixed VSA projects data with proper date objects')
    }

    window.location.reload() // Reload to pick up the fixed data
    return true
  } catch (error) {
    console.warn('Error fixing corrupted VSA data:', error)
    // If still corrupted, clear it entirely
    clearVSAData()
    window.location.reload()
    return false
  }
}