import { signOut } from 'firebase/auth';
import { Menu, Bell, Search, User, Leaf } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { useLanguage } from '../../contexts/LanguageContext'
import LanguageSelector from '../LanguageSelector'

const Header = ({ setSidebarOpen }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
   const logout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };
  return (
    <header className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Mobile menu + Logo */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="hidden lg:flex items-center ml-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-agri-500 to-agri-600 rounded-xl flex items-center justify-center animate-pulse-slow">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">{t('appTitle')}</h1>
                  <p className="text-xs text-slate-400">{t('appSubtitle')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder={t('currentLanguage') === 'hi' ? 'टूल्स, इनसाइट्स खोजें या AI से पूछें...' : t('currentLanguage') === 'ml' ? 'ടൂളുകൾ, ഇൻസൈറ്റ്സ് തിരയുക അല്ലെങ്കിൽ AI യോട് ചോദിക്കുക...' : 'Search tools, insights, or ask AI...'}
                className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-lg bg-slate-800/50 text-white placeholder-slate-400 input-focus"
              />
            </div>
          </div>

          {/* Right side - Language + Notifications + Profile */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector />
            {/* Notifications */}
            <button onClick={()=>logout()} className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-agri-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">3</span>
              </span>
            </button>

            {/* Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <button onClick={()=>navigate('/profile')}>
                  <User className="h-5 w-5 text-white" />
                </button>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">Farmer John</p>
                <p className="text-xs text-slate-400">Premium Plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
