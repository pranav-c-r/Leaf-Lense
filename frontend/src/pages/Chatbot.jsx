import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Bot, User, Sparkles } from 'lucide-react'
import aiService from '../services/aiService.js'
import { useLanguage } from '../contexts/LanguageContext'

const Chatbot = () => {
  const { t, currentLanguage } = useLanguage()
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: t('chatbotWelcome'),
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const userQuery = input
    setInput('')
    setIsTyping(true)

    try {
      // Call AI service
      const aiResponse = await aiService.processQuery(userQuery, currentLanguage, 'Delhi')
      
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: aiResponse.response,
        timestamp: new Date(),
        weather: aiResponse.weather
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('AI service error:', error)
      
      // Fallback response
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      }

      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickQuestions = [
    t('howToImproveYield'),
    t('whatFertilizerForWheat'),
    t('howToPreventDiseases'),
    t('bestTimeToHarvest'),
    t('howMuchWater')
  ]

  const handleQuickQuestion = (question) => {
    setInput(question)
  }

  return (
    <div className="p-6 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{t('chatbotTitle')}</h1>
            <p className="text-slate-400">{t('chatbotSubtitle')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Sparkles className="h-5 w-5 animate-pulse text-emerald-400" />
          <span className="text-sm">{t('alwaysLearning')}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'bot' 
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
                {message.type === 'bot' ? (
                  <Bot className="h-4 w-4 text-white" />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              
              <div className={`max-w-md ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-4 py-3 rounded-2xl ${
                  message.type === 'bot'
                    ? message.isError
                      ? 'bg-red-600/20 text-red-200'
                      : 'bg-slate-700/50 text-slate-100'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {/* Weather info for bot responses */}
                  {message.weather && (
                    <div className="mt-2 pt-2 border-t border-slate-600/50">
                      <p className="text-xs text-slate-400">
                        🌡️ {message.weather.current.temp_c}°C | 
                        💧 {message.weather.current.humidity}% | 
                        ☁️ {message.weather.current.condition.text}
                        {message.weather.forecast?.forecastday[0] && (
                          <span> | 🌧️ {message.weather.forecast.forecastday[0].day.daily_chance_of_rain}% rain chance</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-slate-700/50 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="px-6 py-4 border-t border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-3">{t('quickQuestions')}</h3>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-slate-700/50">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('askMeAnything')}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 input-focus resize-none"
                rows={1}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                  height: 'auto',
                  overflow: 'hidden'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {t('pressEnterToSend')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Chatbot
