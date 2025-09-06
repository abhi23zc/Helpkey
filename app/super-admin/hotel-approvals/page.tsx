'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { collection, getDocs, query, orderBy, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface HotelData {
  id: string;
  name: string;
  location: string;
  address: string;
  email: string;
  phone: string;
  hotelAdmin: string;
  description: string;
  stars: string;
  amenities: string[];
  images: string[];
  policies: {
    cancellation: string;
    checkIn: string;
    checkOut: string;
    pets: boolean;
    smoking: boolean;
  };
  approved: boolean;
  status: string;
  createdAt: any;
  updatedAt: any;
  addedAt: string;
  // Additional fields for approval workflow
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  priority?: string;
}

export default function HotelApprovals() {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch hotels from Firestore
  const fetchHotels = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const q = query(
        collection(db, 'hotels'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const hotelsData: HotelData[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HotelData));
      setHotels(hotelsData);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Failed to load hotels. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  // Filter hotels based on approval status
  const pendingApprovals = hotels.filter(hotel => !hotel.approved && hotel.status === 'active');
  const approvedHotels = hotels.filter(hotel => hotel.approved);
  const rejectedHotels = hotels.filter(hotel => hotel.status === 'rejected');


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Review': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async (hotelId: string) => {
    try {
      await updateDoc(doc(db, 'hotels', hotelId), {
        approved: true,
        approvedBy: 'Super Admin',
        approvedDate: new Date().toISOString(),
        updatedAt: new Date()
      });
      
      setHotels(prev => prev.map(hotel => 
        hotel.id === hotelId 
          ? { ...hotel, approved: true, approvedBy: 'Super Admin', approvedDate: new Date().toISOString() }
          : hotel
      ));
      
      alert('Hotel approved successfully!');
    } catch (error) {
      console.error('Error approving hotel:', error);
      alert('Failed to approve hotel');
    }
  };

  const handleReject = async (hotelId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        await updateDoc(doc(db, 'hotels', hotelId), {
          status: 'rejected',
          rejectedBy: 'Super Admin',
          rejectedDate: new Date().toISOString(),
          rejectionReason: reason,
          updatedAt: new Date()
        });
        
        setHotels(prev => prev.map(hotel => 
          hotel.id === hotelId 
            ? { 
                ...hotel, 
                status: 'rejected', 
                rejectedBy: 'Super Admin', 
                rejectedDate: new Date().toISOString(),
                rejectionReason: reason
              }
            : hotel
        ));
        
        alert('Hotel rejected successfully!');
      } catch (error) {
        console.error('Error rejecting hotel:', error);
        alert('Failed to reject hotel');
      }
    }
  };

  const handleRequestMoreInfo = (hotelId: string) => {
    const message = prompt('What additional information do you need?');
    if (message) {
      console.log(`Requesting more info for hotel ${hotelId}: ${message}`);
      alert('Request for additional information sent!');
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
            <h1 className="text-3xl font-bold text-gray-900">Hotel Approvals</h1>
            <p className="text-gray-600 mt-2">Review and approve hotel registrations</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchHotels(true)}
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
            <Link href="/super-admin" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading hotels...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <i className="ri-error-warning-line text-red-400 w-5 h-5 flex items-center justify-center mr-3 mt-0.5"></i>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading hotels</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-2">
                <i className="ri-time-line text-yellow-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-lg font-semibold text-gray-900">{pendingApprovals.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-2">
                <i className="ri-check-line text-green-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-lg font-semibold text-gray-900">{approvedHotels.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-2">
                <i className="ri-close-line text-red-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-lg font-semibold text-gray-900">{rejectedHotels.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'pending', label: 'Pending Review', count: pendingApprovals.length },
                { id: 'approved', label: 'Approved', count: approvedHotels.length },
                { id: 'rejected', label: 'Rejected', count: rejectedHotels.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center px-6 py-3 text-sm font-medium whitespace-nowrap cursor-pointer border-b-2 ${
                    selectedTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'pending' && (
              <div className="space-y-6">
                {pendingApprovals.map(hotel => {
                  const submittedDate = hotel.createdAt ? 
                    (hotel.createdAt.toDate ? hotel.createdAt.toDate() : new Date(hotel.createdAt)) : 
                    new Date();
                  
                  return (
                    <div key={hotel.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{hotel.name}</h3>
                          <p className="text-gray-600 flex items-center mt-1">
                            <i className="ri-map-pin-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                            {hotel.location}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('Pending Review')}`}>
                            Pending Review
                          </span>
                        </div>
                      </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
                          <p className="text-sm text-gray-900">{hotel.email}</p>
                          <p className="text-sm text-gray-600">{hotel.phone}</p>
                          <p className="text-sm text-gray-600">{hotel.address}</p>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Hotel Details</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Stars</p>
                              <div className="flex items-center">
                                {[...Array(parseInt(hotel.stars))].map((_, i) => (
                                  <i key={i} className="ri-star-fill text-yellow-400 text-sm w-4 h-4 flex items-center justify-center"></i>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <p className="text-sm font-medium text-gray-900 capitalize">{hotel.status}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Submitted</p>
                              <p className="text-sm font-medium text-gray-900">{formatDate(submittedDate.toISOString())}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                          <p className="text-sm text-gray-600">{hotel.description}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Amenities</h4>
                          <div className="flex flex-wrap gap-2">
                            {hotel.amenities?.map(amenity => (
                              <span key={amenity} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Hotel Images</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {hotel.images?.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${hotel.name} ${index + 1}`}
                              className="w-full h-32 object-cover object-top rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleRequestMoreInfo(hotel.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Request More Info
                      </button>
                      <button
                        onClick={() => handleReject(hotel.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(hotel.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Approve Hotel
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {selectedTab === 'approved' && (
              <div className="space-y-4">
                {approvedHotels.map(hotel => (
                  <div key={hotel.id} className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                        <p className="text-gray-600">{hotel.location}</p>
                        <p className="text-sm text-gray-500">Contact: {hotel.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Approved: {hotel.approvedDate ? formatDate(hotel.approvedDate) : 'N/A'}</p>
                        <p className="text-sm text-gray-500">By: {hotel.approvedBy || 'Super Admin'}</p>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Stars: {hotel.stars}</p>
                          <p className="text-sm text-green-600 font-medium">Status: {hotel.status}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'rejected' && (
              <div className="space-y-4">
                {rejectedHotels.map(hotel => (
                  <div key={hotel.id} className="bg-red-50 rounded-lg p-6 border border-red-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                        <p className="text-gray-600">{hotel.location}</p>
                        <p className="text-sm text-gray-500">Contact: {hotel.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Rejected: {hotel.rejectedDate ? formatDate(hotel.rejectedDate) : 'N/A'}</p>
                        <p className="text-sm text-gray-500">By: {hotel.rejectedBy || 'Super Admin'}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-red-200">
                      <p className="text-sm text-gray-700">
                        <strong>Reason:</strong> {hotel.rejectionReason || 'No reason provided'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      <Footer />
    </div>
  );
}