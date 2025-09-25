import React, { useState, useEffect } from 'react';
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  Truck,
  Clock,
  Bell,
  Star,
  Eye,
  AlertTriangle,
  Calendar,
  MapPin,
  Phone,
  User,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Filter,
  Download,
  Wheat,
  Store,
  Target,
  Award
} from 'lucide-react';
import { auth, database } from '../config/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc, where, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const FarmerDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [listings, setListings] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeListings: 0,
    averageRating: 0,
    completedOrders: 0,
    monthlyRevenue: [],
    cropSales: {},
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchFarmerData(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchFarmerData = async (userId) => {
    try {
      setLoading(true);
      
      // Fetch farmer profile
      const profileDoc = await getDoc(doc(database, 'farmers', userId));
      if (profileDoc.exists()) {
        setFarmerProfile(profileDoc.data());
      }

      // Fetch orders where user is farmer
      const ordersQuery = query(
        collection(database, 'orders'),
        where('farmerId', '==', userId),
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

      // Fetch listings
      const listingsQuery = query(
        collection(database, 'cropListings'),
        where('farmerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const listingsSnapshot = await getDocs(listingsQuery);
      const fetchedListings = [];
      listingsSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedListings.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      setListings(fetchedListings);

      // Calculate analytics
      calculateAnalytics(fetchedOrders, fetchedListings, profileDoc.data());
    } catch (error) {
      console.error('Error fetching farmer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (orders, listings, profile) => {
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
    const totalRevenue = filteredOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    const activeListings = listings.filter(listing => listing.status === 'active').length;
    const averageRating = profile?.averageRating || 0;

    // Monthly revenue for chart
    const monthlyRevenue = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = now.getFullYear();
    
    for (let i = 0; i < 12; i++) {
      const monthOrders = orders.filter(order => {
        const orderDate = order.createdAt;
        return orderDate.getFullYear() === currentYear && 
               orderDate.getMonth() === i && 
               order.status === 'delivered';
      });
      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      monthlyRevenue.push({ month: months[i], revenue: monthRevenue });
    }

    // Crop sales breakdown
    const cropSales = {};
    filteredOrders
      .filter(order => order.status === 'delivered')
      .forEach(order => {
        if (cropSales[order.cropName]) {
          cropSales[order.cropName] += order.totalAmount;
        } else {
          cropSales[order.cropName] = order.totalAmount;
        }
      });

    // Recent orders (last 5)
    const recentOrders = orders.slice(0, 5);

    setAnalytics({
      totalOrders,
      totalRevenue,
      activeListings,
      averageRating,
      completedOrders,
      monthlyRevenue,
      cropSales,
      recentOrders
    });
  };

  useEffect(() => {
    if (orders.length > 0 && listings.length > 0) {
      calculateAnalytics(orders, listings, farmerProfile);
    }
  }, [timeRange]);

  const handleOrderAction = async (orderId, action) => {
    try {
      const orderRef = doc(database, 'orders', orderId);
      let updateData = {};

      switch (action) {
        case 'accept':
          updateData = { status: 'accepted', acceptedAt: new Date() };
          break;
        case 'reject':
          updateData = { status: 'rejected', rejectedAt: new Date() };
          break;
        case 'dispatch':
          updateData = { status: 'dispatched', dispatchedAt: new Date() };
          break;
        case 'deliver':
          updateData = { status: 'farmer_delivered', farmerDeliveredAt: new Date() };
          break;
      }

      await updateDoc(orderRef, updateData);
      fetchFarmerData(currentUser.uid); // Refresh data
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

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
      'placed': 'New Order',
      'accepted': 'Accepted',
      'dispatched': 'Dispatched',
      'farmer_delivered': 'Delivered',
      'delivered': 'Confirmed',
      'rejected': 'Rejected'
    };
    return statusTexts[status] || status;
  };

  // Chart configurations
  const revenueChartData = {
    labels: analytics.monthlyRevenue.map(item => item.month),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: analytics.monthlyRevenue.map(item => item.revenue),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const cropSalesData = {
    labels: Object.keys(analytics.cropSales),
    datasets: [
      {
        data: Object.values(analytics.cropSales),
        backgroundColor: [
          '#10B981',
          '#3B82F6',
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
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
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Store className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Farmer Dashboard</h1>
                <p className="text-slate-300">Welcome back, {farmerProfile?.name || 'Farmer'}!</p>
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
                <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-green-400">₹{analytics.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400">+12.5%</span>
              <span className="text-slate-400 ml-2">vs last period</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-blue-400">{analytics.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400">+8.2%</span>
              <span className="text-slate-400 ml-2">vs last period</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Listings</p>
                <p className="text-3xl font-bold text-purple-400">{analytics.activeListings}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400">+5.1%</span>
              <span className="text-slate-400 ml-2">vs last period</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Average Rating</p>
                <p className="text-3xl font-bold text-yellow-400">{analytics.averageRating.toFixed(1)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(analytics.averageRating) ? 'text-yellow-400 fill-current' : 'text-slate-600'}`}
                  />
                ))}
              </div>
              <span className="text-slate-400 ml-2">({farmerProfile?.ratingCount || 0} reviews)</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Revenue Trend</h3>
              <BarChart3 className="h-5 w-5 text-slate-400" />
            </div>
            <div style={{ height: '300px' }}>
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Crop Sales Distribution</h3>
              <PieChart className="h-5 w-5 text-slate-400" />
            </div>
            <div style={{ height: '300px' }}>
              {Object.keys(analytics.cropSales).length > 0 ? (
                <Doughnut data={cropSalesData} options={doughnutOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No sales data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Orders</h3>
            <button className="text-green-400 hover:text-green-300 text-sm font-medium">
              View All Orders →
            </button>
          </div>

          <div className="space-y-4">
            {analytics.recentOrders.map((order) => (
              <div key={order.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Wheat className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{order.cropName} - {order.variety}</h4>
                      <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
                        <span>{order.quantity} kg</span>
                        <span>•</span>
                        <span>₹{order.totalAmount.toLocaleString()}</span>
                        <span>•</span>
                        <span>{order.buyerName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>

                    {order.status === 'placed' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOrderAction(order.id, 'accept')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleOrderAction(order.id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {order.status === 'accepted' && (
                      <button
                        onClick={() => handleOrderAction(order.id, 'dispatch')}
                        className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Dispatch
                      </button>
                    )}

                    {order.status === 'dispatched' && (
                      <button
                        onClick={() => handleOrderAction(order.id, 'deliver')}
                        className="px-3 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Mark Delivered
                      </button>
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
      </div>
    </div>
  );
};

export default FarmerDashboard;
