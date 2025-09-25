import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import CropYield from './pages/CropYield'
import DiseaseDetection from './pages/DiseaseDetection'
import WeatherAlerts from './pages/WeatherAlerts'
import FertilizerRecommendation from './pages/FertilizerRecommendation'
import Insights from './pages/Insights'
import MandiPrices from './pages/MandiPrices'
import CropMarketplace from './pages/CropMarketplace'
import CropRecommendations from './pages/CropRecommendations'
import Orders from './pages/Orders'
import Notifications from './pages/Notifications'
import FarmerDashboard from './pages/FarmerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import Chatbot from './pages/Chatbot'
import VoiceChatbot from './pages/VoiceChatbot'
import LandingPage from './pages/landing'
import Signin from './pages/signin'
import Profile from './pages/profile'
import CropCalendar from './pages/CropCalendar'
import PestAlert from './pages/PestAlert'
import SeedCalculator from './pages/SeedCalculator'
import CostEstimator from './pages/CostEstimator'
import FarmingTips from './pages/FarmingTips'
import Encyclopedia from './pages/Encyclopedia'
import SoilChecker from './pages/SoilChecker'
import ProfitCalculator from './pages/ProfitCalculator'
import PricePrediction from './pages/PricePrediction'

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/crop-yield" element={<Layout><CropYield /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/disease-detection" element={<Layout><DiseaseDetection /></Layout>} />
          <Route path="/price-prediction" element={<Layout><PricePrediction /></Layout>} />
          <Route path="/fertilizer" element={<Layout><FertilizerRecommendation /></Layout>} />
          <Route path="/insights" element={<Layout><Insights /></Layout>} />
          <Route path="/chat" element={<Layout><Chatbot /></Layout>} />
          <Route path="/weather-alerts" element={<Layout><WeatherAlerts /></Layout>} />
          <Route path="/voice-chat" element={<Layout><VoiceChatbot /></Layout>} />
          <Route path="/crop-calendar" element={<Layout><CropCalendar /></Layout>} />
          <Route path="/pest-alert" element={<Layout><PestAlert /></Layout>} />
          <Route path="/seed-calculator" element={<Layout><SeedCalculator /></Layout>} />
          <Route path="/cost-estimator" element={<Layout><CostEstimator /></Layout>} />
          <Route path="/farming-tips" element={<Layout><FarmingTips /></Layout>} />
          <Route path="/encyclopedia" element={<Layout><Encyclopedia /></Layout>} />
          <Route path="/soil-checker" element={<Layout><SoilChecker /></Layout>} />
          <Route path="/profit-calculator" element={<Layout><ProfitCalculator /></Layout>} />
          <Route path="/mandi-prices" element={<Layout><MandiPrices /></Layout>} />
          <Route path="/marketplace" element={<Layout><CropMarketplace /></Layout>} />
          <Route path="/orders" element={<Layout><Orders /></Layout>} />
          <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
          <Route path="/farmer-dashboard" element={<Layout><FarmerDashboard /></Layout>} />
          <Route path="/buyer-dashboard" element={<Layout><BuyerDashboard /></Layout>} />
          <Route path="/crop-recommendations" element={<Layout><CropRecommendations /></Layout>} />
        </Routes>
      </div>
    </LanguageProvider>
  )
}

export default App