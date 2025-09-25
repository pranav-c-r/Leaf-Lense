import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  User, 
  MapPin, 
  Phone, 
  Star,
  MessageCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Eye,
  RefreshCw,
  ArrowRight,
  ShoppingCart,
  Wheat,
  Filter,
  Search,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Flag
} from 'lucide-react';
import { auth, database } from '../config/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc, addDoc, updateDoc, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Orders = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buyer'); // buyer, farmer
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Rating and review states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    rating: 5,
    review: '',
    cropQuality: 5,
    packaging: 5,
    delivery: 5
  });

  // Dispute states
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    reason: '',
    description: '',
    evidence: []
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserProfile(user.uid);
        fetchOrders(user.uid);
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

  const fetchOrders = async (userId) => {
    try {
      setLoading(true);
      
      // Fetch orders where user is buyer
      const buyerOrdersQuery = query(
        collection(database, 'orders'),
        where('buyerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      // Fetch orders where user is farmer
      const farmerOrdersQuery = query(
        collection(database, 'orders'),
        where('farmerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const [buyerSnapshot, farmerSnapshot] = await Promise.all([
        getDocs(buyerOrdersQuery),
        getDocs(farmerOrdersQuery)
      ]);
      
      const fetchedOrders = [];
      
      buyerSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedOrders.push({
          id: doc.id,
          ...data,
          userRole: 'buyer',
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      farmerSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedOrders.push({
          id: doc.id,
          ...data,
          userRole: 'farmer',
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      // Sort all orders by date
      fetchedOrders.sort((a, b) => b.createdAt - a.createdAt);
      
      setOrders(fetchedOrders);
      setFilteredOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders.filter(order => order.userRole === activeTab);
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  };

  useEffect(() => {
    filterOrders();
  }, [activeTab, statusFilter, orders]);

  const handleOrderAction = async (orderId, action, additionalData = {}) => {
    try {
      const orderRef = doc(database, 'orders', orderId);
      let updateData = { ...additionalData };

      switch (action) {
        case 'accept':
          updateData.status = 'accepted';
          updateData.acceptedAt = new Date();
          break;
        case 'reject':
          updateData.status = 'rejected';
          updateData.rejectedAt = new Date();
          break;
        case 'dispatch':
          updateData.status = 'dispatched';
          updateData.dispatchedAt = new Date();
          break;
        case 'farmer_deliver':
          updateData.status = 'farmer_delivered';
          updateData.farmerDeliveredAt = new Date();
          break;
        case 'buyer_confirm':
          updateData.status = 'delivered';
          updateData.deliveredAt = new Date();
          updateData.completedAt = new Date();
          break;
        case 'dispute':
          updateData.status = 'disputed';
          updateData.disputedAt = new Date();
          break;
        default:
          break;
      }

      await updateDoc(orderRef, updateData);
      
      // Create notification
      await createNotification(orderId, action, updateData);
      
      // Refresh orders
      fetchOrders(currentUser.uid);
      alert(`Order ${action} successfully!`);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    }
  };

  const createNotification = async (orderId, action, orderData) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const notification = {
        orderId,
        action,
        message: getNotificationMessage(action, order),
        recipientId: action.includes('buyer') ? order.farmerId : order.buyerId,
        senderId: currentUser.uid,
        read: false,
        createdAt: new Date(),
        orderData: {
          cropName: order.cropName,
          quantity: order.quantity,
          totalAmount: order.totalAmount
        }
      };

      await addDoc(collection(database, 'notifications'), notification);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const getNotificationMessage = (action, order) => {
    const messages = {
      'accept': `Your order for ${order.quantity}kg ${order.cropName} has been accepted!`,
      'reject': `Your order for ${order.quantity}kg ${order.cropName} has been rejected.`,
      'dispatch': `Your order for ${order.quantity}kg ${order.cropName} has been dispatched!`,
      'farmer_deliver': `Farmer has marked your ${order.quantity}kg ${order.cropName} order as delivered.`,
      'buyer_confirm': `Buyer has confirmed delivery of ${order.quantity}kg ${order.cropName}.`,
      'dispute': `A dispute has been raised for ${order.quantity}kg ${order.cropName} order.`
    };
    return messages[action] || 'Order status updated.';
  };

  const handleRating = async (orderId) => {
    try {
      const ratingData = {
        ...ratingForm,
        orderId,
        fromUserId: currentUser.uid,
        toUserId: activeTab === 'buyer' ? selectedOrder.farmerId : selectedOrder.buyerId,
        userRole: activeTab,
        createdAt: new Date()
      };

      await addDoc(collection(database, 'ratings'), ratingData);
      
      // Update order with rating
      await updateDoc(doc(database, 'orders', orderId), {
        rated: true,
        ratedAt: new Date()
      });

      // Update farmer's rating statistics
      await updateFarmerRating(selectedOrder.farmerId, ratingForm.rating);

      setShowRatingModal(false);
      setRatingForm({ rating: 5, review: '', cropQuality: 5, packaging: 5, delivery: 5 });
      fetchOrders(currentUser.uid);
      alert('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  const updateFarmerRating = async (farmerId, rating) => {
    try {
      const farmerDoc = await getDoc(doc(database, 'farmers', farmerId));
      if (farmerDoc.exists()) {
        const farmerData = farmerDoc.data();
        const currentRating = farmerData.averageRating || 0;
        const currentCount = farmerData.ratingCount || 0;
        
        const newCount = currentCount + 1;
        const newAverage = ((currentRating * currentCount) + rating) / newCount;
        
        await updateDoc(doc(database, 'farmers', farmerId), {
          averageRating: newAverage,
          ratingCount: newCount
        });
      }
    } catch (error) {
      console.error('Error updating farmer rating:', error);
    }
  };

  const handleDispute = async (orderId) => {
    try {
      const disputeData = {
        orderId,
        reason: disputeForm.reason,
        description: disputeForm.description,
        evidence: disputeForm.evidence,
        raisedBy: currentUser.uid,
        raisedAt: new Date(),
        status: 'open',
        aiProcessed: false
      };

      await addDoc(collection(database, 'disputes'), disputeData);
      await handleOrderAction(orderId, 'dispute');

      setShowDisputeModal(false);
      setDisputeForm({ reason: '', description: '', evidence: [] });
      alert('Dispute raised successfully! Our AI system will review it shortly.');
    } catch (error) {
      console.error('Error raising dispute:', error);
      alert('Failed to raise dispute. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'placed': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'accepted': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'dispatched': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'farmer_delivered': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'delivered': 'bg-green-500/20 text-green-400 border-green-500/30',
      'rejected': 'bg-red-500/20 text-red-400 border-red-500/30',
      'disputed': 'bg-red-600/20 text-red-300 border-red-600/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'placed': 'Order Placed',
      'accepted': 'Accepted by Farmer',
      'dispatched': 'Dispatched',
      'farmer_delivered': 'Delivered (Awaiting Confirmation)',
      'delivered': 'Delivered & Confirmed',
      'rejected': 'Rejected',
      'disputed': 'Under Dispute'
    };
    return statusTexts[status] || status;
  };

  const canRate = (order) => {
    return order.status === 'delivered' && !order.rated && activeTab === 'buyer';
  };

  const canDispute = (order) => {
    return ['farmer_delivered', 'delivered'].includes(order.status) && order.status !== 'disputed';
  };

  const OrderModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Order Details</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          {/* Order Status Timeline */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-4">Order Progress</h4>
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              {[
                { key: 'placed', label: 'Placed', icon: ShoppingCart },
                { key: 'accepted', label: 'Accepted', icon: CheckCircle },
                { key: 'dispatched', label: 'Dispatched', icon: Truck },
                { key: 'farmer_delivered', label: 'Delivered', icon: Package },
                { key: 'delivered', label: 'Confirmed', icon: Star }
              ].map((step, index) => {
                const isActive = order.status === step.key;
                const isCompleted = ['accepted', 'dispatched', 'farmer_delivered', 'delivered'].indexOf(order.status) >= 
                                  ['accepted', 'dispatched', 'farmer_delivered', 'delivered'].indexOf(step.key);
                
                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex flex-col items-center ${isActive ? 'text-green-400' : isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${
                        isActive ? 'border-green-400 bg-green-400/20' : 
                        isCompleted ? 'border-slate-400 bg-slate-400/20' : 
                        'border-slate-600'
                      }`}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium">{step.label}</span>
                    </div>
                    {index < 4 && (
                      <ArrowRight className={`h-4 w-4 mx-2 ${isCompleted ? 'text-slate-400' : 'text-slate-600'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-white mb-2">Crop Details</h5>
                <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Crop:</span>
                    <span className="text-white">{order.cropName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Variety:</span>
                    <span className="text-white">{order.variety}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quantity:</span>
                    <span className="text-white">{order.quantity} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Price per kg:</span>
                    <span className="text-white">₹{order.pricePerKg}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-slate-600 pt-2">
                    <span className="text-slate-300">Total Amount:</span>
                    <span className="text-green-400">₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-white mb-2">
                  {activeTab === 'buyer' ? 'Farmer Details' : 'Buyer Details'}
                </h5>
                <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-white">
                      {activeTab === 'buyer' ? order.farmerName : order.buyerName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-white">
                      {activeTab === 'buyer' ? order.farmerPhone : order.buyerPhone}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-white">
                      {activeTab === 'buyer' ? order.farmerLocation : order.buyerLocation}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {activeTab === 'farmer' && order.status === 'placed' && (
              <>
                <button
                  onClick={() => handleOrderAction(order.id, 'accept')}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Accept Order</span>
                </button>
                <button
                  onClick={() => handleOrderAction(order.id, 'reject')}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject Order</span>
                </button>
              </>
            )}

            {activeTab === 'farmer' && order.status === 'accepted' && (
              <button
                onClick={() => handleOrderAction(order.id, 'dispatch')}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Truck className="h-4 w-4" />
                <span>Mark as Dispatched</span>
              </button>
            )}

            {activeTab === 'farmer' && order.status === 'dispatched' && (
              <button
                onClick={() => handleOrderAction(order.id, 'farmer_deliver')}
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Package className="h-4 w-4" />
                <span>Mark as Delivered</span>
              </button>
            )}

            {activeTab === 'buyer' && order.status === 'farmer_delivered' && (
              <>
                <button
                  onClick={() => handleOrderAction(order.id, 'buyer_confirm')}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Confirm Delivery</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowDisputeModal(true);
                    onClose();
                  }}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>Report Issue</span>
                </button>
              </>
            )}

            {canRate(order) && (
              <button
                onClick={() => {
                  setSelectedOrder(order);
                  setShowRatingModal(true);
                  onClose();
                }}
                className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Star className="h-4 w-4" />
                <span>Rate & Review</span>
              </button>
            )}

            {canDispute(order) && (
              <button
                onClick={() => {
                  setSelectedOrder(order);
                  setShowDisputeModal(true);
                  onClose();
                }}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Flag className="h-4 w-4" />
                <span>Raise Dispute</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          <p className="text-slate-300 mt-4">Loading orders...</p>
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
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Order Management</h1>
                <p className="text-slate-300">Track and manage your crop orders</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/20 px-4 py-2 rounded-xl border border-green-500/30">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Auto-Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex space-x-2">
              {[
                { id: 'buyer', label: 'My Purchases', icon: ShoppingCart },
                { id: 'farmer', label: 'My Sales', icon: Wheat }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-700/30 rounded-xl text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="placed">Placed</option>
                <option value="accepted">Accepted</option>
                <option value="dispatched">Dispatched</option>
                <option value="farmer_delivered">Delivered (Pending)</option>
                <option value="delivered">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-green-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Wheat className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{order.cropName} - {order.variety}</h3>
                    <p className="text-slate-300">{order.quantity} kg × ₹{order.pricePerKg} = ₹{order.totalAmount.toLocaleString()}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </div>
                      <span className="text-slate-400 text-sm">
                        {order.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderModal(true);
                    }}
                    className="flex items-center space-x-2 bg-slate-700/50 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No orders found</p>
              <p className="text-slate-500 text-sm">
                {activeTab === 'buyer' ? 'You haven\'t made any purchases yet' : 'You haven\'t received any orders yet'}
              </p>
            </div>
          )}
        </div>

        {/* Order Modal */}
        {showOrderModal && selectedOrder && (
          <OrderModal order={selectedOrder} onClose={() => setShowOrderModal(false)} />
        )}

        {/* Rating Modal */}
        {showRatingModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Rate Your Experience</h3>
                <button onClick={() => setShowRatingModal(false)} className="text-slate-400 hover:text-white">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Overall Rating</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                        className={`h-8 w-8 ${star <= ratingForm.rating ? 'text-yellow-400' : 'text-slate-600'}`}
                      >
                        <Star className="h-full w-full fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Review</label>
                  <textarea
                    value={ratingForm.review}
                    onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
                    placeholder="Share your experience..."
                    rows={3}
                    className="w-full p-3 bg-slate-700/30 rounded-xl text-white placeholder-slate-400 resize-none"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRating(selectedOrder.id)}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
                  >
                    Submit Rating
                  </button>
                  <button
                    onClick={() => setShowRatingModal(false)}
                    className="px-6 bg-slate-600 text-white py-3 rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dispute Modal */}
        {showDisputeModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Raise Dispute</h3>
                <button onClick={() => setShowDisputeModal(false)} className="text-slate-400 hover:text-white">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Issue Type</label>
                  <select
                    value={disputeForm.reason}
                    onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                    className="w-full p-3 bg-slate-700/30 rounded-xl text-white"
                  >
                    <option value="">Select Issue</option>
                    <option value="not_delivered">Not Delivered</option>
                    <option value="poor_quality">Poor Quality</option>
                    <option value="wrong_quantity">Wrong Quantity</option>
                    <option value="damaged">Damaged Goods</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={disputeForm.description}
                    onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
                    placeholder="Describe the issue in detail..."
                    rows={4}
                    className="w-full p-3 bg-slate-700/30 rounded-xl text-white placeholder-slate-400 resize-none"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDispute(selectedOrder.id)}
                    disabled={!disputeForm.reason || !disputeForm.description}
                    className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Dispute
                  </button>
                  <button
                    onClick={() => setShowDisputeModal(false)}
                    className="px-6 bg-slate-600 text-white py-3 rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
