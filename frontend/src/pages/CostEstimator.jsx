import React, { useState } from 'react'
import { DollarSign, Plus, Minus, Calculator, ShoppingCart, Trash2, Edit3, Target } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

// Cost data for different farming inputs
const costData = {
  seeds: {
    rice: { price: 45, unit: 'kg', name: { en: 'Rice Seeds', hi: 'धान के बीज', ml: 'നെല്ലിന്റെ വിത്ത്' } },
    wheat: { price: 25, unit: 'kg', name: { en: 'Wheat Seeds', hi: 'गेहूं के बीज', ml: 'ഗോതമ്പിന്റെ വിത്ത്' } },
    maize: { price: 300, unit: 'kg', name: { en: 'Maize Seeds', hi: 'मक्के के बीज', ml: 'ചോളത്തിന്റെ വിത്ത്' } },
    cotton: { price: 400, unit: 'kg', name: { en: 'Cotton Seeds', hi: 'कपास के बीज', ml: 'പരുത്തിയുടെ വിത്ത്' } },
    soybean: { price: 80, unit: 'kg', name: { en: 'Soybean Seeds', hi: 'सोयाबीन के बीज', ml: 'സോയാബീൻ വിത്ത്' } }
  },
  fertilizers: {
    urea: { price: 6, unit: 'kg', name: { en: 'Urea', hi: 'यूरिया', ml: 'യൂറിയ' } },
    dap: { price: 24, unit: 'kg', name: { en: 'DAP', hi: 'डी.ए.पी.', ml: 'ഡി.എ.പി' } },
    potash: { price: 17, unit: 'kg', name: { en: 'Potash', hi: 'पोटाश', ml: 'പൊട്ടാഷ്' } },
    compost: { price: 3, unit: 'kg', name: { en: 'Compost', hi: 'कम्पोस्ट', ml: 'കമ്പോസ്റ്റ്' } },
    vermicompost: { price: 8, unit: 'kg', name: { en: 'Vermicompost', hi: 'वर्मी कम्पोस्ट', ml: 'വേമി കമ്പോസ്റ്റ്' } }
  },
  pesticides: {
    insecticide: { price: 400, unit: 'liter', name: { en: 'General Insecticide', hi: 'सामान्य कीटनाशक', ml: 'സാധാരണ കീടനാശിനി' } },
    fungicide: { price: 350, unit: 'liter', name: { en: 'Fungicide', hi: 'फंगीसाइड', ml: 'ഫംഗിസൈഡ്' } },
    herbicide: { price: 300, unit: 'liter', name: { en: 'Herbicide', hi: 'खरपतवारनाशक', ml: 'കളനാശിനി' } },
    bioPesticide: { price: 250, unit: 'liter', name: { en: 'Bio-Pesticide', hi: 'जैविक कीटनाशक', ml: 'ജൈവ കീടനാശിനി' } }
  },
  labor: {
    plowing: { price: 1200, unit: 'hectare', name: { en: 'Plowing', hi: 'जुताई', ml: 'ഉഴൽ' } },
    sowing: { price: 800, unit: 'hectare', name: { en: 'Sowing', hi: 'बुवाई', ml: 'വിതയൽ' } },
    weeding: { price: 600, unit: 'hectare', name: { en: 'Weeding', hi: 'खरपतवार हटाना', ml: 'കള നിർമാർജനം' } },
    harvesting: { price: 2000, unit: 'hectare', name: { en: 'Harvesting', hi: 'कटाई', ml: 'വിളവെടുപ്പ്' } },
    irrigation: { price: 500, unit: 'hectare', name: { en: 'Irrigation', hi: 'सिंचाई', ml: 'ജലസേചനം' } }
  },
  equipment: {
    tractor: { price: 1500, unit: 'day', name: { en: 'Tractor Rent', hi: 'ट्रैक्टर किराया', ml: 'ട്രാക്ടർ വാടക' } },
    thresher: { price: 800, unit: 'day', name: { en: 'Thresher', hi: 'थ्रेशर', ml: 'മെതനി യന്ത്രം' } },
    sprayer: { price: 200, unit: 'day', name: { en: 'Sprayer', hi: 'स्प्रेयर', ml: 'സ്പ്രേയർ' } },
    harvester: { price: 3000, unit: 'day', name: { en: 'Harvester', hi: 'हार्वेस्टर', ml: 'ഹാർവെസ്റ്റർ' } }
  }
}

