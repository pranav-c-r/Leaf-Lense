import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, Eye, 
  AlertTriangle, CheckCircle, Clock, Send, Loader, 
  MapPin, Calendar, Zap, Bell, Users, History,
  CloudSnow, CloudLightning, Sunrise, Sunset,
  Gauge, Compass, ArrowUp, ArrowDown, Activity
} from 'lucide-react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'

const WeatherAlerts = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const [isRunningPipeline, setIsRunningPipeline] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [farmers, setFarmers] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('weather')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user)
        fetchUserProfile(user.uid)
        fetchAlerts()
        fetchFarmers()
      }
    })
    return () => unsubscribe()
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8000/farm/farmers`)
      const allFarmers = response.data.farmers
      const userFarmer = allFarmers.find(f => f.userId === userId)
      if (userFarmer) {
        setUserProfile(userFarmer)
        fetchWeatherData(userFarmer.lat, userFarmer.lon)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchWeatherData = async (lat, lon) => {
    if (!lat || !lon) return
    
    setIsLoadingWeather(true)
    setError('')
    
    try {
      // For demo purposes, we'll create mock weather data
      // Replace this with actual OpenWeather API call in production
      const mockWeather = {
        location: userProfile?.district || 'Unknown',
        current: {
          temperature: Math.round(25 + Math.random() * 15),
          feels_like: Math.round(25 + Math.random() * 15),
          humidity: Math.round(60 + Math.random() * 30),
          pressure: Math.round(1010 + Math.random() * 20),
          visibility: Math.round(8 + Math.random() * 7),
          wind_speed: Math.round(5 + Math.random() * 15),
          wind_direction: Math.round(Math.random() * 360),
          uv_index: Math.round(Math.random() * 10),
          condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain'][Math.floor(Math.random() * 5)],
          icon: getWeatherIcon(['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain'][Math.floor(Math.random() * 5)])
        },
        forecast: Array.from({length: 5}, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
          high: Math.round(25 + Math.random() * 15),
          low: Math.round(15 + Math.random() * 10),
          condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain'][Math.floor(Math.random() * 5)],
          precipitation: Math.round(Math.random() * 100),
          humidity: Math.round(60 + Math.random() * 30)
        })),
        alerts: generateWeatherAlerts()
      }
      
      setWeatherData(mockWeather)
    } catch (error) {
      setError('Failed to fetch weather data')
      console.error('Weather fetch error:', error)
    } finally {
      setIsLoadingWeather(false)
    }
  }

  const getWeatherIcon = (condition) => {
    const iconMap = {
      'Clear': Sun,
      'Partly Cloudy': Cloud,
      'Cloudy': Cloud,
      'Light Rain': CloudRain,
      'Heavy Rain': CloudRain,
      'Thunderstorm': CloudLightning,
      'Snow': CloudSnow
    }
    return iconMap[condition] || Sun
  }

  const generateWeatherAlerts = () => {
    const possibleAlerts = [
      { 
        type: 'warning', 
        message: 'Heavy rainfall expected in the next 24 hours. Consider protecting crops.',
        severity: 'high',
        action: 'Take immediate action to protect crops from heavy rain'
      },
      { 
        type: 'info', 
        message: 'Optimal conditions for irrigation detected.',
        severity: 'low',
        action: 'Consider scheduling irrigation activities'
      },
      { 
        type: 'caution', 
        message: 'High humidity may increase disease risk.',
        severity: 'medium',
        action: 'Monitor crops for signs of fungal diseases'
      }
    ]
    
    return Math.random() > 0.5 ? [possibleAlerts[Math.floor(Math.random() * possibleAlerts.length)]] : []
  }

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/farm/farmagent/alerts')
      setAlerts(response.data.alerts || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  const fetchFarmers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/farm/farmagent/farmers')
      setFarmers(response.data.farmers || [])
    } catch (error) {
      console.error('Error fetching farmers:', error)
    }
  }

  const runAlertPipeline = async () => {
    setIsRunningPipeline(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await axios.post('http://localhost:8000/farm/farmagent/run-now')
      setSuccess('Alert pipeline executed successfully! WhatsApp alerts have been sent to all registered farmers.')
      fetchAlerts() // Refresh alerts after running pipeline
    } catch (error) {
      setError('Failed to run alert pipeline: ' + (error.response?.data?.detail || error.message))
    } finally {
      setIsRunningPipeline(false)
    }
  }

  const getAlertSeverityColor = (severity) => {
    const colors = {
      'high': 'bg-red-500/20 text-red-400 border-red-500/30',
      'medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'low': 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
    return colors[severity] || colors['low']
  }

  const tabs = [
    { id: 'weather', name: 'Live Weather', icon: Cloud },
    { id: 'alerts', name: 'Alert History', icon: History },
    { id: 'farmers', name: 'Farmers', icon: Users }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
            <Cloud className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Weather Alert System</h1>
            <p className="text-gray-400">Proactive weather monitoring and farmer alerts</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-gray-800 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-green-400" />
              <span className="text-gray-300">Next run: 6:00 AM</span>
            </div>
          </div>
          
          <button
            onClick={runAlertPipeline}
            disabled={isRunningPipeline}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {isRunningPipeline ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>Run Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-green-400">{success}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'weather' && (
        <div className="space-y-6">
          {/* Current Weather */}
          {userProfile && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                  {userProfile.district}
                </h2>
                <button
                  onClick={() => fetchWeatherData(userProfile.lat, userProfile.lon)}
                  disabled={isLoadingWeather}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  {isLoadingWeather ? (
                    <Loader className="h-3 w-3 animate-spin" />
                  ) : (
                    <Activity className="h-3 w-3" />
                  )}
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingWeather ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-blue-400" />
                </div>
              ) : weatherData ? (
                <div className="space-y-6">
                  {/* Current Conditions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          {React.createElement(weatherData.current.icon, { className: "h-8 w-8 text-white" })}
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-white">
                            {weatherData.current.temperature}°C
                          </div>
                          <div className="text-gray-400">
                            Feels like {weatherData.current.feels_like}°C
                          </div>
                          <div className="text-lg text-gray-300">
                            {weatherData.current.condition}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-blue-400 mb-1">
                          <Droplets className="h-4 w-4" />
                          <span className="text-xs">Humidity</span>
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {weatherData.current.humidity}%
                        </div>
                      </div>
                      
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-green-400 mb-1">
                          <Wind className="h-4 w-4" />
                          <span className="text-xs">Wind</span>
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {weatherData.current.wind_speed} km/h
                        </div>
                      </div>
                      
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-purple-400 mb-1">
                          <Gauge className="h-4 w-4" />
                          <span className="text-xs">Pressure</span>
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {weatherData.current.pressure} hPa
                        </div>
                      </div>
                      
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-yellow-400 mb-1">
                          <Eye className="h-4 w-4" />
                          <span className="text-xs">Visibility</span>
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {weatherData.current.visibility} km
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weather Alerts */}
                  {weatherData.alerts && weatherData.alerts.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Bell className="h-4 w-4 mr-2 text-yellow-400" />
                        Weather Alerts
                      </h3>
                      {weatherData.alerts.map((alert, index) => (
                        <div 
                          key={index}
                          className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}
                        >
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-4 w-4 mt-0.5" />
                            <div>
                              <p className="font-medium">{alert.message}</p>
                              <p className="text-sm mt-1 opacity-90">{alert.action}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 5-Day Forecast */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                      5-Day Forecast
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {weatherData.forecast.map((day, index) => (
                        <div key={index} className="bg-gray-700/50 rounded-lg p-4 text-center">
                          <div className="text-sm text-gray-400 mb-2">{day.date}</div>
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                            {React.createElement(getWeatherIcon(day.condition), { className: "h-5 w-5 text-white" })}
                          </div>
                          <div className="text-sm font-medium text-white">{day.condition}</div>
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <span className="text-white font-semibold">{day.high}°</span>
                            <span className="text-gray-400">{day.low}°</span>
                          </div>
                          <div className="text-xs text-blue-400 mt-1">
                            {day.precipitation}% rain
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Cloud className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Please complete your profile to see weather data</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Alerts</h2>
            <span className="text-sm text-gray-400">{alerts.length} alerts</span>
          </div>
          
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={alert.id || index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Bell className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">
                          Alert for {alert.farmer_name || 'Farmer'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          alert.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                          alert.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{alert.message}</p>
                      {alert.weather_data && (
                        <div className="mt-2 text-xs text-gray-400">
                          Weather: {alert.weather_data.current_temp}°C, {alert.weather_data.conditions}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(alert.timestamp?.seconds * 1000).toLocaleString() || 'Recently'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No alerts yet. Run the pipeline to generate alerts.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'farmers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Registered Farmers</h2>
            <span className="text-sm text-gray-400">{farmers.length} farmers</span>
          </div>
          
          {farmers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {farmers.map((farmer, index) => (
                <div key={farmer.id || index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{farmer.name}</div>
                      <div className="text-sm text-gray-400">{farmer.district}</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Crop:</span>
                      <span className="text-white">{farmer.crop || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stage:</span>
                      <span className="text-white">{farmer.growth_stage || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">WhatsApp:</span>
                      <span className={`${farmer.whatsapp_opt_in ? 'text-green-400' : 'text-red-400'}`}>
                        {farmer.whatsapp_opt_in ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No farmers registered yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default WeatherAlerts
