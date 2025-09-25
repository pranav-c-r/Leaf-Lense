import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Cloud, 
  Thermometer, 
  Droplets,
  TrendingUp,
  Calendar,
  Leaf,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Star,
  BarChart,
  Activity,
  Sun,
  CloudRain,
  Wind,
  Target,
  Lightbulb,
  Zap,
  Wheat,
  Package
} from 'lucide-react';
import { auth, database } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const CropRecommendations = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('current');
  const [activeFilter, setActiveFilter] = useState('all');

  // Mock weather and market data - in production, this would come from APIs
  const mockWeatherData = {
    temperature: 28,
    humidity: 65,
    rainfall: 120,
    soilMoisture: 70,
    season: 'Kharif',
    windSpeed: 15,
    forecast: [
      { day: 'Today', temp: 28, condition: 'Sunny', rain: 0 },
      { day: 'Tomorrow', temp: 31, condition: 'Partly Cloudy', rain: 10 },
      { day: 'Day 3', temp: 29, condition: 'Rainy', rain: 80 },
      { day: 'Day 4', temp: 27, condition: 'Cloudy', rain: 30 },
      { day: 'Day 5', temp: 30, condition: 'Sunny', rain: 0 }
    ]
  };

  // AI-generated recommendations based on conditions
  const mockRecommendations = [
    {
      id: 1,
      cropName: 'Rice',
      variety: 'Basmati 1121',
      suitabilityScore: 95,
      expectedYield: '4-5 tons/hectare',
      marketPrice: '₹2,800/quintal',
      profitMargin: 'High',
      growthDuration: '120-130 days',
      waterRequirement: 'High',
      riskLevel: 'Low',
      marketDemand: 'Very High',
      advantages: [
        'Perfect weather conditions for rice cultivation',
        'High market demand and good prices',
        'Suitable soil moisture levels',
        'Proven variety for your region'
      ],
      disadvantages: [
        'High water requirement',
        'Longer growth period'
      ],
      bestPlantingTime: 'June-July',
      harvestTime: 'October-November',
      marketTrends: 'Increasing demand, stable prices',
      category: 'cereal'
    },
    {
      id: 2,
      cropName: 'Cotton',
      variety: 'Bt Cotton',
      suitabilityScore: 88,
      expectedYield: '2-3 tons/hectare',
      marketPrice: '₹5,200/quintal',
      profitMargin: 'Very High',
      growthDuration: '150-180 days',
      waterRequirement: 'Medium',
      riskLevel: 'Medium',
      marketDemand: 'High',
      advantages: [
        'Excellent profitability',
        'Good weather conditions',
        'Strong export demand',
        'Pest-resistant variety'
      ],
      disadvantages: [
        'Longer growth cycle',
        'Market price volatility',
        'Requires careful pest management'
      ],
      bestPlantingTime: 'May-June',
      harvestTime: 'October-December',
      marketTrends: 'Strong export market, rising prices',
      category: 'cash'
    },
    {
      id: 3,
      cropName: 'Sugarcane',
      variety: 'Co 86032',
      suitabilityScore: 82,
      expectedYield: '80-100 tons/hectare',
      marketPrice: '₹280/quintal',
      profitMargin: 'Medium',
      growthDuration: '12-18 months',
      waterRequirement: 'High',
      riskLevel: 'Low',
      marketDemand: 'Stable',
      advantages: [
        'Long-term stable income',
        'Guaranteed government purchase',
        'Suitable climate conditions',
        'Good soil fertility match'
      ],
      disadvantages: [
        'Very long growth period',
        'High water requirement',
        'Heavy initial investment'
      ],
      bestPlantingTime: 'February-March or October-November',
      harvestTime: 'December-April',
      marketTrends: 'Stable government support, consistent demand',
      category: 'cash'
    },
    {
      id: 4,
      cropName: 'Tomato',
      variety: 'Hybrid varieties',
      suitabilityScore: 75,
      expectedYield: '40-50 tons/hectare',
      marketPrice: '₹800-1200/quintal',
      profitMargin: 'Medium',
      growthDuration: '90-120 days',
      waterRequirement: 'Medium',
      riskLevel: 'High',
      marketDemand: 'Very High',
      advantages: [
        'Quick returns',
        'High market demand',
        'Multiple harvesting possible',
        'Good profit potential'
      ],
      disadvantages: [
        'Price volatility',
        'Susceptible to diseases',
        'Requires intensive management'
      ],
      bestPlantingTime: 'June-July, December-January',
      harvestTime: 'September-October, March-April',
      marketTrends: 'Volatile but generally profitable',
      category: 'vegetable'
    },
    {
      id: 5,
      cropName: 'Wheat',
      variety: 'HD 3086',
      suitabilityScore: 70,
      expectedYield: '3.5-4 tons/hectare',
      marketPrice: '₹2,200/quintal',
      profitMargin: 'Medium',
      growthDuration: '120-140 days',
      waterRequirement: 'Medium',
      riskLevel: 'Low',
      marketDemand: 'High',
      advantages: [
        'Stable crop with assured returns',
        'Government support available',
        'Good for crop rotation',
        'Well-suited for winter season'
      ],
      disadvantages: [
        'Lower profit margins',
        'Competition from other regions'
      ],
      bestPlantingTime: 'November-December',
      harvestTime: 'April-May',
      marketTrends: 'Stable pricing, government procurement',
      category: 'cereal'
    }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserProfile(user.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Simulate API calls for weather and recommendations
    setTimeout(() => {
      setWeatherData(mockWeatherData);
      setRecommendations(mockRecommendations);
    }, 1500);
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const profileDoc = await getDoc(doc(database, 'farmers', userId));
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const filteredRecommendations = recommendations.filter(crop => {
    if (activeFilter === 'all') return true;
    return crop.category === activeFilter;
  });

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score) => {
    if (score >= 90) return 'bg-green-500/20 border-green-500/30';
    if (score >= 80) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 70) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  if (loading || !weatherData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto"></div>
          <p className="text-slate-300 mt-4">Analyzing conditions for crop recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI Crop Recommendations</h1>
                <p className="text-slate-300">Smart suggestions based on weather, soil, and market conditions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/20 px-4 py-2 rounded-xl border border-green-500/30">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">AI Powered</span>
                </div>
              </div>
              <div className="bg-blue-500/20 px-4 py-2 rounded-xl border border-blue-500/30">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">95% Accuracy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Conditions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Cloud className="h-5 w-5 mr-2 text-blue-400" />
              Current Weather & Soil Conditions
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                <Thermometer className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Temperature</p>
                <p className="text-white font-bold">{weatherData.temperature}°C</p>
              </div>
              
              <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                <Droplets className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Humidity</p>
                <p className="text-white font-bold">{weatherData.humidity}%</p>
              </div>
              
              <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                <CloudRain className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Rainfall</p>
                <p className="text-white font-bold">{weatherData.rainfall}mm</p>
              </div>
              
              <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                <Wind className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Wind Speed</p>
                <p className="text-white font-bold">{weatherData.windSpeed} km/h</p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">5-Day Weather Forecast</h3>
              <div className="grid grid-cols-5 gap-2">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="text-center p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-slate-400 text-xs mb-1">{day.day}</p>
                    <Sun className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                    <p className="text-white text-sm font-semibold">{day.temp}°</p>
                    <p className="text-slate-400 text-xs">{day.rain}mm</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-red-400" />
              Farm Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Location</p>
                <p className="text-white font-semibold">{userProfile?.district || 'Not specified'}</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm">Current Season</p>
                <p className="text-white font-semibold">{weatherData.season}</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm">Soil Type</p>
                <p className="text-white font-semibold">{userProfile?.soil_type || 'Not specified'}</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm">Farm Size</p>
                <p className="text-white font-semibold">{userProfile?.farm_size || 'Not specified'} acres</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <div className="flex items-center space-x-2 text-violet-400 mb-2">
                <Lightbulb className="h-4 w-4" />
                <span className="text-sm font-medium">AI Analysis</span>
              </div>
              <p className="text-slate-300 text-sm">
                Based on current conditions, this is an excellent time for Kharif crops. 
                High humidity and good rainfall forecasted.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Crops', icon: Wheat },
              { id: 'cereal', label: 'Cereals', icon: Wheat },
              { id: 'cash', label: 'Cash Crops', icon: DollarSign },
              { id: 'vegetable', label: 'Vegetables', icon: Leaf }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeFilter === filter.id 
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <filter.icon className="h-4 w-4" />
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecommendations.map((crop) => (
            <div key={crop.id} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-violet-500/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{crop.cropName}</h3>
                  <p className="text-slate-300">{crop.variety}</p>
                </div>
                
                <div className={`px-4 py-2 rounded-xl border ${getScoreBackground(crop.suitabilityScore)}`}>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${getScoreColor(crop.suitabilityScore)}`}>
                      {crop.suitabilityScore}
                    </p>
                    <p className="text-slate-400 text-xs">Suitability</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-slate-400 text-sm">Expected Yield</p>
                  <p className="text-white font-semibold">{crop.expectedYield}</p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-sm">Market Price</p>
                  <p className="text-green-400 font-semibold">{crop.marketPrice}</p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-sm">Growth Duration</p>
                  <p className="text-white font-semibold">{crop.growthDuration}</p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-sm">Risk Level</p>
                  <p className={`font-semibold ${getRiskColor(crop.riskLevel)}`}>
                    {crop.riskLevel}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-2">Advantages</p>
                  <div className="space-y-1">
                    {crop.advantages.slice(0, 2).map((advantage, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-300 text-sm">{advantage}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {crop.disadvantages.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Considerations</p>
                    <div className="space-y-1">
                      {crop.disadvantages.slice(0, 1).map((disadvantage, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <p className="text-slate-300 text-sm">{disadvantage}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div>
                  <p className="text-slate-400 text-xs">Best Planting</p>
                  <p className="text-white text-sm font-medium">{crop.bestPlantingTime}</p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-xs">Harvest Time</p>
                  <p className="text-white text-sm font-medium">{crop.harvestTime}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Market Insights */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
            Market Insights & Trends
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <h3 className="font-semibold text-green-400">Rising Prices</h3>
              </div>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Cotton: +12% this month</li>
                <li>• Rice: +8% expected</li>
                <li>• Tomato: High volatility</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <Package className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-blue-400">Export Demand</h3>
              </div>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Basmati rice: Very high</li>
                <li>• Cotton: Strong export</li>
                <li>• Wheat: Stable demand</li>
              </ul>
            </div>
            
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <Star className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-purple-400">Best ROI</h3>
              </div>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Cotton: 200-300%</li>
                <li>• Tomato: 150-250%</li>
                <li>• Rice: 120-150%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropRecommendations;
