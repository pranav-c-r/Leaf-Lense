import React, { useState } from 'react'
import { Database, Search, Book, Wrench, Sprout, Beaker, Bug, Droplets, Sun } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const encyclopediaData = {
  crops: {
    icon: Sprout,
    color: 'from-green-500 to-emerald-600',
    title: { en: 'Crops', hi: 'फसलें', ml: 'വിളകൾ' },
    items: {
      rice: {
        name: { en: 'Rice', hi: 'चावल', ml: 'നെല്ല്' },
        description: {
          en: 'Staple food crop grown in flooded fields. High water requirement.',
          hi: 'जलमग्न खेतों में उगाई जाने वाली मुख्य खाद्य फसल। अधिक पानी की आवश्यकता।',
          ml: 'വെള്ളത്തിൽ മുങ്ങിയ വയലുകളിൽ വളർത്തുന്ന പ്രധാന ഭക്ഷ്യവിള. ഉയർന്ന ജല ആവശ്യകത.'
        },
        details: {
          en: ['Duration: 120-150 days', 'Water: High requirement', 'Soil: Clay loam preferred'],
          hi: ['अवधि: 120-150 दिन', 'पानी: अधिक आवश्यकता', 'मिट्टी: चिकनी दोमट उपयुक्त'],
          ml: ['കാലാവധി: 120-150 ദിവസം', 'വെള്ളം: ഉയർന്ന ആവശ്യകത', 'മണ്ണ്: കളിമണ്ണ് അനുയോജ്യം']
        }
      },
      wheat: {
        name: { en: 'Wheat', hi: 'गेहूं', ml: 'ഗോതമ്പ്' },
        description: {
          en: 'Cool season cereal crop. Major source of flour for bread making.',
          hi: 'ठंडे मौसम की अनाज फसल। रोटी बनाने के लिए आटे का मुख्य स्रोत।',
          ml: 'തണുത്ത കാലാവസ്ഥയിലെ ധാന്യവിള. റൊട്ടി നിർമ്മാണത്തിനുള്ള മാവിന്റെ പ്രധാന സ്രോതസ്സ്.'
        },
        details: {
          en: ['Duration: 120-150 days', 'Temperature: 15-25°C', 'Soil: Well-drained loam'],
          hi: ['अवधि: 120-150 दिन', 'तापमान: 15-25°C', 'मिट्टी: अच्छी जल निकासी वाली दोमट'],
          ml: ['കാലാവധി: 120-150 ദിവസം', 'താപനില: 15-25°C', 'മണ്ണ്: നല്ല ജലനിർഗമനമുള്ള പശിമരാശി']
        }
      },
      maize: {
        name: { en: 'Maize', hi: 'मक्का', ml: 'ചോളം' },
        description: {
          en: 'Cereal crop used for food, fodder, and industrial products.',
          hi: 'खाद्य, चारा और औद्योगिक उत्पादों के लिए उपयोग की जाने वाली अनाज फसल।',
          ml: 'ഭക്ഷണം, മൃഗാഹാരം, വ്യവസായ ഉൽപ്പന്നങ്ങൾക്കായി ഉപയോഗിക്കുന്ന ധാന്യവിള.'
        },
        details: {
          en: ['Duration: 90-120 days', 'Rainfall: 50-75 cm', 'Soil: Fertile loamy soil'],
          hi: ['अवधि: 90-120 दिन', 'वर्षा: 50-75 सेमी', 'मिट्टी: उपजाऊ दोमट मिट्टी'],
          ml: ['കാലാവധി: 90-120 ദിവസം', 'മഴ: 50-75 സെമി', 'മണ്ണ്: ഉർവ്വരമായ ലോം മണ്ണ്']
        }
      },
      sugarcane: {
        name: { en: 'Sugarcane', hi: 'गन्ना', ml: 'കരിമ്പ്' },
        description: {
          en: 'Cash crop used for sugar, jaggery, and ethanol production.',
          hi: 'चीनी, गुड़ और एथेनॉल उत्पादन के लिए नकदी फसल।',
          ml: 'പഞ്ചസാര, ശർക്കര, എഥനോൾ ഉൽപ്പാദനത്തിന് ഉപയോഗിക്കുന്ന വ്യാപാര വിള.'
        },
        details: {
          en: ['Duration: 10-12 months', 'Water: High requirement', 'Soil: Deep rich loam'],
          hi: ['अवधि: 10-12 महीने', 'पानी: अधिक आवश्यकता', 'मिट्टी: गहरी उपजाऊ दोमट'],
          ml: ['കാലാവധി: 10-12 മാസം', 'വെള്ളം: ഉയർന്ന ആവശ്യകത', 'മണ്ണ്: ആഴമുള്ള സമ്പന്നമായ ലോം മണ്ണ്']
        }
      },
      cotton: {
        name: { en: 'Cotton', hi: 'कपास', ml: 'പരുത്തി' },
        description: {
          en: 'Fiber crop used in textile industry.',
          hi: 'कपड़ा उद्योग में उपयोग की जाने वाली रेशा फसल।',
          ml: 'വസ്ത്ര വ്യവസായത്തിൽ ഉപയോഗിക്കുന്ന തന്ത്രി വിള.'
        },
        details: {
          en: ['Duration: 150-180 days', 'Temperature: 21-30°C', 'Soil: Black cotton soil preferred'],
          hi: ['अवधि: 150-180 दिन', 'तापमान: 21-30°C', 'मिट्टी: काली कपास मिट्टी उपयुक्त'],
          ml: ['കാലാവധി: 150-180 ദിവസം', 'താപനില: 21-30°C', 'മണ്ണ്: കരിമണ്ണ് അനുയോജ്യം']
        }
      },
      pulses: {
        name: { en: 'Pulses (e.g., Moong, Tur)', hi: 'दालें (जैसे मूंग, अरहर)', ml: 'പയർകൃഷി (ഉദാ. മുക്ക, തുവര)' },
        description: {
          en: 'Leguminous crops that fix nitrogen and improve soil health.',
          hi: 'नाइट्रोजन फिक्स करने वाली और मिट्टी की उर्वरता बढ़ाने वाली फसलें।',
          ml: 'നൈട്രജൻ ഫിക്സ് ചെയ്ത് മണ്ണിന്റെ ഉത്പാദകശക്തി വർദ്ധിപ്പിക്കുന്ന വിളകൾ.'
        },
        details: {
          en: ['Duration: 60-120 days', 'Soil: Well-drained, tolerant to low fertility', 'Benefit: Nitrogen fixer'],
          hi: ['अवधि: 60-120 दिन', 'मिट्टी: अच्छी जल निकासी, कम उर्वरता सहने योग्य', 'लाभ: नाइट्रोजन फिक्सर'],
          ml: ['കാലാവധി: 60-120 ദിവസം', 'മണ്ണ്: മികച്ച ജലനിർഗമന, കുറഞ്ഞ ഉത്പാദകത എന്നിവയ്ക്ക് അനുയോജ്യം', 'ഗുണം: നൈട്രജൻ ഫിക്സർ']
        }
      },
      vegetables: {
        name: { en: 'Vegetables (Tomato, Brinjal, Okra)', hi: 'सब्जियाँ (टमाटर, बैंगन, भिंडी)', ml: 'പച്ചക്കറികൾ (തക്കാളി, വാഴക്ക, വെണ്ട)' },
        description: {
          en: 'Short-duration high-value crops for local markets and nutrition.',
          hi: 'स्थानीय बाजारों और पोषण के लिए छोटी अवधि वाली उच्च-मूल्य वाली फसलें।',
          ml: 'പ്രാദേശിക വിപണികളിലും പോഷണത്തിലും ആവശ്യമായ ചിരകാല കുറഞ്ഞ വിലയുള്ള വിളകൾ.'
        },
        details: {
          en: ['Duration: 60-120 days', 'Irrigation: Regular', 'Market: High value, perishable'],
          hi: ['अवधि: 60-120 दिन', 'सिंचाई: नियमित', 'बाजार: उच्च मूल्य, नाशवान'],
          ml: ['കാലാവധി: 60-120 ദിവസം', 'സേചനം: pravidham', 'വിപണി: ഉയർന്ന മൂല്യം, മ多少期']
        }
      }
    }
  },

  tools: {
    icon: Wrench,
    color: 'from-blue-500 to-indigo-600',
    title: { en: 'Tools & Equipment', hi: 'उपकरण', ml: 'ഉപകരണങ്ങൾ' },
    items: {
      tractor: {
        name: { en: 'Tractor', hi: 'ट्रैक्टर', ml: 'ട്രാക്ടർ' },
        description: {
          en: 'Primary power source for modern farming operations.',
          hi: 'आधुनिक कृषि कार्यों के लिए मुख्य शक्ति स्रोत।',
          ml: 'ആധുനിക കാർഷിക പ്രവർത്തനങ്ങൾക്കുള്ള പ്രധാന ശക്തി സ്രോതസ്സ്.'
        },
        details: {
          en: ['Used for: Plowing, cultivation, transport', 'Power: 25-100+ HP', 'Fuel: Diesel/Electric'],
          hi: ['उपयोग: जुताई, खेती, परिवहन', 'शक्ति: 25-100+ HP', 'ईंधन: डीजल/विद्युत'],
          ml: ['ഉപയോഗം: ഉഴൽ, കൃഷി, ഗതാഗതം', 'ശക്തി: 25-100+ HP', 'ഇന്ധനം: ഡീസൽ/വൈദ്യുതി']
        }
      },
      plow: {
        name: { en: 'Plow', hi: 'हल', ml: 'കലപ്പ' },
        description: {
          en: 'Tool for breaking and turning soil for crop preparation.',
          hi: 'फसल की तैयारी के लिए मिट्टी तोड़ने और पलटने का उपकरण।',
          ml: 'വിള തയ്യാറാക്കലിനായി മണ്ണ് തകർത്ത് മറിക്കുന്ന ഉപകരണം.'
        },
        details: {
          en: ['Types: Moldboard, Disc, Chisel', 'Depth: 15-30 cm', 'Speed: 4-8 km/h'],
          hi: ['प्रकार: मोल्डबोर्ड, डिस्क, छेनी', 'गहराई: 15-30 सेमी', 'गति: 4-8 किमी/घंटा'],
          ml: ['തരങ്ങൾ: മോൾഡ്ബോർഡ്, ഡിസ്ക്, ചിസൽ', 'ആഴം: 15-30 സെമി', 'വേഗത: 4-8 കിമി/മണിക്കൂർ']
        }
      },
      seeddrill: {
        name: { en: 'Seed Drill', hi: 'बीज ड्रिल', ml: 'വിത്തിടുന്ന യന്ത്രം' },
        description: {
          en: 'Machine for uniform seed sowing at correct depth and spacing.',
          hi: 'सही गहराई और दूरी पर समान बीज बुवाई के लिए मशीन।',
          ml: 'ശരിയായ ആഴത്തിലും ഇടവേളയിലും വിത്ത് വിതയ്‌ക്കുന്നതിനുള്ള യന്ത്രം.'
        },
        details: {
          en: ['Seed spacing: Adjustable', 'Power: Manual/Tractor-driven', 'Efficiency: High'],
          hi: ['बीज अंतर: समायोज्य', 'शक्ति: मैनुअल/ट्रैक्टर चालित', 'दक्षता: उच्च'],
          ml: ['വിത്തിടൽ ഇടവ/thread: ക്രമീകരിക്കാവുന്നത്', 'ശക്തി: മാനുവൽ/ട്രാക്ടർ', 'കാര്യക്ഷമത: ഉയർന്നത്']
        }
      },
      harvester: {
        name: { en: 'Combine Harvester', hi: 'कम्बाइन हार्वेस्टर', ml: 'കമ്പൈൻ ഹാർവെസ്റ്റർ' },
        description: {
          en: 'Machine to harvest, thresh and clean grain in one pass.',
          hi: 'एक ही बार में कटाई, थ्रेशिंग और अनाज की सफाई करने वाली मशीन।',
          ml: 'ഒരു വഴി കറ്റി, തോല്പിക്കുകയും ധാന്യം ശുദ്ധീകരിക്കുകയും ചെയ്യുന്ന യന്ത്രം.'
        },
        details: {
          en: ['Suitable for: Wheat, Rice, Maize', 'Capacity: Varies by model', 'Power: Tractor-mounted or self-propelled'],
          hi: ['उपयुक्त: गेहूं, धान, मक्का', 'क्षमता: मॉडल के अनुसार', 'शक्ति: ट्रैक्टर-माउंटेड या स्व-प्रेरित'],
          ml: ['ഉപയോഗത്തിന്: ഗോതമ്പ്, നെല്ല്, ചോളം', 'ക്ഷമത: മോഡലിന്റെ അടിസ്ഥാനത്തിൽ വ്യത്യാസപ്പെടുന്നു', 'ശക്തി: ട്രാക്ടർ-മൗണ്ടഡ് അല്ലെങ്കിൽ സ്വയം ചലിപ്പിക്കുന്നത']
        }
      },
      pump: {
        name: { en: 'Irrigation Pump', hi: 'सिंचाई पंप', ml: 'ജലപ്പമ്പ്' },
        description: {
          en: 'Used to lift water for irrigation from wells, rivers or tanks.',
          hi: 'कुएं, नदियों या तालाबों से सिंचाई के लिए पानी उठाने के लिए उपयोग किया जाता है।',
          ml: 'കിണർ, നദി, കൊണ്ട് ടാങ്കുകളിൽ നിന്നുള്ള ജലം ഉയർത്താൻ ഉപയോഗിക്കുന്നു.'
        },
        details: {
          en: ['Types: Diesel, Electric, Solar', 'Capacity: 0.5 HP - 20+ HP', 'Installation: Aboveground/submersible'],
          hi: ['प्रकार: डीजल, विद्युत, सौर', 'क्षमता: 0.5 HP - 20+ HP', 'इंस्टॉलेशन: ऊपर/पानी में डूबाने योग्य'],
          ml: ['തരം: ഡീസൽ, വൈദ്യുത, സോളാർ', 'ശേഷി: 0.5 HP - 20+ HP', 'ഇൻസ്റ്റാളേഷൻ: മേൽ ഭൂമിശാസ്ത്രം/സബ്മെഴ്സിബിൾ']
        }
      }
    }
  },

  fertilizers: {
    icon: Beaker,
    color: 'from-purple-500 to-violet-600',
    title: { en: 'Fertilizers', hi: 'उर्वरक', ml: 'വളങ്ങൾ' },
    items: {
      urea: {
        name: { en: 'Urea', hi: 'यूरिया', ml: 'യൂറിയ' },
        description: {
          en: 'High nitrogen fertilizer for vegetative growth.',
          hi: 'वानस्पतिक वृद्धि के लिए उच्च नाइट्रोजन उर्वरक।',
          ml: 'വൃദ്ധിക്കുള്ള ഉയർന്ന നൈട്രജൻ വളം.'
        },
        details: {
          en: ['N content: 46%', 'Application: Split doses', 'Rate: 100-150 kg/ha'],
          hi: ['N मात्रा: 46%', 'प्रयोग: विभाजित खुराक', 'दर: 100-150 किग्रा/हेक्टेयर'],
          ml: ['N ഉള്ളടക്കം: 46%', 'പ്രയോഗം: വിഭജിത അളവുകൾ', 'നിരക്ക്: 100-150 കിലോ/ഹെക്ടർ']
        }
      },
      dap: {
        name: { en: 'DAP', hi: 'डी.ए.पी.', ml: 'ഡി.എ.പി' },
        description: {
          en: 'Diammonium phosphate - provides nitrogen and phosphorus.',
          hi: 'डायअमोनियम फास्फेट - नाइट्रोजन और फास्फोरस प्रदान करता है।',
          ml: 'ഡയമോണിയം ഫോസ്ഫേറ്റ് - നൈട്രജനും ഫോസ്ഫറസും നൽകുന്നു.'
        },
        details: {
          en: ['N: 18%, P: 46%', 'Application: Basal dose', 'Rate: 100-125 kg/ha'],
          hi: ['N: 18%, P: 46%', 'प्रयोग: बेसल डोज़', 'दर: 100-125 किग्रा/हेक्टेयर'],
          ml: ['N: 18%, P: 46%', 'പ്രയോഗം: അടിവളം', 'നിരക്ക്: 100-125 കിലോ/ഹെക്ടർ']
        }
      },
      mop: {
        name: { en: 'MOP', hi: 'एम.ओ.पी.', ml: 'എം.ഒ.പി' },
        description: {
          en: 'Muriate of Potash - major source of potassium for plants.',
          hi: 'पोटाश का प्रमुख स्रोत - पौधों के लिए पोटैशियम का मुख्य स्रोत।',
          ml: 'പൊട്ടാഷിന്റെ പ്രധാന ഉറവിടം - സസ്യങ്ങൾക്ക് പൊട്ടാസ്യം നൽകുന്നു.'
        },
        details: {
          en: ['K content: 60%', 'Application: Basal/top dressing', 'Rate: 50-100 kg/ha'],
          hi: ['K मात्रा: 60%', 'प्रयोग: बेसल/टॉप ड्रेसिंग', 'दर: 50-100 किग्रा/हेक्टेयर'],
          ml: ['K ഉള്ളടക്കം: 60%', 'പ്രയോഗം: അടിവളം/മേൽപ്പുറം', 'നിരക്ക്: 50-100 കിലോ/ഹെക്ടർ']
        }
      },
      biofertilizer: {
        name: { en: 'Biofertilizer', hi: 'जैव उर्वरक', ml: 'ജൈവവളം' },
        description: {
          en: 'Microbial formulations that improve nutrient availability (e.g., Rhizobium, Azospirillum).',
          hi: 'राइज़ोबियम, एज़ोस्पायरिलम जैसे सूक्ष्मजीव फ़ॉर्मुलेशन जो पोषक उपलब्धता बढ़ाते हैं।',
          ml: 'റൈസോബിയം, അസോസ്പിരില്ലം പോലുള്ള ഗുരുതരമ്യുക്തി സജ്ജീകരണങ്ങൾ പോഷക ലഭ്യത വർദ്ധിപ്പിക്കുന്നു.'
        },
        details: {
          en: ['Type: Nitrogen fixers, Phosphate solubilizers', 'Application: Seed treatment/soil application', 'Benefit: Soil health improvement'],
          hi: ['प्रकार: नाइट्रोजन फिक्सर, फोस्फेट सॉलubilizer', 'प्रयोग: बीज उपचार/मिट्टी में', 'लाभ: मिट्टी स्वास्थ्य में सुधार'],
          ml: ['തരം: നൈട്രജൻ ഫിക്‌സർ, ഫോസ്ഫേറ്റ് സൊളുബിലൈസർ', 'പ്രയോഗം: വിത്ത് ചികിത്സ/മണ്ണ് പ്രസാദ്', 'ലാഭം: മണ്ണിന്റെ ആരോഗ്യം മെച്ചപ്പെടുത്തുന്നു']
        }
      }
    }
  },

  irrigation: {
    icon: Droplets,
    color: 'from-cyan-500 to-blue-600',
    title: { en: 'Irrigation', hi: 'सिंचाई', ml: 'ജലസേചനം' },
    items: {
      drip: {
        name: { en: 'Drip Irrigation', hi: 'ड्रिप सिंचाई', ml: 'ഡ്രിപ് ജലസേചനം' },
        description: {
          en: 'Water-efficient irrigation system delivering water directly to roots.',
          hi: 'जड़ों तक सीधे पानी पहुंचाने वाली जल कुशल सिंचाई प्रणाली।',
          ml: 'വേരുകളിലേക്ക് നേരിട്ട് വെള്ളം എത്തിക്കുന്ന ജല കാര്യക്ഷമമായ സേചന സംവിധാനം.'
        },
        details: {
          en: ['Efficiency: 90-95%', 'Suitable for: All crops', 'Benefits: Water saving, weed control'],
          hi: ['दक्षता: 90-95%', 'उपयुक्त: सभी फसलों के लिए', 'लाभ: पानी की बचत, खरपतवार नियंत्रण'],
          ml: ['കാര്യക്ഷമത: 90-95%', 'അനുയോജ്യം: എല്ലാ വിളകൾക്കും', 'ഗുണങ്ങൾ: ജല ലാഭം, കള നിയന്ത്രണം']
        }
      },
      sprinkler: {
        name: { en: 'Sprinkler System', hi: 'स्प्रिंकलर सिस्टम', ml: 'സ്പ്രിങ്ക്ലർ സിസ്റ്റം' },
        description: {
          en: 'Overhead irrigation system mimicking natural rainfall.',
          hi: 'प्राकृतिक बारिश की नकल करने वाली ऊपरी सिंचाई प्रणाली।',
          ml: 'പ്രകൃതിദത്ത മഴയെ അനുകരിക്കുന്ന മുകളിൽനിന്നുള്ള സേചന സംവിധാനം.'
        },
        details: {
          en: ['Efficiency: 75-85%', 'Coverage: Large areas', 'Suitable for: Field crops'],
          hi: ['दक्षता: 75-85%', 'कवरेज: बड़े क्षेत्र', 'उपयुक्त: खेत की फसलों के लिए'],
          ml: ['കാര്യക്ഷമത: 75-85%', 'കവറേജ്: വിശാലമായ പ്രദേശങ്ങൾ', 'അനുയോജ്യം: വയൽവിളകൾക്ക്']
        }
      },
      furrow: {
        name: { en: 'Furrow Irrigation', hi: 'फरो सिंचाई', ml: 'കരിമ്പുര ജലസേചനം' },
        description: {
          en: 'Traditional method using furrows between crop rows.',
          hi: 'फसल पंक्तियों के बीच नालियों का उपयोग करने की पारंपरिक विधि।',
          ml: 'വിള നിരകളുടെ ഇടയിൽ കരിമ്പുരകൾ ഉപയോഗിക്കുന്ന പരമ്പരാഗത രീതി.'
        },
        details: {
          en: ['Efficiency: 50-60%', 'Cost: Low', 'Labor: High requirement'],
          hi: ['दक्षता: 50-60%', 'लागत: कम', 'श्रम: अधिक आवश्यकता'],
          ml: ['കാര്യക്ഷമത: 50-60%', 'ചെലവ്: കുറവ്', 'തൊഴിലാളികൾ: ഉയർന്ന ആവശ്യം']
        }
      },
      subsurface: {
        name: { en: 'Sub-surface Irrigation', hi: 'भूमिगत सिंचाई', ml: 'ഉപഭൂമിശാസ്ത്രീയ സേചനം' },
        description: {
          en: 'Delivers water below soil surface to reduce evaporation losses.',
          hi: 'वाष्पीकरण की हानि को कम करने के लिए मिट्टी की सतह के नीचे पानी पहुँचाने वाली प्रणाली।',
          ml: 'ശോഷണ നഷ്ടം കുറയ്ക്കാൻ മണ്ണിന്റെ താളത്തിന്റെ താഴെ വെള്ളം എത്തിക്കുന്നു.'
        },
        details: {
          en: ['Efficiency: 85-95%', 'Installation: Higher initial cost', 'Best for: High-value crops'],
          hi: ['दक्षता: 85-95%', 'इंस्टॉलेशन: उच्च प्रारंभिक लागत', 'उपयुक्त: उच्च-मूल्य फसलें'],
          ml: ['കാര്യക്ഷമത: 85-95%', 'ഇൻസ്റ്റാളേഷൻ: ഉയർന്ന ആരംഭ ചെലവ്', 'ഉതകേണ്ടത്: ഉയർന്ന മൂല്യമുള്ള വിളകൾ']
        }
      }
    }
  },

  pests: {
    icon: Bug,
    color: 'from-red-500 to-rose-600',
    title: { en: 'Pests', hi: 'कीट', ml: 'പീസ്റ്റുകൾ' },
    items: {
      stemBorer: {
        name: { en: 'Stem Borer', hi: 'स्टेम बोअर', ml: 'സ്റ്റം ബോറർ' },
        description: {
          en: 'Common in rice and maize; larvae bore into stem causing dead hearts and whiteheads.',
          hi: 'धान और मक्का में सामान्य; लेरवा डंठल में छेद करते हैं जिससे डेड हार्ट और व्हाइटहेड होते हैं।',
          ml: 'നെല്ല്, ചോളം മുതലായവയിൽ പൊതുവായ പീസ്റ്റ്; ലാർവകൾ തണ്ട് തുരുമ്പിൽ കുത്തി മരിച്ച ഹൃദയം/വെള്ള തലകൾ ഉണ്ടാക്കുന്നു.'
        },
        details: {
          en: ['Signs: Deadheart in seedlings, whiteheads at maturity', 'Control: Pheromone traps, timely transplanting, safe insecticides'],
          hi: ['संकेत: शूटों का सूखना, परिपक्वता पर सफेद सिर', 'नियंत्रण: फेरोमोन ट्रैप, सही समय पर रोपण, सुरक्षित कीटनाशक'],
          ml: ['ചിഹ്നങ്ങൾ: തുടക്കത്തിൽ ഡെഡ് ഹാർട്ട്, പൂർണ്ണ വളർച്ചയിൽ വൈറ്റ്‌ഹെഡ്‌സ്', 'നിയന്ത്രണം: ഫെറോമോൺ ഫുള, സമയബന്ധിതമായി നട്ടെടുക്കൽ, സുരക്ഷിത ജീവനാശിനികൾ']
        }
      },
      locust: {
        name: { en: 'Locusts', hi: 'टिड्डियाँ', ml: 'തതുവകൾ' },
        description: {
          en: 'Migratory swarms that can defoliate fields rapidly causing heavy losses.',
          hi: 'प्रवासी झुंड जो तेज़ी से खेतों की पत्तियाँ खाकर भारी नुकसान कर सकते हैं।',
          ml: 'സംചാരപ്പെടുന്ന കൂട്ടങ്ങൾ, പെട്ടന്ന് കൃഷിഭൂമികളെ പുഴുങ്ങിക്കൊണ്ട് വലിയ നഷ്‌ടം ഉണ്ടാക്കുന്നു.'
        },
        details: {
          en: ['Prevention: Early surveillance, aerial/surface spraying', 'Impact: Can destroy entire fields quickly'],
          hi: ['रोकथाम: प्रारंभिक निगरानी, हवाई/जमीन स्प्रे', 'प्रभाव: तेजी से पूरे खेत बर्बाद कर सकते हैं'],
          ml: ['വൈകല്യം: ആദ്യ പട്രോൾ, പറക്കും/ഭൂമിയിൽ സ്പ്രേ ചെയ്തવાથી നിയന്ത്രണം', 'പ്രഭാവം: ഓരോത്തിലും പിറവികൾ നശിപ്പിക്കാവുന്നതാണ്']
        }
      },
      aphids: {
        name: { en: 'Aphids', hi: 'ऐफ़िड', ml: 'ആഫിഡ്' },
        description: {
          en: 'Sap-sucking insects that transmit viruses and cause stunted growth.',
          hi: 'रस चूसने वाले कीट जो वायरस फैलाते हैं और वृद्धि को रोकते हैं।',
          ml: 'തേങ്ങ ചുഷിക്കുന്ന കീടങ്ങൾ, വൈറസുകൾ ചെരിഞ്ഞു വളർച്ച തടയുന്നു.'
        },
        details: {
          en: ['Signs: Sticky honeydew, sooty mould', 'Control: Natural predators, neem-based sprays, insecticidal soaps'],
          hi: ['संकेत: चिपचिपा हनीड्यू, काला फफूंद', 'नियंत्रण: शत्रु कीट, नीम आधारित स्प्रे, कीटनाशक साबुन'],
          ml: ['ചിഹ്നങ്ങൾ: നെരമ്പ് ഹണിഡ്യൂ, സൂട്ടി ഫംഗസ്', 'നിയന്ത്രണം: പ്രകൃതിദൈനംദിന ശത്രുക്കൾ, നീം സ്പ്രേ, സോപ്പ് സ്പ്രേ']
        }
      }
    }
  },

  diseases: {
    icon: Beaker,
    color: 'from-yellow-500 to-amber-600',
    title: { en: 'Diseases', hi: 'रोग', ml: 'റോം' },
    items: {
      blast: {
        name: { en: 'Rice Blast', hi: 'राइस ब्लास्ट', ml: 'നന്നാട് ബ്ലാസ്റ്റ്' },
        description: {
          en: 'Fungal disease causing lesions on leaves, nodes and panicles; major yield loss disease.',
          hi: 'पत्तियों, गाँठों और कली पर घाव पैदा करने वाली कवक रोग; उत्पादन में बड़ी हानि।',
          ml: 'ഇലകളിലും നോട്ടുകളിലും പാൻക്കിളുകളിലും ദോഷങ്ങൾ സൃഷ്ടിക്കുന്ന ഫംഗസ്; വലിയ വിള നഷ്ടം.'
        },
        details: {
          en: ['Symptoms: Diamond-shaped lesions, neck rot', 'Management: Resistant varieties, balanced N, fungicide spray timing'],
          hi: ['लक्षण: हीरा आकार के घाव, नेक रोग', 'प्रबंधन: प्रतिरोधी किस्में, संतुलित N, कवकनाशक छिड़काव समय'],
          ml: ['രോഗലക്ഷണങ്ങൾ: വീപാചക രൂപത്തിലുള്ള ലെഷൻസ്, നെക്ക് റോട്ട്', 'നിർവ്വചനം: പ്രതിരോധ വിത്തുകൾ, ബലൻസ്ഡ് N, ഫംഗിസൈഡ് സ്പ്രേ']
        }
      },
      rust: {
        name: { en: 'Wheat Rust', hi: 'गेहूं रस्ट', ml: 'ഗോതമ്പ് റസ്റ്റ്' },
        description: {
          en: 'Fungal disease causing orange/brown pustules on leaves; reduces grain quality/quantity.',
          hi: 'पत्तियों पर नारंगी/भूरे फोड़े बनने वाली कवक रोग; अनाज की गुणवत्ता और मात्रा घटती है।',
          ml: 'ഇലകളിൽ ഓറഞ്ച്/ഭূരു ചിറകുകൾ സൃഷ്ടിക്കുന്ന ഫംഗസ്; ധാന്യത്തിന്റെ തോതും ഗുണനിലവാരവും കുറയുന്നു.'
        },
        details: {
          en: ['Types: Stem, Leaf, Stripe rust', 'Control: Resistant varieties, timely fungicides, crop rotation'],
          hi: ['प्रकार: स्टेम, पत्ती, स्ट्राइप रस्ट', 'नियंत्रण: प्रतिरोधी किस्में, समय पर कवकनाशक, फसल चक्रण'],
          ml: ['തരം: സ്റ്റേം, ലീഫ്, സ്ട്രൈപ്പ് റസ്റ്റ്', 'നിയന്ത്രണം: പ്രതിരോധതീർ വിധികൾ, സമയബന്ധിത ഫംഗിസൈഡ്, കൃഷി റോട്ടേഷൻ']
        }
      },
      bacterialBlight: {
        name: { en: 'Bacterial Blight', hi: 'बैक्टीरियल ब्लाइट', ml: 'ബാക്ടീരിയൽ ബ്ലൈറ്റ്' },
        description: {
          en: 'Bacterial disease affecting rice causing wilting and yellowing of leaves.',
          hi: 'धान को प्रभावित करने वाली बैक्टीरियल रोग जो पत्तियों का मुरझाना और पीला होना उत्पन्न करती है।',
          ml: 'നെല്ല് ബാധിക്കുന്ന ബാക്ടീരിയ രോഗം; ഇലകൾ മറയും മഞ്ഞം ആകുന്നു.'
        },
        details: {
          en: ['Spread: Contaminated water, tools', 'Management: Clean seed, resistant varieties, sanitation'],
          hi: ['प्रसार: दूषित पानी, उपकरण', 'प्रबंधन: साफ बीज, प्रतिरोधी किस्में, स्वच्छता'],
          ml: ['വ്യാപനം: മലിനജലവും ഉപകരണങ്ങളും', 'നിയന്ത്രണം: ശുദ്ധമായ വിത്ത്, പ്രതിരോധ വനിതകൾ, ശുചീകരണം']
        }
      }
    }
  },

  renewableEnergy: {
    icon: Sun,
    color: 'from-amber-400 to-yellow-500',
    title: { en: 'Renewable Energy', hi: 'नवीकरणीय ऊर्जा', ml: 'പുനരുജ്ജീവ ഊർജം' },
    items: {
      solarPump: {
        name: { en: 'Solar Pump', hi: 'सोलर पंप', ml: 'സോളാർ പമ്പ്' },
        description: {
          en: 'Electric pump powered by solar panels — low running cost, good for irrigation in sunny areas.',
          hi: 'सौर पैनलों से चलने वाला इलेक्ट्रिक पंप — कम ऑपरेशनल लागत, धूप वाले क्षेत्रों के लिए अच्छा।',
          ml: 'സോളാർ പാനലുകൾ കൊണ്ടുള്ള വൈദ്യുതി പമ്പ് — ഓപ്പറേറ്റിങ് ചെലവ് കുറഞ്ഞു, സൂര്യപ്രകാശമുള്ള മേഖലകളിൽ അനുയോജ്യം.'
        },
        details: {
          en: ['Ideal: Off-grid farms', 'Maintenance: Low', 'Cost: Higher initial investment, long-term savings'],
          hi: ['उपयुक्त: ऑफ-ग्रिड खेत', 'रख-रखाव: कम', 'लागत: अधिक प्रारंभिक निवेश, दीर्घकालिक बचत'],
          ml: ['ഉപോജ്യമായത്: ഓഫ്ഗ്രിഡ് ഫാമുകൾക്ക്', 'ട്രൈ-ഒവർ: കുറഞ്ഞത്', 'ചെലവ്: ഉയർന്ന ലാഭം തുടക്കത്തിൽ, ദീർഘകാല ലാഭം']
        }
      },
      biogas: {
        name: { en: 'Biogas Plant', hi: 'बायोगैस प्लांट', ml: 'ബയോغاز പ്ലാന്റ്' },
        description: {
          en: 'Converts livestock and crop residues to methane-rich gas for cooking/fuel and nutrient-rich slurry for fields.',
          hi: 'पशुधन और फसल अवशेषों को रसोई/ईंधन के लिए मीथेन गैस और खेतों के लिए पोषक तत्व समृद्ध slurry में बदलता है।',
          ml: 'പശു പശുവിനും വിളശേഷിപ്പുകളും മിതേനാർദ്ധ ഗൃഹോദ്യമ ചൂടിനും ഇന്ധനത്തിനും ഉപകരണങ്ങളിലും മാറ്റുന്നു; മണ്ണ് സമ്പുഷ്ടമായ സ്ലറിക്ക് ഉപയോഗിക്കുന്നു.'
        },
        details: {
          en: ['Benefit: Waste recycling, cooking fuel, soil amendment', 'Scale: Household to community digesters', 'Feedstock: Animal manure, crop residues'],
          hi: ['लाभ: अपशिष्ट पुनर्चक्रण, रसोई ईंधन, मिट्टी संवर्धन', 'स्केल: घरेलू से सामुदायिक', 'कच्चा माल: पशु गोबर, फसल अवशेष'],
          ml: ['ഗുണം: മാലിന്യം റിസൈക്കിൾ ചെയ്യുക, പാചക ഇന്ധനം, മണ്ണിന് പോഷകങ്ങൾ നൽകൽ', 'സ്കെയിൽ: വീട്ടു മുതൽ സാമൂഹിക പകുതിയിലേക്', 'ഫീഡ്സ്ടോക്ക്: മൃഗവലം, വിളശേഷിപ്പുകൾ']
        }
      }
    }
  }
}

const Encyclopedia = () => {
  const { t, currentLanguage } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('crops')
  const [searchTerm, setSearchTerm] = useState('')

  const currentCategory = encyclopediaData[selectedCategory]
  const filteredItems = Object.entries(currentCategory.items).filter(([key, item]) =>
    (item.name[currentLanguage] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description[currentLanguage] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(item.details?.[currentLanguage]) && item.details[currentLanguage].join(' ').toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600/20 via-purple-500/20 to-indigo-600/20 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center animate-glow">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                {t('encyclopedia')}
              </h1>
              <p className="text-slate-400 mt-2">
                {t('farmingKnowledgeBase')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Search className="h-5 w-5 mr-2 text-blue-400" />
                Search
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search knowledge base..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Book className="h-5 w-5 mr-2 text-purple-400" />
                Categories
              </h3>
              <div className="space-y-2">
                {Object.entries(encyclopediaData).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`w-full p-3 rounded-xl transition-all duration-200 text-left ${
                      selectedCategory === key
                        ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-300'
                        : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 border border-slate-600/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                        <category.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">{category.title[currentLanguage]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentCategory.color} flex items-center justify-center mr-3`}>
                  <currentCategory.icon className="h-5 w-5 text-white" />
                </div>
                {currentCategory.title[currentLanguage]} ({filteredItems.length})
              </h2>

              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">
                    {searchTerm ? 'No items found matching your search' : 'No items available'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredItems.map(([key, item]) => (
                    <div
                      key={key}
                      className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200"
                    >
                      <h3 className="text-xl font-bold text-white mb-3">
                        {item.name[currentLanguage]}
                      </h3>
                      <p className="text-slate-300 text-sm mb-4">
                        {item.description[currentLanguage]}
                      </p>
                      <div className="space-y-2">
                        {(item.details?.[currentLanguage] || []).map((detail, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                            <span className="text-slate-400 text-sm">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Encyclopedia
