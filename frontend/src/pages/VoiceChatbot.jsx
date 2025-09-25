import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Volume2, Settings, MapPin, Languages, Sparkles, Loader2, User, Bot, MessageSquare, History } from 'lucide-react'
import voiceProcessor from '../services/voiceProcessor'
import aiService from '../services/aiService'
import textToSpeechService from '../services/textToSpeech'
import TranscriptDisplay from '../components/TranscriptDisplay'
import transcriptLogger from '../services/transcriptLogger'
import googleSpeechService from '../services/googleSpeechService'
import { useLanguage } from '../contexts/LanguageContext'

const VoiceChatbot = () => {
  const { t, currentLanguage } = useLanguage()
  const [messages, setMessages] = useState([])

  const [input, setInput] = useState('')
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [voiceState, setVoiceState] = useState('idle') // idle, listening, processing, speaking, error
  const [currentTranscription, setCurrentTranscription] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage)
  const [location, setLocation] = useState('Delhi')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isTTSEnabled, setIsTTSEnabled] = useState(true)
  const [useGoogleSpeech, setUseGoogleSpeech] = useState(false)
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true)
  const [showTranscriptPanel, setShowTranscriptPanel] = useState(false)
  const [voiceSettings, setVoiceSettings] = useState({ rate: 0.9, pitch: 1, volume: 1 })

  const messagesEndRef = useRef(null)
  const idRef = useRef(2)
  const nextId = () => `${Date.now()}-${idRef.current++}`

  const languages = [
    { code: 'hi', name: 'हिंदी', englishName: 'Hindi' },
    { code: 'en', name: 'English', englishName: 'English' },
    { code: 'ta', name: 'தமிழ்', englishName: 'Tamil' },
    { code: 'te', name: 'తెలుగు', englishName: 'Telugu' },
    { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam' },
    { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada' },
    { code: 'bn', name: 'বাংলা', englishName: 'Bengali' },
    { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati' },
    { code: 'mr', name: 'मराठी', englishName: 'Marathi' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi' }
  ]

  const sampleQuestions = {
    hi: [t('willItRainTomorrow'), t('howIsMyWheatCrop'), t('whatFertilizerToUse'), t('howToPreventPests'), t('whenToHarvestCrop')],
    en: [t('willItRainTomorrow'), t('howIsMyWheatCrop'), t('whatFertilizerToUse'), t('howToPreventPests'), t('whenToHarvestCrop')],
    ml: [t('willItRainTomorrow'), t('howIsMyWheatCrop'), t('whatFertilizerToUse'), t('howToPreventPests'), t('whenToHarvestCrop')]
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'seed-1',
        type: 'bot',
        content: t('voiceChatbotWelcome'),
        timestamp: new Date(),
        language: currentLanguage
      }
    ])
  }, [t, currentLanguage])

  // ---- one-time init: logger + callbacks ----
  useEffect(() => {
    transcriptLogger.startSession('user', { location, preferredLanguage: selectedLanguage })

    voiceProcessor.setCallbacks({
      onStateChange: (state) => setVoiceState(state),
      onTranscription: (transcription) => {
        setCurrentTranscription(transcription)
        if (transcription.isFinal && transcription.transcript) {
          transcriptLogger.logUserInput(transcription)
        }
      },
      onResponse: (response) => {
        // Build messages using stable ID generator and functional update
        const userMessage = {
          id: nextId(),
          type: 'user',
          content: response.query,
          timestamp: response.timestamp || new Date(),
          language: response.language
        }
        const botMessage = {
          id: nextId(),
          type: 'bot',
          content: response.response,
          timestamp: response.timestamp || new Date(),
          language: response.language,
          weather: response.weather,
          query: response.query
        }
        setMessages((prev) => [...prev, userMessage, botMessage])
        setCurrentTranscription(null)
        transcriptLogger.logAIResponse(response, response.query)

        // Optional auto language switch with light dampening
        if (autoDetectLanguage && response.language && response.language !== selectedLanguage && (response.confidence ?? 1) > 0.8) {
          setSelectedLanguage(response.language)
        }
      },
      onError: (error) => {
        console.error('Voice processor error:', error)
        setCurrentTranscription(null)
        transcriptLogger.logError(error, { component: 'voiceProcessor' })
        const errorMessage = {
          id: nextId(),
          type: 'bot',
          content: typeof error === 'string' ? error : error?.message || 'Something went wrong.',
          timestamp: new Date(),
          isError: true
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    })

    return () => {
      try {
        voiceProcessor.stopVoiceInteraction()
      } catch {}
      transcriptLogger.endSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- update language/location on deps change ----
  useEffect(() => {
    voiceProcessor.setLanguage(selectedLanguage)
  }, [selectedLanguage])

  // Sync selectedLanguage with currentLanguage
  useEffect(() => {
    setSelectedLanguage(currentLanguage)
  }, [currentLanguage])

  useEffect(() => {
    voiceProcessor.setLocation(location)
  }, [location])

  const toggleVoiceMode = useCallback(async () => {
    try {
      if (isVoiceMode) {
        voiceProcessor.stopVoiceInteraction()
        setIsVoiceMode(false)
        setCurrentTranscription(null)
        return
      }

      if (!voiceProcessor.isVoiceSupported()) {
        alert('Voice features are not supported in this browser. Please use Chrome or Edge.')
        return
      }

      setIsVoiceMode(true)
      await voiceProcessor.startVoiceInteraction({ engine: useGoogleSpeech && googleSpeechService.isAvailable() ? 'google' : 'builtin' })
    } catch (e) {
      console.error('toggleVoiceMode error', e)
      setIsVoiceMode(false)
      setVoiceState('error')
    }
  }, [isVoiceMode, useGoogleSpeech])

  const handleTextSubmit = useCallback(async () => {
    if (!input.trim()) return

    const queryText = input
    setInput('')

    const userMessage = {
      id: nextId(),
      type: 'user',
      content: queryText,
      timestamp: new Date(),
      language: selectedLanguage
    }
    setMessages((prev) => [...prev, userMessage])
    setVoiceState('processing')

    try {
      const aiResponse = await aiService.processQuery(queryText, selectedLanguage, location)

      const botMessage = {
        id: nextId(),
        type: 'bot',
        content: aiResponse?.response ?? 'No response received.',
        timestamp: aiResponse?.timestamp ?? new Date(),
        language: aiResponse?.language ?? selectedLanguage,
        weather: aiResponse?.weather
      }
      setMessages((prev) => [...prev, botMessage])

      if (isTTSEnabled && botMessage.content) {
        setVoiceState('speaking')
        try {
          await textToSpeechService.speak(botMessage.content, botMessage.language, voiceSettings)
        } catch (ttsError) {
          console.error('TTS error:', ttsError)
        }
      }
    } catch (error) {
      console.error('Text query error:', error)
      const errorMessage = {
        id: nextId(),
        type: 'bot',
        content: "I'm having trouble processing your request. Please try again.",
        timestamp: new Date(),
        isError: true
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setVoiceState('idle')
    }
  }, [input, selectedLanguage, location, isTTSEnabled, voiceSettings])

  const handleSampleQuestion = (q) => setInput(q)

  const getStateIcon = () => {
    switch (voiceState) {
      case 'listening':
        return <Mic className="h-6 w-6 text-red-400 animate-pulse" />
      case 'processing':
        return <Loader2 className="h-6 w-6 text-yellow-400 animate-spin" />
      case 'speaking':
        return <Volume2 className="h-6 w-6 text-blue-400 animate-bounce" />
      default:
        return <MicOff className="h-6 w-6 text-gray-400" />
    }
  }

  const handleSpeak = async (text) => {
    setVoiceState("speaking");
    try {
      await textToSpeechService.speak(text, "en");
    } finally {
      setVoiceState("idle");
    }
  };

  const handleStop = () => {
    textToSpeechService.stop();
    setVoiceState("idle");
    // optionally focus user input here if you have a ref
  };

  const getStateText = () => {
    const stateTexts = {
      idle: t('pressToSpeak'),
      listening: t('listening'),
      processing: t('processing'),
      speaking: t('speaking'),
      error: t('errorOccurred')
    }
    return stateTexts[voiceState] || 'Ready'
  }

  const safeTime = (t) => (t instanceof Date ? t : new Date(t))

  const hasUserMsg = messages.some((m) => m.type === 'user')

  return (
    <div className="p-6 h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{t('voiceAssistantTitle')}</h1>
            <p className="text-slate-400">{t('voiceAssistantSubtitle')}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => setIsSettingsOpen((v) => !v)} className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors" aria-label="Settings">
            <Settings className="h-5 w-5 text-slate-300" />
          </button>

          {/* Voice Support Indicator */}
          <div
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              voiceProcessor.isVoiceSupported() ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-600/20 text-red-400'
            }`}
          >
            {getStateIcon()}
            <span className="text-sm">{getStateText()}</span>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="mb-6 p-4 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Languages className="inline h-4 w-4 mr-1" /> भाषा / Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.englishName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" /> स्थान / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                placeholder="Enter your location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Volume2 className="inline h-4 w-4 mr-1" /> आवाज / Voice Output
              </label>
              <button
                onClick={() => setIsTTSEnabled((v) => !v)}
                className={`w-full px-3 py-2 rounded-lg font-medium transition-colors ${
                  isTTSEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {isTTSEnabled ? 'चालू / ON' : 'बंद / OFF'}
              </button>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
            <div>
              <label className="flex items-center space-x-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={autoDetectLanguage}
                  onChange={(e) => setAutoDetectLanguage(e.target.checked)}
                  className="rounded bg-slate-700 border-slate-600 text-emerald-600 focus:ring-emerald-500"
                />
                <span>स्वतः भाषा पहचानें / Auto-detect Language</span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm text-slate-3 00">
                <input
                  type="checkbox"
                  checked={useGoogleSpeech}
                  onChange={(e) => setUseGoogleSpeech(e.target.checked)}
                  className="rounded bg-slate-700 border-slate-600 text-emerald-600 focus:ring-emerald-500"
                  disabled={!googleSpeechService.isAvailable()}
                />
                <span>Google Speech API {!googleSpeechService.isAvailable() && '(Not Available)'}</span>
              </label>
            </div>

            <div>
              <button
                onClick={() => setShowTranscriptPanel((v) => !v)}
                className={`w-full px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  showTranscriptPanel ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <MessageSquare className="h-4 w-4" /> <span>Live Transcript</span>
              </button>
            </div>

            <div>
              <button
                onClick={() => {
                  const a = transcriptLogger.getAnalytics?.() || {
                    totalConversations: 0,
                    totalMessages: messages.length,
                    averageConfidence: 0
                  }
                  alert(
                    `Conversations: ${a.totalConversations}\nMessages: ${a.totalMessages}\nAvg Confidence: ${(
                      (a.averageConfidence || 0) * 100
                    ).toFixed(1)}%`
                  )
                }}
                className="w-full px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 bg-slate-700 text-slate-300 hover:bg-slate-600"
              >
                <History className="h-4 w-4" /> <span>Analytics</span>
              </button>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="pt-4 border-t border-slate-700/50 mt-4">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Voice Settings</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.rate}
                  onChange={(e) => setVoiceSettings({ ...voiceSettings, rate: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
                <span className="text-xs text-slate-500">{voiceSettings.rate}x</span>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Pitch</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) => setVoiceSettings({ ...voiceSettings, pitch: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
                <span className="text-xs text-slate-500">{voiceSettings.pitch}x</span>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceSettings.volume}
                  onChange={(e) => setVoiceSettings({ ...voiceSettings, volume: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
                <span className="text-xs text-slate-500">{Math.round(voiceSettings.volume * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Panel */}
      {showTranscriptPanel && (
        <div className="mb-4">
          <TranscriptDisplay
            currentTranscript={currentTranscription}
            isListening={voiceState === 'listening'}
            isSpeaking={voiceState === 'speaking'}
            onExportTranscript={(data) => {
              console.log('Exported transcript data:', data)
            }}
            className="max-h-64"
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  message.type === 'bot' ? (message.isError ? 'bg-red-500' : 'bg-gradient-to-br from-emerald-500 to-emerald-600') : 'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}
              >
                {message.type === 'bot' ? <Bot className="h-5 w-5 text-white" /> : <User className="h-5 w-5 text-white" />}
              </div>

              <div className={`max-w-md ${message.type === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`inline-block px-4 py-3 rounded-2xl ${
                    message.type === 'bot'
                      ? message.isError
                        ? 'bg-red-600/20 text-red-200'
                        : 'bg-slate-700/50 text-slate-100'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>

                  {/* Weather info for bot responses */}
                  {message.weather?.current && (
                    <div className="mt-2 pt-2 border-t border-slate-600/50">
                      <p className="text-xs text-slate-400">
                        🌡️ {message.weather.current.temp_c}°C • 💧 {message.weather.current.humidity}% • ☁️{' '}
                        {message.weather.current.condition?.text}
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-1">
                  {safeTime(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {message.language && ` • ${languages.find((l) => l.code === message.language)?.englishName || message.language}`}
                </p>
              </div>
            </div>
          ))}

          {/* Live transcription (inline) */}
          {currentTranscription && !showTranscriptPanel && (
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-2xl px-4 py-3 max-w-md">
                <div className="space-y-2">
                  {currentTranscription.interimTranscript && (
                    <p className="text-sm text-slate-300 italic">{currentTranscription.interimTranscript}...</p>
                  )}
                  {currentTranscription.finalTranscript && (
                    <div className="bg-emerald-600/10 border border-emerald-600/30 rounded p-2">
                      <p className="text-sm text-white font-medium">{currentTranscription.finalTranscript}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-emerald-400">{Math.round((currentTranscription.confidence || 0) * 100)}% confidence</span>
                        {currentTranscription.detectedLanguage && currentTranscription.detectedLanguage !== selectedLanguage && (
                          <span className="text-xs text-yellow-400">
                            Detected: {languages.find((l) => l.code === currentTranscription.detectedLanguage)?.englishName}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice Control Section */}
        <div className="p-6 border-t border-slate-700/50 bg-slate-800/20">
          {/* Voice Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={toggleVoiceMode}
              disabled={voiceState === 'processing' || voiceState === 'speaking'}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all transform hover:scale-105 disabled:scale-100 ${
                isVoiceMode
                  ? voiceState === 'listening'
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : voiceState === 'processing'
                    ? 'bg-yellow-500 animate-pulse'
                    : voiceState === 'speaking'
                    ? 'bg-blue-500 animate-bounce'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-slate-600 hover:bg-slate-500'
              } disabled:cursor-not-allowed shadow-lg`}
              aria-label="Toggle voice"
            >
              {getStateIcon()}
            </button>
          </div>

          <p className="text-center text-sm text-slate-400 mb-4">{getStateText()}</p>

          {/* Sample Questions */}
          {!hasUserMsg && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-300 mb-3 text-center">{t('sampleQuestions')}:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sampleQuestions[selectedLanguage]?.slice(0, 4).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSampleQuestion(question)}
                    className="text-xs px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors text-left"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="p-4 flex flex-col items-center gap-3">
            <button
              onClick={() => handleSpeak("Hello! I am your voice assistant.")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Speak
            </button>

            {voiceState === "speaking" && (
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Stop Speaking
              </button>
            )}
          </div>
          {/* Text Input */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleTextSubmit()
                  }
                }}
                placeholder={t('typeYourQuestion')}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 input-focus resize-none"
                rows={1}
                disabled={voiceState === 'processing' || voiceState === 'speaking'}
                aria-label="Message input"
              />
            </div>

            <button
              onClick={handleTextSubmit}
              disabled={!input.trim() || voiceState === 'processing' || voiceState === 'speaking'}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg transition-all disabled:cursor-not-allowed"
            >
              {t('send')}
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-2 text-center">{t('voiceClickMic')}</p>
        </div>
      </div>
    </div>
  )
}

export default VoiceChatbot
