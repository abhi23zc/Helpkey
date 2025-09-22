'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function RevenueAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const monthlyRevenue = [
    { month: 'Jan', revenue: 45000, commission: 4500, bookings: 234 },
    { month: 'Feb', revenue: 52000, commission: 5200, bookings: 278 },
    { month: 'Mar', revenue: 48000, commission: 4800, bookings: 256 },
    { month: 'Apr', revenue: 65000, commission: 6500, bookings: 345 },
    { month: 'May', revenue: 78000, commission: 7800, bookings: 412 },
    { month: 'Jun', revenue: 85000, commission: 8500, bookings: 456 },
    { month: 'Jul', revenue: 92000, commission: 9200, bookings: 498 },
    { month: 'Aug', revenue: 88000, commission: 8800, bookings: 467 },
    { month: 'Sep', revenue: 82000, commission: 8200, bookings: 435 },
    { month: 'Oct', revenue: 75000, commission: 7500, bookings: 398 },
    { month: 'Nov', revenue: 68000, commission: 6800, bookings: 367 },
    { month: 'Dec', revenue: 95000, commission: 9500, bookings: 523 }
  ];

  const hotelPerformance = [
    { name: 'Grand Luxury Resort', revenue: 125000, commission: 12500, bookings: 345 },
    { name: 'City Center Business Hotel', revenue: 198000, commission: 19800, bookings: 456 },
    { name: 'Boutique Garden Hotel', revenue: 89000, commission: 8900, bookings: 234 },
    { name: 'Mountain View Lodge', revenue: 45000, commission: 4500, bookings: 123 },
    { name: 'Seaside Resort & Spa', revenue: 156000, commission: 15600, bookings: 378 }
  ];

  const revenueByCategory = [
    { name: 'Room Bookings', value: 65, color: '#3B82F6' },
    { name: 'Additional Services', value: 20, color: '#10B981' },
    { name: 'Late Fees', value: 10, color: '#F59E0B' },
    { name: 'Cancellation Fees', value: 5, color: '#EF4444' }
  ];

  const stats = {
    totalRevenue: 833000,
    totalCommission: 83300,
    totalBookings: 4173,
    averageBookingValue: 199.6,
    monthlyGrowth: 12.5,
    yearlyGrowth: 28.3
  };

  const topHotels = [
    {
      name: "City Center Business Hotel",
      owner: "Sarah Johnson",
      revenue: 198000,
      commission: 19800,
      bookings: 456,
      growth: 15.2
    },
    {
      name: "Seaside Resort & Spa",
      owner: "Lisa Anderson",
      revenue: 156000,
      commission: 15600,
      bookings: 378,
      growth: 8.7
    },
    {
      name: "Grand Luxury Resort",
      owner: "John Smith",
      revenue: 125000,
      commission: 12500,
      bookings: 345,
      growth: 22.1
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
            <p className="text-gray-600 mt-2">Platform earnings and financial performance</p>
          </div>
          <Link href="/super-admin" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            Back to Dashboard
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <i className="ri-money-dollar-circle-line text-green-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600">+{stats.yearlyGrowth}% yearly</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <i className="ri-percent-line text-blue-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Platform Commission</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalCommission.toLocaleString()}</p>
                <p className="text-sm text-blue-600">10% average</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <i className="ri-calendar-check-line text-purple-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
                <p className="text-sm text-purple-600">+{stats.monthlyGrowth}% monthly</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-3">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-3">
                <i className="ri-line-chart-line text-yellow-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Average Booking Value</p>
                <p className="text-2xl font-bold text-gray-900">${stats.averageBookingValue}</p>
                <p className="text-sm text-yellow-600">Per booking</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-3">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-3">
                <i className="ri-trending-up-line text-red-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Monthly Growth</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyGrowth}%</p>
                <p className="text-sm text-red-600">Revenue increase</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm pr-8"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="commission" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {revenueByCategory.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-700">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hotel Performance Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Performance</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={hotelPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#3B82F6" />
              <Bar dataKey="commission" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performing Hotels */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Hotels</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topHotels.map((hotel, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                        <div className="text-sm text-gray-500">{hotel.owner}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{hotel.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ₹{hotel.commission.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {hotel.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-600">
                        +{hotel.growth}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}