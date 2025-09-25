import { Link } from 'react-router-dom'
import { 
  Wheat, 
  Bug, 
  Beaker, 
  Lightbulb, 
  MessageCircle,
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  Zap,
  Brain,
  ArrowRight,
  Leaf,
  Sun,
  CloudRain,
  Thermometer
} from 'lucide-react'
import SpotlightCard from './SpotlightCard'

const featureCards = [
  {
    name: 'Crop Yield Prediction',
    description: 'AI-powered yield forecasting using soil conditions, weather data, and historical patterns to predict harvest outcomes.',
    href: '/crop-yield',
    icon: Wheat,
    gradient: 'from-green-600 to-green-700',
    stats: '94.2% accuracy'
  },
  {
    name: 'Disease Detection',
    description: 'Upload leaf images for instant AI analysis. Detect plant diseases early and get treatment recommendations.',
    href: '/disease-detection',
    icon: Bug,
    gradient: 'from-red-500 to-red-600',
    stats: '2.1M images analyzed'
  },
  {
    name: 'Fertilizer Guide',
    description: 'Get personalized NPK recommendations based on soil analysis and crop requirements for optimal growth.',
    href: '/fertilizer',
    icon: Beaker,
    gradient: 'from-green-700 to-green-800',
    stats: '500+ crop types'
  },
  {
    name: 'AI Insights',
    description: 'Combined intelligence from all models to provide actionable farming advice and strategic recommendations.',
    href: '/insights',
    icon: Lightbulb,
    gradient: 'from-green-500 to-green-600',
    stats: 'Real-time analysis'
  },
  {
    name: 'AI Assistant',
    description: 'Chat with our AI assistant for instant answers about farming techniques, crop care, and agricultural best practices.',
    href: '/chat',
    icon: MessageCircle,
    gradient: 'from-green-600 to-green-700',
    stats: '24/7 available'
  }
]

const stats = [
  { name: 'Active Farmers', value: '50,000+', icon: Users, change: '+12.5%', changeType: 'positive' },
  { name: 'Predictions Made', value: '2.1M', icon: Brain, change: '+8.2%', changeType: 'positive' },
  { name: 'Accuracy Rate', value: '94.2%', icon: TrendingUp, change: '+2.1%', changeType: 'positive' },
  { name: 'Response Time', value: '< 2s', icon: Zap, change: '-15%', changeType: 'positive' }
]

const weatherData = [
  { label: 'Temperature', value: '24°C', icon: Thermometer, color: 'text-orange-400' },
  { label: 'Humidity', value: '65%', icon: CloudRain, color: 'text-blue-400' },
  { label: 'Sunlight', value: '8h', icon: Sun, color: 'text-yellow-400' }
]

const Dashboard = () => {
  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <SpotlightCard 
        className="relative overflow-hidden bg-[#161F31]"  
        spotlightColor="rgba(0, 230, 0, 0.7)"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-green-400 rounded-full animate-float"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-green-500 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-green-600 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center animate-glow">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome to LeafLense
              </h1>
              <p className="text-lg text-gray-300">
                Smart agriculture powered by artificial intelligence
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <SpotlightCard 
              className="p-6 bg-[#161F31]"  
              spotlightColor="rgba(0, 230, 0, 0.7)"
            >
              <div className="flex items-center justify-between mb-4">
                <MapPin className="h-8 w-8 text-green-400" />
                <span className="text-sm text-gray-400">Location</span>
              </div>
              <h3 className="text-xl font-bold text-white">Midwest Farm</h3>
              <p className="text-gray-300">Iowa, United States</p>
            </SpotlightCard>
            
            <SpotlightCard 
              className="p-6 bg-[#161F31]"  
              spotlightColor="rgba(0, 230, 0, 0.7)"
            >
              <div className="flex items-center justify-between mb-4">
                <Calendar className="h-8 w-8 text-green-400" />
                <span className="text-sm text-gray-400">Season</span>
              </div>
              <h3 className="text-xl font-bold text-white">Growing Season</h3>
              <p className="text-gray-300">Day 145 of 180</p>
            </SpotlightCard>
            
            <SpotlightCard 
              className="p-6 bg-[#161F31]"  
              spotlightColor="rgba(0, 230, 0, 0.7)"
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-green-400" />
                <span className="text-sm text-gray-400">Performance</span>
              </div>
              <h3 className="text-xl font-bold text-white">Excellent</h3>
              <p className="text-gray-300">+15% vs last season</p>
            </SpotlightCard>
          </div>
        </div>
      </SpotlightCard>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <SpotlightCard 
            key={stat.name} 
            className="p-6 bg-[#161F31]"  
            spotlightColor="rgba(0, 230, 0, 0.7)"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-green-400" />
              </div>
              <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-400 text-sm">{stat.name}</p>
          </SpotlightCard>
        ))}
      </div>

      {/* Weather Widget */}
      <SpotlightCard 
        className="p-6 bg-[#161F31]"  
        spotlightColor="rgba(0, 230, 0, 0.7)"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Sun className="h-6 w-6 mr-3 text-yellow-400" />
          Current Weather Conditions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {weatherData.map((item) => (
            <SpotlightCard 
              key={item.label} 
              className="p-4 bg-[#161F31]"  
              spotlightColor="rgba(0, 230, 0, 0.7)"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                  <span className="text-gray-300">{item.label}</span>
                </div>
                <span className="text-xl font-bold text-white">{item.value}</span>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </SpotlightCard>

      {/* Feature Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">AI-Powered Tools</h2>
          <div className="flex items-center space-x-2 text-gray-400">
            <Brain className="h-5 w-5 animate-pulse text-green-400" />
            <span className="text-sm">Powered by Machine Learning</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featureCards.map((feature) => (
            <Link key={feature.name} to={feature.href}>
              <SpotlightCard 
                className="group relative overflow-hidden p-6 bg-[#161F31]"  
                spotlightColor="rgba(0, 230, 0, 0.7)"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <feature.icon className="w-full h-full" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex items-center text-gray-400 group-hover:text-green-400 transition-colors">
                      <span className="text-sm mr-2">Explore</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-100 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                      {feature.stats}
                    </span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </SpotlightCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <SpotlightCard 
        className="p-6 bg-[#161F31]"  
        spotlightColor="rgba(0, 230, 0, 0.7)"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Zap className="h-6 w-6 mr-3 text-green-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/disease-detection">
            <SpotlightCard 
              className="flex items-center space-x-3 p-4 group bg-[#161F31]"  
              spotlightColor="rgba(0, 230, 0, 0.7)"
            >
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Bug className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h4 className="font-medium text-white group-hover:text-green-100">Quick Diagnosis</h4>
                <p className="text-xs text-gray-400">Upload leaf image</p>
              </div>
            </SpotlightCard>
          </Link>
          
          <Link to="/chat">
            <SpotlightCard 
              className="flex items-center space-x-3 p-4 group bg-[#161F31]"  
              spotlightColor="rgba(0, 230, 0, 0.7)"
            >
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-white group-hover:text-green-100">Ask AI Assistant</h4>
                <p className="text-xs text-gray-400">Get instant help</p>
              </div>
            </SpotlightCard>
          </Link>
          
          <Link to="/insights">
            <SpotlightCard 
              className="flex items-center space-x-3 p-4 group bg-[#161F31]"  
              spotlightColor="rgba(0, 230, 0, 0.7)"
            >
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-white group-hover:text-green-100">View Insights</h4>
                <p className="text-xs text-gray-400">AI recommendations</p>
              </div>
            </SpotlightCard>
          </Link>
        </div>
      </SpotlightCard>
    </div>
  )
}

export default Dashboard  