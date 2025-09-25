import React, { useState } from 'react'
import { PieChart, Calculator, TrendingUp, TrendingDown, DollarSign, Target, AlertCircle } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

// Sample crop data with expected yields and market prices
const cropData = {
  rice: {
    name: { en: 'Rice', hi: 'चावल', ml: 'നെല്ല്' },
    expectedYield: { min: 3500, max: 5500, unit: 'kg/hectare' }, // kg per hectare
    marketPrice: { min: 20, max: 25, current: 22 }, // rupees per kg
    icon: '🌾'
  },
  wheat: {
    name: { en: 'Wheat', hi: 'गेहूं', ml: 'ഗോതമ്പ്' },
    expectedYield: { min: 2500, max: 4000, unit: 'kg/hectare' },
    marketPrice: { min: 18, max: 23, current: 20 },
    icon: '🌾'
  },
  maize: {
    name: { en: 'Maize', hi: 'मक्का', ml: 'ചോളം' },
    expectedYield: { min: 4000, max: 6500, unit: 'kg/hectare' },
    marketPrice: { min: 15, max: 20, current: 17 },
    icon: '🌽'
  },
  sugarcane: {
    name: { en: 'Sugarcane', hi: 'गन्ना', ml: 'കരിമ്പ്' },
    expectedYield: { min: 60000, max: 85000, unit: 'kg/hectare' },
    marketPrice: { min: 2.5, max: 3.2, current: 2.8 },
    icon: '🎋'
  },
  cotton: {
    name: { en: 'Cotton', hi: 'कपास', ml: 'പരുത്തി' },
    expectedYield: { min: 400, max: 600, unit: 'kg/hectare' },
    marketPrice: { min: 45, max: 65, current: 55 },
    icon: '🌱'
  },
  soybean: {
    name: { en: 'Soybean', hi: 'सोयाबीन', ml: 'സോയാബീൻ' },
    expectedYield: { min: 1200, max: 2000, unit: 'kg/hectare' },
    marketPrice: { min: 35, max: 45, current: 40 },
    icon: '🫘'
  }
}

