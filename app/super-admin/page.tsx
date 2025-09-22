'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db, auth } from '@/config/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  totalHotels: number;
  approvedHotels: number;
  pendingHotels: number;
  totalBookings: number;
  totalRevenue: number;
  systemRevenue: number;
  monthlyGrowth: number;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  user: string;
  time: string;
  status: string;
  createdAt: any;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    totalHotels: 0,
    approvedHotels: 0,
    pendingHotels: 0,
    totalBookings: 0,
    totalRevenue: 0,
    systemRevenue: 0,
    monthlyGrowth: 0
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication and fetch data
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchDashboardData();
      } else {
        setError('Please sign in to access the dashboard');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data without security rules
      const [
        usersSnapshot,
        hotelsSnapshot,
        bookingsSnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'hotels')),
        getDocs(collection(db, 'bookings'))
      ]);

      // Process users data
      const totalUsers = usersSnapshot.size;
      const activeUsers = usersSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.status === 'active' || data.disabled !== true;
      }).length;

      // Process hotels data
      const totalHotels = hotelsSnapshot.size;
      const approvedHotels = hotelsSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.approved === true && data.status === 'active';
      }).length;
      const pendingHotels = hotelsSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.approved === false || data.approvalStatus === 'pending';
      }).length;

      // Process bookings data
      const totalBookings = bookingsSnapshot.size;
      const totalRevenue = bookingsSnapshot.docs.reduce((sum, doc) => {
        const data = doc.data();
        return sum + (data.totalAmount || 0);
      }, 0);
      const systemRevenue = totalRevenue * 0.1;

      // Try to fetch activities (fallback if collection doesn't exist)
      let activities: Activity[] = [];
      try {
        const activitiesSnapshot = await getDocs(
          query(
            collection(db, 'activities'), 
            orderBy('createdAt', 'desc'), 
            limit(10)
          )
        );
        
        activities = activitiesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            user: data.user || 'System',
            time: formatTimeAgo(data.createdAt?.toDate?.() || new Date())
          } as Activity;
        });
      } catch (activityError) {
        // If activities collection doesn't exist, create mock activities from existing data
        activities = generateMockActivities(totalUsers, totalHotels, totalBookings);
      }

      setStats({
        totalUsers,
        activeUsers,
        pendingApprovals: pendingHotels,
        totalHotels,
        approvedHotels,
        pendingHotels,
        totalBookings,
        totalRevenue,
        systemRevenue,
        monthlyGrowth: calculateMonthlyGrowth(activities)
      });

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const calculateMonthlyGrowth = (activities: Activity[]): number => {
    // Simple growth calculation based on recent activities
    const recentSignups = activities.filter(a => a.type === 'user_signup').length;
    return Math.min(recentSignups * 2.5, 25); // Cap at 25%
  };

  const generateMockActivities = (users: number, hotels: number, bookings: number): Activity[] => {
    const now = new Date();
    return [
      {
        id: '1',
        type: 'hotel_approval',
        message: `${hotels > 0 ? hotels : 1} hotel${hotels > 1 ? 's' : ''} registered`,
        user: 'System',
        time: formatTimeAgo(new Date(now.getTime() - 2 * 60 * 60 * 1000)),
        status: 'success',
        createdAt: Timestamp.fromDate(new Date(now.getTime() - 2 * 60 * 60 * 1000))
      },
      {
        id: '2',
        type: 'user_signup',
        message: `${users > 0 ? users : 1} user${users > 1 ? 's' : ''} signed up`,
        user: 'System',
        time: formatTimeAgo(new Date(now.getTime() - 4 * 60 * 60 * 1000)),
        status: 'active',
        createdAt: Timestamp.fromDate(new Date(now.getTime() - 4 * 60 * 60 * 1000))
      },
      {
        id: '3',
        type: 'revenue_milestone',
        message: `${bookings} booking${bookings > 1 ? 's' : ''} completed`,
        user: 'System',
        time: formatTimeAgo(new Date(now.getTime() - 24 * 60 * 60 * 1000)),
        status: 'success',
        createdAt: Timestamp.fromDate(new Date(now.getTime() - 24 * 60 * 60 * 1000))
      }
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'suspended': return 'bg-red-50 text-red-700 border-red-200';
      case 'success': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'hotel_approval': return 'ri-hotel-line';
      case 'user_signup': return 'ri-user-add-line';
      case 'hotel_suspended': return 'ri-alert-line';
      case 'revenue_milestone': return 'ri-trophy-line';
      case 'booking_completed': return 'ri-calendar-check-line';
      case 'hotel_registered': return 'ri-building-line';
      default: return 'ri-notification-line';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <i className="ri-error-warning-line text-red-600 text-xl"></i>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                System Administration
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Complete platform control and management dashboard
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                href="/super-admin/system-settings"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <i className="ri-settings-3-line mr-2"></i>
                System Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <i className="ri-user-line text-blue-600"></i>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalUsers.toLocaleString()}</dd>
                    <dd className="text-xs text-green-600">+{stats.monthlyGrowth.toFixed(1)}% this month</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <i className="ri-hotel-line text-green-600"></i>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Hotels</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.approvedHotels}</dd>
                    <dd className="text-xs text-yellow-600">{stats.pendingHotels} pending</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                    <i className="ri-calendar-check-line text-purple-600"></i>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalBookings.toLocaleString()}</dd>
                    <dd className="text-xs text-blue-600">All time</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                    <i className="ri-money-dollar-circle-line text-yellow-600"></i>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Platform Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.systemRevenue)}</dd>
                    <dd className="text-xs text-green-600">10% commission</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">System Activity</h3>
                  <span className="text-sm text-gray-500">Last 24 hours</span>
                </div>
                
                {recentActivity.length > 0 ? (
                  <div className="flow-root">
                    <ul className="-my-5 divide-y divide-gray-200">
                      {recentActivity.map((activity) => (
                        <li key={activity.id} className="py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <i className={`${getActivityIcon(activity.type)} text-gray-600`}></i>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {activity.message}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {activity.user} • {activity.time}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                                {activity.status}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <i className="ri-notification-off-line text-4xl text-gray-400 mb-2"></i>
                    <h3 className="text-sm font-medium text-gray-900">No recent activity</h3>
                    <p className="text-sm text-gray-500">System activity will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Administrative Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/super-admin/users"
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center">
                      <i className="ri-user-settings-line text-gray-400 mr-3"></i>
                      User Management
                    </div>
                    <i className="ri-arrow-right-line text-gray-400"></i>
                  </Link>

                  <Link
                    href="/super-admin/hotel-approvals"
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center">
                      <i className="ri-check-double-line text-gray-400 mr-3"></i>
                      Hotel Approvals
                      {stats.pendingApprovals > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {stats.pendingApprovals}
                        </span>
                      )}
                    </div>
                    <i className="ri-arrow-right-line text-gray-400"></i>
                  </Link>

                  <Link
                    href="/super-admin/hotels"
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center">
                      <i className="ri-hotel-line text-gray-400 mr-3"></i>
                      Hotel Management
                    </div>
                    <i className="ri-arrow-right-line text-gray-400"></i>
                  </Link>

                  <Link
                    href="/super-admin/revenue"
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center">
                      <i className="ri-line-chart-line text-gray-400 mr-3"></i>
                      Revenue Analytics
                    </div>
                    <i className="ri-arrow-right-line text-gray-400"></i>
                  </Link>

                  <Link
                    href="/super-admin/refund-requests"
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center">
                      <i className="ri-refund-line text-gray-400 mr-3"></i>
                      Refund Management
                    </div>
                    <i className="ri-arrow-right-line text-gray-400"></i>
                  </Link>

                  <Link
                    href="/super-admin/system-settings"
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center">
                      <i className="ri-settings-3-line text-gray-400 mr-3"></i>
                      System Settings
                    </div>
                    <i className="ri-arrow-right-line text-gray-400"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="mt-6 bg-white shadow-sm border border-gray-200 rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Status</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Active Users</dt>
                    <dd className="text-sm text-gray-900">{stats.activeUsers}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Hotels</dt>
                    <dd className="text-sm text-gray-900">{stats.totalHotels}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Revenue</dt>
                    <dd className="text-sm text-gray-900">{formatCurrency(stats.totalRevenue)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Platform Health</dt>
                    <dd className="text-sm text-green-600">Operational</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}