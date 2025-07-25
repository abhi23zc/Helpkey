'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SuperAdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const users = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      role: "Hotel Admin",
      status: "Active",
      joinDate: "2024-01-15",
      lastLogin: "2024-03-10",
      hotels: 2,
      bookings: 45,
      revenue: 12500,
      avatar: "https://readdy.ai/api/search-image?query=Professional%20business%20man%20portrait%2C%20confident%20smile%2C%20suit%20and%20tie%2C%20modern%20office%20background%2C%20executive%20headshot%2C%20corporate%20professional&width=100&height=100&seq=user-1&orientation=squarish"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      role: "Hotel Admin",
      status: "Active",
      joinDate: "2024-02-20",
      lastLogin: "2024-03-12",
      hotels: 1,
      bookings: 23,
      revenue: 8900,
      avatar: "https://readdy.ai/api/search-image?query=Professional%20business%20woman%20portrait%2C%20confident%20smile%2C%20business%20attire%2C%20modern%20office%20background%2C%20executive%20headshot%2C%20corporate%20professional&width=100&height=100&seq=user-2&orientation=squarish"
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      role: "Customer",
      status: "Active",
      joinDate: "2024-03-01",
      lastLogin: "2024-03-11",
      hotels: 0,
      bookings: 8,
      revenue: 0,
      avatar: "https://readdy.ai/api/search-image?query=Asian%20businessman%20portrait%2C%20professional%20headshot%2C%20business%20casual%20attire%2C%20modern%20background%2C%20confident%20expression%2C%20corporate%20style&width=100&height=100&seq=user-3&orientation=squarish"
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@email.com",
      role: "Hotel Admin",
      status: "Suspended",
      joinDate: "2024-01-10",
      lastLogin: "2024-03-05",
      hotels: 3,
      bookings: 67,
      revenue: 18200,
      avatar: "https://readdy.ai/api/search-image?query=Professional%20woman%20portrait%2C%20business%20executive%2C%20formal%20attire%2C%20confident%20pose%2C%20corporate%20headshot%2C%20modern%20office%20setting&width=100&height=100&seq=user-4&orientation=squarish"
    },
    {
      id: 5,
      name: "David Wilson",
      email: "david.wilson@email.com",
      role: "Customer",
      status: "Active",
      joinDate: "2024-02-15",
      lastLogin: "2024-03-09",
      hotels: 0,
      bookings: 12,
      revenue: 0,
      avatar: "https://readdy.ai/api/search-image?query=Professional%20man%20headshot%2C%20business%20casual%2C%20friendly%20smile%2C%20modern%20background%2C%20executive%20portrait%2C%20corporate%20professional&width=100&height=100&seq=user-5&orientation=squarish"
    },
    {
      id: 6,
      name: "Lisa Anderson",
      email: "lisa.anderson@email.com",
      role: "Hotel Admin",
      status: "Pending",
      joinDate: "2024-03-08",
      lastLogin: "2024-03-12",
      hotels: 0,
      bookings: 0,
      revenue: 0,
      avatar: "https://readdy.ai/api/search-image?query=Professional%20business%20woman%2C%20executive%20portrait%2C%20confident%20expression%2C%20modern%20office%20background%2C%20corporate%20headshot%2C%20business%20attire&width=100&height=100&seq=user-6&orientation=squarish"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Hotel Admin': return 'bg-blue-100 text-blue-800';
      case 'Customer': return 'bg-purple-100 text-purple-800';
      case 'Super Admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role.toLowerCase().includes(selectedRole.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || user.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleStatusChange = (userId: number, newStatus: string) => {
    console.log(`Changing user ${userId} status to ${newStatus}`);
    alert(`User status changed to ${newStatus}`);
  };

  const handleRoleChange = (userId: number, newRole: string) => {
    console.log(`Changing user ${userId} role to ${newRole}`);
    alert(`User role changed to ${newRole}`);
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      console.log(`Deleting user ${userId}`);
      alert('User deleted successfully');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Complete control over all user accounts</p>
          </div>
          <Link href="/super-admin" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            Back to Dashboard
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-2">
                <i className="ri-user-line text-blue-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-lg font-semibold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-2">
                <i className="ri-user-star-line text-green-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Hotel Admins</p>
                <p className="text-lg font-semibold text-gray-900">
                  {users.filter(u => u.role === 'Hotel Admin').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-2">
                <i className="ri-user-heart-line text-purple-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Customers</p>
                <p className="text-lg font-semibold text-gray-900">
                  {users.filter(u => u.role === 'Customer').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-2">
                <i className="ri-user-unfollow-line text-yellow-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-lg font-semibold text-gray-900">
                  {users.filter(u => u.status === 'Suspended').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-3 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm pr-8"
              >
                <option value="all">All Roles</option>
                <option value="hotel">Hotel Admin</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm pr-8"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover object-top"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                        <br />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>Joined: {formatDate(user.joinDate)}</div>
                        <div className="text-gray-500">Last: {formatDate(user.lastLogin)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>Hotels: {user.hotels}</div>
                        <div>Bookings: {user.bookings}</div>
                        {user.revenue > 0 && (
                          <div className="text-green-600 font-medium">${user.revenue.toLocaleString()}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(user.id, user.status === 'Active' ? 'Suspended' : 'Active')}
                          className={`px-3 py-1 rounded text-xs font-medium cursor-pointer whitespace-nowrap ${
                            user.status === 'Active'
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {user.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleRoleChange(user.id, user.role === 'Hotel Admin' ? 'Customer' : 'Hotel Admin')}
                          className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer whitespace-nowrap"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer whitespace-nowrap"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <i className="ri-user-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-600 mb-4">No users match your current search criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('all');
                setSelectedStatus('all');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
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