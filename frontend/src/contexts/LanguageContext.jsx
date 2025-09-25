import { createContext, useContext, useState, useEffect } from 'react'

// Translation data
const translations = {
  en: {
    // Common
    language: 'Language',
    location: 'Location',
    settings: 'Settings',
    send: 'Send',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    home: 'Home',
    profile: 'Profile',
    logout: 'Logout',
    welcome: 'Welcome',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    export: 'Export',
    import: 'Import',
    upload: 'Upload',
    download: 'Download',
    
    // Navigation
    dashboard: 'Dashboard',
    cropYield: 'Crop Yield',
    diseaseDetection: 'Disease Detection',
    pricePrediction: 'Price Prediction',
    fertilizerGuide: 'Fertilizer Guide',
    aiInsights: 'AI Insights',
    aiAssistant: 'AI Assistant',
    voiceAssistant: 'Voice Assistant',
    
    // New Features
    cropCalendar: 'Crop Calendar',
    pestAlert: 'Pest Alert',
    seedCalculator: 'Seed Calculator',
    costEstimator: 'Cost Estimator',
    farmingTips: 'Farming Tips',
    encyclopedia: 'Encyclopedia',
    soilChecker: 'Soil pH Checker',
    profitCalculator: 'Profit Calculator',
    
    // Descriptions
    overviewAnalytics: 'Overview & Analytics',
    predictHarvestYields: 'Predict harvest yields',
    analyzePlantHealth: 'Analyze plant health',
    forecastCropPrices: 'Forecast crop prices',
    npkRecommendations: 'NPK recommendations',
    smartRecommendations: 'Smart recommendations',
    chatWithAi: 'Chat with AI',
    voiceInLocalLanguages: 'Voice in local languages',
    
    // New Feature Descriptions
    sowingGuidance: 'Sowing & farming calendar',
    pestKnowledgeBase: 'Pest identification & control',
    calculateSeedRates: 'Calculate seed rates & spacing',
    farmingCostEstimation: 'Estimate farming costs',
    practicalFarmingAdvice: 'Practical farming advice',
    farmingKnowledgeBase: 'Complete farming knowledge',
    soilSuitabilityCheck: 'Check soil crop suitability',
    cropProfitability: 'Calculate crop profitability',
    
    // App Title
    appTitle: 'LeafLense',
    appSubtitle: 'Smart Agriculture Assistant',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    todaysOverview: "Today's Overview",
    totalFarms: 'Total Farms',
    activeAlerts: 'Active Alerts',
    monthlyGrowth: 'Monthly Growth',
    efficiency: 'Efficiency',
    recentActivity: 'Recent Activity',
    weatherUpdate: 'Weather Update',
    upcomingTasks: 'Upcoming Tasks',
    quickActions: 'Quick Actions',
    viewAllReports: 'View All Reports',
    manageCrops: 'Manage Crops',
    checkWeather: 'Check Weather',
    
    // Crop Yield
    cropYieldPrediction: 'Crop Yield Prediction',
    selectCrop: 'Select Crop',
    cropType: 'Crop Type',
    plantingDate: 'Planting Date',
    harvestDate: 'Estimated Harvest Date',
    soilType: 'Soil Type',
    fieldArea: 'Field Area',
    irrigationType: 'Irrigation Type',
    predictYield: 'Predict Yield',
    expectedYield: 'Expected Yield',
    yieldPerHectare: 'Yield per Hectare',
    totalYield: 'Total Yield',
    confidenceLevel: 'Confidence Level',
    factors: 'Factors Affecting Yield',
    recommendations: 'Recommendations',
    
    // Disease Detection
    diseaseDetectionTitle: 'Plant Disease Detection',
    uploadPlantImage: 'Upload Plant Image',
    takePhoto: 'Take Photo',
    analyzeImage: 'Analyze Image',
    detectedDisease: 'Detected Disease',
    healthyPlant: 'Healthy Plant',
    severity: 'Severity',
    treatmentOptions: 'Treatment Options',
    preventiveMeasures: 'Preventive Measures',
    similarCases: 'Similar Cases',
    consultExpert: 'Consult Expert',
    
    // Price Prediction
    pricePredictionTitle: 'Crop Price Prediction',
    currentMarketPrice: 'Current Market Price',
    predictedPrice: 'Predicted Price',
    priceChange: 'Price Change',
    marketTrends: 'Market Trends',
    demandForecast: 'Demand Forecast',
    supplyAnalysis: 'Supply Analysis',
    bestSellingTime: 'Best Time to Sell',
    nearbyMarkets: 'Nearby Markets',
    priceHistory: 'Price History',
    
    // Fertilizer
    fertilizerRecommendation: 'Fertilizer Recommendation',
    soilAnalysis: 'Soil Analysis',
    nutrientLevels: 'Nutrient Levels',
    nitrogen: 'Nitrogen (N)',
    phosphorus: 'Phosphorus (P)',
    potassium: 'Potassium (K)',
    recommendedFertilizer: 'Recommended Fertilizer',
    applicationRate: 'Application Rate',
    applicationTiming: 'Application Timing',
    costEstimate: 'Cost Estimate',
    
    // AI Insights
    aiInsightsTitle: 'AI Insights',
    smartAnalytics: 'Smart Analytics',
    performanceMetrics: 'Performance Metrics',
    optimization: 'Optimization Suggestions',
    riskAssessment: 'Risk Assessment',
    sustainabilityScore: 'Sustainability Score',
    carbonFootprint: 'Carbon Footprint',
    waterUsage: 'Water Usage Efficiency',
    
    // Profile
    userProfile: 'User Profile',
    personalInformation: 'Personal Information',
    farmDetails: 'Farm Details',
    contactInfo: 'Contact Information',
    preferences: 'Preferences',
    notifications: 'Notifications',
    accountSettings: 'Account Settings',
    changePassword: 'Change Password',
    
    // Voice Assistant
    voiceAssistantTitle: 'Voice Assistant',
    voiceAssistantSubtitle: 'Voice-enabled Agricultural Assistant',
    pressToSpeak: 'Press to speak',
    listening: 'Listening...',
    processing: 'Processing...',
    speaking: 'Speaking...',
    errorOccurred: 'Error occurred',
    sampleQuestions: 'Sample Questions',
    typeYourQuestion: 'Type your question here...',
    voiceClickMic: 'Voice: Click the microphone • Text: Type and press Enter',
    
    // Chatbot
    chatbotTitle: 'AI Assistant',
    chatbotSubtitle: 'Your smart farming companion',
    alwaysLearning: 'Always Learning',
    askMeAnything: 'Ask me anything about farming, crops, or agriculture...',
    pressEnterToSend: 'Press Enter to send, Shift+Enter for new line',
    quickQuestions: 'Quick Questions:',
    
    // Quick Questions
    howToImproveYield: 'How can I improve my crop yield?',
    whatFertilizerForWheat: 'What fertilizer should I use for wheat?',
    howToPreventDiseases: 'How to prevent plant diseases?',
    bestTimeToHarvest: 'When is the best time to harvest?',
    howMuchWater: 'How much water do my crops need?',
    
    // Voice Sample Questions
    willItRainTomorrow: 'Will it rain tomorrow?',
    howIsMyWheatCrop: 'How is my wheat crop?',
    whatFertilizerToUse: 'What fertilizer to use?',
    howToPreventPests: 'How to prevent pests?',
    whenToHarvestCrop: 'When to harvest crop?',
    
    // Units
    hectares: 'hectares',
    kilograms: 'kg',
    tons: 'tons',
    percentage: '%',
    rupees: '₹',
    liters: 'liters',
    days: 'days',
    weeks: 'weeks',
    months: 'months',
    
    // Status
    healthy: 'Healthy',
    warning: 'Warning',
    critical: 'Critical',
    good: 'Good',
    average: 'Average',
    poor: 'Poor',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    
    // Initial Messages
    chatbotWelcome: "Hello! I'm your AI Agriculture Assistant. I can help you with crop management, disease identification, fertilizer recommendations, and general farming advice. What would you like to know?",
    voiceChatbotWelcome: 'Hello! I am your agricultural assistant. I can help you in English, Hindi, Tamil, Telugu, Malayalam, and Kannada. You can ask me questions by speaking or typing.',
  },
  
  hi: {
    // Common
    language: 'भाषा',
    location: 'स्थान',
    settings: 'सेटिंग्स',
    send: 'भेजें',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    edit: 'संपादित करें',
    delete: 'मिटाएं',
    view: 'देखें',
    back: 'वापस',
    next: 'अगला',
    previous: 'पिछला',
    home: 'होम',
    profile: 'प्रोफ़ाइल',
    logout: 'लॉगआउट',
    welcome: 'स्वागत',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    sort: 'क्रमबद्ध करें',
    export: 'निर्यात',
    import: 'आयात',
    upload: 'अपलोड',
    download: 'डाउनलोड',
    
    // Navigation
    dashboard: 'डैशबोर्ड',
    cropYield: 'फसल उत्पादन',
    diseaseDetection: 'रोग की पहचान',
    pricePrediction: 'मूल्य पूर्वानुमान',
    fertilizerGuide: 'उर्वरक गाइड',
    aiInsights: 'AI सुझाव',
    aiAssistant: 'AI सहायक',
    voiceAssistant: 'आवाज सहायक',
    
    // New Features
    cropCalendar: 'फसल कैलेंडर',
    pestAlert: 'कीट चेतावनी',
    seedCalculator: 'बीज कैलकुलेटर',
    costEstimator: 'लागत अनुमान',
    farmingTips: 'खेती की सलाह',
    encyclopedia: 'विश्वकोश',
    soilChecker: 'मिट्टी pH चेकर',
    profitCalculator: 'लाभ कैलकुलेटर',
    
    // Descriptions
    overviewAnalytics: 'अवलोकन और विश्लेषण',
    predictHarvestYields: 'फसल उत्पादन का पूर्वानुमान',
    analyzePlantHealth: 'पौधों के स्वास्थ्य का विश्लेषण',
    forecastCropPrices: 'फसल की कीमतों का पूर्वानुमान',
    npkRecommendations: 'NPK सुझाव',
    smartRecommendations: 'स्मार्ट सुझाव',
    chatWithAi: 'AI के साथ चैट करें',
    voiceInLocalLanguages: 'स्थानीय भाषाओं में आवाज',
    
    // New Feature Descriptions
    sowingGuidance: 'बुवाई और खेती कैलेंडर',
    pestKnowledgeBase: 'कीट पहचान और नियंत्रण',
    calculateSeedRates: 'बीज दर और दूरी गणना',
    farmingCostEstimation: 'खेती की लागत अनुमान',
    practicalFarmingAdvice: 'व्यावहारिक खेती सलाह',
    farmingKnowledgeBase: 'संपूर्ण खेती ज्ञान',
    soilSuitabilityCheck: 'मिट्टी फसल उपयुक्तता जांच',
    cropProfitability: 'फसल लाभदायकता गणना',
    
    // App Title
    appTitle: 'AI कृषि सलाहकार',
    appSubtitle: 'स्मार्ट कृषि सहायक',
    
    // Dashboard
    welcomeBack: 'वापसी पर स्वागत',
    todaysOverview: 'आज का अवलोकन',
    totalFarms: 'कुल खेत',
    activeAlerts: 'सक्रिय चेतावनी',
    monthlyGrowth: 'मासिक वृद्धि',
    efficiency: 'दक्षता',
    recentActivity: 'हाल की गतिविधि',
    weatherUpdate: 'मौसम अपडेट',
    upcomingTasks: 'आगामी कार्य',
    quickActions: 'त्वरित कार्य',
    viewAllReports: 'सभी रिपोर्ट देखें',
    manageCrops: 'फसल प्रबंधन',
    checkWeather: 'मौसम जांचें',
    
    // Crop Yield
    cropYieldPrediction: 'फसल उत्पादन पूर्वानुमान',
    selectCrop: 'फसल चुनें',
    cropType: 'फसल का प्रकार',
    plantingDate: 'रोपण की तारीख',
    harvestDate: 'अनुमानित कटाई की तारीख',
    soilType: 'मिट्टी का प्रकार',
    fieldArea: 'खेत का क्षेत्रफल',
    irrigationType: 'सिंचाई का प्रकार',
    predictYield: 'उत्पादन का पूर्वानुमान',
    expectedYield: 'अपेक्षित उत्पादन',
    yieldPerHectare: 'प्रति हेक्टेयर उत्पादन',
    totalYield: 'कुल उत्पादन',
    confidenceLevel: 'विश्वास स्तर',
    factors: 'उत्पादन को प्रभावित करने वाले कारक',
    recommendations: 'सुझाव',
    
    // Disease Detection
    diseaseDetectionTitle: 'पौधे की बीमारी की पहचान',
    uploadPlantImage: 'पौधे की तस्वीर अपलोड करें',
    takePhoto: 'फोटो लें',
    analyzeImage: 'तस्वीर का विश्लेषण करें',
    detectedDisease: 'पहचानी गई बीमारी',
    healthyPlant: 'स्वस्थ पौधा',
    severity: 'गंभीरता',
    treatmentOptions: 'उपचार के विकल्प',
    preventiveMeasures: 'रोकथाम के उपाय',
    similarCases: 'समान मामले',
    consultExpert: 'विशेषज्ञ से सलाह लें',
    
    // Price Prediction
    pricePredictionTitle: 'फसल मूल्य पूर्वानुमान',
    currentMarketPrice: 'वर्तमान बाजार मूल्य',
    predictedPrice: 'अनुमानित मूल्य',
    priceChange: 'मूल्य परिवर्तन',
    marketTrends: 'बाजार की प्रवृत्ति',
    demandForecast: 'मांग पूर्वानुमान',
    supplyAnalysis: 'आपूर्ति विश्लेषण',
    bestSellingTime: 'बेचने का सबसे अच्छा समय',
    nearbyMarkets: 'पास के बाजार',
    priceHistory: 'मूल्य इतिहास',
    
    // Fertilizer
    fertilizerRecommendation: 'उर्वरक सुझाव',
    soilAnalysis: 'मिट्टी का विश्लेषण',
    nutrientLevels: 'पोषक तत्व का स्तर',
    nitrogen: 'नाइट्रोजन (N)',
    phosphorus: 'फास्फोरस (P)',
    potassium: 'पोटाश (K)',
    recommendedFertilizer: 'सुझावित उर्वरक',
    applicationRate: 'प्रयोग दर',
    applicationTiming: 'प्रयोग का समय',
    costEstimate: 'लागत अनुमान',
    
    // AI Insights
    aiInsightsTitle: 'AI अंतर्दृष्टि',
    smartAnalytics: 'स्मार्ट विश्लेषण',
    performanceMetrics: 'प्रदर्शन मेट्रिक्स',
    optimization: 'अनुकूलन सुझाव',
    riskAssessment: 'जोखिम मूल्यांकन',
    sustainabilityScore: 'स्थिरता स्कोर',
    carbonFootprint: 'कार्बन फुटप्रिंट',
    waterUsage: 'पानी के उपयोग की दक्षता',
    
    // Profile
    userProfile: 'उपयोगकर्ता प्रोफ़ाइल',
    personalInformation: 'व्यक्तिगत जानकारी',
    farmDetails: 'खेत का विवरण',
    contactInfo: 'संपर्क जानकारी',
    preferences: 'प्राथमिकताएं',
    notifications: 'सूचनाएं',
    accountSettings: 'खाता सेटिंग',
    changePassword: 'पासवर्ड बदलें',
    
    // Voice Assistant
    voiceAssistantTitle: 'कृषि वॉइस असिस्टेंट',
    voiceAssistantSubtitle: 'आवाज सक्षम कृषि सहायक',
    pressToSpeak: 'बोलने के लिए दबाएं',
    listening: 'सुन रहा हूं...',
    processing: 'प्रोसेसिंग...',
    speaking: 'जवाब दे रहा हूं...',
    errorOccurred: 'त्रुटि हुई है',
    sampleQuestions: 'नमूना प्रश्न',
    typeYourQuestion: 'यहाँ अपना सवाल लिखें...',
    voiceClickMic: 'आवाज: माइक्रोफोन पर क्लिक करें • टेक्स्ट: टाइप करें और Enter दबाएं',
    
    // Chatbot
    chatbotTitle: 'AI सहायक',
    chatbotSubtitle: 'आपका स्मार्ट कृषि साथी',
    alwaysLearning: 'हमेशा सीख रहा है',
    askMeAnything: 'खेती, फसलों या कृषि के बारे में कुछ भी पूछें...',
    pressEnterToSend: 'भेजने के लिए Enter दबाएं, नई लाइन के लिए Shift+Enter',
    quickQuestions: 'त्वरित प्रश्न:',
    
    // Quick Questions
    howToImproveYield: 'मैं अपनी फसल का उत्पादन कैसे बढ़ा सकता हूं?',
    whatFertilizerForWheat: 'गेहूं के लिए कौन सा उर्वरक इस्तेमाल करूं?',
    howToPreventDiseases: 'पौधों की बीमारियों से कैसे बचें?',
    bestTimeToHarvest: 'फसल काटने का सबसे अच्छा समय कब है?',
    howMuchWater: 'मेरी फसलों को कितना पानी चाहिए?',
    
    // Voice Sample Questions
    willItRainTomorrow: 'कल बारिश होगी?',
    howIsMyWheatCrop: 'गेहूं की फसल कैसी है?',
    whatFertilizerToUse: 'क्या खाद डालूं?',
    howToPreventPests: 'कीट से बचाव कैसे करूं?',
    whenToHarvestCrop: 'फसल कब काटूं?',
    
    // Initial Messages
    chatbotWelcome: 'नमस्ते! मैं आपका AI कृषि सहायक हूं। मैं फसल प्रबंधन, रोग की पहचान, उर्वरक की सिफारिशें और सामान्य कृषि सलाह में आपकी मदद कर सकता हूं। आप क्या जानना चाहेंगे?',
    voiceChatbotWelcome: 'नमस्ते! मैं आपका कृषि सहायक हूं। मैं हिंदी, तमिल, तेलुगू, मलयालम, कन्नड़ और अंग्रेजी में आपकी मदद कर सकता हूं। आप मुझसे बात करके या टाइप करके अपने सवाल पूछ सकते हैं।',
  },
  
  ml: {
    // Common
    language: 'ഭാഷ',
    location: 'സ്ഥലം',
    settings: 'ക്രമീകരണങ്ങൾ',
    send: 'അയയ്ക്കുക',
    loading: 'ലോഡ് ചെയ്യുന്നു...',
    error: 'പിശക്',
    success: 'വിജയം',
    cancel: 'റദ്ദാക്കുക',
    save: 'സേവ് ചെയ്യുക',
    edit: 'എഡിറ്റ് ചെയ്യുക',
    delete: 'അളിക്കുക',
    view: 'കാണുക',
    back: 'തിരിച്ച് പോകുക',
    next: 'അടുത്തത്',
    previous: 'മുമ്പ്',
    home: 'ഹോം',
    profile: 'പ്രോഫൈൽ',
    logout: 'ലോഗ് ആഉട്',
    welcome: 'സ്വാഗതം',
    search: 'അന്വേഷിക്കുക',
    filter: 'ഫില്റ്റർ',
    sort: 'ക്രമീകരിക്കുക',
    export: 'എക്സ്പോർട്ട് ചെയ്യുക',
    import: 'ഇംപോർട്ട് ചെയ്യുക',
    upload: 'അപ്ലോഡ് ചെയ്യുക',
    download: 'ഡൗൺലോഡ് ചെയ്യുക',
    
    // Navigation
    dashboard: 'ഡാഷ്ബോർഡ്',
    cropYield: 'വിള ഉൽപ്പാദനം',
    diseaseDetection: 'രോഗ കണ്ടെത്തൽ',
    pricePrediction: 'വില പ്രവചനം',
    fertilizerGuide: 'വള ഗൈഡ്',
    aiInsights: 'AI നിർദ്ദേശങ്ങൾ',
    aiAssistant: 'AI സഹായി',
    voiceAssistant: 'ശബ്ദ സഹായി',
    
    // New Features
    cropCalendar: 'വിള കലണ്ടർ',
    pestAlert: 'കീട അലാറം',
    seedCalculator: 'വിത്ത് കാൽക്കുലേറ്റർ',
    costEstimator: 'ചെലവ് കണക്കാക്കി',
    farmingTips: 'കൃഷി നിർദ്ദേശങ്ങൾ',
    encyclopedia: 'വിജ്ഞാനകോശം',
    soilChecker: 'മണ്ണ് pH ചെക്കർ',
    profitCalculator: 'ലാഭ കാൽക്കുലേറ്റർ',
    
    // Descriptions
    overviewAnalytics: 'അവലോകനവും വിശകലനവും',
    predictHarvestYields: 'വിളവെടുപ്പ് വിളവ് പ്രവചിക്കുക',
    analyzePlantHealth: 'ചെടിയുടെ ആരോഗ്യം വിശകലനം ചെയ്യുക',
    forecastCropPrices: 'വിള വിലകൾ പ്രവചിക്കുക',
    npkRecommendations: 'NPK ശുപാർശകൾ',
    smartRecommendations: 'സ്മാർട്ട് ശുപാർശകൾ',
    chatWithAi: 'AI യുമായി ചാറ്റ് ചെയ്യുക',
    voiceInLocalLanguages: 'പ്രാദേശിക ഭാഷകളിൽ ശബ്ദം',
    
    // New Feature Descriptions
    sowingGuidance: 'വിതയൽ & കൃഷി കലണ്ടർ',
    pestKnowledgeBase: 'കീട തിരിച്ചറിയൽ & നിയന്ത്രണം',
    calculateSeedRates: 'വിത്ത് നിരക്ക് & അകലം കണക്കാക്കുക',
    farmingCostEstimation: 'കൃഷി ചെലവ് കണക്കാക്കുക',
    practicalFarmingAdvice: 'പ്രായോഗിക കൃഷി നിർദ്ദേശം',
    farmingKnowledgeBase: 'സമ്പൂർണ്ണ കൃഷി അറിവ്',
    soilSuitabilityCheck: 'മണ്ണ് വിള അനുയോജ്യത പരിശോധന',
    cropProfitability: 'വിള ലാഭജനകത കണക്കാക്കുക',
    
    // App Title
    appTitle: 'AI കൃഷി ഉപദേശകൻ',
    appSubtitle: 'സ്മാർട്ട് കൃഷി സഹായി',
    
    // Dashboard
    welcomeBack: 'തിരികെ വരവിന് സ്വാഗതം',
    todaysOverview: 'ഇന്നത്തെ അവലോകനം',
    totalFarms: 'മൊത്തം കൃഷിഭൂമി',
    activeAlerts: 'സക്രിയ എച്ചരിക്കലുകൾ',
    monthlyGrowth: 'മാസിക വൃദ്ധി',
    efficiency: 'കാര്യക്ഷമത',
    recentActivity: 'ഇണ്ണത്തെ പ്രവര്ത്തനങ്ങൾ',
    weatherUpdate: 'കാലാവസ്ഥ അപ്ഡേറ്റ്',
    upcomingTasks: 'വരാനിരിക്കുന്ന കാര്യങ്ങൾ',
    quickActions: 'വേഗത്തിലുള്ള കാര്യങ്ങൾ',
    viewAllReports: 'എല്ലാ രിപ്പോർട്ടുകൾ കാണുക',
    manageCrops: 'വിള പരിപാലനം',
    checkWeather: 'കാലാവസ്ഥ പരിശോധിക്കുക',
    
    // Crop Yield
    cropYieldPrediction: 'വിള ഉൽപ്പാദന പ്രവചനം',
    selectCrop: 'വിള തിരഞ്ഞെടുക്കുക',
    cropType: 'വിളയുടെ വിഭാഗം',
    plantingDate: 'നട്ടു തീയതി',
    harvestDate: 'പ്രതീക്ഷിക്കുന്ന വിളവെടുപ്പ് തീയതി',
    soilType: 'മണ്ണിന്റെ വിഭാഗം',
    fieldArea: 'വയലിന്റെ വിസ്തീർണ്ണം',
    irrigationType: 'ലവണസാധന തരം',
    predictYield: 'ഉൽപ്പാദന പ്രവചനം',
    expectedYield: 'പ്രതീക്ഷിക്കുന്ന ഉൽപ്പാദനം',
    yieldPerHectare: 'ഹെക്ടറിന് ഉൽപ്പാദനം',
    totalYield: 'മൊത്തം ഉൽപ്പാദനം',
    confidenceLevel: 'വിശ്വാസ താരം',
    factors: 'ഉൽപ്പാദനത്തെ സ്വാധീനിക്കുന്ന കാരണങ്ങൾ',
    recommendations: 'ശുപാർശകൾ',
    
    // Disease Detection
    diseaseDetectionTitle: 'ചെടിയുടെ രോഗ കണ്ടെത്തൽ',
    uploadPlantImage: 'ചെടിയുടെ പടം അപ്ലോഡ് ചെയ്യുക',
    takePhoto: 'ഫോട്ടോ എടുക്കുക',
    analyzeImage: 'പടം വിശകലനം ചെയ്യുക',
    detectedDisease: 'കണ്ടെത്ത രോഗം',
    healthyPlant: 'ആരോഗ്യകരമായ ചെടി',
    severity: 'ഗാഢ്യം',
    treatmentOptions: 'ചികിത്സാ മാർഗ്ഗങ്ങൾ',
    preventiveMeasures: 'നിരോധന മാർഗ്ഗങ്ങൾ',
    similarCases: 'സമാന കേസുകൾ',
    consultExpert: 'മാഹിരെ ആലോചിക്കുക',
    
    // Voice Assistant
    voiceAssistantTitle: 'ശബ്ദ സഹായി',
    voiceAssistantSubtitle: 'ശബ്ദ-പ്രാപ്തമായ കൃഷി സഹായി',
    pressToSpeak: 'സംസാരിക്കാൻ അമർത്തുക',
    listening: 'കേൾക്കുന്നു...',
    processing: 'പ്രോസസ്സിംഗ്...',
    speaking: 'സംസാരിക്കുന്നു...',
    errorOccurred: 'പിശക് സംഭവിച്ചു',
    sampleQuestions: 'സാമ്പിൾ ചോദ്യങ്ങൾ',
    typeYourQuestion: 'നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...',
    voiceClickMic: 'ശബ്ദം: മൈക്രോഫോണിൽ ക്ലിക്ക് ചെയ്യുക • ടെക്സ്റ്റ്: ടൈപ്പ് ചെയ്ത് Enter അമർത്തുക',
    
    // Chatbot
    chatbotTitle: 'AI സഹായി',
    chatbotSubtitle: 'നിങ്ങളുടെ സ്മാർട്ട് കൃഷി കൂട്ടാളി',
    alwaysLearning: 'എപ്പോഴും പഠിക്കുന്നു',
    askMeAnything: 'കൃഷി, വിളകൾ അല്ലെങ്കിൽ കാർഷികത്തെക്കുറിച്ച് എന്തും ചോദിക്കുക...',
    pressEnterToSend: 'അയയ്ക്കാൻ Enter അമർത്തുക, പുതിയ വരിക്ക് Shift+Enter',
    quickQuestions: 'വേഗത്തിലുള്ള ചോദ്യങ്ങൾ:',
    
    // Quick Questions
    howToImproveYield: 'എനിക്ക് എന്റെ വിള വിളവ് എങ്ങനെ മെച്ചപ്പെടുത്താം?',
    whatFertilizerForWheat: 'ഗോതമ്പിന് ഏത് വളം ഉപയോഗിക്കണം?',
    howToPreventDiseases: 'ചെടിയുടെ രോഗങ്ങൾ എങ്ങനെ തടയാം?',
    bestTimeToHarvest: 'വിളവെടുപ്പിനുള്ള ഏറ്റവും നല്ല സമയം എപ്പോഴാണ്?',
    howMuchWater: 'എന്റെ വിളകൾക്ക് എത്ര വെള്ളം വേണം?',
    
    // Voice Sample Questions
    willItRainTomorrow: 'നാളെ മഴ വരുമോ?',
    howIsMyWheatCrop: 'ഗോതമ്പ് വിള എങ്ങനെയുണ്ട്?',
    whatFertilizerToUse: 'എന്ത് വളം ഉപയോഗിക്കണം?',
    howToPreventPests: 'കീടങ്ങളെ എങ്ങനെ തടയാം?',
    whenToHarvestCrop: 'വിള എപ്പോൾ വെട്ടണം?',
    
    // Initial Messages
    chatbotWelcome: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AI കൃഷി സഹായിയാണ്. വിള പരിപാലനം, രോഗ കണ്ടെത്തൽ, വള ശുപാർശകൾ, സാധാരണ കൃഷി ഉപദേശം എന്നിവയിൽ എനിക്ക് നിങ്ങളെ സഹായിക്കാൻ കഴിയും. നിങ്ങൾക്ക് എന്തറിയാൻ ആഗ്രഹമുണ്ട്?',
    voiceChatbotWelcome: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ കൃഷി സഹായിയാണ്. മലയാളം, ഹിന്ദി, തമിഴ്, തെലുങ്ക്, കന്നഡ, ഇംഗ്ലീഷ് എന്നിവയിൽ എനിക്ക് നിങ്ങളെ സഹായിക്കാൻ കഴിയും. നിങ്ങൾക്ക് സംസാരിച്ചോ ടൈപ്പ് ചെയ്തോ ചോദ്യങ്ങൾ ചോദിക്കാം.',
  }
}

// Language Context
const LanguageContext = createContext()

// Language Provider
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get saved language from localStorage or default to English
    return localStorage.getItem('app-language') || 'en'
  })

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('app-language', currentLanguage)
  }, [currentLanguage])

  // Translation function
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key
  }

  // Get available languages for selection
  const getAvailableLanguages = () => [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' }
  ]

  const value = {
    currentLanguage,
    setCurrentLanguage,
    t,
    getAvailableLanguages,
    translations
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export default LanguageContext
