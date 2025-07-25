'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HotelApprovals() {
  const [selectedTab, setSelectedTab] = useState('pending');

  const pendingApprovals = [
    {
      id: 1,
      hotelName: "Oceanfront Paradise Resort",
      location: "Malibu, California",
      owner: "David Wilson",
      ownerEmail: "david.wilson@email.com",
      submittedDate: "2024-03-08",
      rooms: 52,
      stars: 5,
      description: "A luxury oceanfront resort featuring private beach access, world-class spa facilities, and premium accommodations with stunning Pacific Ocean views.",
      images: [
        "https://readdy.ai/api/search-image?query=Luxury%20oceanfront%20resort%20hotel%20with%20private%20beach%2C%20infinity%20pool%2C%20palm%20trees%2C%20tropical%20paradise%2C%20premium%20accommodation%2C%20stunning%20ocean%20views%2C%20five%20star%20service%2C%20modern%20architecture&width=400&height=300&seq=approval-1-1&orientation=landscape",
        "https://readdy.ai/api/search-image?query=Resort%20hotel%20lobby%20with%20elegant%20decor%2C%20marble%20floors%2C%20crystal%20chandeliers%2C%20luxury%20furnishings%2C%20sophisticated%20interior%20design%2C%20five%20star%20accommodation%2C%20premium%20hospitality&width=400&height=300&seq=approval-1-2&orientation=landscape"
      ],
      amenities: ["Private Beach Access", "Infinity Pool", "Spa & Wellness", "Fine Dining", "Concierge Service", "Valet Parking"],
      requestType: "New Hotel Registration",
      status: "Pending Review",
      priority: "High"
    },
    {
      id: 2,
      hotelName: "Historic Downtown Inn",
      location: "Boston, Massachusetts",
      owner: "Lisa Anderson",
      ownerEmail: "lisa.anderson@email.com",
      submittedDate: "2024-03-10",
      rooms: 24,
      stars: 3,
      description: "A charming historic inn located in the heart of downtown Boston, featuring restored 19th-century architecture and modern amenities.",
      images: [
        "https://readdy.ai/api/search-image?query=Historic%20boutique%20hotel%20in%20downtown%20area%2C%20classic%20architecture%2C%20restored%20building%2C%20traditional%20charm%2C%20urban%20location%2C%20heritage%20design%2C%20cozy%20atmosphere%2C%20three%20star%20accommodation&width=400&height=300&seq=approval-2-1&orientation=landscape",
        "https://readdy.ai/api/search-image?query=Historic%20hotel%20interior%20with%20classic%20decor%2C%20vintage%20furnishings%2C%20traditional%20design%2C%20elegant%20atmosphere%2C%20heritage%20building%2C%20boutique%20accommodation%2C%20refined%20ambiance&width=400&height=300&seq=approval-2-2&orientation=landscape"
      ],
      amenities: ["Free WiFi", "Business Center", "Continental Breakfast", "Pet Friendly", "Fitness Center"],
      requestType: "Hotel Update Review",
      status: "Under Review",
      priority: "Medium"
    },
    {
      id: 3,
      hotelName: "Mountain Peak Resort",
      location: "Jackson Hole, Wyoming",
      owner: "Robert Taylor",
      ownerEmail: "robert.taylor@email.com",
      submittedDate: "2024-03-12",
      rooms: 67,
      stars: 4,
      description: "A premier mountain resort offering year-round outdoor activities, luxury accommodations, and breathtaking views of the Teton Range.",
      images: [
        "https://readdy.ai/api/search-image?query=Mountain%20resort%20hotel%20with%20stunning%20mountain%20views%2C%20alpine%20architecture%2C%20luxury%20accommodations%2C%20ski%20resort%2C%20natural%20setting%2C%20four%20star%20service%2C%20outdoor%20activities&width=400&height=300&seq=approval-3-1&orientation=landscape",
        "https://readdy.ai/api/search-image?query=Mountain%20resort%20lobby%20with%20rustic%20luxury%20decor%2C%20stone%20fireplace%2C%20wooden%20beams%2C%20cozy%20atmosphere%2C%20alpine%20design%2C%20premium%20mountain%20accommodation&width=400&height=300&seq=approval-3-2&orientation=landscape"
      ],
      amenities: ["Ski-in/Ski-out", "Mountain View", "Spa Services", "Restaurant", "Outdoor Pool", "Fitness Center"],
      requestType: "New Hotel Registration",
      status: "Pending Review",
      priority: "High"
    }
  ];

  const approvedHotels = [
    {
      id: 4,
      hotelName: "Grand Luxury Resort",
      location: "Miami Beach, Florida",
      owner: "John Smith",
      approvedDate: "2024-01-15",
      approvedBy: "Super Admin",
      status: "Approved",
      revenue: 125000,
      commission: 12500
    },
    {
      id: 5,
      hotelName: "City Center Business Hotel",
      location: "Downtown Manhattan, New York",
      owner: "Sarah Johnson",
      approvedDate: "2024-02-20",
      approvedBy: "Super Admin",
      status: "Approved",
      revenue: 198000,
      commission: 19800
    }
  ];

  const rejectedHotels = [
    {
      id: 6,
      hotelName: "Budget Motel Chain",
      location: "Generic Location",
      owner: "Rejected Owner",
      rejectedDate: "2024-03-01",
      rejectedBy: "Super Admin",
      reason: "Does not meet quality standards and documentation requirements",
      status: "Rejected"
    }
  ];

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

  const handleApprove = (hotelId: number) => {
    console.log(`Approving hotel ${hotelId}`);
    alert('Hotel approved successfully!');
  };

  const handleReject = (hotelId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      console.log(`Rejecting hotel ${hotelId} with reason: ${reason}`);
      alert('Hotel rejected successfully!');
    }
  };

  const handleRequestMoreInfo = (hotelId: number) => {
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
          <Link href="/super-admin" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            Back to Dashboard
          </Link>
        </div>

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
                {pendingApprovals.map(hotel => (
                  <div key={hotel.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{hotel.hotelName}</h3>
                        <p className="text-gray-600 flex items-center mt-1">
                          <i className="ri-map-pin-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                          {hotel.location}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(hotel.priority)}`}>
                          {hotel.priority} Priority
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hotel.status)}`}>
                          {hotel.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Owner Information</h4>
                          <p className="text-sm text-gray-900">{hotel.owner}</p>
                          <p className="text-sm text-gray-600">{hotel.ownerEmail}</p>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Hotel Details</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Rooms</p>
                              <p className="text-sm font-medium text-gray-900">{hotel.rooms}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Stars</p>
                              <div className="flex items-center">
                                {[...Array(hotel.stars)].map((_, i) => (
                                  <i key={i} className="ri-star-fill text-yellow-400 text-sm w-4 h-4 flex items-center justify-center"></i>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Submitted</p>
                              <p className="text-sm font-medium text-gray-900">{formatDate(hotel.submittedDate)}</p>
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
                            {hotel.amenities.map(amenity => (
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
                          {hotel.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${hotel.hotelName} ${index + 1}`}
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
                ))}
              </div>
            )}

            {selectedTab === 'approved' && (
              <div className="space-y-4">
                {approvedHotels.map(hotel => (
                  <div key={hotel.id} className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{hotel.hotelName}</h3>
                        <p className="text-gray-600">{hotel.location}</p>
                        <p className="text-sm text-gray-500">Owner: {hotel.owner}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Approved: {formatDate(hotel.approvedDate)}</p>
                        <p className="text-sm text-gray-500">By: {hotel.approvedBy}</p>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Revenue: ${hotel.revenue.toLocaleString()}</p>
                          <p className="text-sm text-green-600 font-medium">Commission: ${hotel.commission.toLocaleString()}</p>
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
                        <h3 className="text-lg font-semibold text-gray-900">{hotel.hotelName}</h3>
                        <p className="text-gray-600">{hotel.location}</p>
                        <p className="text-sm text-gray-500">Owner: {hotel.owner}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Rejected: {formatDate(hotel.rejectedDate)}</p>
                        <p className="text-sm text-gray-500">By: {hotel.rejectedBy}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-red-200">
                      <p className="text-sm text-gray-700">
                        <strong>Reason:</strong> {hotel.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}