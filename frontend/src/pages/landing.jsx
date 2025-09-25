import React, { useState, useEffect } from 'react'
import { 
  Wheat, 
  Bug, 
  Beaker, 
  Lightbulb, 
  MessageCircle,
  TrendingUp,
  Users,
  Brain,
  ArrowRight,
  Leaf,
  Sun,
  CloudRain,
  Thermometer,
  CheckCircle,
  Star,
  Globe,
  Shield,
  Zap,
  PlayCircle,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const LandingPage = () => {
    const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      name: 'AI Crop Yield Prediction',
      description: 'Advanced machine learning algorithms analyze soil conditions, weather patterns, and historical data to predict your harvest with 94.2% accuracy.',
      icon: Wheat,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-500/10 to-emerald-600/5'
    },
    {
      name: 'Smart Disease Detection',
      description: 'Upload leaf images for instant AI-powered disease identification and get personalized treatment recommendations in seconds.',
      icon: Bug,
      gradient: 'from-red-500 to-rose-600',
      bgGradient: 'from-red-500/10 to-rose-600/5'
    },
    {
      name: 'Precision Fertilizer Guide',
      description: 'Get customized NPK recommendations based on comprehensive soil analysis and specific crop requirements.',
      icon: Beaker,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-500/10 to-orange-600/5'
    },
    {
      name: '24/7 AI Assistant',
      description: 'Chat with our intelligent farming assistant for instant answers about techniques, crop care, and best practices.',
      icon: MessageCircle,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-500/10 to-indigo-600/5'
    }
  ]

  const stats = [
    { label: 'Active Farmers', value: '50,000+', icon: Users },
    { label: 'Predictions Made', value: '2.1M', icon: Brain },
    { label: 'Accuracy Rate', value: '94.2%', icon: TrendingUp },
    { label: 'Countries Served', value: '25+', icon: Globe }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Corn Farmer, Iowa',
      content: 'LeafLense increased my yield by 23% last season. The disease detection feature saved my entire crop from blight.',
      rating: 5
    },
    {
      name: 'Miguel Rodriguez',
      role: 'Organic Farm Owner, California',
      content: 'The fertilizer recommendations are spot-on. My soil health improved dramatically, and I reduced chemical usage by 40%.',
      rating: 5
    },
    {
      name: 'James Chen',
      role: 'Agricultural Consultant',
      content: 'I recommend this platform to all my clients. The AI insights are incredibly accurate and actionable.',
      rating: 5
    }
  ]

  const benefits = [
    'Increase crop yields by up to 30%',
    'Reduce fertilizer costs by 25%',
    'Early disease detection saves 90% of affected crops',
    'Real-time weather and soil monitoring',
    'Sustainable farming practices guidance',
    '24/7 expert AI assistance'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-2xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">LeafLense</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-green-400 transition-colors">Features</a>
              <a href="#about" className="text-slate-300 hover:text-green-400 transition-colors">About</a>
              <a href="#testimonials" className="text-slate-300 hover:text-green-400 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-slate-300 hover:text-green-400 transition-colors">Pricing</a>
              <button onClick={()=>navigate('/signin')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all">
                Get Started
              </button>
            </div>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-700">
              <div className="px-6 py-4 space-y-4">
                <a href="#features" className="block text-slate-300 hover:text-green-400">Features</a>
                <a href="#about" className="block text-slate-300 hover:text-green-400">About</a>
                <a href="#testimonials" className="block text-slate-300 hover:text-green-400">Testimonials</a>
                <a href="#pricing" className="block text-slate-300 hover:text-green-400">Pricing</a>
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-xl">
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-6">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center bg-green-500/10 border border-green-500/20 rounded-full px-6 py-2 mb-8">
            <Brain className="h-4 w-4 text-green-400 mr-2 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">Powered by Advanced AI</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Smart Farming with
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent block">
              Artificial Intelligence
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your agricultural operations with AI-powered insights. Predict yields, detect diseases, 
            optimize fertilization, and maximize your harvest with cutting-edge machine learning technology.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <button onClick={()=>navigate('/signin')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-xl hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            
            <button className="bg-slate-800/50 backdrop-blur-sm text-white px-8 py-4 rounded-2xl text-lg font-semibold border border-slate-600 hover:bg-slate-700/50 transition-all duration-300 flex items-center">
              <PlayCircle className="mr-2 h-5 w-5" />
              Watch Demo
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse`} style={{ animationDelay: `${index * 0.2}s` }}>
                  <stat.icon className="h-8 w-8 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-slate-400" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Revolutionary AI Features
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Harness the power of artificial intelligence to make data-driven farming decisions 
              and optimize your agricultural operations like never before.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.name} 
                className={`group relative overflow-hidden bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm rounded-3xl border border-slate-700/50 p-8 hover:transform hover:-translate-y-2 transition-all duration-500`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 opacity-5">
                  <feature.icon className="w-full h-full" />
                </div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-100 transition-colors">
                    {feature.name}
                  </h3>
                  
                  <p className="text-slate-300 text-lg leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center text-green-400 group-hover:text-green-300 transition-colors">
                    <span className="font-semibold">Learn More</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-green-900/10 to-emerald-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Why Choose LeafLense?
              </h2>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Join thousands of farmers who have transformed their operations with our 
                AI-powered platform. See real results from day one.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={benefit} className="flex items-center space-x-4">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <span className="text-slate-300 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <button className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-xl hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-300">
                Start Your Free Trial
              </button>
            </div>
            
            <div className="relative">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Average Results</h3>
                  <p className="text-slate-300">Within 6 months of using our platform</p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Yield Increase</span>
                    <span className="text-2xl font-bold text-green-400">+27%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Cost Reduction</span>
                    <span className="text-2xl font-bold text-blue-400">-22%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Disease Prevention</span>
                    <span className="text-2xl font-bold text-purple-400">89%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by Farmers Worldwide
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our community of farmers says about their experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.name} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-slate-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 border border-slate-700/50">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Zap className="h-10 w-10 text-white" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Farm?
            </h2>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Join over 50,000 farmers who are already using AI to optimize their operations. 
              Start your free trial today and see the difference AI can make.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button onClick={()=>navigate('/signin')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-xl hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              
              <button className="text-slate-300 hover:text-white transition-colors flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                No credit card required
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">LeafLense</span>
            </div>
            
            <div className="text-slate-400 text-sm">
              © 2025 LeafLense. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage