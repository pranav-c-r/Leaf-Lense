import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Package, 
  ShoppingCart, 
  CheckCircle, 
  Truck, 
  Star,
  AlertTriangle,
  MessageCircle,
  Heart,
  Store,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  Filter,
  Search,
  DollarSign
} from 'lucide-react';
import { auth, database } from '../config/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Notifications = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, orders, listings
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchNotifications(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchNotifications = (userId) => {
    try {
      setLoading(true);
      
      // Real-time listener for notifications
      const notificationsQuery = query(
        collection(database, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(notificationsQuery, (querySnapshot) => {
        const fetchedNotifications = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedNotifications.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        });
        
        setNotifications(fetchedNotifications);
        setFilteredNotifications(fetchedNotifications);
        setLoading(false);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(notification => 
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.orderData?.cropName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(n => !n.read);
        break;
      case 'orders':
        filtered = filtered.filter(n => ['new_order', 'accept', 'reject', 'dispatch', 'farmer_deliver', 'buyer_confirm', 'dispute'].includes(n.action));
        break;
      case 'listings':
        filtered = filtered.filter(n => ['new_listing', 'interest', 'crop_recommendation'].includes(n.action));
        break;
      default:
        break;
    }

    setFilteredNotifications(filtered);
  };

  useEffect(() => {
    filterNotifications();
  }, [filter, searchTerm, notifications]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(database, 'notifications', notificationId), {
        read: true,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAsUnread = async (notificationId) => {
    try {
      await updateDoc(doc(database, 'notifications', notificationId), {
        read: false,
        readAt: null
      });
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(database, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const updatePromises = unreadNotifications.map(notification =>
        updateDoc(doc(database, 'notifications', notification.id), {
          read: true,
          readAt: new Date()
        })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (action) => {
    const iconProps = { className: "h-5 w-5" };
    
    switch (action) {
      case 'new_order':
        return <ShoppingCart {...iconProps} />;
      case 'accept':
        return <CheckCircle {...iconProps} />;
      case 'dispatch':
        return <Truck {...iconProps} />;
      case 'farmer_deliver':
      case 'buyer_confirm':
        return <Package {...iconProps} />;
      case 'dispute':
        return <AlertTriangle {...iconProps} />;
      case 'interest':
        return <Heart {...iconProps} />;
      case 'new_listing':
      case 'crop_recommendation':
        return <Store {...iconProps} />;
      case 'rating':
        return <Star {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  const getNotificationColor = (action, read) => {
    const baseColor = read ? 'bg-slate-800/30' : 'bg-slate-700/50';
    const borderColor = read ? 'border-slate-700/30' : 'border-slate-600/50';
    
    let accentColor = 'text-blue-400';
    
    switch (action) {
      case 'new_order':
        accentColor = 'text-green-400';
        break;
      case 'accept':
        accentColor = 'text-blue-400';
        break;
      case 'dispatch':
        accentColor = 'text-purple-400';
        break;
      case 'farmer_deliver':
      case 'buyer_confirm':
        accentColor = 'text-emerald-400';
        break;
      case 'dispute':
        accentColor = 'text-red-400';
        break;
      case 'interest':
        accentColor = 'text-pink-400';
        break;
      case 'new_listing':
        accentColor = 'text-yellow-400';
        break;
      default:
        accentColor = 'text-blue-400';
        break;
    }
    
    return { baseColor, borderColor, accentColor };
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-slate-300 mt-4">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Bell className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
                <p className="text-slate-300">Stay updated with your orders and listings</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500/20 px-4 py-2 rounded-xl border border-blue-500/30">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">
                    {unreadCount} Unread
                  </span>
                </div>
              </div>
              <div className="bg-slate-500/20 px-4 py-2 rounded-xl border border-slate-500/30">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-400 text-sm font-medium">
                    {notifications.length} Total
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Notifications' },
                { id: 'unread', label: 'Unread' },
                { id: 'orders', label: 'Orders' },
                { id: 'listings', label: 'Listings' }
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === filterOption.id 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-700/30 rounded-xl text-white text-sm placeholder-slate-400 w-64"
                />
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const { baseColor, borderColor, accentColor } = getNotificationColor(notification.action, notification.read);
            
            return (
              <div
                key={notification.id}
                className={`${baseColor} backdrop-blur-sm rounded-2xl p-6 border ${borderColor} transition-all hover:border-slate-600/70 group`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl ${accentColor.replace('text-', 'bg-').replace('-400', '-500/20')} flex items-center justify-center`}>
                      <div className={accentColor}>
                        {getNotificationIcon(notification.action)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="text-white font-medium">
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        )}
                      </div>
                      
                      {notification.orderData && (
                        <div className="flex items-center space-x-4 text-sm text-slate-400 mb-2">
                          <span>{notification.orderData.cropName}</span>
                          <span>•</span>
                          <span>{notification.orderData.quantity}kg</span>
                          <span>•</span>
                          <span>₹{notification.orderData.totalAmount?.toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{getTimeAgo(notification.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {notification.read ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsUnread(notification.id);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-700/50 transition-colors"
                        title="Mark as unread"
                      >
                        <MarkAsUnread className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-2 text-slate-400 hover:text-green-400 rounded-lg hover:bg-slate-700/50 transition-colors"
                        title="Mark as read"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700/50 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No notifications found</p>
              <p className="text-slate-500 text-sm">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : searchTerm
                  ? "Try adjusting your search terms."
                  : "New notifications will appear here when you receive them."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
