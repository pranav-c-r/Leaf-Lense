import React, { useState } from 'react'
import { Calculator, Ruler, MapPin, Wheat, Target, Lightbulb } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

// Seed data for different crops
const seedData = {
  rice: {
    name: { en: 'Rice', hi: 'चावल', ml: 'അരി' },
    seedRate: { kg: 20, perUnit: 'hectare' }, // kg per hectare
    spacing: { 
      rowToRow: 20, // cm
      plantToPlant: 15, // cm
      description: { en: '20cm x 15cm', hi: '20 सेमी x 15 सेमी', ml: '20സെ.മീ x 15സെ.മീ' }
    },
    plantsPerHill: 2,
    germinationRate: 85, // percentage
    seedWeight: 22 // grams per 1000 seeds
  },
  wheat: {
    name: { en: 'Wheat', hi: 'गेहूं', ml: 'ഗോതമ്പ്' },
    seedRate: { kg: 100, perUnit: 'hectare' },
    spacing: { 
      rowToRow: 18, 
      plantToPlant: 3,
      description: { en: '18cm x 3cm', hi: '18 सेमी x 3 सेमी', ml: '18സെ.മീ x 3സെ.മീ' }
    },
    plantsPerHill: 1,
    germinationRate: 90,
    seedWeight: 40
  },
  maize: {
    name: { en: 'Maize', hi: 'मक्का', ml: 'ചോളം' },
    seedRate: { kg: 25, perUnit: 'hectare' },
    spacing: { 
      rowToRow: 60, 
      plantToPlant: 25,
      description: { en: '60cm x 25cm', hi: '60 सेमी x 25 सेमी', ml: '60സെ.മീ x 25സെ.മീ' }
    },
    plantsPerHill: 1,
    germinationRate: 85,
    seedWeight: 300
  },
  sugarcane: {
    name: { en: 'Sugarcane', hi: 'गन्ना', ml: 'കരിമ്പ്' },
    seedRate: { kg: 40000, perUnit: 'hectare' }, // actually in kg of setts
    spacing: { 
      rowToRow: 90, 
      plantToPlant: 30,
      description: { en: '90cm x 30cm', hi: '90 सेमी x 30 सेमी', ml: '90സെ.മീ x 30സെ.മീ' }
    },
    plantsPerHill: 1,
    germinationRate: 80,
    seedWeight: 1000 // different unit for sugarcane
  },
  soybean: {
    name: { en: 'Soybean', hi: 'सोयाबीन', ml: 'സോയാബീൻ' },
    seedRate: { kg: 75, perUnit: 'hectare' },
    spacing: { 
      rowToRow: 30, 
      plantToPlant: 10,
      description: { en: '30cm x 10cm', hi: '30 सेमी x 10 सेमी', ml: '30സെ.മീ x 10സെ.മീ' }
    },
    plantsPerHill: 1,
    germinationRate: 85,
    seedWeight: 150
  },
  cotton: {
    name: { en: 'Cotton', hi: 'कपास', ml: 'പരുത്തി' },
    seedRate: { kg: 15, perUnit: 'hectare' },
    spacing: { 
      rowToRow: 90, 
      plantToPlant: 30,
      description: { en: '90cm x 30cm', hi: '90 सेमी x 30 सेमी', ml: '90സെ.മീ x 30സെ.മീ' }
    },
    plantsPerHill: 1,
    germinationRate: 80,
    seedWeight: 100
  }
}

