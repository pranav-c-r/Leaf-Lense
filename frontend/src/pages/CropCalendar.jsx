import React, { useState } from 'react'
import { Calendar, Clock, MapPin, Droplets, Sun, Thermometer, Zap, Lightbulb, ChevronDown } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

// Sample crop calendar data
const cropData = {
  rice: {
    name: { en: 'Rice', hi: 'चावल', ml: 'അരി' },
    seasons: [
      {
        name: { en: 'Kharif', hi: 'खरीफ', ml: 'ഖരിഫ് സീസൺ' },
        planting: { en: 'Jun-Jul', hi: 'जून-जुलाई', ml: 'ജൂൺ-ജൂലൈ' },
        harvesting: { en: 'Oct-Nov', hi: 'अक्टूबर-नवंबर', ml: 'ഒക്ടോബർ-നവംബർ' },
        rainfall: { en: 'High', hi: 'अधिक', ml: 'അധികം' },
        temperature: '25-35°C',
        duration: { en: '120-150 days', hi: '120-150 दिन', ml: '120-150 ദിവസം' }
      },
      {
        name: { en: 'Rabi', hi: 'रबी', ml: 'റബി സീസൺ' },
        planting: { en: 'Nov-Dec', hi: 'नवंबर-दिसंबर', ml: 'നവംബർ-ഡിസംബർ' },
        harvesting: { en: 'Apr-May', hi: 'अप्रैल-मई', ml: 'ഏപ്രിൽ-മെയ്' },
        rainfall: { en: 'Low', hi: 'कम', ml: 'കുറവ്' },
        temperature: '15-25°C',
        duration: { en: '120-140 days', hi: '120-140 दिन', ml: '120-140 ദിവസം' }
      }
    ]
  },
  wheat: {
    name: { en: 'Wheat', hi: 'गेहूं', ml: 'ഗോതമ്പ്' },
    seasons: [
      {
        name: { en: 'Rabi', hi: 'रबी', ml: 'റബി സീസൺ' },
        planting: { en: 'Nov-Dec', hi: 'नवंबर-दिसंबर', ml: 'നവംബർ-ഡിസംബർ' },
        harvesting: { en: 'Mar-Apr', hi: 'मार्च-अप्रैल', ml: 'മാർച്ച്-ഏപ്രിൽ' },
        rainfall: { en: 'Moderate', hi: 'मध्यम', ml: 'മധ്യമം' },
        temperature: '15-25°C',
        duration: { en: '120-150 days', hi: '120-150 दिन', ml: '120-150 ദിവസം' }
      }
    ]
  },
  maize: {
    name: { en: 'Maize', hi: 'मक्का', ml: 'ചോളം' },
    seasons: [
      {
        name: { en: 'Kharif', hi: 'खरीफ', ml: 'ഖരിഫ് സീസൺ' },
        planting: { en: 'Jun-Jul', hi: 'जून-जुलाई', ml: 'ജൂൺ-ജൂലൈ' },
        harvesting: { en: 'Oct-Nov', hi: 'अक्टूबर-नवंबर', ml: 'ഒക്ടോബർ-നവംബർ' },
        rainfall: { en: 'High', hi: 'अधिक', ml: 'അധികം' },
        temperature: '21-27°C',
        duration: { en: '90-110 days', hi: '90-110 दिन', ml: '90-110 ദിവസം' }
      },
      {
        name: { en: 'Rabi', hi: 'रबी', ml: 'റബി സീസൺ' },
        planting: { en: 'Oct-Nov', hi: 'अक्टूबर-नवंबर', ml: 'ഒക്ടോബർ-നവംബർ' },
        harvesting: { en: 'Feb-Mar', hi: 'फरवरी-मार्च', ml: 'ഫെബ്രുവരി-മാർച്ച്' },
        rainfall: { en: 'Low', hi: 'कम', ml: 'കുറവ്' },
        temperature: '15-25°C',
        duration: { en: '90-100 days', hi: '90-100 दिन', ml: '90-100 ദിവസം' }
      }
    ]
  },
  sugarcane: {
    name: { en: 'Sugarcane', hi: 'गन्ना', ml: 'കരിമ്പ്' },
    seasons: [
      {
        name: { en: 'Perennial', hi: 'वार्षिक', ml: 'വാർഷിക' },
        planting: { en: 'Oct-Mar', hi: 'अक्टूबर-मार्च', ml: 'ഒക്ടോബർ-മാർച്ച്' },
        harvesting: { en: 'Dec-Apr (Next Year)', hi: 'दिसंबर-अप्रैल (अगला वर्ष)', ml: 'ഡിസംബർ-ഏപ്രിൽ (അടുത്ത വർഷം)' },
        rainfall: { en: 'High', hi: 'अधिक', ml: 'അധികം' },
        temperature: '21-27°C',
        duration: { en: '10-18 months', hi: '10-18 महीने', ml: '10-18 മാസം' }
      }
    ]
  }
}

const months = [
  { en: 'January', hi: 'जनवरी', ml: 'ജനുവരി', short: 'Jan' },
  { en: 'February', hi: 'फरवरी', ml: 'ഫെബ്രുവരി', short: 'Feb' },
  { en: 'March', hi: 'मार्च', ml: 'മാർച്ച്', short: 'Mar' },
  { en: 'April', hi: 'अप्रैल', ml: 'ഏപ്രിൽ', short: 'Apr' },
  { en: 'May', hi: 'मई', ml: 'മെയ്', short: 'May' },
  { en: 'June', hi: 'जून', ml: 'ജൂൺ', short: 'Jun' },
  { en: 'July', hi: 'जुलाई', ml: 'ജൂലൈ', short: 'Jul' },
  { en: 'August', hi: 'अगस्त', ml: 'ആഗസ്ട്', short: 'Aug' },
  { en: 'September', hi: 'सितंबर', ml: 'സെപ്റ്റംബർ', short: 'Sep' },
  { en: 'October', hi: 'अक्टूबर', ml: 'ഒക്ടോബർ', short: 'Oct' },
  { en: 'November', hi: 'नवंबर', ml: 'നവംബർ', short: 'Nov' },
  { en: 'December', hi: 'दिसंबर', ml: 'ഡിസംബർ', short: 'Dec' }
]

const CropCalendar = () => {
  const { t, currentLanguage } = useLanguage()
  const [selectedCrop, setSelectedCrop] = useState('rice')
  const [selectedSeason, setSelectedSeason] = useState(0)

  const currentCrop = cropData[selectedCrop]
  const currentSeasonData = currentCrop.seasons[selectedSeason]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600/20 via-indigo-500/20 to-purple-600/20 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center animate-glow">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                {t('cropCalendar')}
              </h1>
              <p className="text-slate-400 mt-2">
                {t('sowingGuidance')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Crop Selection */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-indigo-400" />
              Select Crop
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(cropData).map(([key, crop]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedCrop(key)
                    setSelectedSeason(0)
                  }}
                  className={`p-4 rounded-xl transition-all duration-200 ${
                    selectedCrop === key
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300'
                      : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 border border-slate-600/30'
                  }`}
                >
                  <div className="font-medium">{crop.name[currentLanguage]}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Season Selection */}
        {currentCrop.seasons.length > 1 && (
          <div className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Sun className="h-5 w-5 mr-2 text-yellow-400" />
                Select Season
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCrop.seasons.map((season, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSeason(index)}
                    className={`p-4 rounded-xl transition-all duration-200 ${
                      selectedSeason === index
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-300'
                        : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 border border-slate-600/30'
                    }`}
                  >
                    <div className="font-medium">{season.name[currentLanguage]}</div>
                    <div className="text-sm text-slate-400 mt-1">
                      {season.planting[currentLanguage]} → {season.harvesting[currentLanguage]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Calendar View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-indigo-400" />
                {currentCrop.name[currentLanguage]} - {currentSeasonData.name[currentLanguage]} Calendar
              </h3>
              
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {months.map((month, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      isPlantingMonth(month.short, currentSeasonData.planting[currentLanguage])
                        ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30'
                        : isHarvestingMonth(month.short, currentSeasonData.harvesting[currentLanguage])
                        ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30'
                        : 'bg-slate-700/30 border-slate-600/30'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-white text-sm">{month[currentLanguage]}</div>
                      <div className="mt-2">
                        {isPlantingMonth(month.short, currentSeasonData.planting[currentLanguage]) && (
                          <div className="text-xs text-green-400 font-medium">
                            {currentLanguage === 'en' ? 'Planting' : currentLanguage === 'hi' ? 'बुवाई' : 'വിതയൽ'}
                          </div>
                        )}
                        {isHarvestingMonth(month.short, currentSeasonData.harvesting[currentLanguage]) && (
                          <div className="text-xs text-orange-400 font-medium">
                            {currentLanguage === 'en' ? 'Harvesting' : currentLanguage === 'hi' ? 'कटाई' : 'വിളവെടുപ്പ്'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Crop Details */}
          <div className="space-y-6">
            {/* Season Info */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
                Season Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300 text-sm">Duration</span>
                  </div>
                  <span className="text-white font-medium">{currentSeasonData.duration[currentLanguage]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300 text-sm">Temperature</span>
                  </div>
                  <span className="text-white font-medium">{currentSeasonData.temperature}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300 text-sm">Rainfall</span>
                  </div>
                  <span className="text-white font-medium">{currentSeasonData.rainfall[currentLanguage]}</span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-indigo-400" />
                Quick Tips
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                  <p className="text-slate-300 text-sm">
                    {currentLanguage === 'en' 
                      ? 'Monitor weather conditions before planting'
                      : currentLanguage === 'hi'
                      ? 'बुवाई से पहले मौसम की स्थिति पर नज़र रखें'
                      : 'വിതയ്ക്കുന്നതിന് മുമ്പ് കാലാവസ്ഥാ സാഹചര്യങ്ങൾ നിരീക്ഷിക്കുക'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                  <p className="text-slate-300 text-sm">
                    {currentLanguage === 'en' 
                      ? 'Ensure proper soil preparation'
                      : currentLanguage === 'hi'
                      ? 'उचित मिट्टी की तैयारी सुनिश्चित करें'
                      : 'ശരിയായ മണ്ണിന്റെ തയ്യാറെടുപ്പ് ഉറപ്പാക്കുക'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                  <p className="text-slate-300 text-sm">
                    {currentLanguage === 'en' 
                      ? 'Use quality seeds for better yield'
                      : currentLanguage === 'hi'
                      ? 'बेहतर उत्पादन के लिए गुणवत्तापूर्ण बीज का उपयोग करें'
                      : 'മെച്ചപ്പെട്ട വിളവിനായി ഗുണനിലവാരമുള്ള വിത്തുകൾ ഉപയോഗിക്കുക'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
const isPlantingMonth = (month, plantingPeriod) => {
  return plantingPeriod.includes(month)
}

const isHarvestingMonth = (month, harvestingPeriod) => {
  return harvestingPeriod.includes(month)
}

export default CropCalendar
