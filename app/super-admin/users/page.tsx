'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/config/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  where,
  getDocs
} from 'firebase/firestore';

interface User {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  photoURL: string;
  role: string;
  isBanned: boolean;
  createdAt: any;
  updatedAt: any;
  hotels?: number;
  bookings?: number;
  revenue?: number;
}

export default function SuperAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Real-time user data fetching
  useEffect(() => {
    const usersQuery = query(collection(db, 'users'));
    
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          uid: data.uid || doc.id,
          fullName: data.fullName || 'Unknown User',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          photoURL: data.photoURL || '',
          role: data.role || 'user',
          isBanned: data.isBanned || false,
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date(),
          hotels: data.hotels || 0,
          bookings: data.bookings || 0,
          revenue: data.revenue || 0,
        });
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      case 'hotel': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-orange-100 text-orange-800';
      case 'super-admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'hotel': return 'Hotel Admin';
      case 'user': return 'Customer';
      case 'admin': return 'Admin';
      case 'super-admin': return 'Super Admin';
      default: return role;
    }
  };

  const getUserStatus = (isBanned: boolean) => {
    if (isBanned) return 'Suspended';
    return 'Active';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'suspended' && user.isBanned) ||
                         (selectedStatus === 'active' && !user.isBanned);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleStatusChange = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isBanned: !currentStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatLastActivity = (timestamp: any) => {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return formatDate(timestamp);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
                  {users.filter(u => u.role === 'hotel').length}
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
                  {users.filter(u => u.role === 'user').length}
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
                  {users.filter(u => u.isBanned).length}
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
                <option value="user">Customer</option>
                <option value="hotel">Hotel Admin</option>
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
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
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
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
                          src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`;
                          }}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                        <br />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getUserStatus(user.isBanned))}`}>
                          {getUserStatus(user.isBanned)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {user.phoneNumber && <div>{user.phoneNumber}</div>}
                        {!user.phoneNumber && <div className="text-gray-400">No phone</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>Joined: {formatDate(user.createdAt)}</div>
                        <div className="text-gray-500">Last: {formatLastActivity(user.updatedAt)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(user.id, user.isBanned)}
                          className={`px-3 py-1 rounded text-xs font-medium cursor-pointer whitespace-nowrap ${
                            user.isBanned
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {user.isBanned ? 'Activate' : 'Suspend'}
                        </button>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer whitespace-nowrap border-none"
                        >
                          <option value="user">Customer</option>
                          <option value="hotel">Hotel Admin</option>
                          <option value="admin">Admin</option>
                          <option value="super-admin">Super Admin</option>
                        </select>
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