'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BookingManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedHotel, setSelectedHotel] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const bookings = [
    {
      id: 1,
      bookingRef: "BK001234",
      hotelName: "Grand Luxury Resort",
      roomType: "Ocean View Suite",
      guestName: "John Smith",
      guestEmail: "john.smith@email.com",
      guestPhone: "+1 (555) 123-4567",
      checkIn: "2024-03-15",
      checkOut: "2024-03-20",
      guests: 2,
      rooms: 1,
      status: "Confirmed",
      amount: 1495,
      bookedDate: "2024-02-15",
      paymentStatus: "Paid",
      specialRequests: "High floor room with ocean view"
    },
    {
      id: 2,
      bookingRef: "BK001235",
      hotelName: "City Center Business Hotel",
      roomType: "Executive Suite",
      guestName: "Sarah Johnson",
      guestEmail: "sarah.johnson@email.com",
      guestPhone: "+1 (555) 987-6543",
      checkIn: "2024-04-10",
      checkOut: "2024-04-12",
      guests: 1,
      rooms: 1,
      status: "Confirmed",
      amount: 578,
      bookedDate: "2024-03-01",
      paymentStatus: "Paid",
      specialRequests: "Early check-in requested"
    },
    {
      id: 3,
      bookingRef: "BK001236",
      hotelName: "Boutique Garden Hotel",
      roomType: "Garden Suite",
      guestName: "Michael Chen",
      guestEmail: "michael.chen@email.com",
      guestPhone: "+1 (555) 456-7890",
      checkIn: "2024-03-22",
      checkOut: "2024-03-25",
      guests: 2,
      rooms: 1,
      status: "Pending",
      amount: 675,
      bookedDate: "2024-03-10",
      paymentStatus: "Pending",
      specialRequests: "Anniversary celebration"
    },
    {
      id: 4,
      bookingRef: "BK001237",
      hotelName: "Grand Luxury Resort",
      roomType: "Beachfront Villa",
      guestName: "Emily Davis",
      guestEmail: "emily.davis@email.com",
      guestPhone: "+1 (555) 321-9876",
      checkIn: "2024-04-05",
      checkOut: "2024-04-08",
      guests: 4,
      rooms: 1,
      status: "Cancelled",
      amount: 1797,
      bookedDate: "2024-02-28",
      paymentStatus: "Refunded",
      specialRequests: "Ground floor room preferred"
    },
    {
      id: 5,
      bookingRef: "BK001238",
      hotelName: "Mountain View Lodge",
      roomType: "Mountain View Room",
      guestName: "David Wilson",
      guestEmail: "david.wilson@email.com",
      guestPhone: "+1 (555) 789-0123",
      checkIn: "2024-01-15",
      checkOut: "2024-01-18",
      guests: 2,
      rooms: 1,
      status: "Completed",
      amount: 447,
      bookedDate: "2023-12-20",
      paymentStatus: "Paid",
      specialRequests: "Ski equipment storage"
    },
    {
      id: 6,
      bookingRef: "BK001239",
      hotelName: "Seaside Resort & Spa",
      roomType: "Spa Suite",
      guestName: "Lisa Anderson",
      guestEmail: "lisa.anderson@email.com",
      guestPhone: "+1 (555) 654-3210",
      checkIn: "2024-03-28",
      checkOut: "2024-03-30",
      guests: 2,
      rooms: 1,
      status: "Confirmed",
      amount: 892,
      bookedDate: "2024-03-05",
      paymentStatus: "Paid",
      specialRequests: "Spa package included"
    }
  ];

  const hotels = [
    "Grand Luxury Resort",
    "City Center Business Hotel",
    "Boutique Garden Hotel",
    "Mountain View Lodge",
    "Seaside Resort & Spa"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Refunded': return 'bg-blue-100 text-blue-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || booking.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesHotel = selectedHotel === 'all' || booking.hotelName === selectedHotel;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const bookingDate = new Date(booking.bookedDate);
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

  const handleStatusChange = (bookingId: number, newStatus: string) => {
    console.log(`Changing booking ${bookingId} status to ${newStatus}`);
    alert(`Booking status changed to ${newStatus}`);
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
          <Link href="/admin" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            Back to Dashboard
          </Link>
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
                  {bookings.filter(b => b.status === 'Confirmed').length}
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
                  {bookings.filter(b => b.status === 'Pending').length}
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
                  {bookings.filter(b => b.status === 'Completed').length}
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
                  ${bookings.reduce((sum, b) => sum + (b.paymentStatus === 'Paid' ? b.amount : 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

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
                {filteredBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.bookingRef}</div>
                        <div className="text-sm text-gray-500">{booking.hotelName}</div>
                        <div className="text-sm text-gray-500">{booking.roomType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                        <div className="text-sm text-gray-500">{booking.guestEmail}</div>
                        <div className="text-sm text-gray-500">{booking.guestPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {calculateNights(booking.checkIn, booking.checkOut)} nights • {booking.guests} guests
                        </div>
                        <div className="text-sm text-gray-500">Booked: {formatDate(booking.bookedDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <br />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${booking.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link href={`/admin/bookings/${booking.id}`} className="text-blue-600 hover:text-blue-900 cursor-pointer">
                        View
                      </Link>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleStatusChange(booking.id, 'Confirmed')}
                        className="text-green-600 hover:text-green-900 cursor-pointer"
                      >
                        Confirm
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleStatusChange(booking.id, 'Cancelled')}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
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