'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalUsers: 1247,
    activeUsers: 1089,
    pendingApprovals: 23,
    totalHotels: 45,
    approvedHotels: 38,
    pendingHotels: 7,
    totalBookings: 8934,
    totalRevenue: 2847590,
    systemRevenue: 284759,
    monthlyGrowth: 12.5
  };

  const recentActivity = [
    {
      id: 1,
      type: 'hotel_approval',
      message: 'New hotel registration: Luxury Beach Resort',
      user: 'David Johnson',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'user_signup',
      message: 'New hotel admin registered',
      user: 'Sarah Chen',
      time: '4 hours ago',
      status: 'active'
    },
    {
      id: 3,
      type: 'hotel_suspended',
      message: 'Hotel suspended for policy violation',
      user: 'System',
      time: '1 day ago',
      status: 'suspended'
    },
    {
      id: 4,
      type: 'revenue_milestone',
      message: 'Monthly revenue target achieved',
      user: 'System',
      time: '2 days ago',
      status: 'success'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'hotel_approval': return 'ri-hotel-line';
      case 'user_signup': return 'ri-user-add-line';
      case 'hotel_suspended': return 'ri-alert-line';
      case 'revenue_milestone': return 'ri-trophy-line';
      default: return 'ri-notification-line';
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'active': return 'text-green-600';
      case 'suspended': return 'text-red-600';
      case 'success': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Complete system control and management</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <i className="ri-user-line text-blue-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{stats.monthlyGrowth}% this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <i className="ri-hotel-line text-green-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Hotels</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedHotels}</p>
                <p className="text-xs text-yellow-600">{stats.pendingHotels} pending approval</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <i className="ri-calendar-check-line text-purple-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
                <p className="text-xs text-blue-600">All time</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-3">
                <i className="ri-money-dollar-circle-line text-yellow-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Platform Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.systemRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">10% commission</p>
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
                { id: 'users', label: 'User Management', icon: 'ri-user-settings-line' },
                { id: 'hotels', label: 'Hotel Control', icon: 'ri-hotel-line' },
                { id: 'approvals', label: 'Approvals', icon: 'ri-check-double-line' },
                { id: 'revenue', label: 'Revenue', icon: 'ri-line-chart-line' },
                { id: 'settings', label: 'System Settings', icon: 'ri-settings-3-line' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 text-sm font-medium whitespace-nowrap cursor-pointer border-b-2 ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600'
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {recentActivity.map(activity => (
                        <div key={activity.id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start">
                            <div className={`${getActivityColor(activity.status)} mr-3 mt-1`}>
                              <i className={`${getActivityIcon(activity.type)} w-5 h-5 flex items-center justify-center`}></i>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{activity.message}</p>
                              <p className="text-sm text-gray-600">{activity.user} • {activity.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <Link href="/super-admin/users" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="bg-blue-100 rounded-lg p-3 mr-4">
                          <i className="ri-user-settings-line text-blue-600 w-5 h-5 flex items-center justify-center"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Manage Users</p>
                          <p className="text-sm text-gray-600">View and control all user accounts</p>
                        </div>
                      </Link>

                      <Link href="/super-admin/hotel-approvals" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="bg-yellow-100 rounded-lg p-3 mr-4">
                          <i className="ri-check-double-line text-yellow-600 w-5 h-5 flex items-center justify-center"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Hotel Approvals</p>
                          <p className="text-sm text-gray-600">{stats.pendingApprovals} pending approvals</p>
                        </div>
                      </Link>

                      <Link href="/super-admin/revenue" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="bg-green-100 rounded-lg p-3 mr-4">
                          <i className="ri-line-chart-line text-green-600 w-5 h-5 flex items-center justify-center"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Revenue Analytics</p>
                          <p className="text-sm text-gray-600">Platform earnings and commission</p>
                        </div>
                      </Link>

                      <Link href="/super-admin/system-settings" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="bg-purple-100 rounded-lg p-3 mr-4">
                          <i className="ri-settings-3-line text-purple-600 w-5 h-5 flex items-center justify-center"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">System Settings</p>
                          <p className="text-sm text-gray-600">Configure platform settings</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">User Management</h2>
                  <Link href="/super-admin/users" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">
                    Full User Control
                  </Link>
                </div>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <i className="ri-user-settings-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Complete User Control</h3>
                  <p className="text-gray-600 mb-4">Manage all user accounts, permissions, and access levels</p>
                  <Link href="/super-admin/users" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">
                    Go to User Management
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'hotels' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Hotel Control Center</h2>
                  <Link href="/super-admin/hotels" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">
                    Full Hotel Control
                  </Link>
                </div>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <i className="ri-hotel-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Hotel Management System</h3>
                  <p className="text-gray-600 mb-4">Complete control over all hotels, approvals, and operations</p>
                  <Link href="/super-admin/hotels" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">
                    Go to Hotel Control
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'approvals' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Approval Management</h2>
                  <Link href="/super-admin/hotel-approvals" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">
                    Review Approvals
                  </Link>
                </div>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <i className="ri-check-double-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Approval System</h3>
                  <p className="text-gray-600 mb-4">Review and approve hotel registrations and major changes</p>
                  <Link href="/super-admin/hotel-approvals" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">
                    Go to Approvals
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'revenue' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Revenue Analytics</h2>
                  <Link href="/super-admin/revenue" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">
                    View Full Analytics
                  </Link>
                </div>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <i className="ri-line-chart-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Management</h3>
                  <p className="text-gray-600 mb-4">Track platform earnings, commissions, and financial performance</p>
                  <Link href="/super-admin/revenue" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">
                    Go to Revenue Analytics
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">System Settings</h2>
                  <Link href="/super-admin/system-settings" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">
                    Configure System
                  </Link>
                </div>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <i className="ri-settings-3-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">System Configuration</h3>
                  <p className="text-gray-600 mb-4">Configure platform settings, policies, and global parameters</p>
                  <Link href="/super-admin/system-settings" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">
                    Go to Settings
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