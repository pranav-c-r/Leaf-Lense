import { useState } from 'react'
import { Wheat, TrendingUp, Calendar, Thermometer, Droplets, Wind, MapPin, Zap, Brain, AlertCircle } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const CropYield = () => {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    state: '',
    district: '',
    year:'',
    season:'',
    soilPh: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    rainfall: '',
  })
  
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)

  const states = ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir ', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana ', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']
  const districts = ['24 PARAGANAS NORTH', '24 PARAGANAS SOUTH', 'ADILABAD', 'AGAR MALWA', 'AGRA', 'AHMADABAD', 'AHMEDNAGAR', 'AIZAWL', 'AJMER', 'AKOLA', 'ALAPPUZHA', 'ALIGARH', 'ALIRAJPUR', 'ALLAHABAD', 'ALMORA', 'ALWAR', 'AMBALA', 'AMBEDKAR NAGAR', 'AMETHI', 'AMRAVATI', 'AMRELI', 'AMRITSAR', 'AMROHA', 'ANAND', 'ANANTAPUR', 'ANANTNAG', 'ANJAW', 'ANUGUL', 'ANUPPUR', 'ARARIA', 'ARIYALUR', 'ARWAL', 'ASHOKNAGAR', 'AURAIYA', 'AURANGABAD', 'AZAMGARH', 'BADGAM', 'BAGALKOT', 'BAGESHWAR', 'BAGHPAT', 'BAHRAICH', 'BAKSA', 'BALAGHAT', 'BALANGIR', 'BALESHWAR', 'BALLIA', 'BALOD', 'BALODA BAZAR', 'BALRAMPUR', 'BANAS KANTHA', 'BANDA', 'BANDIPORA', 'BANGALORE RURAL', 'BANKA', 'BANKURA', 'BANSWARA', 'BARABANKI', 'BARAMULLA', 'BARAN', 'BARDHAMAN', 'BAREILLY', 'BARGARH', 'BARMER', 'BARNALA', 'BARPETA', 'BARWANI', 'BASTAR', 'BASTI', 'BATHINDA', 'BEED', 'BEGUSARAI', 'BELGAUM', 'BELLARY', 'BEMETARA', 'BENGALURU URBAN', 'BETUL', 'BHADRAK', 'BHAGALPUR', 'BHANDARA', 'BHARATPUR', 'BHARUCH', 'BHAVNAGAR', 'BHILWARA', 'BHIND', 'BHIWANI', 'BHOJPUR', 'BHOPAL', 'BIDAR', 'BIJAPUR', 'BIJNOR', 'BIKANER', 'BILASPUR', 'BIRBHUM', 'BISHNUPUR', 'BOKARO', 'BONGAIGAON', 'BOUDH', 'BUDAUN', 'BULANDSHAHR', 'BULDHANA', 'BUNDI', 'BURHANPUR', 'BUXAR', 'CACHAR', 'CHAMARAJANAGAR', 'CHAMBA', 'CHAMOLI', 'CHAMPAWAT', 'CHAMPHAI', 'CHANDAULI', 'CHANDEL', 'CHANDIGARH', 'CHANDRAPUR', 'CHANGLANG', 'CHATRA', 'CHHATARPUR', 'CHHINDWARA', 'CHIKBALLAPUR', 'CHIKMAGALUR', 'CHIRANG', 'CHITRADURGA', 'CHITRAKOOT', 'CHITTOOR', 'CHITTORGARH', 'CHURACHANDPUR', 'CHURU', 'COIMBATORE', 'COOCHBEHAR', 'CUDDALORE', 'CUTTACK', 'DADRA AND NAGAR HAVELI', 'DAKSHIN KANNAD', 'DAMOH', 'DANG', 'DANTEWADA', 'DARBHANGA', 'DARJEELING', 'DARRANG', 'DATIA', 'DAUSA', 'DAVANGERE', 'DEHRADUN', 'DEOGARH', 'DEOGHAR', 'DEORIA', 'DEWAS', 'DHALAI', 'DHAMTARI', 'DHANBAD', 'DHAR', 'DHARMAPURI', 'DHARWAD', 'DHEMAJI', 'DHENKANAL', 'DHOLPUR', 'DHUBRI', 'DHULE', 'DIBANG VALLEY', 'DIBRUGARH', 'DIMA HASAO', 'DIMAPUR', 'DINAJPUR DAKSHIN', 'DINAJPUR UTTAR', 'DINDIGUL', 'DINDORI', 'DODA', 'DOHAD', 'DUMKA', 'DUNGARPUR', 'DURG', 'EAST DISTRICT', 'EAST GARO HILLS', 'EAST GODAVARI', 'EAST JAINTIA HILLS', 'EAST KAMENG', 'EAST KHASI HILLS', 'EAST SIANG', 'EAST SINGHBUM', 'ERNAKULAM', 'ERODE', 'ETAH', 'ETAWAH', 'FAIZABAD', 'FARIDABAD', 'FARIDKOT', 'FARRUKHABAD', 'FATEHABAD', 'FATEHGARH SAHIB', 'FATEHPUR', 'FAZILKA', 'FIROZABAD', 'FIROZEPUR', 'GADAG', 'GADCHIROLI', 'GAJAPATI', 'GANDERBAL', 'GANDHINAGAR', 'GANGANAGAR', 'GANJAM', 'GARHWA', 'GARIYABAND', 'GAUTAM BUDDHA NAGAR', 'GAYA', 'GHAZIABAD', 'GHAZIPUR', 'GIRIDIH', 'GOALPARA', 'GODDA', 'GOLAGHAT', 'GOMATI', 'GONDA', 'GONDIA', 'GOPALGANJ', 'GORAKHPUR', 'GULBARGA', 'GUMLA', 'GUNA', 'GUNTUR', 'GURDASPUR', 'GURGAON', 'GWALIOR', 'HAILAKANDI', 'HAMIRPUR', 'HANUMANGARH', 'HAPUR', 'HARDA', 'HARDOI', 'HARIDWAR', 'HASSAN', 'HATHRAS', 'HAVERI', 'HAZARIBAGH', 'HINGOLI', 'HISAR', 'HOOGHLY', 'HOSHANGABAD', 'HOSHIARPUR', 'HOWRAH', 'HYDERABAD', 'IDUKKI', 'IMPHAL EAST', 'IMPHAL WEST', 'INDORE', 'JABALPUR', 'JAGATSINGHAPUR', 'JAIPUR', 'JAISALMER', 'JAJAPUR', 'JALANDHAR', 'JALAUN', 'JALGAON', 'JALNA', 'JALORE', 'JALPAIGURI', 'JAMMU', 'JAMNAGAR', 'JAMTARA', 'JAMUI', 'JANJGIR-CHAMPA', 'JASHPUR', 'JAUNPUR', 'JEHANABAD', 'JHABUA', 'JHAJJAR', 'JHALAWAR', 'JHANSI', 'JHARSUGUDA', 'JHUNJHUNU', 'JIND', 'JODHPUR', 'JORHAT', 'JUNAGADH', 'KABIRDHAM', 'KACHCHH', 'KADAPA', 'KAIMUR (BHABUA)', 'KAITHAL', 'KALAHANDI', 'KAMRUP', 'KAMRUP METRO', 'KANCHIPURAM', 'KANDHAMAL', 'KANGRA', 'KANKER', 'KANNAUJ', 'KANNIYAKUMARI', 'KANNUR', 'KANPUR DEHAT', 'KANPUR NAGAR', 'KAPURTHALA', 'KARAIKAL', 'KARAULI', 'KARBI ANGLONG', 'KARGIL', 'KARIMGANJ', 'KARIMNAGAR', 'KARNAL', 'KARUR', 'KASARAGOD', 'KASGANJ', 'KATHUA', 'KATIHAR', 'KATNI', 'KAUSHAMBI', 'KENDRAPARA', 'KENDUJHAR', 'KHAGARIA', 'KHAMMAM', 'KHANDWA', 'KHARGONE', 'KHEDA', 'KHERI', 'KHORDHA', 'KHOWAI', 'KHUNTI', 'KINNAUR', 'KIPHIRE', 'KISHANGANJ', 'KISHTWAR', 'KODAGU', 'KODERMA', 'KOHIMA', 'KOKRAJHAR', 'KOLAR', 'KOLASIB', 'KOLHAPUR', 'KOLLAM', 'KONDAGAON', 'KOPPAL', 'KORAPUT', 'KORBA', 'KOREA', 'KOTA', 'KOTTAYAM', 'KOZHIKODE', 'KRISHNA', 'KRISHNAGIRI', 'KULGAM', 'KULLU', 'KUPWARA', 'KURNOOL', 'KURUKSHETRA', 'KURUNG KUMEY', 'KUSHI NAGAR', 'LAHUL AND SPITI', 'LAKHIMPUR', 'LAKHISARAI', 'LALITPUR', 'LATEHAR', 'LATUR', 'LAWNGTLAI', 'LEH LADAKH', 'LOHARDAGA', 'LOHIT', 'LONGDING', 'LONGLENG', 'LOWER DIBANG VALLEY', 'LOWER SUBANSIRI', 'LUCKNOW', 'LUDHIANA', 'LUNGLEI', 'MADHEPURA', 'MADHUBANI', 'MADURAI', 'MAHARAJGANJ', 'MAHASAMUND', 'MAHBUBNAGAR', 'MAHE', 'MAHENDRAGARH', 'MAHESANA', 'MAHOBA', 'MAINPURI', 'MALAPPURAM', 'MALDAH', 'MALKANGIRI', 'MAMIT', 'MANDI', 'MANDLA', 'MANDSAUR', 'MANDYA', 'MANSA', 'MARIGAON', 'MATHURA', 'MAU', 'MAYURBHANJ', 'MEDAK', 'MEDINIPUR EAST', 'MEDINIPUR WEST', 'MEERUT', 'MEWAT', 'MIRZAPUR', 'MOGA', 'MOKOKCHUNG', 'MON', 'MORADABAD', 'MORENA', 'MUKTSAR', 'MUMBAI', 'MUNGELI', 'MUNGER', 'MURSHIDABAD', 'MUZAFFARNAGAR', 'MUZAFFARPUR', 'MYSORE', 'NABARANGPUR', 'NADIA', 'NAGAON', 'NAGAPATTINAM', 'NAGAUR', 'NAGPUR', 'NAINITAL', 'NALANDA', 'NALBARI', 'NALGONDA', 'NAMAKKAL', 'NAMSAI', 'NANDED', 'NANDURBAR', 'NARAYANPUR', 'NARMADA', 'NARSINGHPUR', 'NASHIK', 'NAVSARI', 'NAWADA', 'NAWANSHAHR', 'NAYAGARH', 'NEEMUCH', 'NICOBARS', 'NIZAMABAD', 'NORTH AND MIDDLE ANDAMAN', 'NORTH DISTRICT', 'NORTH GARO HILLS', 'NORTH GOA', 'NORTH TRIPURA', 'NUAPADA', 'OSMANABAD', 'PAKUR', 'PALAKKAD', 'PALAMU', 'PALGHAR', 'PALI', 'PALWAL', 'PANCH MAHALS', 'PANCHKULA', 'PANIPAT', 'PANNA', 'PAPUM PARE', 'PARBHANI', 'PASHCHIM CHAMPARAN', 'PATAN', 'PATHANAMTHITTA', 'PATHANKOT', 'PATIALA', 'PATNA', 'PAURI GARHWAL', 'PERAMBALUR', 'PEREN', 'PHEK', 'PILIBHIT', 'PITHORAGARH', 'PONDICHERRY', 'POONCH', 'PORBANDAR', 'PRAKASAM', 'PRATAPGARH', 'PUDUKKOTTAI', 'PULWAMA', 'PUNE', 'PURBI CHAMPARAN', 'PURI', 'PURNIA', 'PURULIA', 'RAE BARELI', 'RAICHUR', 'RAIGAD', 'RAIGARH', 'RAIPUR', 'RAISEN', 'RAJAURI', 'RAJGARH', 'RAJKOT', 'RAJNANDGAON', 'RAJSAMAND', 'RAMANAGARA', 'RAMANATHAPURAM', 'RAMBAN', 'RAMGARH', 'RAMPUR', 'RANCHI', 'RANGAREDDI', 'RATLAM', 'RATNAGIRI', 'RAYAGADA', 'REASI', 'REWA', 'REWARI', 'RI BHOI', 'ROHTAK', 'ROHTAS', 'RUDRA PRAYAG', 'RUPNAGAR', 'S.A.S NAGAR', 'SABAR KANTHA', 'SAGAR', 'SAHARANPUR', 'SAHARSA', 'SAHEBGANJ', 'SAIHA', 'SALEM', 'SAMASTIPUR', 'SAMBA', 'SAMBALPUR', 'SAMBHAL', 'SANGLI', 'SANGRUR', 'SANT KABEER NAGAR', 'SANT RAVIDAS NAGAR', 'SARAIKELA KHARSAWAN', 'SARAN', 'SATARA', 'SATNA', 'SAWAI MADHOPUR', 'SEHORE', 'SENAPATI', 'SEONI', 'SEPAHIJALA', 'SERCHHIP', 'SHAHDOL', 'SHAHJAHANPUR', 'SHAJAPUR', 'SHAMLI', 'SHEIKHPURA', 'SHEOHAR', 'SHEOPUR', 'SHIMLA', 'SHIMOGA', 'SHIVPURI', 'SHOPIAN', 'SHRAVASTI', 'SIDDHARTH NAGAR', 'SIDHI', 'SIKAR', 'SIMDEGA', 'SINDHUDURG', 'SINGRAULI', 'SIRMAUR', 'SIROHI', 'SIRSA', 'SITAMARHI', 'SITAPUR', 'SIVAGANGA', 'SIVASAGAR', 'SIWAN', 'SOLAN', 'SOLAPUR', 'SONBHADRA', 'SONEPUR', 'SONIPAT', 'SONITPUR', 'SOUTH ANDAMANS', 'SOUTH DISTRICT', 'SOUTH GARO HILLS', 'SOUTH GOA', 'SOUTH TRIPURA', 'SOUTH WEST GARO HILLS', 'SOUTH WEST KHASI HILLS', 'SPSR NELLORE', 'SRIKAKULAM', 'SRINAGAR', 'SUKMA', 'SULTANPUR', 'SUNDARGARH', 'SUPAUL', 'SURAJPUR', 'SURAT', 'SURENDRANAGAR', 'SURGUJA', 'TAMENGLONG', 'TAPI', 'TARN TARAN', 'TAWANG', 'TEHRI GARHWAL', 'THANE', 'THANJAVUR', 'THE NILGIRIS', 'THENI', 'THIRUVALLUR', 'THIRUVANANTHAPURAM', 'THIRUVARUR', 'THOUBAL', 'THRISSUR', 'TIKAMGARH', 'TINSUKIA', 'TIRAP', 'TIRUCHIRAPPALLI', 'TIRUNELVELI', 'TIRUPPUR', 'TIRUVANNAMALAI', 'TONK', 'TUENSANG', 'TUMKUR', 'TUTICORIN', 'UDAIPUR', 'UDALGURI', 'UDAM SINGH NAGAR', 'UDHAMPUR', 'UDUPI', 'UJJAIN', 'UKHRUL', 'UMARIA', 'UNA', 'UNAKOTI', 'UNNAO', 'UPPER SIANG', 'UPPER SUBANSIRI', 'UTTAR KANNAD', 'UTTAR KASHI', 'VADODARA', 'VAISHALI', 'VALSAD', 'VARANASI', 'VELLORE', 'VIDISHA', 'VILLUPURAM', 'VIRUDHUNAGAR', 'VISAKHAPATANAM', 'VIZIANAGARAM', 'WARANGAL', 'WARDHA', 'WASHIM', 'WAYANAD', 'WEST DISTRICT', 'WEST GARO HILLS', 'WEST GODAVARI', 'WEST JAINTIA HILLS', 'WEST KAMENG', 'WEST KHASI HILLS', 'WEST SIANG', 'WEST SINGHBHUM', 'WEST TRIPURA', 'WOKHA', 'YADGIR', 'YAMUNANAGAR', 'YANAM', 'YAVATMAL', 'ZUNHEBOTO']
  const years = [1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010,  2011, 2012, 2013, 2014, 2015]
  const seasons = ['Kharif', 'Whole Year', 'Autumn', 'Rabi', 'Summer', 'Winter']

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }


const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null); // Clear previous prediction

    // Prepare the data payload for the API
    // NOTE: Make sure the keys match the Pydantic model in api.py
const apiPayload = {
  N: parseFloat(formData.nitrogen),
  P: parseFloat(formData.phosphorus),
  K: parseFloat(formData.potassium),
  temperature: parseFloat(formData.temperature),
  humidity: parseFloat(formData.humidity),
  ph: parseFloat(formData.soilPh),
  rainfall: parseFloat(formData.rainfall),
  State_Name: formData.state,
  District_Name: formData.district,
  Season: formData.season,
  Crop_Year: parseInt(formData.year), // <-- Add this line
};

    try {
        // Send a POST request to your FastAPI backend
        const response = await fetch('http://127.0.0.1:8000/yield/predict-yield', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiPayload),
        });

        console.log(JSON.stringify(apiPayload))

        if (!response.ok) {
            // Handle HTTP errors
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Update the state with the prediction from the API
        if (result.error) {
            // If the API returns an error message
            console.error("API Error:", result.error);
            setPrediction({ error: result.error });
        } else {
            setPrediction({
                yield: result.predicted_yield,
                crop: result.recommended_crop,
                // Add other details as needed
                recommendations: [
                    `The model recommends planting ${result.recommended_crop}.`,
                    'Ensure nutrient levels are maintained for optimal growth.',
                ],
            });
            console.log(prediction);
        }
    } catch (error) {
        console.error("Failed to fetch prediction:", error);
        setPrediction({ error: 'Failed to connect to the prediction service.' });
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-agri-500 to-agri-600 rounded-xl flex items-center justify-center">
            <Wheat className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{t('cropYieldPrediction')}</h1>
            <p className="text-slate-400">{t('predictHarvestYields')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Brain className="h-5 w-5 animate-pulse text-agri-400" />
          <span className="text-sm">94.2% Accuracy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-agri-400" />
              {t('farmCropDetails')}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    State
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  >
                    <option value="">Select state</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Area (hectares)
                  </label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="10"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    District
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  >
                    <option value="">Select district</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Soil pH
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="soilPh"
                    value={formData.soilPh}
                    onChange={handleInputChange}
                    placeholder="6.5"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Crop Year
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  >
                    <option value="">Select year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select season
                  </label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  >
                    <option value="">Select season</option>
                    {seasons.map(season => (
                      <option key={season} value={season}>{season}</option>
                    ))}
                  </select>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mt-6 mb-4 flex items-center">
                <Droplets className="h-5 w-5 mr-2 text-blue-400" />
                Soil Nutrients (kg/ha)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nitrogen (N)
                  </label>
                  <input
                    type="number"
                    name="nitrogen"
                    value={formData.nitrogen}
                    onChange={handleInputChange}
                    placeholder="120"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phosphorus (P)
                  </label>
                  <input
                    type="number"
                    name="phosphorus"
                    value={formData.phosphorus}
                    onChange={handleInputChange}
                    placeholder="60"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Potassium (K)
                  </label>
                  <input
                    type="number"
                    name="potassium"
                    value={formData.potassium}
                    onChange={handleInputChange}
                    placeholder="40"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mt-6 mb-4 flex items-center">
                <Thermometer className="h-5 w-5 mr-2 text-orange-400" />
                Weather Conditions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleInputChange}
                      placeholder="25"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Humidity (%)
                    </label>
                    <input
                      type="number"
                      name="humidity"
                      value={formData.humidity}
                      onChange={handleInputChange}
                      placeholder="65"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Rainfall (mm)
                    </label>
                    <input
                      type="number"
                      name="rainfall"
                      value={formData.rainfall}
                      onChange={handleInputChange}
                      placeholder="800"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                      required
                    />
                  </div>
                  
{/*                   <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Sunshine (hrs)
                    </label>
                    <input
                      type="number"
                      name="sunshine"
                      value={formData.sunshine}
                      onChange={handleInputChange}
                      placeholder="2200"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                      required
                    />
                  </div>
 */}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full button-primary mt-6 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Predict Yield</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {prediction ? (
            <>
              {/* Main Prediction */}
              <div className="bg-gradient-to-br from-agri-500/20 to-agri-600/10 backdrop-blur-sm rounded-2xl p-6 border border-agri-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Predicted Yield</h2>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-agri-400" />
                    {/* <span className="text-sm text-agri-300">{prediction.confidence}% Confidence</span> */}
                  </div>
                </div>
                
                <div className="text-center py-6">
                  <div className="text-5xl font-bold text-gradient mb-2">
                    {prediction.yield}
                  </div>
                  <div className="text-lg text-slate-300">tons per hectare</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-agri-400">{(prediction.yield * parseFloat(formData.area || 1)).toFixed(1)}</div>
                    <div className="text-sm text-slate-400">Total Yield (tons)</div>
                  </div>
{/* 
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{prediction.confidence}%</div>
                    <div className="text-sm text-slate-400">Accuracy</div>
                  </div> */}


                </div>
 
              </div>

              {/* Factors */}
              {/* <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-400" />
                  Impact Factors
                </h3>
                
                <div className="space-y-3">
                  {prediction.factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          factor.impact === 'High' ? 'bg-agri-400' : 
                          factor.impact === 'Medium' ? 'bg-yellow-400' : 'bg-slate-400'
                        }`}></div>
                        <span className="text-slate-300">{factor.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-400">{factor.impact}</span>
                        <span className="text-agri-400 font-medium">{factor.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Recommendations */}
              {/* <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-yellow-400" />
                  AI Recommendations
                </h3>
                
                <div className="space-y-3">
                  {prediction.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-300 text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div> */}
            </>
          ) : (
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
              <Wheat className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">Ready to Predict</h3>
              <p className="text-slate-500">Fill in the form to get AI-powered yield predictions for your crops.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CropYield