const CostEstimator = () => {
  const { t, currentLanguage } = useLanguage()
  const [selectedItems, setSelectedItems] = useState([])
  const [fieldArea, setFieldArea] = useState('')
  const [unit, setUnit] = useState('hectare')
  const [activeCategory, setActiveCategory] = useState('seeds')

  const addItem = (category, itemKey, itemData) => {
    const newItem = {
      id: Date.now(),
      category,
      key: itemKey,
      name: itemData.name[currentLanguage],
      price: itemData.price,
      unit: itemData.unit,
      quantity: 1
    }
    setSelectedItems([...selectedItems, newItem])
  }

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }
    setSelectedItems(selectedItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ))
  }

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id))
  }

  const calculateTotalCost = () => {
    const area = parseFloat(fieldArea) || 1
    let areaInHectares = area
    
    if (unit === 'acre') {
      areaInHectares = area * 0.4047
    } else if (unit === 'bigha') {
      areaInHectares = area * 0.2529
    }

    return selectedItems.reduce((total, item) => {
      let itemCost = item.price * item.quantity
      
      // For per-hectare items, multiply by area
      if (item.unit === 'hectare') {
        itemCost *= areaInHectares
      }
      
      return total + itemCost
    }, 0)
  }

  const getCategoryIcon = (category) => {
    const icons = {
      seeds: '🌱',
      fertilizers: '🧪',
      pesticides: '🚫',
      labor: '👨‍🌾',
      equipment: '🚜'
    }
    return icons[category] || '📦'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600/20 via-yellow-500/20 to-orange-600/20 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center animate-glow">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                {t('costEstimator')}
              </h1>
              <p className="text-slate-400 mt-2">
                {t('farmingCostEstimation')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Field Area */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-400" />
                Field Area (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  value={fieldArea}
                  onChange={(e) => setFieldArea(e.target.value)}
                  placeholder="Enter field area..."
                  className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                >
                  <option value="hectare">Hectare</option>
                  <option value="acre">Acre</option>
                  <option value="bigha">Bigha</option>
                </select>
              </div>
            </div>

            {/* Category Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-purple-400" />
                Select Category
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.keys(costData).map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`p-3 rounded-xl transition-all duration-200 text-center ${
                      activeCategory === category
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300'
                        : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 border border-slate-600/30'
                    }`}
                  >
                    <div className="text-xl mb-1">{getCategoryIcon(category)}</div>
                    <div className="text-xs font-medium capitalize">{category}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Items List */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">{getCategoryIcon(activeCategory)}</span>
                {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(costData[activeCategory]).map(([key, item]) => (
                  <div
                    key={key}
                    className="bg-slate-700/30 rounded-xl p-4 hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/30"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-white text-sm">{item.name[currentLanguage]}</h4>
                        <p className="text-xs text-slate-400">₹{item.price} per {item.unit}</p>
                      </div>
                      <button
                        onClick={() => addItem(activeCategory, key, item)}
                        className="p-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg border border-amber-500/30 text-amber-400 transition-all duration-200"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="space-y-6">
            {/* Selected Items */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-green-400" />
                Selected Items ({selectedItems.length})
              </h3>
              
              {selectedItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No items selected</p>
                  <p className="text-slate-500 text-sm mt-1">Add items from the categories</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedItems.map(item => (
                    <div key={item.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-white text-sm">{item.name}</h4>
                          <p className="text-xs text-slate-400">₹{item.price} per {item.unit}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 bg-slate-600/50 hover:bg-slate-600 rounded text-white transition-colors duration-200"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 1)}
                            className="w-16 px-2 py-1 bg-slate-600/50 border border-slate-500/50 rounded text-white text-center text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 bg-slate-600/50 hover:bg-slate-600 rounded text-white transition-colors duration-200"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white">
                            ₹{(item.price * item.quantity * (item.unit === 'hectare' && fieldArea ? (unit === 'acre' ? parseFloat(fieldArea) * 0.4047 : unit === 'bigha' ? parseFloat(fieldArea) * 0.2529 : parseFloat(fieldArea)) : 1)).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Cost */}
            {selectedItems.length > 0 && (
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-amber-400" />
                  Total Cost Estimate
                </h3>
                
                <div className="space-y-4">
                  {fieldArea && (
                    <div className="bg-slate-800/30 rounded-xl p-4">
                      <div className="text-sm text-slate-400 mb-1">Field Area</div>
                      <div className="text-lg font-bold text-white">
                        {fieldArea} {unit}
                        {unit !== 'hectare' && (
                          <span className="text-sm text-slate-400 ml-2">
                            ({unit === 'acre' ? (parseFloat(fieldArea) * 0.4047).toFixed(2) : (parseFloat(fieldArea) * 0.2529).toFixed(2)} hectares)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-1">Total Investment</div>
                    <div className="text-3xl font-bold text-amber-300">
                      ₹{calculateTotalCost().toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-1">Cost per Hectare</div>
                    <div className="text-xl font-bold text-white">
                      ₹{fieldArea ? (calculateTotalCost() / (unit === 'acre' ? parseFloat(fieldArea) * 0.4047 : unit === 'bigha' ? parseFloat(fieldArea) * 0.2529 : parseFloat(fieldArea))).toFixed(2) : calculateTotalCost().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CostEstimator
