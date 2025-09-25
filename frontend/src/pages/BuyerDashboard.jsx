import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Package,
  Clock,
  Star,
  CheckCircle,
  Truck,
  DollarSign,
  TrendingUp,
  Heart,
  Eye,
  User,
  MapPin,
  Calendar,
  Filter,
  Search,
  ArrowUpRight,
  AlertTriangle,
  Wheat,
  Store,
  Target,
  Award,
  Bell,
  BarChart3
} from 'lucide-react';
import { auth, database } from '../config/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const BuyerDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [buyerProfile, setBuyerProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalSpent: 0,
    activeOrders: 0,
    completedOrders: 0,
    monthlySpending: [],
    cropPurchases: {},
    recentOrders: [],
    favoritesCrops: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchBuyerData(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchBuyerData = async (userId) => {
    try {
      setLoading(true);
      
      // Fetch buyer profile (farmers collection for now, but should be buyers collection)
      const profileDoc = await getDoc(doc(database, 'farmers', userId));
      if (profileDoc.exists()) {
        setBuyerProfile(profileDoc.data());
      }

      // Fetch orders where user is buyer
      const ordersQuery = query(
        collection(database, 'orders'),
        where('buyerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const fetchedOrders = [];
      ordersSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedOrders.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      setOrders(fetchedOrders);

      // Fetch crop recommendations based on purchase history
      await generateRecommendations(fetchedOrders);

      // Calculate analytics
      calculateAnalytics(fetchedOrders);
    } catch (error) {
      console.error('Error fetching buyer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (orders) => {
    try {
      // Get user's favorite crops based on purchase history
      const cropFrequency = {};
      orders.forEach(order => {
        cropFrequency[order.cropName] = (cropFrequency[order.cropName] || 0) + 1;
      });

      const favoriteCrops = Object.keys(cropFrequency)
        .sort((a, b) => cropFrequency[b] - cropFrequency[a])
        .slice(0, 3);

      // Fetch similar crop listings
      const listingsQuery = query(
        collection(database, 'cropListings'),
        orderBy('createdAt', 'desc')
      );
      const listingsSnapshot = await getDocs(listingsQuery);
      const allListings = [];
      
      listingsSnapshot.forEach((doc) => {
        const data = doc.data();
        // Don't recommend own listings
        if (data.farmerId !== currentUser.uid && data.status === 'active') {
          allListings.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        }
      });

      // Filter recommendations based on favorite crops and seasonal availability
      const seasonalCrops = getSeasonalCrops();
      const recommendations = allListings
        .filter(listing => 
          favoriteCrops.includes(listing.cropName) || 
          seasonalCrops.includes(listing.cropName.toLowerCase())
        )
        .slice(0, 6);

      setRecommendations(recommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  };

  const getSeasonalCrops = () => {
    const currentMonth = new Date().getMonth();
    const seasonalCrops = {
      // Winter crops (Dec-Feb): 11, 0, 1
      winter: ['wheat', 'potato', 'onion', 'peas', 'cauliflower'],
      // Summer crops (Mar-May): 2, 3, 4
      summer: ['rice', 'cotton', 'sugarcane', 'maize', 'groundnut'],
      // Monsoon crops (Jun-Aug): 5, 6, 7
      monsoon: ['rice', 'cotton', 'sugarcane', 'soybean', 'pulses'],
      // Post-monsoon (Sep-Nov): 8, 9, 10
      postMonsoon: ['rice', 'wheat', 'maize', 'cotton', 'soybean']
    };

    if ([11, 0, 1].includes(currentMonth)) return seasonalCrops.winter;
    if ([2, 3, 4].includes(currentMonth)) return seasonalCrops.summer;
    if ([5, 6, 7].includes(currentMonth)) return seasonalCrops.monsoon;
    return seasonalCrops.postMonsoon;
  };

  const calculateAnalytics = (orders) => {
    const now = new Date();
    const timeRangeMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    const daysBack = timeRangeMap[timeRange];
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Filter orders by time range
    const filteredOrders = orders.filter(order => order.createdAt >= startDate);
    
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(order => order.status === 'delivered').length;
    const activeOrders = filteredOrders.filter(order => 
      !['delivered', 'rejected'].includes(order.status)
    ).length;
    const totalSpent = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Monthly spending for chart
    const monthlySpending = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = now.getFullYear();
    
    for (let i = 0; i < 12; i++) {
      const monthOrders = orders.filter(order => {
        const orderDate = order.createdAt;
        return orderDate.getFullYear() === currentYear && orderDate.getMonth() === i;
      });
      const monthSpending = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      monthlySpending.push({ month: months[i], spending: monthSpending });
    }

    // Crop purchases breakdown
    const cropPurchases = {};
    filteredOrders.forEach(order => {
      if (cropPurchases[order.cropName]) {
        cropPurchases[order.cropName] += order.totalAmount;
      } else {
        cropPurchases[order.cropName] = order.totalAmount;
      }
    });

    // Recent orders (last 5)
    const recentOrders = orders.slice(0, 5);

    // Favorite crops
    const cropFrequency = {};
    orders.forEach(order => {
      cropFrequency[order.cropName] = (cropFrequency[order.cropName] || 0) + 1;
    });
    const favoritesCrops = Object.keys(cropFrequency)
      .sort((a, b) => cropFrequency[b] - cropFrequency[a])
      .slice(0, 5);

    setAnalytics({
      totalOrders,
      totalSpent,
      activeOrders,
      completedOrders,
      monthlySpending,
      cropPurchases,
      recentOrders,
      favoritesCrops
    });
  };

  useEffect(() => {
    if (orders.length > 0) {
      calculateAnalytics(orders);
    }
  }, [timeRange]);

  const getStatusColor = (status) => {
    const colors = {
      'placed': 'text-yellow-400 bg-yellow-400/20',
      'accepted': 'text-blue-400 bg-blue-400/20',
      'dispatched': 'text-purple-400 bg-purple-400/20',
      'farmer_delivered': 'text-orange-400 bg-orange-400/20',
      'delivered': 'text-green-400 bg-green-400/20',
      'rejected': 'text-red-400 bg-red-400/20'
    };
    return colors[status] || 'text-slate-400 bg-slate-400/20';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'placed': 'Order Placed',
      'accepted': 'Accepted',
      'dispatched': 'In Transit',
      'farmer_delivered': 'Delivered',
      'delivered': 'Completed',
      'rejected': 'Cancelled'
    };
    return statusTexts[status] || status;
  };

  const getDeliveryDate = (order) => {
    const estimatedDays = {
      'placed': 5,
      'accepted': 4,
      'dispatched': 2,
      'farmer_delivered': 1,
      'delivered': 0
    };
    
    const days = estimatedDays[order.status] || 5;
    const deliveryDate = new Date(order.createdAt.getTime() + (days * 24 * 60 * 60 * 1000));
    return deliveryDate.toLocaleDateString();
  };

  // Chart configurations
  const spendingChartData = {
    labels: analytics.monthlySpending.map(item => item.month),
    datasets: [
      {
        label: 'Spending (₹)',
        data: analytics.monthlySpending.map(item => item.spending),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const cropPurchasesData = {
    labels: Object.keys(analytics.cropPurchases),
    datasets: [
      {
        data: Object.values(analytics.cropPurchases),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#8B5CF6',
          '#F59E0B',
          '#EF4444',
          '#06B6D4',
          '#84CC16',
          '#F97316',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-slate-300 mt-4">Loading dashboard...</p>
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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Buyer Dashboard</h1>
                <p className="text-slate-300">Welcome back, {buyerProfile?.name || 'Buyer'}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-slate-700/30 rounded-xl text-white text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Spent</p>
                <p className="text-3xl font-bold text-blue-400">₹{analytics.totalSpent.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400">+15.3%</span>
              <span className="text-slate-400 ml-2">vs last period</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-green-400">{analytics.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400">+12.1%</span>
              <span className="text-slate-400 ml-2">vs last period</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Orders</p>
                <p className="text-3xl font-bold text-orange-400">{analytics.activeOrders}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <Truck className="h-4 w-4 text-orange-400 mr-1" />
              <span className="text-orange-400">In transit</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Completed Orders</p>
                <p className="text-3xl font-bold text-emerald-400">{analytics.completedOrders}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-slate-400">Rate your experience</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Spending Trend</h3>
              <BarChart3 className="h-5 w-5 text-slate-400" />
            </div>
            <div style={{ height: '300px' }}>
              <Line data={spendingChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Purchase Categories</h3>
              <Target className="h-5 w-5 text-slate-400" />
            </div>
            <div style={{ height: '300px' }}>
              {Object.keys(analytics.cropPurchases).length > 0 ? (
                <Doughnut data={cropPurchasesData} options={doughnutOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No purchase data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Orders</h3>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                View All →
              </button>
            </div>

            <div className="space-y-4">
              {analytics.recentOrders.map((order) => (
                <div key={order.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Wheat className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white text-sm">{order.cropName}</h4>
                        <p className="text-slate-400 text-xs">{order.quantity} kg • ₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </div>
                      {order.status !== 'delivered' && order.status !== 'rejected' && (
                        <p className="text-slate-400 text-xs mt-1">ETA: {getDeliveryDate(order)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {analytics.recentOrders.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Package className="h-12 w-12 mx-auto mb-4" />
                  <p>No recent orders</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recommended for You</h3>
              <Award className="h-5 w-5 text-slate-400" />
            </div>

            <div className="space-y-4">
              {recommendations.map((listing) => (
                <div key={listing.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50 hover:border-slate-500/50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Wheat className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white text-sm">{listing.cropName} - {listing.variety}</h4>
                        <p className="text-slate-400 text-xs">{listing.farmerName} • {listing.farmerLocation}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-green-400 font-medium text-sm">₹{listing.pricePerKg}/kg</p>
                      <p className="text-slate-400 text-xs">{listing.quantity} kg available</p>
                    </div>
                  </div>
                </div>
              ))}

              {recommendations.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Target className="h-12 w-12 mx-auto mb-4" />
                  <p>No recommendations yet</p>
                  <p className="text-xs">Make some purchases to get personalized recommendations</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Favorite Crops */}
        {analytics.favoritesCrops.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Your Favorite Crops</h3>
              <Heart className="h-5 w-5 text-slate-400" />
            </div>

            <div className="flex flex-wrap gap-3">
              {analytics.favoritesCrops.map((crop, index) => (
                <div
                  key={crop}
                  className="flex items-center space-x-2 bg-slate-700/30 px-4 py-2 rounded-xl border border-slate-600/50"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Wheat className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white font-medium text-sm capitalize">{crop}</span>
                  <div className="text-slate-400 text-xs">#{index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
