'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/config/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface Stats {
  totalHotels: number;
  totalRooms: number;
  totalBookings: number;
  activeBookings: number;
  revenue: number;
  occupancyRate: number;
}

interface RecentBooking {
  id: string;
  reference: string;
  hotelName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  amount: number;
}

export default function AdminDashboard() {
  const { user, userData } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalHotels: 0,
    totalRooms: 0,
    totalBookings: 0,
    activeBookings: 0,
    revenue: 0,
    occupancyRate: 0
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
   
    const fetchDashboardData = async () => {
      if (!user || userData?.role !== 'admin') return;

      setLoading(true);
      setError(null);

      try {
        // Filter by hotelAdmin (user.uid)
        const hotelAdminId = user.uid;

        // Fetch hotels count for this hotelAdmin
        const hotelsQuery = query(
          collection(db, 'hotels'),
          where('hotelAdmin', '==', hotelAdminId)
        );
        const hotelsSnapshot = await getDocs(hotelsQuery);
        const totalHotels = hotelsSnapshot.size;

        // Fetch rooms count for this hotelAdmin
        const roomsQuery = query(
          collection(db, 'rooms'),
          where('hotelAdmin', '==', hotelAdminId)
        );
        const roomsSnapshot = await getDocs(roomsQuery);
        const totalRooms = roomsSnapshot.size;

        // Fetch bookings for this hotelAdmin
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('hotelAdmin', '==', hotelAdminId)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const totalBookings = bookingsSnapshot.size;

        // Calculate active bookings and revenue
        let activeBookings = 0;
        let totalRevenue = 0;
        const today = new Date();

        bookingsSnapshot.forEach(doc => {
          const data = doc.data();
          const status = (data.status || '').toLowerCase();
          const checkIn = new Date(data.checkIn);
          // Active booking: confirmed status and check-in date is in the future
          if (status === 'confirmed' && checkIn > today) {
            activeBookings++;
          }
          // Add to revenue if booking is confirmed or completed
          if (status === 'confirmed' || status === 'completed') {
            totalRevenue += data.totalAmount || 0;
          }
        });

        // Calculate occupancy rate (simplified - based on active bookings vs total rooms)
        const occupancyRate = totalRooms > 0 ? Math.round((activeBookings / totalRooms) * 100) : 0;

        setStats({
          totalHotels,
          totalRooms,
          totalBookings,
          activeBookings,
          revenue: totalRevenue,
          occupancyRate
        });

        // Fetch recent bookings for this hotelAdmin
        const recentBookingsQuery = query(
          collection(db, 'bookings'),
          where('hotelAdmin', '==', hotelAdminId),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
        const recentBookingsData: RecentBooking[] = recentBookingsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            reference: data.reference || 'N/A',
            hotelName: data.hotelDetails?.name || 'Hotel',
            guestName: `${data.guestInfo?.firstName || ''} ${data.guestInfo?.lastName || ''}`.trim() || 'Guest',
            checkIn: data.checkIn || '',
            checkOut: data.checkOut || '',
            status: data.status || 'Unknown',
            amount: data.totalAmount || 0
          };
        });

        setRecentBookings(recentBookingsData);

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, userData]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Check if user is admin
  if (!user || userData?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <i className="ri-shield-check-line text-red-600 text-xl"></i>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
              <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {userData?.fullName || 'Admin'}. Here's an overview of your hotel operations.
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                href="/admin/hotels/add"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <i className="ri-add-line mr-2"></i>
                Add Hotel
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
                    <i className="ri-hotel-line text-blue-600"></i>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Hotels</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalHotels}</dd>
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
                    <i className="ri-hotel-bed-line text-green-600"></i>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Rooms</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalRooms}</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Bookings</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeBookings}</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.revenue)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
                  <Link
                    href="/admin/bookings"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View all
                  </Link>
                </div>
                
                {recentBookings.length > 0 ? (
                  <div className="flow-root">
                    <ul className="-my-5 divide-y divide-gray-200">
                      {recentBookings.map((booking) => (
                        <li key={booking.id} className="py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <i className="ri-calendar-line text-gray-600"></i>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {booking.reference}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {booking.hotelName} • {booking.guestName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(booking.amount)}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <i className="ri-calendar-line text-4xl text-gray-400 mb-2"></i>
                    <h3 className="text-sm font-medium text-gray-900">No recent bookings</h3>
                    <p className="text-sm text-gray-500">Your recent bookings will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/admin/hotels"
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center">
                      <i className="ri-hotel-line text-gray-400 mr-3"></i>
                      Manage Hotels
                    </div>
                    <i className="ri-arrow-right-line text-gray-400"></i>
                  </Link>

                  <Link
                    href="/admin/rooms"
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center">
                      <i className="ri-hotel-bed-line text-gray-400 mr-3"></i>
                      Manage Rooms
                    </div>
                    <i className="ri-arrow-right-line text-gray-400"></i>
                  </Link>

                  <Link
                    href="/admin/bookings"
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center">
                      <i className="ri-calendar-check-line text-gray-400 mr-3"></i>
                      View Bookings
                    </div>
                    <i className="ri-arrow-right-line text-gray-400"></i>
                  </Link>

                  <Link
                    href="/admin/rooms/add"
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center">
                      <i className="ri-add-line text-gray-400 mr-3"></i>
                      Add Room
                    </div>
                    <i className="ri-arrow-right-line text-gray-400"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="mt-6 bg-white shadow-sm border border-gray-200 rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Performance</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Occupancy Rate</dt>
                    <dd className="text-sm text-gray-900">{stats.occupancyRate}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Bookings</dt>
                    <dd className="text-sm text-gray-900">{stats.totalBookings}</dd>
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