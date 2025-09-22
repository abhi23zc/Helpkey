'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/config/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

interface Hotel {
  id: string;
  name: string;
  location: string;
  address: string;
  owner: string;
  ownerEmail: string;
  rooms: number;
  stars: number;
  status: string;
  approvalStatus: string;
  revenue: number;
  commission: number;
  occupancy: number;
  joinDate: string;
  lastUpdate: string;
  violations: number;
  images: string[];
  email: string;
  phone: string;
  createdAt: any;
  updatedAt: any;
}

export default function SuperAdminHotels() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const hotelsCollection = collection(db, 'hotels');
      const hotelsSnapshot = await getDocs(hotelsCollection);
      const hotelsData = hotelsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          location: data.location || '',
          address: data.address || '',
          owner: data.owner || 'Unknown Owner',
          ownerEmail: data.email || 'No email provided',
          rooms: data.totalRooms || 0,
          stars: parseInt(data.stars) || 0,
          status: data.status || 'active',
          approvalStatus: data.approved ? 'Approved' : 'Pending Review',
          revenue: data.revenue || 0,
          commission: data.commission || 0,
          occupancy: data.occupancy || 0,
          joinDate: data.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0] || new Date().toISOString().split('T')[0],
          lastUpdate: data.updatedAt?.toDate?.()?.toISOString?.()?.split('T')[0] || new Date().toISOString().split('T')[0],
          violations: data.violations || 0,
          images: data.images || [],
          email: data.email || '',
          phone: data.phone || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });
      setHotels(hotelsData);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      alert('Failed to load hotels. Please check your permissions.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending Review': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (hotelId: string, newStatus: string) => {
    setUpdating(hotelId);
    try {
      const hotelRef = doc(db, 'hotels', hotelId);
      await updateDoc(hotelRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setHotels(prevHotels => 
        prevHotels.map(hotel => 
          hotel.id === hotelId ? { ...hotel, status: newStatus } : hotel
        )
      );
      
      alert(`Hotel status successfully changed to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update hotel status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleApprovalChange = async (hotelId: string, newApproval: string) => {
    setUpdating(hotelId);
    try {
      const hotelRef = doc(db, 'hotels', hotelId);
      await updateDoc(hotelRef, {
        approved: newApproval === 'Approved',
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setHotels(prevHotels => 
        prevHotels.map(hotel => 
          hotel.id === hotelId ? { ...hotel, approvalStatus: newApproval } : hotel
        )
      );
      
      alert(`Hotel approval status successfully changed to ${newApproval}`);
    } catch (error) {
      console.error('Error updating approval:', error);
      alert('Failed to update hotel approval. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    if (confirm('Are you sure you want to permanently delete this hotel? This action cannot be undone.')) {
      setUpdating(hotelId);
      try {
        await deleteDoc(doc(db, 'hotels', hotelId));
        
        // Remove from local state
        setHotels(prevHotels => prevHotels.filter(hotel => hotel.id !== hotelId));
        
        alert('Hotel successfully deleted');
      } catch (error) {
        console.error('Error deleting hotel:', error);
        alert('Failed to delete hotel. Please try again.');
      } finally {
        setUpdating(null);
      }
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || hotel.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesOwner = selectedOwner === 'all' || hotel.owner === selectedOwner;
    return matchesSearch && matchesStatus && matchesOwner;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const uniqueOwners = [...new Set(hotels.map(h => h.owner))];

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
            <h1 className="text-3xl font-bold text-gray-900">Hotel Control Center</h1>
            <p className="text-gray-600 mt-2">Complete control over all hotel properties</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/super-admin" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
              Back to Dashboard
            </Link>
            <Link href="/super-admin/hotel-approvals" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">
              Review Approvals
            </Link>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-2">
                <i className="ri-hotel-line text-green-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Active Hotels</p>
                <p className="text-lg font-semibold text-gray-900">
                  {hotels.filter(h => h.status.toLowerCase() === 'active').length}
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
                  {hotels.filter(h => h.status.toLowerCase() === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-2">
                <i className="ri-error-warning-line text-red-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-lg font-semibold text-gray-900">
                  {hotels.filter(h => h.status.toLowerCase() === 'suspended').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-2">
                <i className="ri-hotel-bed-line text-blue-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Rooms</p>
                <p className="text-lg font-semibold text-gray-900">
                  {hotels.reduce((sum, h) => sum + h.rooms, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-2">
                <i className="ri-money-dollar-circle-line text-purple-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Commission</p>
                <p className="text-lg font-semibold text-gray-900">
                  ₹{hotels.reduce((sum, h) => sum + h.commission, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Hotels</label>
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-3 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, location, or owner..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Owner</label>
              <select
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm pr-8"
              >
                <option value="all">All Owners</option>
                {uniqueOwners.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map(hotel => (
            <div key={hotel.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative">
                <img
                  src={hotel.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={hotel.name}
                  className="w-full h-48 object-cover object-top"
                />
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hotel.status)}`}>
                    {hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalColor(hotel.approvalStatus)}`}>
                    {hotel.approvalStatus}
                  </span>
                </div>
                {hotel.violations > 0 && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                      {hotel.violations} Violations
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                  <div className="flex items-center">
                    {[...Array(hotel.stars)].map((_, i) => (
                      <i key={i} className="ri-star-fill text-yellow-400 text-sm w-4 h-4 flex items-center justify-center"></i>
                    ))}
                  </div>
                </div>

                <p className="text-gray-600 flex items-center mb-3">
                  <i className="ri-map-pin-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                  {hotel.location}
                </p>

                <div className="mb-4">
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="text-sm font-medium text-gray-900">{hotel.owner}</p>
                  <p className="text-sm text-gray-500">{hotel.ownerEmail}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Rooms</p>
                    <p className="text-lg font-semibold text-gray-900">{hotel.rooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Occupancy</p>
                    <p className="text-lg font-semibold text-gray-900">{hotel.occupancy}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-lg font-semibold text-green-600">₹{hotel.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Commission</p>
                    <p className="text-lg font-semibold text-blue-600">₹{hotel.commission.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    Joined: {formatDate(hotel.joinDate)} • Updated: {formatDate(hotel.lastUpdate)}
                  </p>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusChange(hotel.id, hotel.status === 'active' ? 'suspended' : 'active')}
                      disabled={updating === hotel.id}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap text-center ${
                        updating === hotel.id ? 'bg-gray-400' :
                        hotel.status === 'active'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      } disabled:cursor-not-allowed`}
                    >
                      {updating === hotel.id ? 'Updating...' : (hotel.status === 'active' ? 'Suspend' : 'Activate')}
                    </button>
                    <button
                      onClick={() => handleApprovalChange(hotel.id, 'Approved')}
                      disabled={updating === hotel.id || hotel.approvalStatus === 'Approved'}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap text-center text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {updating === hotel.id ? 'Updating...' : 'Approve'}
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/super-admin/hotels/${hotel.id}`} className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap text-center text-sm">
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDeleteHotel(hotel.id)}
                      disabled={updating === hotel.id}
                      className="flex-1 bg-red-100 text-red-800 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors cursor-pointer whitespace-nowrap text-center text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {updating === hotel.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredHotels.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <i className="ri-hotel-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hotels Found</h3>
            <p className="text-gray-600 mb-4">No hotels match your current search criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedOwner('all');
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