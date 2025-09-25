/**
 * Voice Processor Service
 * Handles speech recognition, processing, and voice interactions
 */

import aiService from './aiService.js'
import textToSpeechService from './textToSpeech.js'

class VoiceProcessor {
  constructor() {
    this.recognition = null
    this.isListening = false
    this.currentLanguage = 'en'
    this.currentLocation = 'Delhi'
    this.callbacks = {
      onStateChange: () => {},
      onTranscription: () => {},
      onResponse: () => {},
      onError: () => {}
    }
    this.interimTranscript = ''
    this.finalTranscript = ''
    this.confidence = 0
    this.isSupported = this.checkVoiceSupport()
  }

  /**
   * Check if browser supports speech recognition
   */
  checkVoiceSupport() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }

  /**
   * Initialize speech recognition
   */
  initializeSpeechRecognition() {
    if (!this.isSupported) {
      throw new Error('Speech recognition is not supported in this browser')
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    this.recognition = new SpeechRecognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 3
    this.recognition.lang = this.getRecognitionLanguage()

    this.recognition.onstart = () => {
      this.isListening = true
      this.callbacks.onStateChange('listening')
      console.log('Speech recognition started')
    }

    this.recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''
      let confidence = 0

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript

        if (result.isFinal) {
          finalTranscript += transcript
          confidence = result[0].confidence || 0.8
        } else {
          interimTranscript += transcript
        }
      }

      this.interimTranscript = interimTranscript
      this.finalTranscript = finalTranscript
      this.confidence = confidence

      this.callbacks.onTranscription({
        interimTranscript: interimTranscript,
        finalTranscript: finalTranscript,
        isFinal: !!finalTranscript,
        confidence: confidence,
        language: this.currentLanguage,
        alternatives: this.getAlternatives(event),
        transcript: finalTranscript || interimTranscript
      })

      if (finalTranscript.trim()) {
        this.processFinalTranscript(finalTranscript.trim())
      }
    }

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      this.isListening = false
      this.callbacks.onStateChange('error')

      let errorMessage = 'Speech recognition error'
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech was detected. Please try again.'
          break
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Please check your microphone.'
          break
        case 'not-allowed':
          errorMessage = 'Microphone access was denied. Please allow microphone access.'
          break
        case 'network':
          errorMessage = 'Network error occurred during speech recognition.'
          break
        default:
          errorMessage = `Speech recognition error: ${event.error}`
      }

      this.callbacks.onError(errorMessage)
    }

    this.recognition.onend = () => {
      this.isListening = false
      this.callbacks.onStateChange('idle')
      console.log('Speech recognition ended')
    }
  }

  /**
   * Get alternative transcriptions
   */
  getAlternatives(event) {
    if (!event.results.length) return []

    const lastResult = event.results[event.results.length - 1]
    const alternatives = []

    for (let i = 0; i < Math.min(lastResult.length, 3); i++) {
      alternatives.push({
        transcript: lastResult[i].transcript,
        confidence: lastResult[i].confidence || 0
      })
    }

    return alternatives
  }

  /**
   * Get recognition language code for browser
   */
  getRecognitionLanguage() {
    const languageMap = {
      'hi': 'hi-IN',
      'en': 'en-US',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'ml': 'ml-IN',
      'kn': 'kn-IN',
      'bn': 'bn-IN',
      'gu': 'gu-IN',
      'mr': 'mr-IN',
      'pa': 'pa-IN'
    }

    return languageMap[this.currentLanguage] || 'en-US'
  }

  /**
   * Process final transcript and get AI response
   */
  async processFinalTranscript(transcript) {
    try {
      this.callbacks.onStateChange('processing')

      // Get AI response
      const aiResponse = await aiService.processQuery(
        transcript,
        this.currentLanguage,
        this.currentLocation
      )

      // Send complete response to callbacks
      this.callbacks.onResponse({
        query: transcript,
        response: aiResponse.response,
        language: aiResponse.language,
        timestamp: aiResponse.timestamp,
        weather: aiResponse.weather,
        confidence: aiResponse.confidence
      })

      // Speak the AI response
      try {
        await textToSpeechService.speak(aiResponse.response, aiResponse.language)
      } catch (error) {
        console.error('TTS playback failed:', error)
      }

      this.callbacks.onStateChange('idle')
    } catch (error) {
      console.error('Error processing transcript:', error)
      this.callbacks.onError('Failed to process your speech. Please try again.')
      this.callbacks.onStateChange('idle')
    }
  }

  /**
   * Start voice interaction
   */
  async startVoiceInteraction(options = {}) {
    if (!this.isSupported) {
      throw new Error('Speech recognition is not supported')
    }

    if (this.isListening) return

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })

      if (!this.recognition) {
        this.initializeSpeechRecognition()
      }

      if (this.recognition.lang !== this.getRecognitionLanguage()) {
        this.recognition.lang = this.getRecognitionLanguage()
      }

      this.interimTranscript = ''
      this.finalTranscript = ''

      this.recognition.start()
    } catch (error) {
      console.error('Failed to start voice interaction:', error)
      throw new Error('Failed to access microphone. Please check permissions.')
    }
  }

  /**
   * Stop voice interaction
   */
  stopVoiceInteraction() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
    this.isListening = false
    this.callbacks.onStateChange('idle')
  }

  /**
   * Set callbacks for voice events
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * Set current language
   */
  setLanguage(language) {
    this.currentLanguage = language
    if (this.recognition) {
      this.recognition.lang = this.getRecognitionLanguage()
    }
  }

  /**
   * Set current location
   */
  setLocation(location) {
    this.currentLocation = location
  }

  /**
   * Check if voice is supported
   */
  isVoiceSupported() {
    return this.isSupported
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening() {
    return this.isListening
  }

  /**
   * Get current transcripts
   */
  getCurrentTranscripts() {
    return {
      interimTranscript: this.interimTranscript,
      finalTranscript: this.finalTranscript,
      confidence: this.confidence
    }
  }
}

// Export singleton instance
const voiceProcessor = new VoiceProcessor()
export default voiceProcessor