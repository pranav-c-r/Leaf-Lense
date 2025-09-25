/**
 * AI Service for Agricultural Assistant
 * Handles AI queries and responses for both chatbot and voice assistant
 */

import geminiService from './geminiService.js'

class AIService {
  constructor() {
    this.apiBaseUrl = 'http://127.0.0.1:8000'
    this.weatherApiKey = null // Set your weather API key here if available
    this.isInitialized = false
  }

  /**
   * Initialize the AI service
   */
  async initialize() {
    if (this.isInitialized) return true

    try {
      // Test connection to backend
      const response = await fetch(`${this.apiBaseUrl}/`)
      if (response.ok) {
        this.isInitialized = true
        console.log('AI Service initialized successfully')
        return true
      }
    } catch (error) {
      console.warn('Backend not available, using fallback mode:', error.message)
    }

    this.isInitialized = true
    return true
  }

  /**
   * Process a query from user (text or voice)
   * @param {string} query - User's question
   * @param {string} language - Language code (hi, en, etc.)
   * @param {string} location - User's location
   * @returns {Promise<Object>} AI response with answer and metadata
   */
  async processQuery(query, language = 'en', location = 'Delhi') {
    await this.initialize()

    if (!query || !query.trim()) {
      throw new Error('Query cannot be empty')
    }

    try {
      // Try to get weather data first
      const weather = await this.getWeatherData(location)

      // Generate AI response
      const aiResponse = await this.generateAIResponse(query, language, location, weather)

      return {
        query: query.trim(),
        response: aiResponse,
        language: language,
        timestamp: new Date(),
        weather: weather,
        confidence: 0.85 // Mock confidence score
      }
    } catch (error) {
      console.error('AI processing error:', error)
      
      // Fallback response
      return {
        query: query.trim(),
        response: this.getFallbackResponse(query, language),
        language: language,
        timestamp: new Date(),
        weather: null,
        confidence: 0.6,
        isError: false
      }
    }
  }