const SeedCalculator = () => {
  const { t, currentLanguage } = useLanguage()
  const [selectedCrop, setSelectedCrop] = useState('rice')
  const [fieldArea, setFieldArea] = useState('')
  const [unit, setUnit] = useState('hectare')
  const [results, setResults] = useState(null)

  const currentCrop = seedData[selectedCrop]

  const calculateSeedRequirement = () => {
    if (!fieldArea || fieldArea <= 0) return

    let areaInHectares = parseFloat(fieldArea)
    
    // Convert to hectares if needed
    if (unit === 'acre') {
      areaInHectares = areaInHectares * 0.4047 // 1 acre = 0.4047 hectares
    } else if (unit === 'bigha') {
      areaInHectares = areaInHectares * 0.2529 // 1 bigha = 0.2529 hectares (varies by region, using standard)
    }

    // Calculate seed requirement
    const baseSeedRate = currentCrop.seedRate.kg
    const germinationAdjustment = 100 / currentCrop.germinationRate
    const adjustedSeedRate = baseSeedRate * germinationAdjustment
    
    const totalSeedNeeded = adjustedSeedRate * areaInHectares
    
    // Calculate spacing details
    const rowSpacing = currentCrop.spacing.rowToRow / 100 // convert cm to meters
    const plantSpacing = currentCrop.spacing.plantToPlant / 100 // convert cm to meters
    
    const plantsPerSquareMeter = 1 / (rowSpacing * plantSpacing)
    const totalPlants = plantsPerSquareMeter * areaInHectares * 10000 // 1 hectare = 10000 sq meters
    
    setResults({
      seedRequired: Math.round(totalSeedNeeded * 100) / 100,
      seedRequiredWithBuffer: Math.round(totalSeedNeeded * 1.1 * 100) / 100, // 10% buffer
      totalPlants: Math.round(totalPlants),
      plantsPerSquareMeter: Math.round(plantsPerSquareMeter * 100) / 100,
      areaCalculated: Math.round(areaInHectares * 100) / 100
    })
  }

  const convertArea = (area, fromUnit, toUnit) => {
    let hectares = area
    
    if (fromUnit === 'acre') hectares = area * 0.4047
    else if (fromUnit === 'bigha') hectares = area * 0.2529
    
    if (toUnit === 'hectare') return hectares
    else if (toUnit === 'acre') return hectares / 0.4047
    else if (toUnit === 'bigha') return hectares / 0.2529
    
    return hectares
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600/20 via-green-500/20 to-emerald-600/20 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center animate-glow">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                {t('seedCalculator')}
              </h1>
              <p className="text-slate-400 mt-2">
                {t('calculateSeedRates')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            {/* Crop Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Wheat className="h-5 w-5 mr-2 text-teal-400" />
                Select Crop
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(seedData).map(([key, crop]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCrop(key)}
                    className={`p-4 rounded-xl transition-all duration-200 ${
                      selectedCrop === key
                        ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/30 text-teal-300'
                        : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 border border-slate-600/30'
                    }`}
                  >
                    <div className="font-medium text-sm">{crop.name[currentLanguage]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Area Input */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-400" />
                Field Area
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Enter Field Area
                  </label>
                  <input
                    type="number"
                    value={fieldArea}
                    onChange={(e) => setFieldArea(e.target.value)}
                    placeholder="Enter area..."
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                  >
                    <option value="hectare">Hectare</option>
                    <option value="acre">Acre</option>
                    <option value="bigha">Bigha</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateSeedRequirement}
              disabled={!fieldArea || fieldArea <= 0}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Target className="h-5 w-5" />
              <span>Calculate Requirements</span>
            </button>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Crop Details */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Ruler className="h-5 w-5 mr-2 text-purple-400" />
                {currentCrop.name[currentLanguage]} Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Seed Rate</span>
                  <span className="text-white font-medium">{currentCrop.seedRate.kg} kg/hectare</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Spacing</span>
                  <span className="text-white font-medium">{currentCrop.spacing.description[currentLanguage]}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Germination Rate</span>
                  <span className="text-white font-medium">{currentCrop.germinationRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">1000 Seed Weight</span>
                  <span className="text-white font-medium">{currentCrop.seedWeight}g</span>
                </div>
              </div>
            </div>

            {/* Results */}
            {results && (
              <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-teal-500/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-teal-400" />
                  Calculation Results
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-1">Area Calculated</div>
                    <div className="text-2xl font-bold text-teal-300">{results.areaCalculated} hectares</div>
                    <div className="text-sm text-slate-400">
                      ({convertArea(results.areaCalculated, 'hectare', 'acre').toFixed(2)} acres, {convertArea(results.areaCalculated, 'hectare', 'bigha').toFixed(2)} bighas)
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 rounded-xl p-4">
                      <div className="text-sm text-slate-400 mb-1">Seed Required</div>
                      <div className="text-xl font-bold text-white">{results.seedRequired} kg</div>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4">
                      <div className="text-sm text-slate-400 mb-1">With 10% Buffer</div>
                      <div className="text-xl font-bold text-emerald-300">{results.seedRequiredWithBuffer} kg</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 rounded-xl p-4">
                      <div className="text-sm text-slate-400 mb-1">Total Plants</div>
                      <div className="text-lg font-bold text-white">{results.totalPlants.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4">
                      <div className="text-sm text-slate-400 mb-1">Plants per m²</div>
                      <div className="text-lg font-bold text-white">{results.plantsPerSquareMeter}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
                Pro Tips
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <p className="text-slate-300 text-sm">
                    {currentLanguage === 'en' 
                      ? 'Always add 10-15% buffer for better field establishment'
                      : currentLanguage === 'hi'
                      ? 'बेहतर खेत स्थापना के लिए हमेशा 10-15% अतिरिक्त बीज रखें'
                      : 'മെച്ചപ്പെട്ട വയൽ സ്ഥാപനത്തിനായി എപ്പോഴും 10-15% അധിക വിത്ത് സൂക്ഷിക്കുക'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <p className="text-slate-300 text-sm">
                    {currentLanguage === 'en' 
                      ? 'Check seed germination rate before final calculation'
                      : currentLanguage === 'hi'
                      ? 'अंतिम गणना से पहले बीज अंकुरण दर की जांच करें'
                      : 'അവസാന കണക്കുകൂട്ടലിന് മുമ്പ് വിത്ത് മുളക്കൽ നിരക്ക് പരിശോധിക്കുക'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <p className="text-slate-300 text-sm">
                    {currentLanguage === 'en' 
                      ? 'Maintain proper spacing for optimal plant growth'
                      : currentLanguage === 'hi'
                      ? 'इष्टतम पौधे की वृद्धि के लिए उचित दूरी बनाए रखें'
                      : 'ഒപ്റ്റിമൽ സസ്യ വളർച്ചയ്ക്കായി ശരിയായ അകലം പാലിക്കുക'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeedCalculator
