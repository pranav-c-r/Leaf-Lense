import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Wheat, 
  Bug, 
  Beaker, 
  Lightbulb, 
  MessageCircle,
  Mic,
  Leaf,
  X,
  TrendingUp,
  Shield,
  Zap,
  Brain,
  Calendar,
  AlertTriangle,
  Calculator,
  DollarSign,
  BookOpen,
  Database,
  TestTube,
  PieChart,   
  Store,
  ShoppingCart,
  Sparkles
} from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

const getNavigation = (t) => [
  { 
    name: t('dashboard'), 
    href: '/dashboard', 
    icon: LayoutDashboard,
    description: t('overviewAnalytics'),
    gradient: 'from-blue-500 to-blue-600'
  },
  { 
    name: t('cropYield'), 
    href: '/crop-yield', 
    icon: Wheat,
    description: t('predictHarvestYields'),
    gradient: 'from-agri-500 to-agri-600'
  },
  { 
    name: t('diseaseDetection'), 
    href: '/disease-detection', 
    icon: Bug,
    description: t('analyzePlantHealth'),
    gradient: 'from-red-500 to-red-600'
  },
  {
    name: t('pricePrediction'),
    href: '/price-prediction',
    icon: TrendingUp,
    description: t('forecastCropPrices'),
    gradient: 'from-green-500 to-emerald-600'
  },
  { 
    name: t('fertilizerGuide'), 
    href: '/fertilizer', 
    icon: Beaker,
    description: t('npkRecommendations'),
    gradient: 'from-soil-500 to-soil-600'
  },
  { 
    name: t('aiInsights'), 
    href: '/insights', 
    icon: Lightbulb,
    description: t('smartRecommendations'),
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    name: t('cropCalendar'),
    href: '/crop-calendar',
    icon: Calendar,
    description: t('sowingGuidance'),
    gradient: 'from-indigo-500 to-indigo-600'
  },
  {
    name: t('pestAlert'),
    href: '/pest-alert',
    icon: AlertTriangle,
    description: t('pestKnowledgeBase'),
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    name: t('seedCalculator'),
    href: '/seed-calculator',
    icon: Calculator,
    description: t('calculateSeedRates'),
    gradient: 'from-teal-500 to-teal-600'
  },
  {
    name: t('costEstimator'),
    href: '/cost-estimator',
    icon: DollarSign,
    description: t('farmingCostEstimation'),
    gradient: 'from-amber-500 to-amber-600'
  },
  {
    name: t('farmingTips'),
    href: '/farming-tips',
    icon: BookOpen,
    description: t('practicalFarmingAdvice'),
    gradient: 'from-cyan-500 to-cyan-600'
  },
  {
    name: t('encyclopedia'),
    href: '/encyclopedia',
    icon: Database,
    description: t('farmingKnowledgeBase'),
    gradient: 'from-violet-500 to-violet-600'
  },
  {
    name: t('soilChecker'),
    href: '/soil-checker',
    icon: TestTube,
    description: t('soilSuitabilityCheck'),
    gradient: 'from-lime-500 to-lime-600'
  },
  {
    name: t('profitCalculator'),
    href: '/profit-calculator',
    icon: PieChart,
    description: t('cropProfitability'),
    gradient: 'from-rose-500 to-rose-600'
  },
  { 
    name: 'Mandi Prices', 
    href: '/mandi-prices', 
    icon: Store,
    description: 'Live market rates',
    gradient: 'from-orange-500 to-orange-600'
  },
  { 
    name: 'Crop Marketplace', 
    href: '/marketplace', 
    icon: ShoppingCart,
    description: 'Buy & sell crops directly',
    gradient: 'from-indigo-500 to-indigo-600'
  },
  { 
    name: 'Crop Recommendations', 
    href: '/crop-recommendations', 
    icon: Sparkles,
    description: 'AI-powered crop suggestions',
    gradient: 'from-violet-500 to-violet-600'
  },
  { 
    name: t('aiAssistant'), 
    href: '/chat', 
    icon: MessageCircle,
    description: t('chatWithAi'),
    gradient: 'from-emerald-500 to-emerald-600'
  },
  { 
    name: t('voiceAssistant'), 
    href: '/voice-chat', 
    icon: Mic,
    description: t('voiceInLocalLanguages'),
    gradient: 'from-pink-500 to-pink-600'
  },
]

const stats = [
  { label: 'Accuracy', value: '94.2%', icon: TrendingUp, color: 'text-agri-400' },
  { label: 'Protected', value: '1.2M', icon: Shield, color: 'text-blue-400' },
  { label: 'Speed', value: '< 2s', icon: Zap, color: 'text-yellow-400' },
]

const Sidebar = ({ open, setOpen }) => {
  const { t } = useLanguage()
  const location = useLocation()

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-80 flex flex-col">
          <div className="flex flex-col min-h-0 bg-slate-900/90 backdrop-blur-xl border-r border-slate-700/50">
            {/* Logo - Fixed at top */}
            <div className="flex-shrink-0 px-6 py-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-agri-500 to-agri-600 rounded-2xl flex items-center justify-center animate-glow">
                  <Leaf className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient">{t('appTitle')}</h1>
                  <p className="text-sm text-slate-400">{t('appSubtitle')}</p>
                </div>
              </div>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {getNavigation(t).map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-agri-500/20 to-agri-600/20 text-agri-300 border border-agri-500/30' 
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-gradient-to-br ${item.gradient} ${
                      isActive ? 'animate-pulse-slow' : 'group-hover:scale-110'
                    } transition-transform duration-200`}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        {isActive && <Brain className="h-4 w-4 text-agri-400 animate-pulse" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                    </div>
                  </Link>
                )
              })}
            </nav>

            
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-slate-900/95 backdrop-blur-xl transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile header - Fixed at top */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-agri-500 to-agri-600 rounded-xl flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gradient">{t('appTitle')}</h1>
                <p className="text-xs text-slate-400">{t('appSubtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {getNavigation(t).map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-agri-500/20 to-agri-600/20 text-agri-300 border border-agri-500/30' 
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-gradient-to-br ${item.gradient} ${
                    isActive ? 'animate-pulse-slow' : 'group-hover:scale-110'
                  } transition-transform duration-200`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.name}</span>
                      {isActive && <Brain className="h-4 w-4 text-agri-400 animate-pulse" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar