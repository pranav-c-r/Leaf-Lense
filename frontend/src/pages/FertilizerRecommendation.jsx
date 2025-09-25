import { useState } from 'react';
import { Beaker, Zap, Brain, Info, AlertCircle } from 'lucide-react';

const FertilizerRecommendation = () => {
  const [formData, setFormData] = useState({
    Crop_Type: '', Soil_Type: '', Nitrogen: '', Phosphorus: '', Potassium: '', Temperature: '', Humidity: '', Moisture: ''
  });
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const crops = ['Ground Nuts', 'Cotton', 'Sugarcane', 'Wheat', 'Tobacco', 'Barley', 'Millets', 'Pulses', 'Oil seeds', 'Maize', 'Paddy'];
  const soilTypes = ['Red', 'Black', 'Sandy', 'Loamy', 'Clayey'];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFormData({ Crop_Type: '', Soil_Type: '', Nitrogen: '', Phosphorus: '', Potassium: '', Temperature: '', Humidity: '', Moisture: '' });
    setRecommendation(null);
    setError(null);
  };

  // --- START: MODIFICATION ---
  // The handleSubmit function now sends a flat JSON object to match the backend's Pydantic model.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setRecommendation(null);

    for (const key in formData) {
      if (formData[key] === '' || formData[key] === null) {
        setError(`Please fill out the "${key.replace('_', ' ')}" field.`);
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Create the flat payload object that the backend is expecting.
      //    The keys MUST exactly match the Pydantic model field names.
      const payload = {
        Temperature: parseFloat(formData.Temperature),
        Humidity: parseFloat(formData.Humidity),
        Moisture: parseFloat(formData.Moisture),
        Nitrogen: parseFloat(formData.Nitrogen),
        Phosphorus: parseFloat(formData.Phosphorus),
        Potassium: parseFloat(formData.Potassium),
        Crop_Type: formData.Crop_Type, // Send as a string
        Soil_Type: formData.Soil_Type,   // Send as a string
      };

      // 2. Check for any invalid numbers.
      for (const key in payload) {
          if (typeof payload[key] === 'number' && isNaN(payload[key])) {
              throw new Error(`Invalid number for "${key}". Please check your input.`);
          }
      }
      
      // 3. Send the new flat payload to the backend.
      const res = await fetch("http://127.0.0.1:8000/fertilizer/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) // Send the flat object
      });

      if (!res.ok) {
        const errData = await res.json();
        const errorMessage = errData.detail || 'An unknown API error occurred';
        // Make the error more readable
        const readableError = Array.isArray(errorMessage) 
          ? errorMessage.map(e => `${e.loc[1]}: ${e.msg}`).join(', ')
          : JSON.stringify(errorMessage);
        throw new Error(`API Error ${res.status}: ${readableError}`);
      }
      
      const data = await res.json();
      setRecommendation(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // --- END: MODIFICATION ---

  return (
    <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center"><Beaker className="h-6 w-6 text-white" /></div>
                <div><h1 className="text-3xl font-bold text-white">Fertilizer Recommendation</h1><p className="text-gray-400">AI-Powered NPK Optimization</p></div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-bold text-white mb-6">Soil Analysis Input</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Crop Type</label>
                                <select name="Crop_Type" value={formData.Crop_Type} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus" required>
                                    <option value="">Select crop</option>
                                    {crops.map(crop => <option key={crop} value={crop}>{crop}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Soil Type</label>
                                <select name="Soil_Type" value={formData.Soil_Type} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus" required>
                                    <option value="">Select soil type</option>
                                    {soilTypes.map(soil => <option key={soil} value={soil}>{soil}</option>)}
                                </select>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white mt-6 mb-4">Current Nutrient Levels (kg/ha)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Nitrogen (N)</label>
                                <input type="number" name="Nitrogen" value={formData.Nitrogen} onChange={handleInputChange} placeholder="e.g., 90" className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Phosphorus (P)</label>
                                <input type="number" name="Phosphorus" value={formData.Phosphorus} onChange={handleInputChange} placeholder="e.g., 45" className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Potassium (K)</label>
                                <input type="number" name="Potassium" value={formData.Potassium} onChange={handleInputChange} placeholder="e.g., 45" className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus" required />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white mt-6 mb-4">Environmental Conditions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Temperature (°C)</label>
                                <input type="number" step="0.1" name="Temperature" value={formData.Temperature} onChange={handleInputChange} placeholder="e.g., 26.5" className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Humidity (%)</label>
                                <input type="number" step="0.1" name="Humidity" value={formData.Humidity} onChange={handleInputChange} placeholder="e.g., 82.5" className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Moisture</label>
                                <input type="number" step="0.1" name="Moisture" value={formData.Moisture} onChange={handleInputChange} placeholder="e.g., 65.2" className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus" required />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full button-primary mt-6 flex items-center justify-center space-x-2">
                            {loading ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Analyzing...</span></>) : (<><Zap className="h-5 w-5" /><span>Get Recommendations</span></>)}
                        </button>
                    </form>
                </div>
            </div>
            <div className="space-y-6">
                {error && <div className="bg-red-900/40 border border-red-700/50 text-red-300 rounded-lg p-4 flex items-center"><AlertCircle className="h-5 w-5 mr-3" />{error}</div>}
                
                {recommendation ? (
                    <>
                        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
                            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-white">Recommended Fertilizer</h2><button onClick={handleReset} className="px-3 py-1 bg-gray-700/40 text-sm rounded-md text-white">Reset</button></div>
                            <div className="text-center py-6"><div className="text-4xl font-bold text-gradient mb-2">{recommendation.prediction}</div><div className="text-lg text-gray-300">ML Model Prediction</div></div>
                        </div>
                        {recommendation.explanation && (
                            <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                                <div className="flex items-center mb-3"><Info className="h-5 w-5 text-blue-400 mr-3"/><h3 className="text-lg font-bold text-white">AI-Generated Explanation</h3></div>
                                <p className="text-gray-300 text-sm leading-relaxed">{recommendation.explanation}</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center flex flex-col justify-center items-center h-full">
                        <Beaker className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">Ready to Analyze</h3>
                        <p className="text-gray-500">Enter your soil test results for a recommendation.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default FertilizerRecommendation;