const ProfitCalculator = () => {
  const { t, currentLanguage } = useLanguage()
  const [selectedCrop, setSelectedCrop] = useState('rice')
  const [inputs, setInputs] = useState({
    fieldArea: '',
    unit: 'hectare',
    seedCost: '',
    fertilizerCost: '',
    laborCost: '',
    irrigationCost: '',
    pesticideCost: '',
    otherCosts: ''
  })
  const [results, setResults] = useState(null)

  const currentCrop = cropData[selectedCrop]

  const calculateProfit = () => {
    const area = parseFloat(inputs.fieldArea) || 1
    let areaInHectares = area
    
    // Convert to hectares if needed
    if (inputs.unit === 'acre') {
      areaInHectares = area * 0.4047
    } else if (inputs.unit === 'bigha') {
      areaInHectares = area * 0.2529
    }

    // Calculate total costs
    const totalInputCosts = 
      (parseFloat(inputs.seedCost) || 0) +
      (parseFloat(inputs.fertilizerCost) || 0) +
      (parseFloat(inputs.laborCost) || 0) +
      (parseFloat(inputs.irrigationCost) || 0) +
      (parseFloat(inputs.pesticideCost) || 0) +
      (parseFloat(inputs.otherCosts) || 0)

    // Calculate yields (min, max, average)
    const minYield = currentCrop.expectedYield.min * areaInHectares
    const maxYield = currentCrop.expectedYield.max * areaInHectares
    const avgYield = (minYield + maxYield) / 2

    // Calculate revenue scenarios
    const minRevenue = minYield * currentCrop.marketPrice.min
    const maxRevenue = maxYield * currentCrop.marketPrice.max
    const currentRevenue = avgYield * currentCrop.marketPrice.current

    // Calculate profit scenarios
    const minProfit = minRevenue - totalInputCosts
    const maxProfit = maxRevenue - totalInputCosts
    const currentProfit = currentRevenue - totalInputCosts

    // Calculate profitability metrics
    const profitMargin = ((currentProfit / currentRevenue) * 100).toFixed(2)
    const roi = ((currentProfit / totalInputCosts) * 100).toFixed(2)
    const breakEvenPrice = (totalInputCosts / avgYield).toFixed(2)
    const costPerHectare = (totalInputCosts / areaInHectares).toFixed(2)

    setResults({
      areaInHectares: areaInHectares.toFixed(2),
      totalInputCosts: totalInputCosts.toFixed(2),
      yields: {
        min: minYield.toFixed(0),
        max: maxYield.toFixed(0),
        avg: avgYield.toFixed(0)
      },
      revenue: {
        min: minRevenue.toFixed(2),
        max: maxRevenue.toFixed(2),
        current: currentRevenue.toFixed(2)
      },
      profit: {
        min: minProfit.toFixed(2),
        max: maxProfit.toFixed(2),
        current: currentProfit.toFixed(2)
      },
      metrics: {
        profitMargin: parseFloat(profitMargin),
        roi: parseFloat(roi),
        breakEvenPrice: parseFloat(breakEvenPrice),
        costPerHectare: parseFloat(costPerHectare)
      }
    })
  }

  const getProfitColor = (profit) => {
    const profitValue = parseFloat(profit)
    if (profitValue > 0) return 'text-green-400'
    else if (profitValue < 0) return 'text-red-400'
    else return 'text-slate-400'
  }

  const getProfitIcon = (profit) => {
    const profitValue = parseFloat(profit)
    if (profitValue > 0) return <TrendingUp className="h-5 w-5 text-green-400" />
    else if (profitValue < 0) return <TrendingDown className="h-5 w-5 text-red-400" />
    else return <DollarSign className="h-5 w-5 text-slate-400" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600/20 via-pink-500/20 to-purple-600/20 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl flex items-center justify-center animate-glow">
              <PieChart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                {t('profitCalculator')}
              </h1>
              <p className="text-slate-400 mt-2">
                {t('cropProfitability')}
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
                <Target className="h-5 w-5 mr-2 text-rose-400" />
                Select Crop
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(cropData).map(([key, crop]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCrop(key)}
                    className={`p-3 rounded-xl transition-all duration-200 text-center ${
                      selectedCrop === key
                        ? 'bg-gradient-to-r from-rose-500/20 to-purple-500/20 border border-rose-500/30 text-rose-300'
                        : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 border border-slate-600/30'
                    }`}
                  >
                    <div className="text-xl mb-1">{crop.icon}</div>
                    <div className="text-xs font-medium">{crop.name[currentLanguage]}</div>
                    <div className="text-xs text-slate-400 mt-1">₹{crop.marketPrice.current}/kg</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Area Input */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Field Area</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={inputs.fieldArea}
                  onChange={(e) => setInputs({...inputs, fieldArea: e.target.value})}
                  placeholder="Enter area..."
                  className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50"
                />
                <select
                  value={inputs.unit}
                  onChange={(e) => setInputs({...inputs, unit: e.target.value})}
                  className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50"
                >
                  <option value="hectare">Hectare</option>
                  <option value="acre">Acre</option>
                  <option value="bigha">Bigha</option>
                </select>
              </div>
            </div>

            {/* Cost Inputs */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-blue-400" />
                Input Costs (₹)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Seeds</label>
                  <input
                    type="number"
                    value={inputs.seedCost}
                    onChange={(e) => setInputs({...inputs, seedCost: e.target.value})}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Fertilizers</label>
                  <input
                    type="number"
                    value={inputs.fertilizerCost}
                    onChange={(e) => setInputs({...inputs, fertilizerCost: e.target.value})}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Labor</label>
                  <input
                    type="number"
                    value={inputs.laborCost}
                    onChange={(e) => setInputs({...inputs, laborCost: e.target.value})}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Irrigation</label>
                  <input
                    type="number"
                    value={inputs.irrigationCost}
                    onChange={(e) => setInputs({...inputs, irrigationCost: e.target.value})}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Pesticides</label>
                  <input
                    type="number"
                    value={inputs.pesticideCost}
                    onChange={(e) => setInputs({...inputs, pesticideCost: e.target.value})}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Other Costs</label>
                  <input
                    type="number"
                    value={inputs.otherCosts}
                    onChange={(e) => setInputs({...inputs, otherCosts: e.target.value})}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={calculateProfit}
              className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <PieChart className="h-5 w-5" />
              <span>Calculate Profitability</span>
            </button>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {results ? (
              <>
                {/* Summary */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                  <h3 className="text-xl font-bold text-white mb-4">
                    {currentCrop.name[currentLanguage]} Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/30 rounded-xl p-4">
                      <div className="text-sm text-slate-400 mb-1">Area</div>
                      <div className="text-lg font-bold text-white">{results.areaInHectares} ha</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-4">
                      <div className="text-sm text-slate-400 mb-1">Total Costs</div>
                      <div className="text-lg font-bold text-white">₹{results.totalInputCosts}</div>
                    </div>
                  </div>
                </div>

                {/* Yield & Revenue */}
                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
                  <h3 className="text-xl font-bold text-white mb-4">Expected Yield & Revenue</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-slate-400 mb-1">Min Yield</div>
                        <div className="text-lg font-bold text-white">{results.yields.min} kg</div>
                        <div className="text-sm text-slate-400">₹{results.revenue.min}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-slate-400 mb-1">Avg Yield</div>
                        <div className="text-lg font-bold text-blue-300">{results.yields.avg} kg</div>
                        <div className="text-sm text-blue-300">₹{results.revenue.current}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-slate-400 mb-1">Max Yield</div>
                        <div className="text-lg font-bold text-white">{results.yields.max} kg</div>
                        <div className="text-sm text-slate-400">₹{results.revenue.max}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profit Analysis */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
                  <h3 className="text-xl font-bold text-white mb-4">Profit Analysis</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                        <div className="text-sm text-slate-400 mb-1">Worst Case</div>
                        <div className={`text-lg font-bold ${getProfitColor(results.profit.min)} flex items-center justify-center space-x-1`}>
                          {getProfitIcon(results.profit.min)}
                          <span>₹{results.profit.min}</span>
                        </div>
                      </div>
                      <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                        <div className="text-sm text-slate-400 mb-1">Expected</div>
                        <div className={`text-xl font-bold ${getProfitColor(results.profit.current)} flex items-center justify-center space-x-1`}>
                          {getProfitIcon(results.profit.current)}
                          <span>₹{results.profit.current}</span>
                        </div>
                      </div>
                      <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                        <div className="text-sm text-slate-400 mb-1">Best Case</div>
                        <div className={`text-lg font-bold ${getProfitColor(results.profit.max)} flex items-center justify-center space-x-1`}>
                          {getProfitIcon(results.profit.max)}
                          <span>₹{results.profit.max}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                  <h3 className="text-xl font-bold text-white mb-4">Key Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 rounded-xl p-4">
                      <div className="text-sm text-slate-400 mb-1">Profit Margin</div>
                      <div className={`text-lg font-bold ${results.metrics.profitMargin > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {results.metrics.profitMargin}%
                      </div>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4">
                      <div className="text-sm text-slate-400 mb-1">ROI</div>
                      <div className={`text-lg font-bold ${results.metrics.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {results.metrics.roi}%
                      </div>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4">
                      <div className="text-sm text-slate-400 mb-1">Break-even Price</div>
                      <div className="text-lg font-bold text-white">₹{results.metrics.breakEvenPrice}/kg</div>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4">
                      <div className="text-sm text-slate-400 mb-1">Cost per Hectare</div>
                      <div className="text-lg font-bold text-white">₹{results.metrics.costPerHectare}</div>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-orange-400" />
                    Risk Assessment
                  </h3>
                  <div className="space-y-3">
                    {parseFloat(results.profit.min) < 0 && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                        <p className="text-slate-300 text-sm">
                          Risk of loss in worst case scenario. Consider crop insurance or risk mitigation strategies.
                        </p>
                      </div>
                    )}
                    {results.metrics.roi < 15 && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                        <p className="text-slate-300 text-sm">
                          Low ROI compared to typical farming returns (15-25%). Consider optimizing costs.
                        </p>
                      </div>
                    )}
                    {parseFloat(results.metrics.breakEvenPrice) > currentCrop.marketPrice.current && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                        <p className="text-slate-300 text-sm">
                          Break-even price is higher than current market price. Monitor price trends closely.
                        </p>
                      </div>
                    )}
                    {results.metrics.roi > 20 && parseFloat(results.profit.min) > 0 && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <p className="text-slate-300 text-sm">
                          Good profitability with acceptable risk levels. Consider expanding cultivation area.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
                <PieChart className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Calculate Profitability</h3>
                <p className="text-slate-400">
                  Enter your crop details and input costs to analyze potential profit
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfitCalculator
