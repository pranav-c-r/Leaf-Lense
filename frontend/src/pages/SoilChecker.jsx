import React, { useState } from 'react'
import { TestTube, Target, CheckCircle, XCircle, AlertCircle, Lightbulb } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

// Crop pH suitability data
const cropPHData = {
  rice: {
    name: { en: 'Rice', hi: 'चावल', ml: 'നെല്ല്' },
    optimal: { min: 5.5, max: 6.5 },
    suitable: { min: 5.0, max: 7.0 },
    icon: '🌾'
  },
  wheat: {
    name: { en: 'Wheat', hi: 'गेहूं', ml: 'ഗോതമ്പ്' },
    optimal: { min: 6.0, max: 7.0 },
    suitable: { min: 5.5, max: 8.0 },
    icon: '🌾'
  },
  maize: {
    name: { en: 'Maize', hi: 'मक्का', ml: 'ചോളം' },
    optimal: { min: 6.0, max: 6.8 },
    suitable: { min: 5.8, max: 7.5 },
    icon: '🌽'
  },
  sugarcane: {
    name: { en: 'Sugarcane', hi: 'गन्ना', ml: 'കരിമ്പ്' },
    optimal: { min: 6.0, max: 7.5 },
    suitable: { min: 5.5, max: 8.5 },
    icon: '🎋'
  },
  cotton: {
    name: { en: 'Cotton', hi: 'कपास', ml: 'പരുത്തി' },
    optimal: { min: 5.8, max: 8.0 },
    suitable: { min: 5.5, max: 8.5 },
    icon: '🌱'
  },
  soybean: {
    name: { en: 'Soybean', hi: 'सोयाबीन', ml: 'സോയാബീൻ' },
    optimal: { min: 6.0, max: 6.8 },
    suitable: { min: 5.8, max: 7.2 },
    icon: '🫘'
  },
  tomato: {
    name: { en: 'Tomato', hi: 'टमाटर', ml: 'തക്കാളി' },
    optimal: { min: 6.0, max: 6.8 },
    suitable: { min: 5.5, max: 7.5 },
    icon: '🍅'
  },
  potato: {
    name: { en: 'Potato', hi: 'आलू', ml: 'ഉരുളക്കിഴങ്ങ്' },
    optimal: { min: 5.2, max: 6.4 },
    suitable: { min: 4.8, max: 7.0 },
    icon: '🥔'
  },
  carrot: {
    name: { en: 'Carrot', hi: 'गाजर', ml: 'കാരറ്റ്' },
    optimal: { min: 6.0, max: 6.8 },
    suitable: { min: 5.5, max: 7.5 },
    icon: '🥕'
  },
  onion: {
    name: { en: 'Onion', hi: 'प्याज', ml: 'ഉള്ളി' },
    optimal: { min: 6.0, max: 7.0 },
    suitable: { min: 5.8, max: 7.5 },
    icon: '🧅'
  }
}

const phRecommendations = {
  veryAcidic: {
    range: '< 5.0',
    status: { en: 'Very Acidic', hi: 'अत्यधिक अम्लीय', ml: 'അതീവ അമ്ലത്വം' },
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    recommendations: {
      en: ['Add lime or dolomite', 'Use organic matter', 'Avoid acidifying fertilizers'],
      hi: ['चूना या डोलोमाइट डालें', 'जैविक पदार्थ का उपयोग करें', 'अम्लीकरण करने वाले उर्वरक से बचें'],
      ml: ['കുമ്മായം അല്ലെങ്കിൽ ഡോളോമൈറ്റ് ചേർക്കുക', 'ജൈവവസ്തു ഉപയോഗിക്കുക', 'അമ്ലീകരണ വളങ്ങൾ ഒഴിവാക്കുക']
    }
  },
  acidic: {
    range: '5.0 - 6.0',
    status: { en: 'Acidic', hi: 'अम्लीय', ml: 'അമ്ലത്വം' },
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    recommendations: {
      en: ['Light liming may be needed', 'Monitor nutrient availability', 'Good for acid-loving crops'],
      hi: ['हल्का चूना डालना आवश्यक हो सकता है', 'पोषक तत्वों की उपलब्धता पर नज़र रखें', 'अम्ल पसंद करने वाली फसलों के लिए अच्छा'],
      ml: ['നേരിയ കുമ്മായം ആവശ്യമായേക്കാം', 'പോഷക ലഭ്യത നിരീക്ഷിക്കുക', 'അമ്ല പ്രിയ വിളകൾക്ക് നല്ലത്']
    }
  },
  neutral: {
    range: '6.0 - 7.0',
    status: { en: 'Neutral', hi: 'उदासीन', ml: 'ന്യൂട്രൽ' },
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    recommendations: {
      en: ['Ideal for most crops', 'Maintain current pH', 'Regular soil testing recommended'],
      hi: ['अधिकांश फसलों के लिए आदर्श', 'वर्तमान pH बनाए रखें', 'नियमित मिट्टी परीक्षण की सिफारिश'],
      ml: ['മിക്ക വിളകൾക്കും അനുയോജ്യം', 'നിലവിലെ pH നിലനിർത്തുക', 'പതിവ് മണ്ണ് പരിശോധന ശുപാർശ ചെയ്യുന്നു']
    }
  },
  alkaline: {
    range: '7.0 - 8.0',
    status: { en: 'Alkaline', hi: 'क्षारीय', ml: 'ക്ഷാര' },
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    recommendations: {
      en: ['Add organic matter', 'Use sulfur to lower pH', 'Monitor iron deficiency'],
      hi: ['जैविक पदार्थ डालें', 'pH कम करने के लिए सल्फर का उपयोग करें', 'लोहे की कमी पर नज़र रखें'],
      ml: ['ജൈവവസ്തു ചേർക്കുക', 'pH കുറയ്ക്കാൻ സൾഫർ ഉപയോഗിക്കുക', 'ഇരുമ്പിന്റെ കുറവ് നിരീക്ഷിക്കുക']
    }
  },
  veryAlkaline: {
    range: '> 8.0',
    status: { en: 'Very Alkaline', hi: 'अत्यधिक क्षारीय', ml: 'അതീവ ക്ഷാരത്വം' },
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    recommendations: {
      en: ['Urgent pH correction needed', 'Add sulfur and organic matter', 'Consider gypsum application'],
      hi: ['तत्काल pH सुधार की आवश्यकता', 'सल्फर और जैविक पदार्थ डालें', 'जिप्सम का प्रयोग करने पर विचार करें'],
      ml: ['അടിയന്തര pH തിരുത്തൽ ആവശ്യം', 'സൾഫറും ജൈവവസ്തുവും ചേർക്കുക', 'ജിപ്സം പ്രയോഗം പരിഗണിക്കുക']
    }
  }
}

const SoilChecker = () => {
  const { t, currentLanguage } = useLanguage()
  const [soilPH, setSoilPH] = useState('')
  const [results, setResults] = useState(null)

  const checkSuitability = () => {
    const pH = parseFloat(soilPH)
    if (!pH || pH < 3 || pH > 11) return

    const suitableCrops = []
    const optimalCrops = []
    const unsuitableCrops = []

    Object.entries(cropPHData).forEach(([key, crop]) => {
      if (pH >= crop.optimal.min && pH <= crop.optimal.max) {
        optimalCrops.push({ key, ...crop, status: 'optimal' })
      } else if (pH >= crop.suitable.min && pH <= crop.suitable.max) {
        suitableCrops.push({ key, ...crop, status: 'suitable' })
      } else {
        unsuitableCrops.push({ key, ...crop, status: 'unsuitable' })
      }
    })

    // Get pH category and recommendations
    let phCategory
    if (pH < 5.0) phCategory = phRecommendations.veryAcidic
    else if (pH < 6.0) phCategory = phRecommendations.acidic
    else if (pH <= 7.0) phCategory = phRecommendations.neutral
    else if (pH <= 8.0) phCategory = phRecommendations.alkaline
    else phCategory = phRecommendations.veryAlkaline

    setResults({
      pH,
      phCategory,
      optimalCrops,
      suitableCrops,
      unsuitableCrops
    })
  }

  const CropCard = ({ crop, status }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'optimal': return 'border-green-500/30 bg-green-500/10'
        case 'suitable': return 'border-yellow-500/30 bg-yellow-500/10'
        case 'unsuitable': return 'border-red-500/30 bg-red-500/10'
        default: return 'border-slate-600/30 bg-slate-700/30'
      }
    }

    const getStatusIcon = () => {
      switch (status) {
        case 'optimal': return <CheckCircle className="h-4 w-4 text-green-400" />
        case 'suitable': return <AlertCircle className="h-4 w-4 text-yellow-400" />
        case 'unsuitable': return <XCircle className="h-4 w-4 text-red-400" />
        default: return null
      }
    }

    return (
      <div className={`rounded-xl p-4 border transition-all duration-200 ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{crop.icon}</span>
            <span className="font-medium text-white text-sm">{crop.name[currentLanguage]}</span>
          </div>
          {getStatusIcon()}
        </div>
        <div className="text-xs text-slate-400">
          Optimal: {crop.optimal.min} - {crop.optimal.max}
        </div>
        <div className="text-xs text-slate-400">
          Suitable: {crop.suitable.min} - {crop.suitable.max}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-lime-600/20 via-green-500/20 to-emerald-600/20 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-lime-500 to-green-600 rounded-2xl flex items-center justify-center animate-glow">
              <TestTube className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                {t('soilChecker')}
              </h1>
              <p className="text-slate-400 mt-2">
                {t('soilSuitabilityCheck')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            {/* pH Input */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <TestTube className="h-5 w-5 mr-2 text-lime-400" />
                Enter Soil pH
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Soil pH Value (3.0 - 11.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="3"
                    max="11"
                    value={soilPH}
                    onChange={(e) => setSoilPH(e.target.value)}
                    placeholder="e.g., 6.5"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50"
                  />
                </div>
                <button
                  onClick={checkSuitability}
                  disabled={!soilPH || parseFloat(soilPH) < 3 || parseFloat(soilPH) > 11}
                  className="w-full bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Target className="h-5 w-5" />
                  <span>Check Crop Suitability</span>
                </button>
              </div>
            </div>

            {/* pH Scale Reference */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
                pH Scale Reference
              </h3>
              <div className="space-y-3">
                {Object.entries(phRecommendations).map(([key, category]) => (
                  <div key={key} className={`p-3 rounded-xl border ${category.bgColor} ${category.borderColor}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${category.color}`}>
                        {category.status[currentLanguage]}
                      </span>
                      <span className="text-slate-400 text-sm">{category.range}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {results ? (
              <>
                {/* pH Status */}
                <div className={`rounded-2xl p-6 border ${results.phCategory.bgColor} ${results.phCategory.borderColor}`}>
                  <h3 className="text-xl font-bold text-white mb-4">
                    pH Analysis Results
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Your soil pH:</span>
                      <span className="text-2xl font-bold text-white">{results.pH}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Status:</span>
                      <span className={`font-semibold ${results.phCategory.color}`}>
                        {results.phCategory.status[currentLanguage]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {results.phCategory.recommendations[currentLanguage].map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-lime-400 rounded-full mt-2"></div>
                        <span className="text-slate-300 text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Optimal Crops */}
                {results.optimalCrops.length > 0 && (
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                      Optimal Crops ({results.optimalCrops.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.optimalCrops.map((crop) => (
                        <CropCard key={crop.key} crop={crop} status="optimal" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Suitable Crops */}
                {results.suitableCrops.length > 0 && (
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-yellow-400" />
                      Suitable Crops ({results.suitableCrops.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.suitableCrops.map((crop) => (
                        <CropCard key={crop.key} crop={crop} status="suitable" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Unsuitable Crops */}
                {results.unsuitableCrops.length > 0 && (
                  <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <XCircle className="h-5 w-5 mr-2 text-red-400" />
                      Not Recommended ({results.unsuitableCrops.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.unsuitableCrops.map((crop) => (
                        <CropCard key={crop.key} crop={crop} status="unsuitable" />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
                <TestTube className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Enter Soil pH</h3>
                <p className="text-slate-400">
                  Enter your soil pH value to get crop suitability recommendations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SoilChecker
