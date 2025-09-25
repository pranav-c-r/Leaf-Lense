import { useState, useRef } from 'react'
import axios from 'axios'
import { 
  Upload, Camera, Zap, X, Eye, Leaf, AlertTriangle, CheckCircle, 
  Lightbulb, Sun, Target, Microscope, Info
} from 'lucide-react'

const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [expandedSection, setExpandedSection] = useState(null)
  const fileInputRef = useRef(null)

  // Drag/Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleImageSelect(files[0])
    }
  }

  // Image Select
  const handleImageSelect = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage({
        file: file,
        url: e.target.result,
        name: file.name
      })
      setResult(null)
      setError("")
    }
    reader.readAsDataURL(file)
  }
  
  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  // Get confidence color based on percentage
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    if (confidence >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  // Get confidence background color
  const getConfidenceBackground = (confidence) => {
    if (confidence >= 80) return 'bg-green-500/20 border-green-500/30'
    if (confidence >= 60) return 'bg-yellow-500/20 border-yellow-500/30'
    if (confidence >= 40) return 'bg-orange-500/20 border-orange-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  // Get urgency color and icon
  const getUrgencyInfo = (advice) => {
    const lowerAdvice = advice?.toLowerCase() || ''
    if (lowerAdvice.includes('immediate') || lowerAdvice.includes('urgent')) {
      return { color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertTriangle, text: 'Immediate' }
    }
    if (lowerAdvice.includes('soon') || lowerAdvice.includes('quickly')) {
      return { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: Clock, text: 'Soon' }
    }
    return { color: 'text-green-400', bg: 'bg-green-500/20', icon: Calendar, text: 'Monitor' }
  }

  // Parse advice text for structured display
  const parseAdviceStructure = (advice) => {
    if (!advice) return null

    const sections = {
      plantType: '',
      condition: '',
      confidence: '',
      symptoms: [],
      causes: [],
      organicTreatments: [],
      chemicalTreatments: [],
      prevention: [],
      urgency: '',
      generalAdvice: advice
    }

    const lines = advice.split('\n').map(line => line.trim()).filter(line => line)
    let currentSection = null

    for (let line of lines) {
      const lowerLine = line.toLowerCase()
      
      // Check for section headers
      if (lowerLine.includes('plant identification') || lowerLine.includes('plant type')) {
        currentSection = 'plantType'
        continue
      } else if (lowerLine.includes('health assessment') || lowerLine.includes('condition')) {
        currentSection = 'condition'
        continue
      } else if (lowerLine.includes('confidence')) {
        currentSection = 'confidence'
        continue
      } else if (lowerLine.includes('symptoms')) {
        currentSection = 'symptoms'
        continue
      } else if (lowerLine.includes('causes') || lowerLine.includes('possible causes')) {
        currentSection = 'causes'
        continue
      } else if (lowerLine.includes('organic') || lowerLine.includes('natural')) {
        currentSection = 'organicTreatments'
        continue
      } else if (lowerLine.includes('chemical')) {
        currentSection = 'chemicalTreatments'
        continue
      } else if (lowerLine.includes('prevention') || lowerLine.includes('preventive')) {
        currentSection = 'prevention'
        continue
      } else if (lowerLine.includes('urgency')) {
        currentSection = 'urgency'
        continue
      }

      // Extract content based on current section
      if (currentSection && line.includes(':')) {
        const content = line.split(':')[1]?.trim()
        if (content) {
          if (currentSection === 'plantType' || currentSection === 'condition' || 
              currentSection === 'confidence' || currentSection === 'urgency') {
            sections[currentSection] = content
          }
        }
      } else if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
        const item = line.substring(1).trim()
        if (currentSection && sections[currentSection] && Array.isArray(sections[currentSection])) {
          sections[currentSection].push(item)
        }
      }
    }

    return sections
  }

  // ANALYZE IMAGE HANDLER - Updated for new Gemini API
  const analyzeImage = async () => {
    if (!selectedImage?.file) return

    setIsAnalyzing(true)
    setError("")
    setResult(null)

    const formData = new FormData()
    formData.append('file', selectedImage.file)

    try {
      const response = await axios.post(
        'http://localhost:8000/plant/disease/predict',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      
      if (response.data.error) {
        setError(response.data.error)
        setIsAnalyzing(false)
        return
      }

      // Handle the new Gemini Vision response structure
      const data = response.data
      const parsedAdvice = parseAdviceStructure(data.advice)
      
      setResult({
        ...data,
        parsedAdvice,
        urgency: getUrgencyInfo(data.advice)
      })
    } catch (err) {
      setError("API error: " + (err.response?.data?.error || err.message))
    }
    setIsAnalyzing(false)
  }

  // Clear selection
  const clearImage = () => {
    setSelectedImage(null)
    setResult(null)
    setError("")
    setExpandedSection(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Toggle expanded section
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="p-6 space-y-8 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center animate-glow">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gradient">Plant Disease Detection</h1>
            <p className="text-gray-400 text-lg">Advanced AI-powered plant health analysis with Gemini Vision</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-800/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-700/50">
            <Brain className="h-5 w-5 animate-pulse text-blue-400" />
            <span className="text-sm text-gray-300">Gemini AI</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-800/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-700/50">
            <Award className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-gray-300">Expert Level</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Upload Section - Left Column */}
        <div className="xl:col-span-1 space-y-6">
          {/* Image Upload Card */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 glass-effect">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-green-400" />
              Upload Plant Image
            </h2>

            {!selectedImage ? (
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragging 
                    ? 'border-green-400 bg-green-500/10 scale-105' 
                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/20'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <Upload className={`h-16 w-16 mx-auto mb-4 transition-colors ${isDragging ? 'text-green-400' : 'text-gray-500'}`} />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Drop your image here
                </h3>
                <p className="text-gray-400 mb-4">
                  or click to browse files
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, WebP up to 10MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative group">
                  <img
                    src={selectedImage.url}
                    alt="Selected plant"
                    className="w-full h-64 object-cover rounded-xl border border-gray-600 group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-gray-900/80 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-300 text-sm truncate">{selectedImage.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {(selectedImage.file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>

                <button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="w-full button-primary flex items-center justify-center space-x-2 h-12"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Analyzing with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Microscope className="h-5 w-5" />
                      <span>Analyze with AI</span>
                    </>
                  )}
                </button>
              </div>
            )}
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Best Practices */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 glass-effect">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
              Best Practices
            </h3>
            <div className="space-y-4">
              {[
                { icon: Sun, text: "Take clear, well-lit photos of affected leaves" },
                { icon: Target, text: "Focus on visible symptoms and abnormalities" },
                { icon: Eye, text: "Avoid blurry or heavily shadowed images" },
                { icon: Camera, text: "Include multiple angles if possible" }
              ].map((tip, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700/20 rounded-lg">
                  <tip.icon className="h-4 w-4 text-green-400 flex-shrink-0 mt-1" />
                  <p className="text-gray-300 text-sm">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section - Right Two Columns */}
        <div className="xl:col-span-2 space-y-6">
          {result ? (
            <>
              {/* Main Result Header */}
              <div className={`backdrop-blur-sm rounded-2xl p-6 border ${getConfidenceBackground(result.confidence)} glass-effect`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Stethoscope className="h-6 w-6 text-white" />
                    <h2 className="text-2xl font-bold text-white">Analysis Complete</h2>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full ${result.urgency.bg}`}>
                      <div className="flex items-center space-x-1">
                        <result.urgency.icon className={`h-4 w-4 ${result.urgency.color}`} />
                        <span className={`text-xs font-medium ${result.urgency.color}`}>{result.urgency.text}</span>
                      </div>
                    </div>
                    <Share2 className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Plant Type</h3>
                    <p className="text-2xl font-bold text-green-400 flex items-center">
                      <Leaf className="h-6 w-6 mr-2" />
                      {result.plant_type || 'Unknown Plant'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Condition</h3>
                    <p className="text-2xl font-bold text-white">
                      {result.class}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">Confidence Level</span>
                    <span className={`text-sm font-bold ${getConfidenceColor(result.confidence)}`}>
                      {result.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        result.confidence >= 80 ? 'bg-green-500' :
                        result.confidence >= 60 ? 'bg-yellow-500' :
                        result.confidence >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Symptoms Section */}
                {result.analysis_details?.symptoms?.length > 0 && (
                  <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20 glass-effect">
                    <button 
                      onClick={() => toggleSection('symptoms')}
                      className="w-full flex items-center justify-between mb-4 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <h3 className="text-lg font-bold text-white">Symptoms Observed</h3>
                        <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-full">
                          {result.analysis_details.symptoms.length}
                        </span>
                      </div>
                      {expandedSection === 'symptoms' ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    
                    <div className={`space-y-3 transition-all duration-300 ${expandedSection === 'symptoms' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      {result.analysis_details.symptoms.map((symptom, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <Activity className="h-4 w-4 text-red-400 flex-shrink-0 mt-1" />
                          <span className="text-red-200 text-sm">{symptom}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Causes Section */}
                {result.analysis_details?.causes?.length > 0 && (
                  <div className="bg-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20 glass-effect">
                    <button 
                      onClick={() => toggleSection('causes')}
                      className="w-full flex items-center justify-between mb-4 hover:bg-orange-500/10 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Info className="h-5 w-5 text-orange-400" />
                        <h3 className="text-lg font-bold text-white">Possible Causes</h3>
                        <span className="bg-orange-500/20 text-orange-300 text-xs px-2 py-1 rounded-full">
                          {result.analysis_details.causes.length}
                        </span>
                      </div>
                      {expandedSection === 'causes' ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    
                    <div className={`space-y-3 transition-all duration-300 ${expandedSection === 'causes' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      {result.analysis_details.causes.map((cause, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                          <TrendingUp className="h-4 w-4 text-orange-400 flex-shrink-0 mt-1" />
                          <span className="text-orange-200 text-sm">{cause}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Organic Treatments */}
                {result.analysis_details?.treatments?.organic?.length > 0 && (
                  <div className="bg-green-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 glass-effect">
                    <button 
                      onClick={() => toggleSection('organic')}
                      className="w-full flex items-center justify-between mb-4 hover:bg-green-500/10 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Leaf className="h-5 w-5 text-green-400" />
                        <h3 className="text-lg font-bold text-white">Organic Remedies</h3>
                        <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full">
                          {result.analysis_details.treatments.organic.length}
                        </span>
                      </div>
                      {expandedSection === 'organic' ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    
                    <div className={`space-y-3 transition-all duration-300 ${expandedSection === 'organic' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      {result.analysis_details.treatments.organic.map((treatment, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <HeartHandshake className="h-4 w-4 text-green-400 flex-shrink-0 mt-1" />
                          <span className="text-green-200 text-sm">{treatment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chemical Treatments */}
                {result.analysis_details?.treatments?.chemical?.length > 0 && (
                  <div className="bg-blue-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 glass-effect">
                    <button 
                      onClick={() => toggleSection('chemical')}
                      className="w-full flex items-center justify-between mb-4 hover:bg-blue-500/10 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Beaker className="h-5 w-5 text-blue-400" />
                        <h3 className="text-lg font-bold text-white">Chemical Treatments</h3>
                        <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                          {result.analysis_details.treatments.chemical.length}
                        </span>
                      </div>
                      {expandedSection === 'chemical' ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    
                    <div className={`space-y-3 transition-all duration-300 ${expandedSection === 'chemical' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      {result.analysis_details.treatments.chemical.map((treatment, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <Droplets className="h-4 w-4 text-blue-400 flex-shrink-0 mt-1" />
                          <span className="text-blue-200 text-sm">{treatment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prevention Measures */}
                {result.analysis_details?.treatments?.prevention?.length > 0 && (
                  <div className="lg:col-span-2 bg-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 glass-effect">
                    <button 
                      onClick={() => toggleSection('prevention')}
                      className="w-full flex items-center justify-between mb-4 hover:bg-purple-500/10 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-purple-400" />
                        <h3 className="text-lg font-bold text-white">Prevention Measures</h3>
                        <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">
                          {result.analysis_details.treatments.prevention.length}
                        </span>
                      </div>
                      {expandedSection === 'prevention' ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 transition-all duration-300 ${expandedSection === 'prevention' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      {result.analysis_details.treatments.prevention.map((prevention, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <Shield className="h-4 w-4 text-purple-400 flex-shrink-0 mt-1" />
                          <span className="text-purple-200 text-sm">{prevention}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Full Analysis Text */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 glass-effect">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-blue-400" />
                  Complete Analysis Report
                </h3>
                <div className="bg-gray-900/50 rounded-lg p-4 max-h-96 overflow-y-auto hide-scrollbar">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">
                    {result.advice}
                  </pre>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Star className="h-4 w-4" />
                    <span>Powered by Gemini Vision AI</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white transition-colors">
                      <Download className="h-4 w-4" />
                      <span>Export Report</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center glass-effect">
              <div className="animate-pulse mb-6">
                <Microscope className="h-24 w-24 text-gray-600 mx-auto mb-4" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-400 mb-4">Ready for Advanced Analysis</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Upload a plant image to receive comprehensive AI-powered disease detection, 
                treatment recommendations, and expert agricultural advice powered by Gemini Vision.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {[
                  { icon: Leaf, text: "Plant ID" },
                  { icon: Stethoscope, text: "Health Check" },
                  { icon: HeartHandshake, text: "Treatments" },
                  { icon: Shield, text: "Prevention" }
                ].map((feature, index) => (
                  <div key={index} className="bg-gray-700/30 rounded-lg p-4 text-center">
                    <feature.icon className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-400">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiseaseDetection
