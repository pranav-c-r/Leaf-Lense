import { useState, useRef } from 'react'
import axios from 'axios'
import { 
  Upload, Camera, X, Eye, Leaf, AlertTriangle, CheckCircle, Lightbulb, 
  Microscope, Target, Clock, Shield, Zap, BookOpen, FlaskConical,
  Bug, Sprout, Activity, TrendingUp, AlertCircle, Info, Star
} from 'lucide-react'

const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
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

  // ANALYZE IMAGE
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
        return
      }

      setResult(response.data)
    } catch (err) {
      setError("Analysis failed: " + (err.response?.data?.error || err.message))
    }
    setIsAnalyzing(false)
  }

  // Clear selection
  const clearImage = () => {
    setSelectedImage(null)
    setResult(null)
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Format advice into sections
  const formatAdvice = (advice) => {
    if (!advice) return { sections: [], full: advice }
    
    const sections = []
    const lines = advice.split('\n').filter(line => line.trim())
    
    let currentSection = null
    let currentContent = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('**') || trimmed.startsWith('#')) {
        // Save previous section
        if (currentSection) {
          sections.push({
            title: currentSection,
            content: currentContent.join('\n')
          })
        }
        // Start new section
        currentSection = trimmed.replace(/\*\*|#/g, '').trim()
        currentContent = []
      } else if (currentSection) {
        currentContent.push(trimmed)
      }
    }
    
    // Save last section
    if (currentSection) {
      sections.push({
        title: currentSection,
        content: currentContent.join('\n')
      })
    }
    
    return { sections, full: advice }
  }

  const formattedAdvice = result ? formatAdvice(result.advice) : null

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Simple Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-3">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Plant Disease Detection</h1>
        </div>
        <p className="text-gray-400">Upload an image to analyze plant health with AI</p>
      </div>

      {/* Upload Section */}
      <div className="mb-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Camera className="h-5 w-5 mr-2 text-green-400" />
            Upload Plant Image
          </h2>

          {!selectedImage ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-green-400 bg-green-500/5' 
                  : 'border-gray-600 hover:border-gray-500'
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
                className="hidden"
              />
              
              <Upload className="h-12 w-12 text-gray-500 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-white mb-2">
                Drop image here or click to browse
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                JPG, PNG, WebP up to 10MB
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              >
                Choose File
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={selectedImage.url}
                    alt="Selected plant"
                    className="w-full h-64 object-cover rounded-lg shadow-lg"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span className="truncate">{selectedImage.name}</span>
                  <span>{(selectedImage.file.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2 text-yellow-400" />
                    Tips for best results
                  </h3>
                  <ul className="text-xs text-gray-300 space-y-2">
                    <li>• Use natural lighting or bright indoor light</li>
                    <li>• Focus on affected leaves or problem areas</li>
                    <li>• Keep the image sharp and in focus</li>
                    <li>• Include multiple affected areas if possible</li>
                    <li>• Avoid shadows and blurry images</li>
                  </ul>
                </div>
                
                <button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center font-medium"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Microscope className="h-5 w-5 mr-2" />
                      Analyze Plant Disease
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result ? (
        <div className="space-y-6">
          {/* Main Result Card */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                Analysis Complete
              </h2>
              {result.urgency_level && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  result.urgency_level.toLowerCase().includes('critical') || result.urgency_level.toLowerCase().includes('immediate') 
                    ? 'bg-red-900 text-red-300 border border-red-700'
                    : result.urgency_level.toLowerCase().includes('high') || result.urgency_level.toLowerCase().includes('soon')
                    ? 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                    : 'bg-blue-900 text-blue-300 border border-blue-700'
                }`}>
                  {result.urgency_level}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Sprout className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-sm text-gray-400">Plant Type</span>
                </div>
                <p className="text-white font-semibold">{result.plant_type || 'Unknown'}</p>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Bug className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-sm text-gray-400">Condition</span>
                </div>
                <p className="text-white font-semibold">{result.class}</p>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Target className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-sm text-gray-400">Confidence</span>
                </div>
                <div className="flex items-center">
                  <span className="text-white font-semibold mr-3">{result.confidence}%</span>
                  <div className="flex-1 bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        result.confidence >= 70 ? 'bg-green-500' : 
                        result.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comprehensive Analysis Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* How AI Identified This */}
            {result.analysis_details.identification_process?.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Eye className="h-5 w-5 text-purple-400 mr-2" />
                  How AI Identified This
                </h3>
                <div className="space-y-2">
                  {result.analysis_details.identification_process.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-sm text-gray-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Symptoms */}
            {result.analysis_details.symptoms?.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  Visual Symptoms Observed
                </h3>
                <div className="space-y-2">
                  {result.analysis_details.symptoms.map((symptom, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-sm text-gray-300">{symptom}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Causes */}
            {result.analysis_details.causes?.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FlaskConical className="h-5 w-5 text-orange-400 mr-2" />
                  What Causes This
                </h3>
                <div className="space-y-2">
                  {result.analysis_details.causes.map((cause, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-sm text-gray-300">{cause}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Why This Happens */}
            {result.analysis_details.why_happens?.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Info className="h-5 w-5 text-blue-400 mr-2" />
                  Why This Happens
                </h3>
                <div className="space-y-2">
                  {result.analysis_details.why_happens.map((reason, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-sm text-gray-300">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Impact & Progression */}
            {result.analysis_details.impact_progression?.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 text-red-400 mr-2" />
                  Impact & Progression
                </h3>
                <div className="space-y-2">
                  {result.analysis_details.impact_progression.map((impact, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-sm text-gray-300">{impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Immediate Actions */}
            {result.analysis_details.immediate_actions?.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Zap className="h-5 w-5 text-yellow-400 mr-2" />
                  Immediate Actions Required
                </h3>
                <div className="space-y-2">
                  {result.analysis_details.immediate_actions.map((action, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-sm text-gray-300">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Treatment Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Organic Treatments */}
            {result.analysis_details.treatments?.organic?.length > 0 && (
              <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-lg p-6 border border-green-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Sprout className="h-5 w-5 text-green-400 mr-2" />
                  Organic Treatments
                </h3>
                <div className="space-y-3">
                  {result.analysis_details.treatments.organic.map((treatment, index) => (
                    <div key={index} className="bg-green-900/30 rounded-md p-3">
                      <p className="text-sm text-green-100">{treatment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chemical Treatments */}
            {result.analysis_details.treatments?.chemical?.length > 0 && (
              <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 rounded-lg p-6 border border-red-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FlaskConical className="h-5 w-5 text-red-400 mr-2" />
                  Chemical Treatments
                </h3>
                <div className="space-y-3">
                  {result.analysis_details.treatments.chemical.map((treatment, index) => (
                    <div key={index} className="bg-red-900/30 rounded-md p-3">
                      <p className="text-sm text-red-100">{treatment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prevention */}
            {result.analysis_details.treatments?.prevention?.length > 0 && (
              <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-lg p-6 border border-blue-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Shield className="h-5 w-5 text-blue-400 mr-2" />
                  Prevention Measures
                </h3>
                <div className="space-y-3">
                  {result.analysis_details.treatments.prevention.map((prevention, index) => (
                    <div key={index} className="bg-blue-900/30 rounded-md p-3">
                      <p className="text-sm text-blue-100">{prevention}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Information Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Safety Precautions */}
            {result.analysis_details.precautions?.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Shield className="h-5 w-5 text-yellow-400 mr-2" />
                  Important Precautions
                </h3>
                <div className="space-y-2">
                  {result.analysis_details.precautions.map((precaution, index) => (
                    <div key={index} className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm text-gray-300">{precaution}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {result.analysis_details.timeline?.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Clock className="h-5 w-5 text-cyan-400 mr-2" />
                  Expected Timeline
                </h3>
                <div className="space-y-2">
                  {result.analysis_details.timeline.map((timeItem, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-sm text-gray-300">{timeItem}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Tips */}
            {result.analysis_details.additional_tips?.length > 0 && (
              <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Star className="h-5 w-5 text-purple-400 mr-2" />
                  Expert Tips
                </h3>
                <div className="space-y-2">
                  {result.analysis_details.additional_tips.map((tip, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-sm text-gray-300">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Full Analysis Report */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BookOpen className="h-5 w-5 text-indigo-400 mr-2" />
              Complete Analysis Report
            </h3>
            <div className="max-h-96 overflow-y-auto bg-gray-900 rounded-lg p-4">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">{result.advice}</pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <Leaf className="h-20 w-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-300 mb-3">Ready for Plant Analysis</h3>
            <p className="text-gray-400 mb-6">
              Upload a clear image of your plant to get comprehensive AI-powered disease detection, 
              treatment recommendations, and expert agricultural advice.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Microscope className="h-4 w-4 mr-2 text-green-400" />
                <span>AI Disease Detection</span>
              </div>
              <div className="flex items-center">
                <Sprout className="h-4 w-4 mr-2 text-blue-400" />
                <span>Treatment Plans</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-yellow-400" />
                <span>Prevention Tips</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-purple-400" />
                <span>Expert Analysis</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiseaseDetection
