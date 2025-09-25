/**
 * Transcript Logger Service
 * Handles logging and analytics for voice conversations
 */

class TranscriptLogger {
  constructor() {
    this.sessions = []
    this.currentSession = null
    this.isEnabled = true
    this.maxSessions = 10 // Keep only last 10 sessions in memory
    this.storageKey = 'leaflense-voice-sessions'
    
    // Load previous sessions from localStorage
    this.loadFromStorage()
  }

  /**
   * Start a new conversation session
   */
  startSession(userId = 'anonymous', metadata = {}) {
    this.currentSession = {
      id: this.generateSessionId(),
      userId: userId,
      startTime: new Date(),
      endTime: null,
      interactions: [],
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform
      },
      analytics: {
        totalInteractions: 0,
        totalTranscriptionTime: 0,
        averageConfidence: 0,
        languagesUsed: new Set(),
        errors: []
      }
    }

    console.log('Started voice session:', this.currentSession.id)
    return this.currentSession.id
  }

  /**
   * End the current session
   */
  endSession() {
    if (!this.currentSession) return

    this.currentSession.endTime = new Date()
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime
    
    // Calculate final analytics
    this.calculateSessionAnalytics()
    
    // Add to sessions list
    this.sessions.push(this.currentSession)
    
    // Limit sessions in memory
    if (this.sessions.length > this.maxSessions) {
      this.sessions = this.sessions.slice(-this.maxSessions)
    }
    
    // Save to storage
    this.saveToStorage()
    
    console.log('Ended voice session:', this.currentSession.id, 'Duration:', this.currentSession.duration / 1000, 'seconds')
    this.currentSession = null
  }

  /**
   * Log user input (speech recognition result)
   */
  logUserInput(transcription) {
    if (!this.currentSession || !this.isEnabled) return

    const interaction = {
      id: this.generateInteractionId(),
      timestamp: new Date(),
      type: 'user_input',
      data: {
        transcript: transcription.transcript || transcription.finalTranscript,
        interimTranscript: transcription.interimTranscript,
        confidence: transcription.confidence || 0,
        language: transcription.language || 'unknown',
        alternatives: transcription.alternatives || [],
        isFinal: transcription.isFinal || false
      }
    }

    this.currentSession.interactions.push(interaction)
    this.currentSession.analytics.totalInteractions++
    
    if (interaction.data.language) {
      this.currentSession.analytics.languagesUsed.add(interaction.data.language)
    }

    console.log('Logged user input:', interaction.data.transcript)
  }

  /**
   * Log AI response
   */
  logAIResponse(response, query = '') {
    if (!this.currentSession || !this.isEnabled) return

    const interaction = {
      id: this.generateInteractionId(),
      timestamp: new Date(),
      type: 'ai_response',
      data: {
        query: query,
        response: response.response || response,
        language: response.language || 'unknown',
        confidence: response.confidence || 0,
        processingTime: response.processingTime || 0,
        weather: response.weather || null
      }
    }

    this.currentSession.interactions.push(interaction)
    
    if (interaction.data.language) {
      this.currentSession.analytics.languagesUsed.add(interaction.data.language)
    }

    console.log('Logged AI response:', interaction.data.response?.substring(0, 50) + '...')
  }

  /**
   * Log error
   */
  logError(error, metadata = {}) {
    if (!this.currentSession || !this.isEnabled) return

    const errorLog = {
      id: this.generateInteractionId(),
      timestamp: new Date(),
      type: 'error',
      data: {
        message: typeof error === 'string' ? error : error.message,
        stack: error.stack || '',
        code: error.code || '',
        metadata: metadata
      }
    }

    this.currentSession.interactions.push(errorLog)
    this.currentSession.analytics.errors.push(errorLog)

    console.error('Logged error:', errorLog.data.message)
  }

  /**
   * Calculate session analytics
   */
  calculateSessionAnalytics() {
    if (!this.currentSession) return

    const interactions = this.currentSession.interactions
    const userInputs = interactions.filter(i => i.type === 'user_input')
    
    if (userInputs.length > 0) {
      const totalConfidence = userInputs.reduce((sum, input) => sum + (input.data.confidence || 0), 0)
      this.currentSession.analytics.averageConfidence = totalConfidence / userInputs.length
    }

    this.currentSession.analytics.languagesUsed = Array.from(this.currentSession.analytics.languagesUsed)
  }

  /**
   * Get current session analytics
   */
  getCurrentSessionAnalytics() {
    if (!this.currentSession) return null

    this.calculateSessionAnalytics()
    return {
      sessionId: this.currentSession.id,
      duration: Date.now() - this.currentSession.startTime.getTime(),
      totalInteractions: this.currentSession.analytics.totalInteractions,
      averageConfidence: this.currentSession.analytics.averageConfidence,
      languagesUsed: this.currentSession.analytics.languagesUsed,
      errorCount: this.currentSession.analytics.errors.length
    }
  }

  /**
   * Get all sessions analytics
   */
  getAnalytics() {
    const allSessions = [...this.sessions]
    if (this.currentSession) {
      allSessions.push(this.currentSession)
    }

    if (allSessions.length === 0) {
      return {
        totalSessions: 0,
        totalInteractions: 0,
        averageConfidence: 0,
        totalDuration: 0,
        languagesUsed: [],
        totalErrors: 0
      }
    }

    const totalSessions = allSessions.length
    let totalInteractions = 0
    let totalConfidence = 0
    let totalDuration = 0
    let allLanguages = new Set()
    let totalErrors = 0
    let confidenceCount = 0

    allSessions.forEach(session => {
      totalInteractions += session.analytics.totalInteractions
      totalErrors += session.analytics.errors.length
      
      if (session.duration) {
        totalDuration += session.duration
      }

      session.analytics.languagesUsed.forEach(lang => allLanguages.add(lang))

      // Calculate confidence from user inputs
      const userInputs = session.interactions.filter(i => i.type === 'user_input')
      userInputs.forEach(input => {
        if (input.data.confidence !== undefined) {
          totalConfidence += input.data.confidence
          confidenceCount++
        }
      })
    })

    return {
      totalSessions,
      totalInteractions,
      averageConfidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0,
      totalDuration,
      averageSessionDuration: totalSessions > 0 ? totalDuration / totalSessions : 0,
      languagesUsed: Array.from(allLanguages),
      totalErrors
    }
  }

  /**
   * Export session data
   */
  exportSessions(format = 'json') {
    const data = {
      exportDate: new Date().toISOString(),
      sessions: this.sessions.map(session => ({
        ...session,
        analytics: {
          ...session.analytics,
          languagesUsed: Array.from(session.analytics.languagesUsed)
        }
      }))
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    }

    // Could add CSV export here
    return data
  }

  /**
   * Clear all sessions
   */
  clearAllSessions() {
    this.sessions = []
    this.currentSession = null
    localStorage.removeItem(this.storageKey)
    console.log('Cleared all voice sessions')
  }

  /**
   * Load sessions from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        this.sessions = data.sessions || []
        console.log('Loaded', this.sessions.length, 'voice sessions from storage')
      }
    } catch (error) {
      console.error('Failed to load voice sessions from storage:', error)
    }
  }

  /**
   * Save sessions to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        lastUpdated: new Date().toISOString(),
        sessions: this.sessions.map(session => ({
          ...session,
          analytics: {
            ...session.analytics,
            languagesUsed: Array.from(session.analytics.languagesUsed)
          }
        }))
      }
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save voice sessions to storage:', error)
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate unique interaction ID
   */
  generateInteractionId() {
    return `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    console.log('Voice session logging', enabled ? 'enabled' : 'disabled')
  }

  /**
   * Check if logging is enabled
   */
  isLoggingEnabled() {
    return this.isEnabled
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    return this.sessions.find(session => session.id === sessionId)
  }

  /**
   * Get current session
   */
  getCurrentSession() {
    return this.currentSession
  }

  /**
   * Get all sessions
   */
  getAllSessions() {
    return [...this.sessions]
  }
}

// Export singleton instance
const transcriptLogger = new TranscriptLogger()
export default transcriptLogger
