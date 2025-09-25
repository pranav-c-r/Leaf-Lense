import { useState } from 'react'
import { DollarSign, TrendingUp, Calendar, MapPin, Package, Zap, Brain, AlertCircle, CheckCircle, Info } from 'lucide-react'

const PricePrediction = () => {
  const [formData, setFormData] = useState({
    month: '',
    commodity_name: '',
    avg_min_price: '',
    avg_max_price: '',
    state_name: '',
    district_name: '',
    calculationType: '',
    change: '',
  })
  
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sample data arrays
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const commodities = [
    'Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Groundnut',
    'Soybean', 'Turmeric', 'Coriander', 'Chili', 'Onion', 'Potato',
    'Tomato', 'Banana', 'Mango', 'Orange', 'Apple', 'Grapes',
    'Tea', 'Coffee', 'Rubber', 'Coconut', 'Areca nut', 'Cardamom',
    'Black pepper', 'Ginger', 'Garlic', 'Lemon', 'Jowar', 'Bajra',
    'Ragi', 'Barley', 'Gram', 'Tur', 'Moong', 'Urad', 'Linseed',
    'Castor seed', 'Sesamum', 'Safflower', 'Nigerseed', 'Sunflower'
  ]

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal', 'Delhi', 'Chandigarh', 'Dadra and Nagar Haveli',
    'Daman and Diu', 'Lakshadweep', 'Puducherry'
  ]

  const calculationTypes = [
    'Modal Price', 'Minimum Price', 'Maximum Price', 'Average Price'
  ]

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setPrediction(null)
    setError('')

    // Prepare the data payload for the API
    const apiPayload = {
      month: formData.month,
      commodity_name: formData.commodity_name,
      avg_min_price: parseFloat(formData.avg_min_price),
      avg_max_price: parseFloat(formData.avg_max_price),
      state_name: formData.state_name,
      district_name: formData.district_name,
      calculationType: formData.calculationType,
      change: parseFloat(formData.change),
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/price/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        setError(result.error)
      } else {
        setPrediction({
          price: result.predicted_price,
          commodity: formData.commodity_name,
          confidence: 'High', // You can calculate this based on model metrics
          trend: result.predicted_price > ((parseFloat(formData.avg_min_price) + parseFloat(formData.avg_max_price)) / 2) ? 'up' : 'down',
          recommendations: [
            `Based on current market trends, ${formData.commodity_name} is expected to trade at ₹${result.predicted_price.toFixed(2)}.`,
            'Consider market timing and storage costs when making decisions.',
            'Monitor weather conditions and government policies for price fluctuations.'
          ]
        })
      }
    } catch (err) {
      console.error('Failed to fetch prediction:', err)
      setError('Failed to connect to the prediction service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Price Prediction</h1>
            <p className="text-slate-400">AI-powered crop price forecasting</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Brain className="h-5 w-5 animate-pulse text-green-400" />
          <span className="text-sm">AI Powered</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Package className="h-5 w-5 mr-2 text-green-400" />
              Commodity & Market Details
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Commodity
                  </label>
                  <select
                    name="commodity_name"
                    value={formData.commodity_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  >
                    <option value="">Select commodity</option>
                    {commodities.map(commodity => (
                      <option key={commodity} value={commodity}>{commodity}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Month
                  </label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  >
                    <option value="">Select month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    State
                  </label>
                  <select
                    name="state_name"
                    value={formData.state_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  >
                    <option value="">Select state</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    District
                  </label>
                  <input
                    type="text"
                    name="district_name"
                    value={formData.district_name}
                    onChange={handleInputChange}
                    placeholder="Enter district name"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Calculation Type
                </label>
                <select
                  name="calculationType"
                  value={formData.calculationType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                  required
                >
                  <option value="">Select calculation type</option>
                  {calculationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <h3 className="text-lg font-semibold text-white mt-6 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
                Price Range & Market Data
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Average Minimum Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="avg_min_price"
                    value={formData.avg_min_price}
                    onChange={handleInputChange}
                    placeholder="1000"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Average Maximum Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="avg_max_price"
                    value={formData.avg_max_price}
                    onChange={handleInputChange}
                    placeholder="1500"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Price Change (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="change"
                  value={formData.change}
                  onChange={handleInputChange}
                  placeholder="5.2"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full button-primary mt-6 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Predicting...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Predict Price</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Information Card */}
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-400" />
              How It Works
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-300 text-sm">AI analyzes historical price patterns and market trends</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-300 text-sm">Considers seasonal variations and regional factors</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-slate-300 text-sm">Provides accurate price forecasts for better decisions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {prediction ? (
            <>
              {/* Main Prediction */}
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Predicted Price</h2>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className={`h-5 w-5 ${prediction.trend === 'up' ? 'text-green-400' : 'text-red-400'}`} />
                    <span className="text-sm text-slate-300">{prediction.confidence} Confidence</span>
                  </div>
                </div>
                
                <div className="text-center py-6">
                  <div className="text-5xl font-bold text-gradient mb-2">
                    ₹{prediction.price.toFixed(2)}
                  </div>
                  <div className="text-lg text-slate-300">per unit</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{prediction.commodity}</div>
                    <div className="text-sm text-slate-400">Commodity</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${prediction.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                      {prediction.trend === 'up' ? '↗' : '↘'} {Math.abs(parseFloat(formData.change) || 0).toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-400">Price Trend</div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-400" />
                  AI Recommendations
                </h3>
                
                <div className="space-y-3">
                  {prediction.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-1" />
                      <span className="text-slate-300 text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
              <DollarSign className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">Ready to Predict</h3>
              <p className="text-slate-500">Fill in the commodity details to get AI-powered price predictions for better market decisions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PricePrediction
