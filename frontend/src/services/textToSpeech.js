/**
 * Text-to-Speech Service
 * Handles speech synthesis for AI responses
 */

class TextToSpeechService {
  constructor() {
    this.isSupported = 'speechSynthesis' in window
    this.voices = []
    this.currentUtterance = null
    this.defaultSettings = {
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0
    }

    if (this.isSupported) {
      this.loadVoices()
      speechSynthesis.onvoiceschanged = () => this.loadVoices()
    }
  }

  loadVoices() {
    this.voices = speechSynthesis.getVoices()
    console.log('Loaded voices:', this.voices.length)
  }

  getBestVoice(language) {
    if (!this.voices.length) this.loadVoices()

    const languageMap = {
      'hi': ['hi-IN', 'hi'],
      'en': ['en-US', 'en-GB', 'en'],
      'ta': ['ta-IN', 'ta'],
      'te': ['te-IN', 'te'],
      'ml': ['ml-IN', 'ml'],
      'kn': ['kn-IN', 'kn'],
      'bn': ['bn-IN', 'bn'],
      'gu': ['gu-IN', 'gu'],
      'mr': ['mr-IN', 'mr'],
      'pa': ['pa-IN', 'pa']
    }

    const preferredLangs = languageMap[language] || ['en-US', 'en']

    // Exact match
    for (const lang of preferredLangs) {
      const voice = this.voices.find(v => v.lang === lang)
      if (voice) return voice
    }

    // Partial match
    for (const lang of preferredLangs) {
      const voice = this.voices.find(v => v.lang.startsWith(lang.split('-')[0]))
      if (voice) return voice
    }

    return this.voices.find(v => v.default) || this.voices[0] || null
  }

  async speak(text, language = 'en', settings = {}) {
    if (!this.isSupported) throw new Error('Speech synthesis is not supported')
    if (!text || !text.trim()) throw new Error('Text cannot be empty')

    this.stop()

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text.trim())
        const finalSettings = { ...this.defaultSettings, ...settings }
        utterance.rate = finalSettings.rate
        utterance.pitch = finalSettings.pitch
        utterance.volume = finalSettings.volume

        const voice = this.getBestVoice(language)
        if (voice) {
          utterance.voice = voice
          utterance.lang = voice.lang
        } else {
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
          utterance.lang = languageMap[language] || 'en-US'
        }

        utterance.onend = () => {
          this.currentUtterance = null
          resolve()
        }

        utterance.onerror = (e) => {
          this.currentUtterance = null
          reject(new Error(`Speech synthesis failed: ${e.error}`))
        }

        this.currentUtterance = utterance
        speechSynthesis.speak(utterance)
      } catch (err) {
        reject(err)
      }
    })
  }

  stop() {
    if (this.isSupported && speechSynthesis.speaking) {
      speechSynthesis.cancel()
    }
    this.currentUtterance = null
  }

  pause() {
    if (this.isSupported && speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
    }
  }

  resume() {
    if (this.isSupported && speechSynthesis.paused) {
      speechSynthesis.resume()
    }
  }

  isSpeaking() {
    return this.isSupported && speechSynthesis.speaking
  }

  isPaused() {
    return this.isSupported && speechSynthesis.paused
  }

  isTextToSpeechSupported() {
    return this.isSupported
  }

  getAvailableVoices() {
    return this.voices
  }

  getVoicesForLanguage(language) {
    const languageMap = {
      'hi': ['hi-IN', 'hi'],
      'en': ['en-US', 'en-GB', 'en'],
      'ta': ['ta-IN', 'ta'],
      'te': ['te-IN', 'te'],
      'ml': ['ml-IN', 'ml'],
      'kn': ['kn-IN', 'kn'],
      'bn': ['bn-IN', 'bn'],
      'gu': ['gu-IN', 'gu'],
      'mr': ['mr-IN', 'mr'],
      'pa': ['pa-IN', 'pa']
    }

    const targetLangs = languageMap[language] || ['en']
    return this.voices.filter(v => targetLangs.some(lang => v.lang.startsWith(lang.split('-')[0])))
  }

  setDefaultSettings(settings) {
    this.defaultSettings = { ...this.defaultSettings, ...settings }
  }

  getDefaultSettings() {
    return { ...this.defaultSettings }
  }
}

const textToSpeechService = new TextToSpeechService()
export default textToSpeechService
