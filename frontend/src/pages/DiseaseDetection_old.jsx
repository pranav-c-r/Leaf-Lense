import { useState, useRef } from 'react'
import axios from 'axios'
import { 
  Bug, Upload, Camera, Zap, Brain, AlertTriangle, CheckCircle, X, Eye, 
  Leaf, Microscope, Shield, Droplets, Beaker, Calendar, Clock, 
  TrendingUp, Activity, Info, ExternalLink, Download, Share2,
  ThermometerSun, CloudRain, Sun, Wind, Target, Lightbulb,
  HeartHandshake, Stethoscope, Award, Star
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
    const file = e.target.files
    if (file) {
      handleImageSelect(file[0])
    }
  }

  // Clean advice text: split by separators and trim
  const formatAdviceText = (advice) => {
    if (!advice) return []
    // Remove markdown headers and split by '---' or '###'
    return advice
      .replace(/###/g, '')
      .split(/---/g)
      .map(line => line.trim())
      .filter(line => line.length > 0)
  }

  // ANALYZE IMAGE HANDLER
  const analyzeImage = async () => {
    if (!selectedImage?.file) return

    setIsAnalyzing(true)
    setError("")
    setResult(null)

    const formData = new FormData()
    formData.append('file', selectedImage.file)

    try {
      const response = await axios.post(
        'http://localhost:8000/', 
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      if (response.data.error) {
        setError(response.data.error)
        setIsAnalyzing(false)
        return
      }

      const { class: diseaseName, advice } = response.data

      // parse preventive measures if present
      const preventiveRegex = /Preventive measures\:?(.+)/i
      let preventive = []
      if (preventiveRegex.test(advice)) {
        preventive = preventiveRegex
          .exec(advice)[1]
          ?.trim()
          .split(/\.\s*|\n/)
          .filter(line => line && line.length > 2) || []
      }

      setResult({
        disease: {
          name: diseaseName || "Unknown Disease",
          treatment: advice || "No treatment advice available.",
        },
        detailsDetected: formatAdviceText(advice),
        preventiveMeasures: preventive
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
            <Bug className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Disease Detection</h1>
            <p className="text-gray-400">AI-powered plant health analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Brain className="h-5 w-5 animate-pulse text-red-400" />
          <span className="text-sm">AI Powered</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-green-400" />
              Upload Plant Image
            </h2>

            {!selectedImage ? (
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragging 
                    ? 'border-green-400 bg-green-500/10' 
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
                
                <Upload className="h-16 w-16 text-gray-500 mx-auto mb-4" />
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
                    className="w-full h-64 object-cover rounded-xl border border-gray-600"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-gray-900/80 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
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
                  className="w-full button-primary flex items-center justify-center space-x-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </>
                ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      <span>Analyze Image</span>
                    </>
                  )}
                </button>
              </div>
            )}
            {error && <div className="mt-4 text-red-400 text-sm">{error}</div>}
          </div>

          {/* Instructions */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">Best Practices</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300 text-sm">Take clear, well-lit photos of affected leaves</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300 text-sm">Focus on visible symptoms and abnormalities</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300 text-sm">Avoid blurry or heavily shadowed images</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300 text-sm">Include multiple angles if possible</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Main Result */}
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Analysis Result</h2>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>

                <div className="text-center py-6">
                  <div className="text-3xl font-bold text-white mb-2">
                    {result.disease.name}
                  </div>
                </div>
              </div>

              {/* Detection Details */}
              {result.detailsDetected?.length > 0 && (
                <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-400" />
                    Detection Details
                  </h3>
                  
                  <div className="space-y-3">
                    {result.detailsDetected.map((detail, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-1" />
                        <span className="text-slate-300 text-sm">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center">
              <Bug className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Ready to Analyze</h3>
              <p className="text-gray-500">Upload a plant image to get instant AI-powered disease detection and treatment recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiseaseDetection