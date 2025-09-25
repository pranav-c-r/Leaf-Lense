import React, { useState } from 'react'
import { AlertTriangle, Bug, Shield, Search, Filter, Eye, Zap } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

// Pest data for different crops
const pestData = {
  rice: {
    name: { en: 'Rice', hi: 'चावल', ml: 'അരി' },
    pests: [
      {
        name: { en: 'Brown Planthopper', hi: 'भूरा फुदका', ml: 'ബ്രൗൺ പ്ലാന്റ്ഹോപ്പർ' },
        severity: 'high',
        symptoms: { 
          en: 'Yellow to brown leaves, stunted growth, honeydew secretion',
          hi: 'पत्तियों का पीला से भूरा होना, विकास रुकना, शहद जैसा स्राव',
          ml: 'ഇലകൾ മഞ്ഞയിൽ നിന്ന് തവിട്ട് നിറമാകുക, വളർച്ച മുരടിക്കുക'
        },
        prevention: {
          en: 'Use resistant varieties, maintain proper spacing, avoid excessive nitrogen',
          hi: 'प्रतिरोधी किस्मों का उपयोग, उचित दूरी बनाए रखें, अधिक नाइट्रोजन से बचें',
          ml: 'പ്രതിരോധശേഷിയുള്ള ഇനങ്ങൾ ഉപയോഗിക്കുക, ശരിയായ അകലം പാലിക്കുക'
        },
        treatment: {
          en: 'Apply insecticides like imidacloprid, thiamethoxam',
          hi: 'इमिडाक्लोप्रिड, थियामेथोक्साम जैसे कीटनाशकों का प्रयोग करें',
          ml: 'ഇമിഡാക്ലോപ്രിഡ്, തിയമെത്തോക്സാം എന്നീ കീടനാശിനികൾ ഉപയോഗിക്കുക'
        }
      },
      {
        name: { en: 'Stem Borer', hi: 'तना बेधक', ml: 'തണ്ട് തുരപ്പൻ' },
        severity: 'medium',
        symptoms: { 
          en: 'Dead heart, white heads, holes in stem',
          hi: 'मृत हृदय, सफेद सिर, तने में छेद',
          ml: 'ഡെഡ് ഹാർട്ട്, വെള്ള തല, തണ്ടിൽ ദ്വാരങ്ങൾ'
        },
        prevention: {
          en: 'Early planting, destroy stubbles, use pheromone traps',
          hi: 'जल्दी बुवाई, ठूंठ नष्ट करें, फेरोमोन ट्रैप का उपयोग',
          ml: 'നേരത്തെ നടൽ, അവശിഷ്ടങ്ങൾ നശിപ്പിക്കുക, ഫെറോമോൺ കെണികൾ ഉപയോഗിക്കുക'
        },
        treatment: {
          en: 'Apply carbofuran, chlorpyrifos at proper timing',
          hi: 'उचित समय पर कार्बोफुरान, क्लोरपायरीफॉस का प्रयोग',
          ml: 'ശരിയായ സമയത്ത് കാർബോഫുറാൻ, ക്ലോർപൈരിഫോസ് പ്രയോഗിക്കുക'
        }
      }
    ]
  },
  wheat: {
    name: { en: 'Wheat', hi: 'गेहूं', ml: 'ഗോതമ്പ്' },
    pests: [
      {
        name: { en: 'Aphids', hi: 'माहू', ml: 'എഫിഡ്സ്' },
        severity: 'medium',
        symptoms: { 
          en: 'Yellowing leaves, stunted growth, honeydew on leaves',
          hi: 'पत्तियों का पीला होना, विकास रुकना, पत्तियों पर शहद जैसा पदार्थ',
          ml: 'ഇലകൾ മഞ്ഞയാകുക, വളർച്ച മുരടിക്കുക, ഇലകളിൽ തേൻ പോലെ ദ്രവം'
        },
        prevention: {
          en: 'Early sowing, remove weeds, use reflective mulch',
          hi: 'जल्दी बुवाई, खरपतवार हटाएं, प्रतिबिंबित मल्च का उपयोग',
          ml: 'നേരത്തെ വിതയ്ക്കുക, കളകൾ നീക്കം ചെയ്യുക, പ്രതിഫലന മൾച്ച് ഉപയോഗിക്കുക'
        },
        treatment: {
          en: 'Spray dimethoate, malathion insecticides',
          hi: 'डाइमेथोएट, मैलाथियान कीटनाशकों का छिड़काव',
          ml: 'ഡൈമെത്തോയേറ്റ്, മലാത്തിയോൺ കീടനാശിനികൾ തളിക്കുക'
        }
      },
      {
        name: { en: 'Termites', hi: 'दीमक', ml: 'ചിതൽ' },
        severity: 'high',
        symptoms: { 
          en: 'Wilting, yellowing, plant death, mud tubes',
          hi: 'मुरझाना, पीला होना, पौधे की मृत्यु, मिट्टी की नलियां',
          ml: 'വാടൽ, മഞ്ഞയാകൽ, ചെടി മരണം, മണ്ണ് കുഴലുകൾ'
        },
        prevention: {
          en: 'Soil treatment before sowing, remove crop residues',
          hi: 'बुवाई से पहले मिट्टी का उपचार, फसल अवशेष हटाएं',
          ml: 'വിതയ്ക്കുന്നതിന് മുമ്പ് മണ്ണ് ചികിത്സ, വിള അവശിഷ്ടങ്ങൾ നീക്കം ചെയ്യുക'
        },
        treatment: {
          en: 'Apply chlorpyrifos, fipronil in soil',
          hi: 'मिट्टी में क्लोरपायरीफॉस, फिप्रोनिल का प्रयोग',
          ml: 'മണ്ണിൽ ക്ലോർപൈരിഫോസ്, ഫിപ്രോണിൽ പ്രയോഗിക്കുക'
        }
      }
    ]
  },
  sugarcane: {
    name: { en: 'Sugarcane', hi: 'गन्ना', ml: 'കരിമ്പ്' },
    pests: [
      {
        name: { en: 'Sugarcane Borer', hi: 'गन्ना बेधक', ml: 'കരിമ്പ് തുരപ്പൻ' },
        severity: 'high',
        symptoms: { 
          en: 'Holes in internodes, dead hearts, reduced sugar content',
          hi: 'अंतर्गांठों में छेद, मृत हृदय, चीनी की मात्रा में कमी',
          ml: 'ഇന്റർനോഡുകളിൽ ദ്വാരങ്ങൾ, ഡെഡ് ഹാർട്ട്, പഞ്ചസാരയുടെ അളവ് കുറയൽ'
        },
        prevention: {
          en: 'Use healthy seed cane, destroy infested stubbles',
          hi: 'स्वस्थ बीज गन्ने का उपयोग, संक्रमित ठूंठ नष्ट करें',
          ml: 'ആരോഗ്യകരമായ വിത്ത് കരിമ്പ് ഉപയോഗിക്കുക, രോഗബാധിതമായ അവശിഷ്ടങ്ങൾ നശിപ്പിക്കുക'
        },
        treatment: {
          en: 'Apply carbofuran granules, release parasitoids',
          hi: 'कार्बोफुरान दाने डालें, परजीवी छोड़ें',
          ml: 'കാർബോഫുറാൻ ഗ്രാന്യൂളുകൾ പ്രയോഗിക്കുക, പരാന്നജീവികൾ വിട്ടയയ്ക്കുക'
        }
      }
    ]
  },
  soybean: {
  name: { en: 'Soybean', hi: 'सोयाबीन', ml: 'സോയാബീൻ' },
  pests: [
    {
      name: { en: 'Soybean Aphid', hi: 'सोयाबीन माहू', ml: 'സോയാബീൻ എഫിഡ്സ്' },
      severity: 'medium',
      symptoms: {
        en: 'Yellowing leaves, stunted growth, curled leaves',
        hi: 'पत्तियों का पीला होना, विकास रुकना, मुड़ी हुई पत्तियाँ',
        ml: 'ഇലകൾ മഞ്ഞയാകുക, വളർച്ച മുരടിക്കുക, വളച്ചിലായ ഇലകൾ'
      },
      prevention: {
        en: 'Plant resistant varieties, remove weeds',
        hi: 'प्रतिरोधी किस्में लगाएं, खरपतवार हटाएं',
        ml: 'പ്രതിരോധശേഷിയുള്ള ഇനങ്ങൾ നടുക, കളകൾ നീക്കം ചെയ്യുക'
      },
      treatment: {
        en: 'Spray imidacloprid or thiamethoxam',
        hi: 'इमिडाक्लोप्रिड या थियामेथोक्साम छिड़कें',
        ml: 'ഇമിഡാക്ലോപ്രിഡ് അല്ലെങ്കിൽ തിയമെത്തോക്സാം തളിക്കുക'
      }
    },
    {
      name: { en: 'Leaf Roller', hi: 'पत्ती रोलर', ml: 'ഇല റോളർ' },
      severity: 'high',
      symptoms: {
        en: 'Rolled leaves, damaged foliage, reduced photosynthesis',
        hi: 'मुड़ी हुई पत्तियाँ, पत्तियाँ क्षतिग्रस्त, प्रकाश-संश्लेषण कम',
        ml: 'വളച്ച ഇലകൾ, ഇലകൾ കേടുപാട്, പ്രകാശസംശ്ലേഷണം കുറവ്'
      },
      prevention: {
        en: 'Remove affected leaves, practice crop rotation',
        hi: 'प्रभावित पत्तियाँ हटाएँ, फसल चक्र अपनाएँ',
        ml: 'ബാധിച്ച ഇലകൾ നീക്കം ചെയ്യുക, വിളവുകൾ മടങ്ങി നടൽ'
      },
      treatment: {
        en: 'Spray Bacillus thuringiensis or neem oil',
        hi: 'बैसिलस थुरिंगियन्सिस या नीम का तेल छिड़कें',
        ml: 'ബാസിൽസ് തുറിംഗ്‌എൻസിസ് അല്ലെങ്കിൽ നീം എണ്ണ തളിക്കുക'
      }
    }
  ]
},

tomato: {
  name: { en: 'Tomato', hi: 'टमाटर', ml: 'തക്കാളി' },
  pests: [
    {
      name: { en: 'Tomato Fruit Borer', hi: 'टमाटर फल बेधक', ml: 'തക്കാളി പഴം തുരപ്പൻ' },
      severity: 'high',
      symptoms: {
        en: 'Holes in fruits, premature fruit drop, rotting',
        hi: 'फलों में छेद, समय से पहले गिरना, सड़न',
        ml: 'പഴങ്ങളിൽ ദ്വാരങ്ങൾ, നേരത്തേ പഴം വീഴൽ, പാഴ്‌ച'
      },
      prevention: {
        en: 'Use resistant varieties, destroy affected fruits',
        hi: 'प्रतिरोधी किस्में लगाएँ, प्रभावित फलों को नष्ट करें',
        ml: 'പ്രതിരോധശേഷിയുള്ള ഇനങ്ങൾ നടുക, ബാധിച്ച പഴങ്ങൾ നശിപ്പിക്കുക'
      },
      treatment: {
        en: 'Spray spinosad or indoxacarb',
        hi: 'स्पिनोसैड या इंडॉक्साकार्ब छिड़कें',
        ml: 'സ്പിനോസാഡ് അല്ലെങ്കിൽ ഇൻഡോക്സാകാർബ് തളിക്കുക'
      }
    },
    {
      name: { en: 'Whitefly', hi: 'सफेद मक्खी', ml: 'വെള്ളപ്പുഴു' },
      severity: 'medium',
      symptoms: {
        en: 'Yellow leaves, sticky honeydew, sooty mold',
        hi: 'पीली पत्तियाँ, चिपचिपा शहद, कालीन सड़न',
        ml: 'മഞ്ഞ ഇലകൾ, ചിപ്‌ചിപി തേൻ, കൂലി പൂർണ്ണം'
      },
      prevention: {
        en: 'Use yellow sticky traps, remove weeds',
        hi: 'पीले स्टिकी ट्रैप का उपयोग करें, खरपतवार हटाएँ',
        ml: 'മഞ്ഞ സ്റ്റിക്കി ട്രാപ്പുകൾ ഉപയോഗിക്കുക, കളകൾ നീക്കം ചെയ്യുക'
      },
      treatment: {
        en: 'Spray neem oil or imidacloprid',
        hi: 'नीम का तेल या इमिडाक्लोप्रिड छिड़कें',
        ml: 'നീം എണ്ണ അല്ലെങ്കിൽ ഇമിഡാക്ലോപ്രിഡ് തളിക്കുക'
      }
    }
  ]
},

potato: {
  name: { en: 'Potato', hi: 'आलू', ml: 'ഉരുളകിഴങ്ങ്' },
  pests: [
    {
      name: { en: 'Potato Tuber Moth', hi: 'आलू कंद कीट', ml: 'ഉരുളകിഴങ്ങ് തൂബ് മാത്' },
      severity: 'high',
      symptoms: {
        en: 'Holes in tubers, tunneling, reduced yield',
        hi: 'कंद में छेद, सुरंग, उत्पादन कम',
        ml: 'തൂബറിൽ ദ്വാരങ്ങൾ, തണൽ, വിളവ് കുറവ്'
      },
      prevention: {
        en: 'Use healthy seed tubers, remove infested tubers',
        hi: 'स्वस्थ बीज कंद का उपयोग करें, प्रभावित कंद हटाएँ',
        ml: 'ആരോഗ്യകരമായ വിത്ത് തൂബർ ഉപയോഗിക്കുക, ബാധിച്ച തൂബർ നീക്കം ചെയ്യുക'
      },
      treatment: {
        en: 'Spray Bacillus thuringiensis or neem oil',
        hi: 'बैसिलस थुरिंगियन्सिस या नीम का तेल छिड़कें',
        ml: 'ബാസിൽസ് തുറിംഗ്‌എൻസിസ് അല്ലെങ്കിൽ നീം എണ്ണ തളിക്കുക'
      }
    },
    {
      name: { en: 'Colorado Potato Beetle', hi: 'कोलोराडो आलू बीटल', ml: 'കൊളറാഡോ ഉരുളകിഴങ്ങ് ബീറ്റ്' },
      severity: 'medium',
      symptoms: {
        en: 'Chewed leaves, defoliation, stunted growth',
        hi: 'चबाई हुई पत्तियाँ, पत्तियाँ झड़ना, विकास रुकना',
        ml: 'ചിരിച്ച ഇലകൾ, ഇലപൊളിക്കൽ, വളർച്ച മുരടല്‍'
      },
      prevention: {
        en: 'Crop rotation, remove weeds',
        hi: 'फसल चक्र अपनाएँ, खरपतवार हटाएँ',
        ml: 'ഫലങ്ങൾ മാറ്റി നട്ടൽ, കളകൾ നീക്കം ചെയ്യുക'
      },
      treatment: {
        en: 'Apply imidacloprid or carbaryl',
        hi: 'इमिडाक्लोप्रिड या कार्बारील छिड़कें',
        ml: 'ഇമിഡാക്ലോപ്രിഡ് അല്ലെങ്കിൽ കാർബാരിൽ തളിക്കുക'
      }
    }
  ]
},

cotton: {
  name: { en: 'Cotton', hi: 'कपास', ml: 'പറമ്പ്' },
  pests: [
    {
      name: { en: 'Pink Bollworm', hi: 'गुलाबी बॉलवर्म', ml: 'പിങ്ക് ബോൾവർം' },
      severity: 'high',
      symptoms: {
        en: 'Bolls damaged, premature opening, reduced lint quality',
        hi: 'फल क्षतिग्रस्त, समय से पहले खुलना, कपास की गुणवत्ता कम',
        ml: 'ബോൾസ് കേടുപാട്, മുമ്പ് തുറന്നൽ, ലിന്റ് ഗുണനിലവാരം കുറവ്'
      },
      prevention: {
        en: 'Use resistant varieties, destroy affected bolls',
        hi: 'प्रतिरोधी किस्में लगाएँ, प्रभावित बॉल्स नष्ट करें',
        ml: 'പ്രതിരോധശേഷിയുള്ള ഇനങ്ങൾ നടുക, ബാധിച്ച ബോൾസ് നശിപ്പിക്കുക'
      },
      treatment: {
        en: 'Spray spinosad or indoxacarb',
        hi: 'स्पिनोसैड या इंडॉक्साकार्ब छिड़कें',
        ml: 'സ്പിനോസാഡ് അല്ലെങ്കിൽ ഇൻഡോക്സാകാർബ് തളിക്കുക'
      }
    },
    {
      name: { en: 'Aphids', hi: 'माहू', ml: 'എഫിഡ്സ്' },
      severity: 'medium',
      symptoms: {
        en: 'Yellowing leaves, sticky honeydew, sooty mold',
        hi: 'पीली पत्तियाँ, चिपचिपा शहद, कालीन सड़न',
        ml: 'മഞ്ഞ ഇലകൾ, ചിപ്‌ചിപി തേൻ, കൂലി പൂർണ്ണം'
      },
      prevention: {
        en: 'Remove weeds, encourage natural predators',
        hi: 'खरपतवार हटाएँ, प्राकृतिक शिकारी बढ़ाएँ',
        ml: 'കളകൾ നീക്കം ചെയ്യുക, സ്വാഭാവിക പേറെഡേറ്റർമാർ കൂട്ടുക'
      },
      treatment: {
        en: 'Spray neem oil or imidacloprid',
        hi: 'नीम का तेल या इमिडाक्लोप्रिड छिड़कें',
        ml: 'നീം എണ്ണ അല്ലെങ്കിൽ ഇമിഡാക്ലോപ്രിഡ് തളിക്കുക'
      }
    }
  ]
},

maize: {
  name: { en: 'Maize', hi: 'मक्का', ml: 'ചോളം' },
  pests: [
    {
      name: { en: 'Fall Armyworm', hi: 'फॉल आर्मीवर्म', ml: 'ഫാൾ ആർമിവേം' },
      severity: 'high',
      symptoms: {
        en: 'Holes in leaves, damaged growing points, frass in whorl',
        hi: 'पत्तियों में छेद, बढ़ते बिंदुओं को नुकसान, कुंडली में मल',
        ml: 'ഇലകളിൽ ദ്വാരങ്ങൾ, വളരുന്ന പോയിന്റുകൾക്ക് കേടുപാടുകൾ'
      },
      prevention: {
        en: 'Early planting, intercropping, pheromone traps',
        hi: 'जल्दी बुवाई, अंतर-फसल, फेरोमोन ट्रैप',
        ml: 'നേരത്തെ നടൽ, ഇടവിള, ഫെറോമോൺ കെണികൾ'
      },
      treatment: {
        en: 'Apply chlorantraniliprole, spinetoram insecticides',
        hi: 'क्लोरैंट्रानिलिप्रोल, स्पिनेटोरम कीटनाशकों का प्रयोग',
        ml: 'ക്ലോറാന്ത്രാനിലിപ്രോൾ, സ്പിനെറ്റോറാം കീടനാശിനികൾ പ്രയോഗിക്കുക'
      }
    },
    {
      name: { en: 'Maize Weevil', hi: 'मक्का की कीड़ा', ml: 'മൈസ് വീൽ' },
      severity: 'medium',
      symptoms: {
        en: 'Damaged kernels, reduced yield, holes in grains',
        hi: 'कर्नेल क्षतिग्रस्त, उत्पादन कम, अनाज में छेद',
        ml: 'കണികകൾ കേടുപാട്, വിളവ് കുറവ്, ധാന്യത്തിൽ ദ്വാരങ്ങൾ'
      },
      prevention: {
        en: 'Proper storage, remove infested grains',
        hi: 'उचित भंडारण, प्रभावित अनाज हटाएँ',
        ml: 'ശരിയായ സംഭരണം, ബാധിച്ച ധാന്യം നീക്കം ചെയ്യുക'
      },
      treatment: {
        en: 'Use insecticides or fumigation',
        hi: 'कीटनाशक या धूमन का प्रयोग करें',
        ml: 'കീടനാശിനികൾ അല്ലെങ്കിൽ ധൂമന പ്രയോഗിക്കുക'
      }
    }
  ]
},
banana: {
  name: { en: 'Banana', hi: 'केला', ml: 'വഴുതന' },
  pests: [
    {
      name: { en: 'Banana Weevil', hi: 'केला कीड़ा', ml: 'വഴുതന വീൽ' },
      severity: 'high',
      symptoms: {
        en: 'Wilting, damaged corms, reduced bunch size',
        hi: 'मुरझाना, क्षतिग्रस्त कर्न, गुच्छे का आकार कम',
        ml: 'വാടൽ, കേടായ കോർം, ചെടിയുടെ പൊക്കം കുറവ്'
      },
      prevention: {
        en: 'Use healthy planting material, remove infected plants',
        hi: 'स्वस्थ पौधे लगाएँ, संक्रमित पौध हटाएँ',
        ml: 'ആരോഗ്യകരമായ നടൽ വസ്തു ഉപയോഗിക്കുക, ബാധിച്ച ചെടികൾ നീക്കം ചെയ്യുക'
      },
      treatment: {
        en: 'Apply carbofuran granules, trap adults',
        hi: 'कार्बोफुरान दाने डालें, वयस्कों को फँसाएँ',
        ml: 'കാർബോഫുറാൻ ഗ്രാന്യൂളുകൾ പ്രയോഗിക്കുക, മുതിർന്ന കീടങ്ങൾ പിടിക്കുക'
      }
    },
    {
      name: { en: 'Nematodes', hi: 'वृत्तजोंड़ी', ml: 'നമാറ്റോഡ്' },
      severity: 'medium',
      symptoms: {
        en: 'Root lesions, stunted growth, yellow leaves',
        hi: 'जड़ में घाव, विकास रुकना, पत्तियाँ पीली',
        ml: 'വേരിൽ ഗ്രന്ഥികൾ, വളർച്ച മുരടൽ, ഇലകൾ മഞ്ഞയാകൽ'
      },
      prevention: {
        en: 'Use nematode-free planting material, rotate crops',
        hi: 'कीट-मुक्त पौधे लगाएँ, फसल चक्र अपनाएँ',
        ml: 'നമാറ്റോഡ്-രഹിത നടൽ വസ്തു ഉപയോഗിക്കുക, വിളകൾ മടങ്ങി നടൽ'
      },
      treatment: {
        en: 'Soil fumigation, apply nematicides',
        hi: 'मिट्टी की धूमन, कीटनाशक का प्रयोग करें',
        ml: 'മണ്ണ് ധൂമനം, നമാറ്റിസൈഡ് പ്രയോഗിക്കുക'
      }
    }
  ]
},

chili: {
  name: { en: 'Chili', hi: 'मिर्च', ml: 'മുളക്' },
  pests: [
    {
      name: { en: 'Thrips', hi: 'थ्रिप्स', ml: 'ത്രിപ്സ്' },
      severity: 'medium',
      symptoms: {
        en: 'Silvering of leaves, deformed fruits, reduced yield',
        hi: 'पत्तियों का चांदी जैसा होना, विकृत फल, उत्पादन कम',
        ml: 'ഇലകളിൽ വെള്ളിപ്പോലെ ചിങ്ങൽ, വളർച്ചയ്‌ക്കുള്ള പഴങ്ങൾ, വിളവ് കുറവ്'
      },
      prevention: {
        en: 'Remove infected leaves, avoid overcrowding',
        hi: 'संक्रमित पत्तियाँ हटाएँ, अधिक घनी न लगाएँ',
        ml: 'ബാധിച്ച ഇലകൾ നീക്കം ചെയ്യുക, അടുപ്പത്തിൽ നടൽ ഒഴിവാക്കുക'
      },
      treatment: {
        en: 'Spray neem oil or spinosad',
        hi: 'नीम का तेल या स्पिनोसैड छिड़कें',
        ml: 'നീം എണ്ണ അല്ലെങ്കിൽ സ്പിനോസാഡ് തളിക്കുക'
      }
    },
    {
      name: { en: 'Red Spider Mite', hi: 'लाल मकड़ी', ml: 'ചുവന്ന ചിരിയണ്ട' },
      severity: 'high',
      symptoms: {
        en: 'Webbing on leaves, yellowing, leaf drop',
        hi: 'पत्तियों पर जाल, पत्तियाँ पीली, झड़ना',
        ml: 'ഇലകളിൽ നെറ്റ്, ഇലകൾ മഞ്ഞയാകൽ, വീഴൽ'
      },
      prevention: {
        en: 'Maintain humidity, remove infested leaves',
        hi: 'आर्द्रता बनाए रखें, संक्रमित पत्तियाँ हटाएँ',
        ml: 'നെമ്മദാവസ്ഥ പാലിക്കുക, ബാധിച്ച ഇലകൾ നീക്കം ചെയ്യുക'
      },
      treatment: {
        en: 'Spray miticides or neem oil',
        hi: 'माइटिसाइड या नीम का तेल छिड़कें',
        ml: 'മൈറ്റിസൈഡ് അല്ലെങ്കിൽ നീം എണ്ണ തളിക്കുക'
      }
    }
  ]
},

cucumber: {
  name: { en: 'Cucumber', hi: 'खीरा', ml: 'സൗരഭി' },
  pests: [
    {
      name: { en: 'Cucumber Beetle', hi: 'खीरे का कीट', ml: 'സൗരഭി വീൽ' },
      severity: 'medium',
      symptoms: {
        en: 'Chewed leaves, stunted growth, yellowing',
        hi: 'चबाई हुई पत्तियाँ, विकास रुकना, पत्तियाँ पीली',
        ml: 'ചിരിച്ച ഇലകൾ, വളർച്ച മുരടൽ, ഇലകൾ മഞ്ഞയാകൽ'
      },
      prevention: {
        en: 'Use row covers, remove weeds',
        hi: 'रो कवर का उपयोग करें, खरपतवार हटाएँ',
        ml: 'റോ കവർ ഉപയോഗിക്കുക, കളകൾ നീക്കം ചെയ്യുക'
      },
      treatment: {
        en: 'Spray carbaryl or neem oil',
        hi: 'कार्बारील या नीम का तेल छिड़कें',
        ml: 'കാർബാരിൽ അല്ലെങ്കിൽ നീം എണ്ണ തളിക്കുക'
      }
    },
    {
      name: { en: 'Powdery Mildew', hi: 'पाउडरी मिल्ड्यू', ml: 'പൗഡറി മിൽഡ്യു' },
      severity: 'high',
      symptoms: {
        en: 'White powder on leaves, distorted growth, reduced yield',
        hi: 'पत्तियों पर सफेद पाउडर, विकृत विकास, उत्पादन कम',
        ml: 'ഇലകളിൽ വെള്ള പൊടി, വളർച്ച विकൃത, വിളവ് കുറവ്'
      },
      prevention: {
        en: 'Ensure proper spacing, avoid overhead watering',
        hi: 'उचित दूरी बनाए रखें, ऊपर से पानी देने से बचें',
        ml: 'ശരിയായ അകലം പാലിക്കുക, മേലിൽ വെള്ളം കൊടുക്കുന്നത് ഒഴിവാക്കുക'
      },
      treatment: {
        en: 'Apply sulfur-based fungicides',
        hi: 'सल्फर आधारित फफूंदी नाशक का प्रयोग करें',
        ml: 'സൾഫർ അടിസ്ഥാനമുള്ള ഫംഗിസൈഡ് പ്രയോഗിക്കുക'
      }
    }
  ]
}


}

const PestAlert = () => {
  const { t, currentLanguage } = useLanguage()
  const [selectedCrop, setSelectedCrop] = useState('rice')
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')

  const currentCrop = pestData[selectedCrop]
  const filteredPests = currentCrop.pests.filter(pest => {
    const matchesSearch = pest.name[currentLanguage].toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === 'all' || pest.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600/20 via-red-500/20 to-pink-600/20 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center animate-glow">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                {t('pestAlert')}
              </h1>
              <p className="text-slate-400 mt-2">
                {t('pestKnowledgeBase')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Crop Selection */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Bug className="h-5 w-5 mr-2 text-orange-400" />
              Select Crop
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(pestData).map(([key, crop]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCrop(key)}
                  className={`p-3 rounded-xl transition-all duration-200 text-sm ${
                    selectedCrop === key
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-300'
                      : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 border border-slate-600/30'
                  }`}
                >
                  {crop.name[currentLanguage]}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Search className="h-5 w-5 mr-2 text-blue-400" />
              Search Pest
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by pest name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
              />
            </div>
          </div>

          {/* Severity Filter */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-purple-400" />
              Filter by Severity
            </h3>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
            >
              <option value="all">All Severities</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>

        {/* Pest List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {currentCrop.name[currentLanguage]} Pests ({filteredPests.length})
            </h2>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <span>🔴 High</span>
              <span>🟡 Medium</span>
              <span>🟢 Low</span>
            </div>
          </div>

          {filteredPests.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
              <Bug className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">
                {searchTerm || severityFilter !== 'all' 
                  ? 'No pests found matching your criteria'
                  : 'No pest data available for this crop'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPests.map((pest, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200"
                >
                  {/* Pest Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                        <span className="mr-2">{getSeverityIcon(pest.severity)}</span>
                        {pest.name[currentLanguage]}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(pest.severity)}`}>
                        {pest.severity.toUpperCase()} RISK
                      </span>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-orange-400" />
                  </div>

                  {/* Symptoms */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-blue-400" />
                      Symptoms
                    </h4>
                    <p className="text-sm text-slate-400">
                      {pest.symptoms[currentLanguage]}
                    </p>
                  </div>

                  {/* Prevention */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-400" />
                      Prevention
                    </h4>
                    <p className="text-sm text-slate-400">
                      {pest.prevention[currentLanguage]}
                    </p>
                  </div>

                  {/* Treatment */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                      Treatment
                    </h4>
                    <p className="text-sm text-slate-400">
                      {pest.treatment[currentLanguage]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PestAlert
