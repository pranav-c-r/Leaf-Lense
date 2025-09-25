import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, 
  User, 
  MapPin, 
  Phone, 
  Star, 
  Filter,
  Search,
  Wheat,
  Package,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  QrCode,
  Camera,
  CheckCircle,
  Sparkles,
  Truck,
  Shield,
  DollarSign,
  TrendingUp,
  Users,
  Store,
  Smartphone,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { auth, database } from '../config/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc, addDoc, updateDoc, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import jsQR from 'jsqr';

const CropMarketplace = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('buy'); // buy, sell, mylistings
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  // Sell form state
  const [sellForm, setSellForm] = useState({
    cropName: '',
    variety: '',
    quantity: '',
    pricePerKg: '',
    harvestDate: '',
    description: '',
    location: '',
    contactNumber: '',
    images: []
  });

  const crops = ['rice', 'wheat', 'tomato', 'potato', 'onion', 'cotton', 'sugarcane', 'maize', 'groundnut', 'soybean'];
  const locations = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserProfile(user.uid);
        fetchListings();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const profileDoc = await getDoc(doc(database, 'farmers', userId));
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const listingsQuery = query(
        collection(database, 'cropListings'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(listingsQuery);
      const fetchedListings = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedListings.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      setListings(fetchedListings);
      setFilteredListings(fetchedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let filtered = listings;

    if (searchTerm) {
      filtered = filtered.filter(listing => 
        listing.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCrop) {
      filtered = filtered.filter(listing => listing.cropName === selectedCrop);
    }

    if (selectedLocation) {
      filtered = filtered.filter(listing => listing.location === selectedLocation);
    }

    if (priceRange.min) {
      filtered = filtered.filter(listing => parseFloat(listing.pricePerKg) >= parseFloat(priceRange.min));
    }

    if (priceRange.max) {
      filtered = filtered.filter(listing => parseFloat(listing.pricePerKg) <= parseFloat(priceRange.max));
    }

    setFilteredListings(filtered);
  };

  const handleSellFormSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !userProfile) return;

    try {
      const listingData = {
        ...sellForm,
        farmerId: currentUser.uid,
        farmerName: userProfile.name || 'Anonymous Farmer',
        farmerPhone: userProfile.phone || sellForm.contactNumber,
        farmerLocation: userProfile.district || sellForm.location,
        status: 'active',
        views: 0,
        interested: [],
        createdAt: new Date()
      };

      await addDoc(collection(database, 'cropListings'), listingData);
      
      // Reset form
      setSellForm({
        cropName: '',
        variety: '',
        quantity: '',
        pricePerKg: '',
        harvestDate: '',
        description: '',
        location: '',
        contactNumber: '',
        images: []
      });

      alert('Crop listing posted successfully!');
      fetchListings();
      setActiveTab('mylistings');
    } catch (error) {
      console.error('Error posting listing:', error);
      alert('Failed to post listing. Please try again.');
    }
  };

  const handleInterest = async (listingId) => {
    if (!currentUser) return;

    try {
      const listingRef = doc(database, 'cropListings', listingId);
      const listingDoc = await getDoc(listingRef);
      
      if (listingDoc.exists()) {
        const data = listingDoc.data();
        const interested = data.interested || [];
        
        if (!interested.includes(currentUser.uid)) {
          interested.push(currentUser.uid);
          await updateDoc(listingRef, { 
            interested: interested,
            views: (data.views || 0) + 1
          });
          
          alert('Interest registered! The farmer will contact you soon.');
          fetchListings();
        }
      }
    } catch (error) {
      console.error('Error registering interest:', error);
    }
  };

  const QRScanner = ({ onClose, listing }) => {
    const [farmerQRCode, setFarmerQRCode] = useState(null);
    const [loadingQR, setLoadingQR] = useState(true);
    const [paymentAttempted, setPaymentAttempted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
      const fetchFarmerQR = async () => {
        if (!listing?.farmerId) return;
        
        try {
          const farmerDoc = await getDoc(doc(database, 'farmers', listing.farmerId));
          if (farmerDoc.exists()) {
            const farmerData = farmerDoc.data();
            setFarmerQRCode(farmerData.qr_code_data || null);
          }
        } catch (error) {
          console.error('Error fetching farmer QR code:', error);
        } finally {
          setLoadingQR(false);
        }
      };
      
      fetchFarmerQR();
    }, [listing]);

    // Place order first
    const placeOrder = async () => {
      try {
        const orderData = {
          listingId: listing.id,
          buyerId: currentUser.uid,
          farmerId: listing.farmerId,
          cropName: listing.cropName,
          variety: listing.variety,
          quantity: listing.orderQuantity || listing.quantity,
          pricePerKg: listing.pricePerKg,
          totalAmount: (listing.orderQuantity || listing.quantity) * listing.pricePerKg,
          buyerName: userProfile?.name || 'Anonymous Buyer',
          buyerPhone: userProfile?.phone || 'Not provided',
          buyerLocation: userProfile?.district || 'Unknown',
          farmerName: listing.farmerName,
          farmerPhone: listing.farmerPhone,
          farmerLocation: listing.farmerLocation,
          status: 'placed',
          createdAt: new Date(),
          paymentMethod: farmerQRCode ? 'digital' : 'contact_farmer'
        };

        await addDoc(collection(database, 'orders'), orderData);
        
        // Create notification for farmer
        await addDoc(collection(database, 'notifications'), {
          orderId: 'temp', // Will be updated
          action: 'new_order',
          message: `New order received: ${orderData.quantity}kg ${orderData.cropName} worth ₹${orderData.totalAmount.toLocaleString()}`,
          recipientId: listing.farmerId,
          senderId: currentUser.uid,
          read: false,
          createdAt: new Date(),
          orderData: {
            cropName: orderData.cropName,
            quantity: orderData.quantity,
            totalAmount: orderData.totalAmount
          }
        });

        return true;
      } catch (error) {
        console.error('Error placing order:', error);
        setErrorMsg('Failed to place order. Please try again.');
        return false;
      }
    };

    // Direct payment handling - no camera needed!
    const handleDirectPayment = async () => {
      // First place the order
      const orderPlaced = await placeOrder();
      if (!orderPlaced) return;

      if (!farmerQRCode) {
        setErrorMsg('Order placed successfully! Contact farmer directly for payment.');
        setTimeout(() => {
          alert('🎉 Order placed successfully! The farmer will contact you for payment and delivery details.');
          onClose();
        }, 2000);
        return;
      }

      setPaymentAttempted(true);
      
      // Detect mobile device
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      try {
        let paymentUrl = farmerQRCode;

        if (farmerQRCode.startsWith('upi://')) {
          // Direct UPI link - perfect!
          paymentUrl = farmerQRCode;
        } else if (farmerQRCode.startsWith('http')) {
          // Web-based payment link
          paymentUrl = farmerQRCode;
        } else if (farmerQRCode.startsWith('data:image')) {
          // It's a QR code image - user needs to scan manually
          setErrorMsg('Please scan the QR code with any UPI app (Google Pay, PhonePe, Paytm, etc.)');
          return;
        } else {
          // Fallback: try to construct a UPI link
          paymentUrl = farmerQRCode.includes('upi://') ? farmerQRCode : `upi://pay?${farmerQRCode}`;
        }

        // Open payment app
        if (isMobile) {
          // On mobile, redirect directly to the app
          window.location.href = paymentUrl;
        } else {
          // On desktop, open in new tab/window
          window.open(paymentUrl, '_blank');
        }

        // Show success message
        setTimeout(() => {
          setErrorMsg('');
          alert('🚀 Payment app should have opened! Complete your payment there.');
          onClose();
        }, 1500);
        
      } catch (error) {
        console.error('Payment error:', error);
        setErrorMsg('Failed to open payment app. Please try scanning the QR code manually.');
      }
    };

    const getPaymentButtonText = () => {
      if (farmerQRCode?.startsWith('upi://')) {
        return 'Pay Now (Open UPI App)';
      } else if (farmerQRCode?.includes('paytm')) {
        return 'Pay with Paytm';
      } else if (farmerQRCode?.includes('phonepe')) {
        return 'Pay with PhonePe';
      } else if (farmerQRCode?.includes('gpay') || farmerQRCode?.includes('googlepay')) {
        return 'Pay with Google Pay';
      } else {
        return 'Pay Now (Open Payment App)';
      }
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Payment QR Code</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="bg-slate-700 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center h-48 bg-white rounded-lg relative">
              {loadingQR ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading QR Code...</p>
                </div>
              ) : farmerQRCode ? (
                <>
                  {farmerQRCode.startsWith('data:image') ? (
                    <img 
                      src={farmerQRCode} 
                      alt="Payment QR Code" 
                      className="max-w-full max-h-44 object-contain rounded"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <QrCode className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-600 text-xs font-mono break-all">{farmerQRCode}</p>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2">
                    <Smartphone className="h-6 w-6 text-green-600" />
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <AlertTriangle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No Payment Method Available</p>
                  <p className="text-sm text-slate-500">Contact farmer directly</p>
                </div>
              )}
            </div>
            
            {/* Error Message */}
            {errorMsg && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <p className="text-red-400 text-sm">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {paymentAttempted && !errorMsg && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4 text-green-400" />
                  <p className="text-green-400 text-sm">Opening payment app... Complete your payment there!</p>
                </div>
              </div>
            )}
          </div>

        <div className="bg-slate-700/50 rounded-xl p-4">
          <h4 className="font-semibold text-white mb-2">Payment Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Crop:</span>
              <span className="text-white">{listing?.cropName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Quantity:</span>
              <span className="text-white">{listing?.orderQuantity || listing?.quantity} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Price per kg:</span>
              <span className="text-white">₹{listing?.pricePerKg}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-slate-600 pt-2 mt-2">
              <span className="text-slate-300">Total Amount:</span>
              <span className="text-green-400">₹{listing ? ((listing.orderQuantity || listing.quantity) * listing.pricePerKg).toLocaleString() : 0}</span>
            </div>
          </div>
        </div>

          <div className="space-y-3">
            {/* Payment buttons */}
            <div className="space-y-2">
              {farmerQRCode && (
                <>
                  <button 
                    // onClick={() => window.open(farmerQRCode, "_blank")}
                    to={farmerQRCode}
                    disabled={loadingQR || paymentAttempted}
                    className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>{getPaymentButtonText()}</span>
                  </button>
                  {farmerQRCode.startsWith('data:image') && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <QrCode className="h-4 w-4 text-blue-400" />
                        <span className="text-blue-400 text-sm font-medium">Manual Scanning Required</span>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Open any UPI app (Google Pay, PhonePe, Paytm) and scan the QR code above
                      </p>
                    </div>
                  )}
                </>
              )}
              
              {!farmerQRCode && !loadingQR && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">No Payment QR Available</span>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">
                    The farmer hasn't set up digital payments yet. You can:
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-300">• Contact: {listing?.farmerName}</p>
                    <p className="text-slate-300">• Phone: {listing?.farmerPhone || 'Not provided'}</p>
                    <p className="text-slate-300">• Location: {listing?.farmerLocation}</p>
                  </div>
                </div>
              )}
              
              <button 
                onClick={onClose}
                className="w-full bg-slate-600 text-white py-3 rounded-xl hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
          <p className="text-slate-300 mt-4">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Crop Marketplace</h1>
                <p className="text-slate-300">Direct trade between farmers and buyers</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/20 px-4 py-2 rounded-xl border border-green-500/30">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Secure Trading</span>
                </div>
              </div>
              <div className="bg-blue-500/20 px-4 py-2 rounded-xl border border-blue-500/30">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">{listings.length} Active Listings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-2 border border-slate-700/50">
          <div className="flex space-x-2">
            {[
              { id: 'buy', label: 'Buy Crops', icon: ShoppingCart, color: 'indigo' },
              { id: 'sell', label: 'Sell Crops', icon: Store, color: 'green' },
              { id: 'mylistings', label: 'My Listings', icon: Package, color: 'purple' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id 
                    ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/30` 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Buy Tab Content */}
        {activeTab === 'buy' && (
          <>
            {/* Search and Filters */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search crops, varieties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/30 rounded-xl text-white placeholder-slate-400"
                    />
                  </div>
                </div>
                
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="px-4 py-3 bg-slate-700/30 rounded-xl text-white"
                >
                  <option value="">All Crops</option>
                  {crops.map(crop => (
                    <option key={crop} value={crop}>{crop.charAt(0).toUpperCase() + crop.slice(1)}</option>
                  ))}
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-3 bg-slate-700/30 rounded-xl text-white"
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>

                <button
                  onClick={handleSearch}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-indigo-500/50 transition-all group">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Wheat className="h-12 w-12 mx-auto mb-2" />
                        <p className="font-semibold">{listing.cropName}</p>
                        <p className="text-sm opacity-80">{listing.variety}</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ₹{listing.pricePerKg}/kg
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      {listing.quantity} kg available
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white text-lg">{listing.cropName}</h3>
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-400 text-sm">{listing.views || 0}</span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-sm mb-4 line-clamp-2">{listing.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">{listing.farmerName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">{listing.farmerLocation}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">Harvest: {new Date(listing.harvestDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <label className="text-slate-300 text-sm font-medium">Quantity (kg):</label>
                        <input
                          type="number"
                          min="1"
                          max={listing.quantity}
                          defaultValue="1"
                          id={`quantity-${listing.id}`}
                          className="w-20 px-2 py-1 bg-slate-700/50 rounded text-white text-sm text-center"
                        />
                        <span className="text-slate-400 text-sm">/ {listing.quantity} kg</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleInterest(listing.id)}
                          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Heart className="h-4 w-4" />
                          <span>Show Interest</span>
                        </button>
                        <button
                          onClick={() => {
                            const quantity = document.getElementById(`quantity-${listing.id}`).value;
                            setSelectedListing({...listing, orderQuantity: parseInt(quantity)});
                            setShowQRScanner(true);
                          }}
                          className="bg-green-600 text-white p-2 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center"
                          title="Place Order"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredListings.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No crops found matching your criteria</p>
                <p className="text-slate-500 text-sm">Try adjusting your search filters</p>
              </div>
            )}
          </>
        )}

        {/* Sell Tab Content */}
        {activeTab === 'sell' && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">List Your Crops for Sale</h2>
            
            <form onSubmit={handleSellFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Crop Name</label>
                <select
                  value={sellForm.cropName}
                  onChange={(e) => setSellForm({...sellForm, cropName: e.target.value})}
                  required
                  className="w-full p-3 bg-slate-700/30 rounded-xl text-white"
                >
                  <option value="">Select Crop</option>
                  {crops.map(crop => (
                    <option key={crop} value={crop}>{crop.charAt(0).toUpperCase() + crop.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Variety</label>
                <input
                  type="text"
                  value={sellForm.variety}
                  onChange={(e) => setSellForm({...sellForm, variety: e.target.value})}
                  placeholder="e.g., Basmati, Cherry"
                  required
                  className="w-full p-3 bg-slate-700/30 rounded-xl text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Quantity (kg)</label>
                <input
                  type="number"
                  value={sellForm.quantity}
                  onChange={(e) => setSellForm({...sellForm, quantity: e.target.value})}
                  placeholder="1000"
                  required
                  className="w-full p-3 bg-slate-700/30 rounded-xl text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Price per kg (₹)</label>
                <input
                  type="number"
                  value={sellForm.pricePerKg}
                  onChange={(e) => setSellForm({...sellForm, pricePerKg: e.target.value})}
                  placeholder="25"
                  required
                  className="w-full p-3 bg-slate-700/30 rounded-xl text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Harvest Date</label>
                <input
                  type="date"
                  value={sellForm.harvestDate}
                  onChange={(e) => setSellForm({...sellForm, harvestDate: e.target.value})}
                  required
                  className="w-full p-3 bg-slate-700/30 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Location</label>
                <select
                  value={sellForm.location}
                  onChange={(e) => setSellForm({...sellForm, location: e.target.value})}
                  required
                  className="w-full p-3 bg-slate-700/30 rounded-xl text-white"
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={sellForm.description}
                  onChange={(e) => setSellForm({...sellForm, description: e.target.value})}
                  placeholder="Describe your crop quality, farming methods, etc."
                  rows={4}
                  required
                  className="w-full p-3 bg-slate-700/30 rounded-xl text-white placeholder-slate-400 resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Package className="h-5 w-5" />
                  <span>Post Listing</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Listings Tab */}
        {activeTab === 'mylistings' && (
          <div className="space-y-4">
            {listings.filter(listing => listing.farmerId === currentUser?.uid).map((listing) => (
              <div key={listing.id} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Wheat className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{listing.cropName} - {listing.variety}</h3>
                      <p className="text-slate-300">{listing.quantity} kg at ₹{listing.pricePerKg}/kg</p>
                      <p className="text-slate-400 text-sm">{(listing.interested || []).length} interested buyers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 text-2xl font-bold">
                      ₹{(listing.quantity * listing.pricePerKg).toLocaleString()}
                    </div>
                    <p className="text-slate-400 text-sm">Total Value</p>
                  </div>
                </div>
              </div>
            ))}
            
            {listings.filter(listing => listing.farmerId === currentUser?.uid).length === 0 && (
              <div className="text-center py-12">
                <Store className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">You haven't listed any crops yet</p>
                <p className="text-slate-500 text-sm">Switch to the "Sell Crops" tab to create your first listing</p>
              </div>
            )}
          </div>
        )}

        {/* QR Scanner Modal */}
        {showQRScanner && selectedListing && (
          <QRScanner 
            onClose={() => {
              setShowQRScanner(false);
              setSelectedListing(null);
            }}
            listing={selectedListing}
          />
        )}
      </div>
    </div>
  );
};

export default CropMarketplace;
