'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalHotels: 12,
    totalRooms: 156,
    totalBookings: 2847,
    activeBookings: 234,
    revenue: 485750,
    occupancyRate: 78.5
  };

  const recentBookings = [
    {
      id: 1,
      bookingRef: "BK001234",
      hotelName: "Grand Luxury Resort",
      guestName: "John Smith",
      checkIn: "2024-03-15",
      checkOut: "2024-03-20",
      status: "Confirmed",
      amount: 1495
    },
    {
      id: 2,
      bookingRef: "BK001235",
      hotelName: "City Center Business Hotel",
      guestName: "Sarah Johnson",
      checkIn: "2024-04-10",
      checkOut: "2024-04-12",
      status: "Confirmed",
      amount: 378
    },
    {
      id: 3,
      bookingRef: "BK001236",
      hotelName: "Boutique Garden Hotel",
      guestName: "Michael Chen",
      checkIn: "2024-03-22",
      checkOut: "2024-03-25",
      status: "Pending",
      amount: 675
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hotel Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your hotels, rooms, and bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <i className="ri-hotel-line text-blue-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Hotels</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHotels}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <i className="ri-hotel-bed-line text-green-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <i className="ri-calendar-check-line text-purple-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-3">
                <i className="ri-line-chart-line text-yellow-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-3">
                <i className="ri-money-dollar-circle-line text-red-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center">
              <div className="bg-indigo-100 rounded-lg p-3">
                <i className="ri-file-list-3-line text-indigo-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
                { id: 'hotels', label: 'Hotels', icon: 'ri-hotel-line' },
                { id: 'rooms', label: 'Rooms', icon: 'ri-hotel-bed-line' },
                { id: 'bookings', label: 'Bookings', icon: 'ri-calendar-check-line' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 text-sm font-medium whitespace-nowrap cursor-pointer border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className={`${tab.icon} mr-2 w-4 h-4 flex items-center justify-center`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Recent Activity</h2>
                  <div className="flex space-x-3">
                    <Link href="/admin/hotels" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                      Manage Hotels
                    </Link>
                    <Link href="/admin/bookings" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                      View All Bookings
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                    <div className="space-y-3">
                      {recentBookings.map(booking => (
                        <div key={booking.id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{booking.bookingRef}</p>
                              <p className="text-sm text-gray-600">{booking.hotelName}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>{booking.guestName}</span>
                            <span className="font-medium text-gray-900">${booking.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Link href="/admin/hotels/add" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="bg-blue-100 rounded-lg p-3 mr-4">
                          <i className="ri-add-line text-blue-600 w-5 h-5 flex items-center justify-center"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Add New Hotel</p>
                          <p className="text-sm text-gray-600">Create a new hotel listing</p>
                        </div>
                      </Link>

                      <Link href="/admin/rooms/add" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="bg-green-100 rounded-lg p-3 mr-4">
                          <i className="ri-home-add-line text-green-600 w-5 h-5 flex items-center justify-center"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Add New Room</p>
                          <p className="text-sm text-gray-600">Add rooms to existing hotels</p>
                        </div>
                      </Link>

                      <Link href="/admin/bookings" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="bg-purple-100 rounded-lg p-3 mr-4">
                          <i className="ri-calendar-check-line text-purple-600 w-5 h-5 flex items-center justify-center"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Manage Bookings</p>
                          <p className="text-sm text-gray-600">View and manage all bookings</p>
                        </div>
                      </Link>

                      <Link href="/admin/reports" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="bg-yellow-100 rounded-lg p-3 mr-4">
                          <i className="ri-bar-chart-line text-yellow-600 w-5 h-5 flex items-center justify-center"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">View Reports</p>
                          <p className="text-sm text-gray-600">Analytics and performance reports</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hotels' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Hotel Management</h2>
                  <Link href="/admin/hotels" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                    View All Hotels
                  </Link>
                </div>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <i className="ri-hotel-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Your Hotels</h3>
                  <p className="text-gray-600 mb-4">Add, edit, or remove hotels from your portfolio</p>
                  <Link href="/admin/hotels" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                    Go to Hotels
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'rooms' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Room Management</h2>
                  <Link href="/admin/rooms" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                    View All Rooms
                  </Link>
                </div>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <i className="ri-hotel-bed-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Your Rooms</h3>
                  <p className="text-gray-600 mb-4">Add, edit, or remove rooms from your hotels</p>
                  <Link href="/admin/rooms" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                    Go to Rooms
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Booking Management</h2>
                  <Link href="/admin/bookings" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                    View All Bookings
                  </Link>
                </div>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <i className="ri-calendar-check-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Your Bookings</h3>
                  <p className="text-gray-600 mb-4">View, edit, or cancel customer bookings</p>
                  <Link href="/admin/bookings" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                    Go to Bookings
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}