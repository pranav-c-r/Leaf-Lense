/**
 * Google Speech Service
 * Enhanced speech recognition using Google Speech API (if available)
 */

class GoogleSpeechService {
  constructor() {
    this.apiKey = null // Set your Google Speech API key here if available
    this.isAvailableFlag = false
    this.supportedLanguages = [
      'hi-IN', 'en-US', 'ta-IN', 'te-IN', 'ml-IN', 'kn-IN', 
      'bn-IN', 'gu-IN', 'mr-IN', 'pa-IN'
    ]
  }

  /**
   * Check if Google Speech API is available
   */
  isAvailable() {
    // For now, return false since we don't have API key setup
    // In production, this would check for API key and connectivity
    return false && !!this.apiKey
  }

  /**
   * Initialize Google Speech API
   */
  async initialize() {
    if (!this.apiKey) {
      console.warn('Google Speech API key not configured')
      return false
    }

    try {
      // Test API connectivity (placeholder)
      // In production, make a test call to verify API access
      this.isAvailableFlag = true
      return true
    } catch (error) {
      console.error('Failed to initialize Google Speech API:', error)
      return false
    }
  }

  /**
   * Convert speech to text using Google Speech API
   * @param {Blob} audioBlob - Audio blob from microphone
   * @param {string} language - Language code
   * @returns {Promise<Object>} Transcription result
   */
  async speechToText(audioBlob, language = 'hi-IN') {
    if (!this.isAvailable()) {
      throw new Error('Google Speech API is not available')
    }

    try {
      // Convert audio blob to base64
      const base64Audio = await this.blobToBase64(audioBlob)
      
      // Prepare API request
      const requestData = {
        config: {
          encoding: 'WEBM_OPUS', // or appropriate format
          sampleRateHertz: 48000,
          languageCode: language,
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: true,
          model: 'latest_short', // or 'latest_long' for longer audio
          useEnhanced: true
        },
        audio: {
          content: base64Audio.split(',')[1] // Remove data URL prefix
        }
      }

      // Make API call
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        }
      )

      if (!response.ok) {
        throw new Error(`Google Speech API error: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.results || result.results.length === 0) {
        return {
          transcript: '',
          confidence: 0,
          alternatives: []
        }
      }

      const bestResult = result.results[0]
      const bestAlternative = bestResult.alternatives[0]

      return {
        transcript: bestAlternative.transcript,
        confidence: bestAlternative.confidence || 0,
        alternatives: bestResult.alternatives.map(alt => ({
          transcript: alt.transcript,
          confidence: alt.confidence || 0
        })),
        words: bestAlternative.words || []
      }

    } catch (error) {
      console.error('Google Speech API error:', error)
      throw new Error(`Speech recognition failed: ${error.message}`)
    }
  }

  /**
   * Convert blob to base64
   */
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return [...this.supportedLanguages]
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(language) {
    return this.supportedLanguages.includes(language)
  }

  /**
   * Set API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey
    this.isAvailableFlag = !!apiKey
  }

  /**
   * Get API key status
   */
  hasApiKey() {
    return !!this.apiKey
  }
}

// Export singleton instance
const googleSpeechService = new GoogleSpeechService()
export default googleSpeechService
