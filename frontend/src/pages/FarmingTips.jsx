import React from 'react'
import { Lightbulb, Sprout, Droplets, Sun, Shield, Leaf, Zap, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const tips = [
  {
    icon: Sprout,
    color: 'from-emerald-500 to-green-600',
    title: {
      en: 'Soil Preparation',
      hi: 'मिट्टी की तैयारी',
      ml: 'മണ്ണിന്റെ തയ്യാറാക്കല്'
    },
    points: {
      en: [
        'Test soil pH and nutrients before sowing',
        'Add organic matter like compost or FYM',
        'Ensure proper tillage for good root aeration'
      ],
      hi: [
        'बुवाई से पहले मिट्टी का pH और पोषक तत्व जाँचें',
        'कम्पोस्ट या गोबर खाद मिलाएँ',
        'जड़ों के लिए उचित जुताई करें'
      ],
      ml: [
        'വിതയ്ക്കുന്നതിന് മുമ്പ് മണ്ണിലെ pHയും പോഷകങ്ങളും പരിശോധിക്കുക',
        'കമ്പോസ്റ്റ് അല്ലെങ്കിൽ എഫ്.വൈ. എം ചേർക്കുക',
        'വേരുകളുടെ വായുസഞ്ചാരത്തിനായി ശരിയായ ഉഴവ് ഉറപ്പാക്കുക'
      ]
    }
  },
  {
    icon: Droplets,
    color: 'from-blue-500 to-indigo-600',
    title: {
      en: 'Irrigation Management',
      hi: 'सिंचाई प्रबंधन',
      ml: 'ജലസേചന നിയന്ത്രണം'
    },
    points: {
      en: [
        'Irrigate based on crop stage and soil moisture',
        'Use mulching to conserve water',
        'Prefer drip/sprinkler for efficiency'
      ],
      hi: [
        'फसल की अवस्था और मिट्टी की नमी के अनुसार सिंचाई करें',
        'पानी बचाने के लिए मल्चिंग करें',
        'दक्षता के लिए ड्रिप/स्प्रिंकलर का उपयोग करें'
      ],
      ml: [
        'വിളയുടെ ഘട്ടം, മണ്ണിലെ ഈർപ്പം എന്നിവയെ ആശ്രയിച്ച് ജലസേചനം നടത്തുക',
        'വെള്ളം സംരക്ഷിക്കാൻ മൾച്ചിംഗ് ഉപയോഗിക്കുക',
        'കാര്യക്ഷമതയ്ക്ക് ഡ്രിപ്പ്/സ്പ്രിങ്ക്ലർ പ്രാധാന്യം നൽകുക'
      ]
    }
  },
  {
    icon: Sun,
    color: 'from-yellow-500 to-orange-600',
    title: {
      en: 'Crop Nutrition',
      hi: 'फसल पोषण',
      ml: 'വിള പോഷണം'
    },
    points: {
      en: [
        'Follow soil test-based fertilizer recommendation',
        'Split nitrogen doses for better uptake',
        'Use biofertilizers to boost soil health'
      ],
      hi: [
        'मिट्टी परीक्षण आधारित उर्वरक सिफारिशें अपनाएं',
        'नाइट्रोजन की खुराक विभाजित करें',
        'जैविक उर्वरकों का उपयोग करें'
      ],
      ml: [
        'മണ്ണ് പരിശോധനയെ അടിസ്ഥാനമാക്കിയുള്ള വള ശുപാർശകൾ പിന്തുടരുക',
        'നൈട്രജൻ വിഭജിക്കപ്പെട്ട അളവുകളിൽ നൽകുക',
        'മണ്ണിന്റെ ആരോഗ്യത്തിന് ജൈവവളങ്ങൾ പ്രയോജനപ്പെടുത്തുക'
      ]
    }
  },
  {
    icon: Shield,
    color: 'from-pink-500 to-rose-600',
    title: {
      en: 'Pest & Disease',
      hi: 'कीट और रोग',
      ml: 'കീടവും രോഗവും'
    },
    points: {
      en: [
        'Monitor fields weekly for early detection',
        'Use resistant varieties and crop rotation',
        'Apply pesticides only as per threshold'
      ],
      hi: [
        'जल्दी पहचान के लिए साप्ताहिक निगरानी करें',
        'प्रतिरोधी किस्में और फसल चक्र अपनाएं',
        'कीटनाशक केवल सीमा के अनुसार दें'
      ],
      ml: [
        'ലഘുവായ ഘട്ടത്തിൽ കണ്ടെത്താൻ ആഴ്ചതോറും നിരീക്ഷിക്കുക',
        'പ്രതിരോധ ഇനങ്ങളും വിള പരിവർത്തനവും സ്വീകരിക്കുക',
        'പരിധി അടിസ്ഥാനത്തിൽ മാത്രം കീടനാശിനികൾ പ്രയോഗിക്കുക'
      ]
    }
  },
  {
    icon: Leaf,
    color: 'from-lime-500 to-green-600',
    title: {
      en: 'Sustainable Practices',
      hi: 'टिकाऊ उपाय',
      ml: 'സുസ്ഥിര പദ്ധതികൾ'
    },
    points: {
      en: [
        'Adopt intercropping and cover crops',
        'Conserve water and soil',
        'Recycle farm residues'
      ],
      hi: [
        'अंतर-फसल और कवर फसल अपनाएं',
        'पानी और मिट्टी का संरक्षण करें',
        'कृषि अवशेषों का पुनर्चक्रण करें'
      ],
      ml: [
        'ഇടവിളയും മൂടിവിളയും സ്വീകരിക്കുക',
        'ജലവും മണ്ണും സംരക്ഷിക്കുക',
        'കൃഷി അവശിഷ്ടങ്ങൾ പുനരുപയോഗിക്കുക'
      ]
    }
  },
  {
    icon: Zap,
    color: 'from-purple-500 to-indigo-700',
    title: {
      en: 'Weed Management',
      hi: 'खरपतवार प्रबंधन',
      ml: 'കുറ്റിച്ചെടി നിയന്ത്രണം'
    },
    points: {
      en: [
        'Weed control during critical crop stages',
        'Use mulching or cover crops to suppress weeds',
        'Apply herbicides judiciously when needed'
      ],
      hi: [
        'फसल के महत्वपूर्ण चरणों में खरपतवार नियंत्रण करें',
        'खरपतवार को दबाने के लिए मल्चिंग या कवर फसल अपनाएं',
        'जरूरत पड़ने पर ही शाकनाशी का उपयोग करें'
      ],
      ml: [
        'വിളയുടെ പ്രധാന ഘട്ടങ്ങളിൽ കുറ്റിച്ചെടി നിയന്ത്രിക്കുക',
        'മൾച്ചിംഗ് അല്ലെങ്കിൽ മൂടിവിളകൾ ഉപയോഗിച്ച് കുറ്റിച്ചെടികൾ തടയുക',
        'ആവശ്യമായപ്പോൾ മാത്രം കീടനാശിനികൾ പ്രയോഗിക്കുക'
      ]
    }
  },
  {
    icon: Lightbulb,
    color: 'from-cyan-500 to-sky-600',
    title: {
      en: 'Harvesting Tips',
      hi: 'कटाई सुझाव',
      ml: 'വിളവെടുപ്പ് നിര്‍ദേശങ്ങള്‍'
    },
    points: {
      en: [
        'Harvest crops at the right maturity stage',
        'Avoid delays to prevent post-harvest losses',
        'Use clean tools and proper storage facilities'
      ],
      hi: [
        'सही परिपक्वता चरण पर फसल की कटाई करें',
        'कटाई में देरी से बचें ताकि नुकसान न हो',
        'साफ औजार और उचित भंडारण सुविधाएं अपनाएं'
      ],
      ml: [
        'ശരിയായ പക്വതയിൽ വിളവെടുപ്പ് നടത്തുക',
        'വിളവെടുപ്പിൽ വൈകിപ്പിക്കാതെ നഷ്ടം ഒഴിവാക്കുക',
        'ശുദ്ധമായ ഉപകരണങ്ങളും നല്ല സംഭരണ സംവിധാനങ്ങളും ഉപയോഗിക്കുക'
      ]
    }
  },
  {
    icon: Sun,
    color: 'from-amber-500 to-orange-700',
    title: {
      en: 'Climate Adaptation',
      hi: 'जलवायु अनुकूलन',
      ml: 'കാലാവസ്ഥ അനുയോജനം'
    },
    points: {
      en: [
        'Choose crops suitable for changing climate',
        'Use drought and flood-tolerant varieties',
        'Adopt rainwater harvesting techniques'
      ],
      hi: [
        'बदलती जलवायु के लिए उपयुक्त फसलें चुनें',
        'सूखा और बाढ़ सहनशील किस्में अपनाएं',
        'वर्षा जल संचयन तकनीकें अपनाएं'
      ],
      ml: [
        'മാറുന്ന കാലാവസ്ഥയ്ക്ക് അനുയോജ്യമായ വിളകൾ തിരഞ്ഞെടുക്കുക',
        'വറ്റലും വെള്ളപ്പൊക്കവും സഹിക്കുന്ന ഇനങ്ങൾ ഉപയോഗിക്കുക',
        'മഴവെള്ള സംഭരണം സ്വീകരിക്കുക'
      ]
    }
  },
  {
    icon: Shield,
    color: 'from-red-500 to-rose-700',
    title: {
      en: 'Post-Harvest Management',
      hi: 'कटाई के बाद प्रबंधन',
      ml: 'വിളവെടുപ്പ് ശേഷമുള്ള നിയന്ത്രണം'
    },
    points: {
      en: [
        'Sort and grade produce before storage',
        'Use proper packaging to reduce damage',
        'Ensure pest-free storage conditions'
      ],
      hi: [
        'भंडारण से पहले उपज की छंटाई और ग्रेडिंग करें',
        'नुकसान कम करने के लिए सही पैकेजिंग करें',
        'कीट-मुक्त भंडारण सुनिश्चित करें'
      ],
      ml: [
        'സംഭരണത്തിന് മുമ്പ് വിളവെടുപ്പ് വസ്തുക്കൾ ക്രമീകരിക്കുകയും ഗ്രേഡ് ചെയ്യുകയും ചെയ്യുക',
        'നാശനഷ്ടം കുറയ്ക്കാൻ ശരിയായ പാക്കേജിംഗ് ചെയ്യുക',
        'കീടരഹിത സംഭരണം ഉറപ്പാക്കുക'
      ]
    }
  },
  {
    icon: Leaf,
    color: 'from-green-500 to-emerald-700',
    title: {
      en: 'Organic Farming',
      hi: 'जैविक खेती',
      ml: 'ഓർഗാനിക് കൃഷി'
    },
    points: {
      en: [
        'Use natural fertilizers and biopesticides',
        'Avoid synthetic chemicals in farming',
        'Promote soil biodiversity and health'
      ],
      hi: [
        'प्राकृतिक उर्वरक और जैव-कीटनाशक का उपयोग करें',
        'खेती में रासायनिक उर्वरकों से बचें',
        'मिट्टी की जैव विविधता और स्वास्थ्य को बढ़ावा दें'
      ],
      ml: [
        'സ്വാഭാവിക വളങ്ങളും ജൈവ കീടനാശിനികളും ഉപയോഗിക്കുക',
        'കൃത്രിമ രാസവളങ്ങൾ ഒഴിവാക്കുക',
        'മണ്ണിലെ ജൈവ വൈവിധ്യവും ആരോഗ്യവും പ്രോത്സാഹിപ്പിക്കുക'
      ]
    }
  },
  {
    icon: Droplets,
    color: 'from-sky-500 to-blue-700',
    title: {
      en: 'Water Conservation',
      hi: 'जल संरक्षण',
      ml: 'ജല സംരക്ഷണം'
    },
    points: {
      en: [
        'Build farm ponds for water storage',
        'Use micro-irrigation methods',
        'Plant trees to maintain groundwater levels'
      ],
      hi: [
        'पानी के भंडारण के लिए खेत तालाब बनाएं',
        'सूक्ष्म सिंचाई विधियों का उपयोग करें',
        'भूजल स्तर बनाए रखने के लिए पेड़ लगाएं'
      ],
      ml: [
        'വെള്ള സംഭരണത്തിനായി ഫാം കുളങ്ങൾ നിർമ്മിക്കുക',
        'മൈക്രോ-ജലസേചന രീതികൾ ഉപയോഗിക്കുക',
        'ഭൂഗർഭജല നിലനിർത്താൻ മരങ്ങൾ നടുക'
      ]
    }
  },
  {
    icon: Sprout,
    color: 'from-teal-500 to-cyan-700',
    title: {
      en: 'Seed Selection',
      hi: 'बीज चयन',
      ml: 'ബീജ തിരഞ്ഞെടുപ്പ്'
    },
    points: {
      en: [
        'Choose certified, high-yielding seeds',
        'Use disease-free seeds for better crops',
        'Follow recommended seed rate and spacing'
      ],
      hi: [
        'प्रमाणित, उच्च उपज वाले बीज चुनें',
        'बेहतर फसल के लिए रोग-मुक्त बीज का उपयोग करें',
        'अनुशंसित बीज दर और दूरी का पालन करें'
      ],
      ml: [
        'സർട്ടിഫൈഡ്, ഉയർന്ന വിളവുള്ള വിത്തുകൾ തിരഞ്ഞെടുക്കുക',
        'മെച്ചപ്പെട്ട വിളയ്ക്കായി രോഗരഹിത വിത്തുകൾ ഉപയോഗിക്കുക',
        'ശുപാർശ ചെയ്യുന്ന വിത്ത് നിരക്കും ഇടവിടവും പാലിക്കുക'
      ]
    }
  },
  {
    icon: Lightbulb,
    color: 'from-indigo-500 to-purple-700',
    title: {
      en: 'Farm Mechanization',
      hi: 'कृषि यंत्रीकरण',
      ml: 'കൃഷി മെക്കാനൈസേഷൻ'
    },
    points: {
      en: [
        'Use modern tools to save labor costs',
        'Adopt precision farming technologies',
        'Ensure regular maintenance of equipment'
      ],
      hi: [
        'श्रम लागत बचाने के लिए आधुनिक उपकरण अपनाएं',
        'सटीक खेती तकनीकें अपनाएं',
        'उपकरणों का नियमित रखरखाव करें'
      ],
      ml: [
        'തൊഴിൽ ചെലവ് കുറയ്ക്കാൻ ആധുനിക ഉപകരണങ്ങൾ ഉപയോഗിക്കുക',
        'പ്രിസിഷൻ കൃഷി സാങ്കേതികവിദ്യകൾ സ്വീകരിക്കുക',
        'ഉപകരണങ്ങളുടെ സ്ഥിരമായ പരിപാലനം ഉറപ്പാക്കുക'
      ]
    }
  }
]

const FarmingTips = () => {
  const { t, currentLanguage } = useLanguage()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="bg-gradient-to-r from-cyan-600/20 via-teal-500/20 to-emerald-600/20 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-600 rounded-2xl flex items-center justify-center animate-glow">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">{t('farmingTips')}</h1>
              <p className="text-slate-400 mt-2">{t('practicalFarmingAdvice')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tips.map((tip, idx) => (
            <div key={idx} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tip.color} flex items-center justify-center mb-4`}>
                <tip.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{tip.title[currentLanguage]}</h3>
              <ul className="space-y-2">
                {tip.points[currentLanguage].map((p, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-1" />
                    <span className="text-slate-300 text-sm">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FarmingTips
