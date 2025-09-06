'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { collection, getDocs, orderBy, query, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';

interface BookingData {
  id: string;
  reference: string;
  userId?: string;
  userEmail?: string;
  hotelId: string;
  roomId: string;
  hotelAdmin?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
  taxesAndFees: number;
  totalAmount: number;
  unitPrice: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending' | string;
  createdAt?: any;
  guestInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    specialRequests?: string;
  };
  hotelDetails?: {
    name?: string;
    location?: string;
    image?: string;
    hotelId?: string;
  };
  roomDetails?: {
    type?: string;
    price?: number;
    size?: string;
    beds?: string;
    image?: string;
    roomId?: string;
  };
  paymentInfo?: {
    cardholderName?: string;
    lastFourDigits?: string;
    billingAddress?: string;
    city?: string;
    country?: string;
    zipCode?: string;
  };
}

export default function BookingManagement() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedHotel, setSelectedHotel] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch bookings from Firestore
  const fetchBookings = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      if (!user?.uid) {
        setError('User not authenticated');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const q = query(
        collection(db, 'bookings'),
        where('hotelAdmin', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const bookingsData: BookingData[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BookingData));
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchBookings();
    }
  }, [user?.uid]);


  // Get unique hotels from bookings data
  const hotels = Array.from(new Set(bookings.map(booking => booking.hotelDetails?.name).filter(Boolean))) as string[];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  const filteredBookings = bookings.filter(booking => {
    const guestName = `${booking.guestInfo?.firstName || ''} ${booking.guestInfo?.lastName || ''}`.trim();
    const matchesSearch = booking.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.hotelDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.guestInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || booking.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesHotel = selectedHotel === 'all' || booking.hotelDetails?.name === selectedHotel;
    
    let matchesDate = true;
    if (dateRange !== 'all' && booking.createdAt) {
      const bookingDate = booking.createdAt.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateRange) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesHotel && matchesDate;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus });
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      alert(`Booking status changed to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600 mt-2">Manage all hotel bookings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchBookings(true)}
              disabled={refreshing}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <i className="ri-refresh-line w-4 h-4 flex items-center justify-center"></i>
                  Refresh
                </>
              )}
            </button>
            <Link href="/admin" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-2">
                <i className="ri-check-line text-green-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-lg font-semibold text-gray-900">
                  {bookings.filter(b => b.status.toLowerCase() === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-2">
                <i className="ri-time-line text-yellow-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-lg font-semibold text-gray-900">
                  {bookings.filter(b => b.status.toLowerCase() === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-2">
                <i className="ri-check-double-line text-blue-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-lg font-semibold text-gray-900">
                  {bookings.filter(b => b.status.toLowerCase() === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-2">
                <i className="ri-money-dollar-circle-line text-green-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${bookings.reduce((sum, b) => sum + (b.status.toLowerCase() === 'confirmed' || b.status.toLowerCase() === 'completed' ? b.totalAmount : 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <i className="ri-error-warning-line text-red-400 w-5 h-5 flex items-center justify-center mr-3 mt-0.5"></i>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading bookings</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Bookings</label>
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-3 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by booking ref, guest name..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
              <select
                value={selectedHotel}
                onChange={(e) => setSelectedHotel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
              >
                <option value="all">All Hotels</option>
                {hotels.map(hotel => (
                  <option key={hotel} value={hotel}>{hotel}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stay Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map(booking => {
                    const guestName = `${booking.guestInfo?.firstName || ''} ${booking.guestInfo?.lastName || ''}`.trim();
                    const bookedDate = booking.createdAt ? 
                      (booking.createdAt.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt)) : 
                      new Date();
                    
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.reference}</div>
                            <div className="text-sm text-gray-500">{booking.hotelDetails?.name || 'Hotel'}</div>
                            <div className="text-sm text-gray-500">{booking.roomDetails?.type || 'Room'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{guestName || 'Guest'}</div>
                            <div className="text-sm text-gray-500">{booking.guestInfo?.email || ''}</div>
                            <div className="text-sm text-gray-500">{booking.guestInfo?.phone || ''}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">
                              {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.nights || calculateNights(booking.checkIn, booking.checkOut)} nights • {booking.guests} guests
                            </div>
                            <div className="text-sm text-gray-500">Booked: {formatDate(bookedDate.toISOString())}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${booking.totalAmount?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link href={`/admin/bookings/${booking.id}`} className="text-blue-600 hover:text-blue-900 cursor-pointer">
                            View
                          </Link>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="text-green-600 hover:text-green-900 cursor-pointer"
                          >
                            Confirm
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBookings.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <i className="ri-calendar-check-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600 mb-4">No bookings match your current search criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedHotel('all');
                setDateRange('all');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}