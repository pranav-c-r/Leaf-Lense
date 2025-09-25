
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Wheat, 
  Ruler, 
  Mountain,
  Droplets,
  GraduationCap,
  Globe,
  Save,
  X,
  Edit3,
  Leaf,
  Users,
  CheckCircle,
  Map,
  AlertCircle,
  QrCode,
  Upload,
  Camera,
  Eye,
  EyeOff,
  CreditCard
} from 'lucide-react';
import jsQR from 'jsqr';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { database, auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
function LocationMarker({ onLocationSelect, initialPosition }) {
  const [position, setPosition] = useState(initialPosition);
  
  useMapEvents({
    click(e) {
      const newPosition = e.latlng;
      setPosition(newPosition);
      onLocationSelect(newPosition.lat, newPosition.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

const Profile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    name: '',
    phone: '',
    whatsapp_opt_in: false,
    district: '',
    lat: 12.9716,
    lon: 77.5946,
    crop: '',
    growth_stage: 'vegetative',
    language: 'en',
    userType: 'general',
    farm_size: '',
    soil_type: '',
    irrigation_type: '',
    experience_level: 'beginner',
    qr_code_data: '',
    payment_upi_id: '',
    payment_method: 'upi'
  });

  const [originalData, setOriginalData] = useState({ ...formData });
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrValidationMessage, setQrValidationMessage] = useState('');
  const [isValidatingQR, setIsValidatingQR] = useState(false);
  const fileInputRef = useRef(null);

  // Trusted payment gateways
  const trustedGateways = [
    "pay.google.com", 
    "phonepe.com", 
    "paytm.com", 
    "bhimupi.com",
    "razorpay.com",
    "mobikwik.com",
    "freecharge.com",
    "amazonpay.com",
    "jiomoney.com",
    "airtel.in"
  ];
  const districts = [
    'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Kolkata',
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Bhopal', 'Patna'
  ];

  const crops = ['rice', 'wheat', 'tomato', 'potato', 'cotton', 'sugarcane', 'maize'];
  const soilTypes = ['sandy', 'clay', 'loam', 'silt'];
  const irrigationTypes = ['drip', 'sprinkler', 'flood', 'manual'];
  const experienceLevels = ['beginner', 'intermediate', 'expert'];
  const languages = ['en', 'hi', 'ta', 'te', 'ml'];
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserData(user.uid);
      } else {
        navigate('/signin');
      }
    });

    return () => unsubscribe();
  }, [navigate]);
  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      
      const userDoc = await getDoc(doc(database, 'Users', userId));
      const userData = userDoc.exists() ? userDoc.data() : {};

      const profileDoc = await getDoc(doc(database, 'farmers', userId));
      const profileData = profileDoc.exists() ? profileDoc.data() : {};

      const mergedData = {
        email: auth.currentUser?.email || '',
        username: userData.username || '',
        name: profileData.name || '',
        phone: profileData.phone || '',
        whatsapp_opt_in: profileData.whatsapp_opt_in || false,
        district: profileData.district || '',
        lat: profileData.lat || 12.9716,
        lon: profileData.lon || 77.5946,
        crop: profileData.crop || '',
        growth_stage: profileData.growth_stage || 'vegetative',
        language: profileData.language || 'en',
        userType: profileData.userType || 'general',
        farm_size: profileData.farm_size || '',
        soil_type: profileData.soil_type || '',
        irrigation_type: profileData.irrigation_type || '',
        experience_level: profileData.experience_level || 'beginner',
        qr_code_data: profileData.qr_code_data || '',
        payment_upi_id: profileData.payment_upi_id || '',
        payment_method: profileData.payment_method || 'upi'
      };

      setFormData(mergedData);
      setOriginalData(mergedData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      lat: lat,
      lon: lng
    }));
  };

  const handleDistrictSelect = (district) => {
    const districtCoords = {
      'Bangalore': { lat: 12.9716, lon: 77.5946 },
      'Mumbai': { lat: 19.0760, lon: 72.8777 },
      'Delhi': { lat: 28.6139, lon: 77.2090 },
      'Chennai': { lat: 13.0827, lon: 80.2707 },
      'Hyderabad': { lat: 17.3850, lon: 78.4867 },
      'Kolkata': { lat: 22.5726, lon: 88.3639 },
      'Pune': { lat: 18.5204, lon: 73.8567 },
      'Ahmedabad': { lat: 23.0225, lon: 72.5714 },
      'Jaipur': { lat: 26.9124, lon: 75.7873 },
      'Lucknow': { lat: 26.8467, lon: 80.9462 },
      'Bhopal': { lat: 23.2599, lon: 77.4126 },
      'Patna': { lat: 25.5941, lon: 85.1376 }
    };

    const coords = districtCoords[district] || { lat: 0, lon: 0 };
    
    setFormData(prev => ({
      ...prev,
      district: district,
      lat: coords.lat,
      lon: coords.lon
    }));
  };

  const handleSave = async () => {
  if (!currentUser) return;

  try {
    setSaving(true);
    const profileData = {
      userId: currentUser.uid,
      email: formData.email,
      username: formData.username,
      name: formData.name,
      phone: formData.phone,
      whatsapp_opt_in: formData.whatsapp_opt_in,
      district: formData.district,
      lat: formData.lat,
      lon: formData.lon,
      crop: formData.crop,
      growth_stage: formData.growth_stage,
      language: formData.language,
      userType: formData.userType,
      farm_size: formData.farm_size,
      soil_type: formData.soil_type,
      irrigation_type: formData.irrigation_type,
      experience_level: formData.experience_level,
      qr_code_data: formData.qr_code_data,
      payment_upi_id: formData.payment_upi_id,
      payment_method: formData.payment_method,
      updatedAt: new Date()
    };

    await setDoc(doc(database, "farmers", currentUser.uid), profileData, { merge: true });
    setOriginalData({ ...formData });
    setIsEditing(false);
    setShowMap(false);

    alert("Profile saved successfully! You will receive weather alerts starting tomorrow.");
  } catch (error) {
    console.error("Error saving profile:", error);
    alert("Failed to save profile");
  } finally {
    setSaving(false);
  }
};


  const handleCancel = () => {
    setFormData({ ...originalData });
    setIsEditing(false);
    setShowMap(false);
  };

  const isFarmer = formData.userType === 'farmer';

  const decodeQR = async (imageBase64) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageBase64;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const qrCode = jsQR(imageData.data, img.width, img.height);
        qrCode ? resolve(qrCode.data) : reject("QR code not detected");
      };
      img.onerror = () => reject("Error loading image");
    });
  };

  const verifyQR = (data) => {
    try {
      if (data.startsWith("http")) {
        const qrUrl = new URL(data);
        return trustedGateways.some((gateway) => qrUrl.hostname.includes(gateway));
      }
      if (data.startsWith("upi://pay")) return true;
      return false;
    } catch {
      return false;
    }
  };

  const handleQRCodeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setQrValidationMessage("❌ Please select a QR code image.");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setQrValidationMessage('❌ Please upload a valid image file');
      return;
    }

    setIsValidatingQR(true);
    setQrValidationMessage('🔍 Validating QR code...');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageBase64 = e.target.result;
          const qrData = await decodeQR(imageBase64);
          
          if (!verifyQR(qrData)) {
            setQrValidationMessage("❌ Unverified QR code! Only trusted payment gateways or UPI links are allowed.");
            setIsValidatingQR(false);
            return;
          }

          setFormData(prev => ({
            ...prev,
            qr_code_data: imageBase64
          }));
          setQrCodeFile(file);
          setQrValidationMessage("✅ QR code uploaded successfully!");
          
        } catch (error) {
          console.error(error);
          setQrValidationMessage("⚠ Error processing QR code.");
        } finally {
          setIsValidatingQR(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setQrValidationMessage("❌ Error reading the image file");
      setIsValidatingQR(false);
    }
  };

  const generateUPIQR = () => {
    if (formData.payment_upi_id) {
      // Generate UPI QR code data
      const upiString = `upi://pay?pa=${formData.payment_upi_id}&pn=${formData.name}&cu=INR`;
      setFormData(prev => ({
        ...prev,
        qr_code_data: upiString
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                <p className="text-slate-300">Manage your agricultural profile</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              disabled={saving}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                isEditing 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              } disabled:opacity-50`}
            >
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4">Profile Summary</h2>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-xl">
                <Mail className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white">{formData.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-xl">
                <User className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-slate-400">Username</p>
                  <p className="text-white">@{formData.username}</p>
                </div>
              </div>

              {isFarmer && (
                <>
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-xl">
                    <MapPin className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="text-sm text-slate-400">Location</p>
                      <p className="text-white">{formData.district || 'Not set'}</p>
                      <p className="text-xs text-slate-500">
                        {formData.lat.toFixed(4)}, {formData.lon.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-xl">
                    <Wheat className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="text-sm text-slate-400">Main Crop</p>
                      <p className="text-white">{formData.crop || 'Not set'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {isFarmer && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">You will receive daily weather alerts</span>
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full p-3 bg-slate-700/30 rounded-xl text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-3 bg-slate-700/30 rounded-xl text-white disabled:opacity-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                    className="w-full p-3 bg-slate-700/30 rounded-xl text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-300 mb-2">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('userType', 'farmer')}
                    disabled={!isEditing}
                    className={`p-3 rounded-xl text-center ${
                      formData.userType === 'farmer'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-slate-700/30 text-slate-300'
                    } disabled:opacity-50`}
                  >
                    Farmer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('userType', 'general')}
                    disabled={!isEditing}
                    className={`p-3 rounded-xl text-center ${
                      formData.userType === 'general'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-700/30 text-slate-300'
                    } disabled:opacity-50`}
                  >
                    General User
                  </button>
                </div>
              </div>
            </div>
            {isFarmer && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4">Farming Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="+91 9876543210"
                      className="w-full p-3 bg-slate-700/30 rounded-xl text-white disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">District</label>
                    <select
                      value={formData.district}
                      onChange={(e) => handleDistrictSelect(e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 bg-slate-700/30 rounded-xl text-white disabled:opacity-50"
                    >
                      <option value="">Select District</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Main Crop</label>
                    <select
                      value={formData.crop}
                      onChange={(e) => handleInputChange('crop', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 bg-slate-700/30 rounded-xl text-white disabled:opacity-50"
                    >
                      <option value="">Select Crop</option>
                      {crops.map(crop => (
                        <option key={crop} value={crop}>{crop}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Growth Stage</label>
                    <select
                      value={formData.growth_stage}
                      onChange={(e) => handleInputChange('growth_stage', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 bg-slate-700/30 rounded-xl text-white disabled:opacity-50"
                    >
                      <option value="vegetative">Vegetative</option>
                      <option value="flowering">Flowering</option>
                      <option value="fruiting">Fruiting</option>
                      <option value="harvesting">Harvesting</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm text-slate-300 mb-2">Farm Location</label>
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    disabled={!isEditing}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-700/30 text-slate-300 rounded-xl disabled:opacity-50 mb-2"
                  >
                    <Map className="h-4 w-4" />
                    <span>{showMap ? 'Hide Map' : 'Select Exact Location on Map'}</span>
                  </button>
                  
                  {showMap && (
                    <div className="mt-2 h-64 rounded-xl overflow-hidden border border-slate-600">
                      <MapContainer
                        center={[formData.lat, formData.lon]}
                        zoom={10}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <LocationMarker 
                          onLocationSelect={handleLocationSelect}
                          initialPosition={[formData.lat, formData.lon]}
                        />
                      </MapContainer>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-slate-500">
                    Coordinates: {formData.lat.toFixed(6)}, {formData.lon.toFixed(6)}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.whatsapp_opt_in}
                      onChange={(e) => handleInputChange('whatsapp_opt_in', e.target.checked)}
                      disabled={!isEditing}
                      className="w-4 h-4 text-green-400"
                    />
                    <span className="text-slate-300">Receive WhatsApp alerts</span>
                  </label>
                </div>

                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">Your farm will receive daily weather alerts at 6:00 AM</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* QR Code Payment Section */}
            {isFarmer && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <QrCode className="h-5 w-5 mr-2 text-green-400" />
                  Payment QR Code
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm text-slate-300 mb-2">Payment Method</label>
                      <select
                        value={formData.payment_method}
                        onChange={(e) => handleInputChange('payment_method', e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-3 bg-slate-700/30 rounded-xl text-white disabled:opacity-50"
                      >
                        <option value="upi">UPI</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="wallet">Digital Wallet</option>
                      </select>
                    </div>

                    {formData.payment_method === 'upi' && (
                      <div className="mb-4">
                        <label className="block text-sm text-slate-300 mb-2">UPI ID</label>
                        <input
                          type="text"
                          value={formData.payment_upi_id}
                          onChange={(e) => handleInputChange('payment_upi_id', e.target.value)}
                          disabled={!isEditing}
                          placeholder="yourname@paytm"
                          className="w-full p-3 bg-slate-700/30 rounded-xl text-white disabled:opacity-50 placeholder-slate-400"
                        />
                        {isEditing && formData.payment_upi_id && (
                          <button
                            type="button"
                            onClick={generateUPIQR}
                            className="mt-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Generate UPI QR
                          </button>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Upload QR Code Image</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleQRCodeUpload}
                        disabled={!isEditing}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!isEditing || isValidatingQR}
                        className="w-full p-3 bg-slate-700/30 border border-slate-600 rounded-xl text-slate-300 disabled:opacity-50 hover:bg-slate-600/30 transition-colors flex items-center justify-center space-x-2"
                      >
                        {isValidatingQR ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-300"></div>
                            <span>Validating...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            <span>Upload QR Code</span>
                          </>
                        )}
                      </button>
                      
                      {/* Validation Message */}
                      {qrValidationMessage && (
                        <div className={`mt-3 p-3 rounded-xl text-sm ${
                          qrValidationMessage.includes('✅') 
                            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                            : qrValidationMessage.includes('❌') || qrValidationMessage.includes('⚠')
                            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                            : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                        }`}>
                          {qrValidationMessage}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">QR Code Preview</label>
                    <div className="bg-slate-700/30 rounded-xl p-4 min-h-48 flex items-center justify-center border border-slate-600">
                      {formData.qr_code_data ? (
                        <div className="text-center">
                          {formData.qr_code_data.startsWith('data:image') ? (
                            <img 
                              src={formData.qr_code_data} 
                              alt="QR Code" 
                              className="max-w-full max-h-40 rounded-lg mx-auto mb-2"
                            />
                          ) : (
                            <div className="bg-white p-4 rounded-lg mb-2">
                              <div className="text-black text-xs font-mono break-all">
                                {formData.qr_code_data}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setShowQRCode(!showQRCode)}
                              className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                            >
                              {showQRCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <p className="text-slate-400 text-xs">
                              {showQRCode ? 'Hide from buyers' : 'Visible to buyers'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-slate-400">
                          <QrCode className="h-12 w-12 mx-auto mb-2" />
                          <p>No QR code uploaded</p>
                          <p className="text-xs">Upload or generate QR code for payments</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center space-x-2 text-green-400 mb-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm font-medium">Secure Payment</span>
                  </div>
                  <p className="text-slate-300 text-sm">
                    Buyers can scan your QR code to make instant payments for crop purchases. 
                    Your QR code is securely stored and only visible to interested buyers.
                  </p>
                </div>
              </div>
            )}
            {isEditing && (
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-3 bg-slate-700/30 text-slate-300 rounded-xl disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl disabled:opacity-50 hover:bg-green-600 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;