  /**
   * Generate AI response based on query
   * @param {string} query - User's question
   * @param {string} language - Language code
   * @param {string} location - User's location
   * @param {Object} weather - Weather data
   * @returns {Promise<string>} AI response
   */
  async generateAIResponse(query, language, location, weather) {
    console.log('AIService: Generating response for:', query)
    
    // Try Gemini API first
    try {
      console.log('AIService: Attempting Gemini API...')
      await geminiService.initialize() // Force initialization
      
      if (geminiService.isAvailable()) {
        console.log('AIService: Gemini is available, making request...')
        const response = await geminiService.generateResponse(query, language, location, weather)
        console.log('AIService: Gemini response received:', response)
        return response
      } else {
        console.log('AIService: Gemini not available')
      }
    } catch (error) {
      console.warn('AIService: Gemini API error, trying backend:', error.message)
      console.error('AIService: Full Gemini error:', error)
    }

    // Try backend AI endpoint as fallback
    try {
      console.log('AIService: Attempting backend API...')
      const response = await fetch(`${this.apiBaseUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          language: language,
          location: location,
          weather: weather
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('AIService: Backend response received:', data.response)
        return data.response
      } else {
        console.log('AIService: Backend API returned error:', response.status)
      }
    } catch (error) {
      console.log('AIService: Backend AI not available, using rule-based responses', error.message)
    }

    // Final fallback to rule-based responses
    console.log('AIService: Using rule-based fallback')
    return this.getRuleBasedResponse(query, language, location, weather)
  }

  /**
   * Rule-based response generation
   * @param {string} query - User's question
   * @param {string} language - Language code
   * @param {string} location - User's location
   * @param {Object} weather - Weather data
   * @returns {string} Generated response
   */
  getRuleBasedResponse(query, language, location, weather) {
    const queryLower = query.toLowerCase()
    
    // Weather-related queries
    if (queryLower.includes('weather') || queryLower.includes('rain') || queryLower.includes('मौसम') || queryLower.includes('बारिश')) {
      if (weather && weather.current) {
        const temp = weather.current.temp_c
        const humidity = weather.current.humidity
        const condition = weather.current.condition.text
        
        if (language === 'hi') {
          return `${location} में वर्तमान मौसम: तापमान ${temp}°C, आर्द्रता ${humidity}%, मौसम ${condition}। ${this.getWeatherAdvice(queryLower, weather, 'hi')}`
        } else {
          return `Current weather in ${location}: Temperature ${temp}°C, Humidity ${humidity}%, Condition: ${condition}. ${this.getWeatherAdvice(queryLower, weather, 'en')}`
        }
      } else {
        if (language === 'hi') {
          return 'मौसम की जानकारी उपलब्ध नहीं है। कृपया स्थानीय मौसम सेवा से जांच करें।'
        } else {
          return 'Weather information is not available. Please check your local weather service.'
        }
      }
    }

    // Crop-related queries
    if (queryLower.includes('crop') || queryLower.includes('wheat') || queryLower.includes('rice') || 
        queryLower.includes('फसल') || queryLower.includes('गेहूं') || queryLower.includes('चावल')) {
      if (language === 'hi') {
        return 'फसल की देखभाल के लिए: 1) नियमित सिंचाई करें, 2) उचित मात्रा में खाद डालें, 3) कीटों से बचाव करें। अधिक जानकारी के लिए स्थानीय कृषि विशेषज्ञ से सलाह लें।'
      } else {
        return 'For crop care: 1) Maintain regular irrigation, 2) Apply proper fertilizer, 3) Protect from pests. Consult local agricultural experts for more specific advice.'
      }
    }

    // Fertilizer queries
    if (queryLower.includes('fertilizer') || queryLower.includes('खाद') || queryLower.includes('उर्वरक')) {
      if (language === 'hi') {
        return 'उर्वरक का उपयोग: NPK (नाइट्रोजन, फास्फोरस, पोटाश) का संतुलित उपयोग करें। मिट्टी की जांच कराकर उचित मात्रा निर्धारित करें। जैविक खाद का भी प्रयोग करें।'
      } else {
        return 'Fertilizer usage: Use balanced NPK (Nitrogen, Phosphorus, Potassium). Get soil tested to determine proper quantities. Also use organic manure.'
      }
    }

    // Disease/pest queries
    if (queryLower.includes('disease') || queryLower.includes('pest') || queryLower.includes('बीमारी') || queryLower.includes('कीट')) {
      if (language === 'hi') {
        return 'पौधों की बीमारी से बचाव: 1) स्वच्छ खेती करें, 2) प्रभावित पत्तियों को हटाएं, 3) आवश्यक दवा का छिड़काव करें, 4) फसल चक्र अपनाएं।'
      } else {
        return 'Disease prevention: 1) Maintain field hygiene, 2) Remove affected leaves, 3) Apply necessary pesticides, 4) Practice crop rotation.'
      }
    }

    // Harvest queries
    if (queryLower.includes('harvest') || queryLower.includes('when to cut') || queryLower.includes('कटाई') || queryLower.includes('काटना')) {
      if (language === 'hi') {
        return 'फसल कटाई का समय फसल के प्रकार पर निर्भर करता है। सामान्यतः जब अनाज पक जाए और दाने सख्त हो जाएं तो कटाई करें। मौसम साफ होने पर ही कटाई करें।'
      } else {
        return 'Harvest timing depends on crop type. Generally harvest when grains are mature and firm. Harvest only in clear weather conditions.'
      }
    }

    // Default response
    if (language === 'hi') {
      return 'मैं आपका कृषि सहायक हूं। मैं फसल, मौसम, खाद, कीट-बीमारी और खेती से जुड़े सवालों में आपकी मदद कर सकता हूं। कृपया अपना सवाल स्पष्ट रूप से पूछें।'
    } else {
      return 'I am your agricultural assistant. I can help you with crops, weather, fertilizers, pests, diseases, and farming-related questions. Please ask your question clearly.'
    }
  }

  /**
   * Get weather-specific advice
   */
  getWeatherAdvice(query, weather, language) {
    if (!weather || !weather.current) return ''

    const temp = weather.current.temp_c
    const humidity = weather.current.humidity
    const isRainy = weather.current.condition.text.toLowerCase().includes('rain')

    let advice = []

    if (temp > 35) {
      advice.push(language === 'hi' ? 'तेज गर्मी में सिंचाई बढ़ाएं' : 'Increase irrigation in high heat')
    }

    if (humidity > 80) {
      advice.push(language === 'hi' ? 'अधिक नमी से बीमारी का खतरा है' : 'High humidity may cause disease risk')
    }

    if (isRainy) {
      advice.push(language === 'hi' ? 'बारिश में खेत की जल निकासी देखें' : 'Ensure proper drainage during rain')
    }

    return advice.join('. ')
  }

  /**
   * Get weather data for location
   * @param {string} location - Location name
   * @returns {Promise<Object>} Weather data
   */
  async getWeatherData(location) {
    // For now, return mock weather data
    // In production, integrate with a weather API like OpenWeatherMap or WeatherAPI
    return {
      current: {
        temp_c: 28,
        humidity: 65,
        condition: {
          text: 'Partly Cloudy'
        }
      },
      forecast: {
        forecastday: [{
          day: {
            daily_chance_of_rain: 20
          }
        }]
      }
    }
  }

  /**
   * Get fallback response when AI processing fails
   * @param {string} query - User's question
   * @param {string} language - Language code
   * @returns {string} Fallback response
   */
  getFallbackResponse(query, language) {
    if (language === 'hi') {
      return 'क्षमा करें, मुझे आपका सवाल समझने में कुछ समस्या आ रही है। कृपया अपना सवाल दूसरे शब्दों में पूछें या किसी कृषि विशेषज्ञ से सलाह लें।'
    } else {
      return 'Sorry, I am having trouble understanding your question. Please rephrase your question or consult with a local agricultural expert.'
    }
  }

  /**
   * Detect language from text (basic implementation)
   * @param {string} text - Input text
   * @returns {string} Detected language code
   */
  detectLanguage(text) {
    // Basic language detection based on script
    const hindiPattern = /[\u0900-\u097F]/
    const tamilPattern = /[\u0B80-\u0BFF]/
    const teluguPattern = /[\u0C00-\u0C7F]/
    const malayalamPattern = /[\u0D00-\u0D7F]/
    const kannadaPattern = /[\u0C80-\u0CFF]/

    if (hindiPattern.test(text)) return 'hi'
    if (tamilPattern.test(text)) return 'ta'
    if (teluguPattern.test(text)) return 'te'
    if (malayalamPattern.test(text)) return 'ml'
    if (kannadaPattern.test(text)) return 'kn'

    return 'en' // Default to English
  }

  /**
   * Check if service is available
   * @returns {boolean} Service availability
   */
  isAvailable() {
    return this.isInitialized
  }
}

// Export singleton instance
const aiService = new AIService()
export default aiService
