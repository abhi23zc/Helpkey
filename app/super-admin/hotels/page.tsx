'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SuperAdminHotels() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOwner, setSelectedOwner] = useState('all');

  const hotels = [
    {
      id: 1,
      name: "Grand Luxury Resort",
      location: "Miami Beach, Florida",
      owner: "John Smith",
      ownerEmail: "john.smith@email.com",
      rooms: 45,
      stars: 5,
      status: "Active",
      approvalStatus: "Approved",
      revenue: 125000,
      commission: 12500,
      occupancy: 85.5,
      joinDate: "2024-01-15",
      lastUpdate: "2024-03-10",
      violations: 0,
      image: "https://readdy.ai/api/search-image?query=Luxury%20beachfront%20resort%20hotel%20exterior%20with%20infinity%20pool%2C%20palm%20trees%2C%20modern%20architecture%2C%20ocean%20view%2C%20tropical%20paradise%2C%20white%20sand%20beach%2C%20elegant%20design%2C%20five%20star%20accommodation&width=400&height=300&seq=super-hotel-1&orientation=landscape"
    },
    {
      id: 2,
      name: "City Center Business Hotel",
      location: "Downtown Manhattan, New York",
      owner: "Sarah Johnson",
      ownerEmail: "sarah.johnson@email.com",
      rooms: 78,
      stars: 4,
      status: "Active",
      approvalStatus: "Approved",
      revenue: 198000,
      commission: 19800,
      occupancy: 92.3,
      joinDate: "2024-02-20",
      lastUpdate: "2024-03-12",
      violations: 0,
      image: "https://readdy.ai/api/search-image?query=Modern%20business%20hotel%20in%20city%20center%2C%20sleek%20contemporary%20design%2C%20glass%20facade%2C%20urban%20setting%2C%20professional%20atmosphere%2C%20downtown%20location%2C%20sophisticated%20interior%2C%20four%20star%20accommodation&width=400&height=300&seq=super-hotel-2&orientation=landscape"
    },
    {
      id: 3,
      name: "Boutique Garden Hotel",
      location: "Beverly Hills, California",
      owner: "Michael Chen",
      ownerEmail: "michael.chen@email.com",
      rooms: 33,
      stars: 4,
      status: "Active",
      approvalStatus: "Approved",
      revenue: 89000,
      commission: 8900,
      occupancy: 78.9,
      joinDate: "2024-03-01",
      lastUpdate: "2024-03-11",
      violations: 0,
      image: "https://readdy.ai/api/search-image?query=Boutique%20hotel%20with%20beautiful%20garden%20courtyard%2C%20elegant%20Victorian%20architecture%2C%20lush%20landscaping%2C%20intimate%20atmosphere%2C%20luxury%20amenities%2C%20charming%20facade%2C%20upscale%20neighborhood%20setting&width=400&height=300&seq=super-hotel-3&orientation=landscape"
    },
    {
      id: 4,
      name: "Mountain View Lodge",
      location: "Aspen, Colorado",
      owner: "Emily Davis",
      ownerEmail: "emily.davis@email.com",
      rooms: 28,
      stars: 3,
      status: "Suspended",
      approvalStatus: "Approved",
      revenue: 45000,
      commission: 4500,
      occupancy: 0,
      joinDate: "2024-01-10",
      lastUpdate: "2024-03-05",
      violations: 2,
      image: "https://readdy.ai/api/search-image?query=Mountain%20lodge%20hotel%20with%20wooden%20architecture%2C%20alpine%20setting%2C%20snow-capped%20peaks%2C%20rustic%20luxury%2C%20cozy%20atmosphere%2C%20ski%20resort%20location%2C%20natural%20materials%2C%20three%20star%20accommodation&width=400&height=300&seq=super-hotel-4&orientation=landscape"
    },
    {
      id: 5,
      name: "Oceanfront Paradise Resort",
      location: "Malibu, California",
      owner: "David Wilson",
      ownerEmail: "david.wilson@email.com",
      rooms: 52,
      stars: 5,
      status: "Pending",
      approvalStatus: "Pending Review",
      revenue: 0,
      commission: 0,
      occupancy: 0,
      joinDate: "2024-03-08",
      lastUpdate: "2024-03-12",
      violations: 0,
      image: "https://readdy.ai/api/search-image?query=Oceanfront%20resort%20hotel%20with%20private%20beach%2C%20luxury%20amenities%2C%20infinity%20pool%2C%20palm%20trees%2C%20tropical%20paradise%2C%20premium%20accommodation%2C%20stunning%20ocean%20views%2C%20five%20star%20service&width=400&height=300&seq=super-hotel-5&orientation=landscape"
    },
    {
      id: 6,
      name: "Historic Downtown Inn",
      location: "Boston, Massachusetts",
      owner: "Lisa Anderson",
      ownerEmail: "lisa.anderson@email.com",
      rooms: 24,
      stars: 3,
      status: "Active",
      approvalStatus: "Under Review",
      revenue: 34000,
      commission: 3400,
      occupancy: 65.2,
      joinDate: "2024-02-15",
      lastUpdate: "2024-03-09",
      violations: 1,
      image: "https://readdy.ai/api/search-image?query=Historic%20boutique%20hotel%20in%20downtown%20area%2C%20classic%20architecture%2C%20restored%20building%2C%20traditional%20charm%2C%20urban%20location%2C%20heritage%20design%2C%20cozy%20atmosphere%2C%20three%20star%20accommodation&width=400&height=300&seq=super-hotel-6&orientation=landscape"
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

  const getApprovalColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending Review': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const handleStatusChange = (hotelId: number, newStatus: string) => {
    console.log(`Changing hotel ${hotelId} status to ${newStatus}`);
    alert(`Hotel status changed to ${newStatus}`);
  };

  const handleApprovalChange = (hotelId: number, newApproval: string) => {
    console.log(`Changing hotel ${hotelId} approval to ${newApproval}`);
    alert(`Hotel approval status changed to ${newApproval}`);
  };

  const handleDeleteHotel = (hotelId: number) => {
    if (confirm('Are you sure you want to permanently delete this hotel? This action cannot be undone.')) {
      console.log(`Deleting hotel ${hotelId}`);
      alert('Hotel deleted successfully');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const uniqueOwners = [...new Set(hotels.map(h => h.owner))];

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
                  {hotels.filter(h => h.status === 'Active').length}
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
                  {hotels.filter(h => h.status === 'Pending').length}
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
                  {hotels.filter(h => h.status === 'Suspended').length}
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
                  ${hotels.reduce((sum, h) => sum + h.commission, 0).toLocaleString()}
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
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-48 object-cover object-top"
                />
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hotel.status)}`}>
                    {hotel.status}
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
                    <p className="text-lg font-semibold text-green-600">${hotel.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Commission</p>
                    <p className="text-lg font-semibold text-blue-600">${hotel.commission.toLocaleString()}</p>
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
                      onClick={() => handleStatusChange(hotel.id, hotel.status === 'Active' ? 'Suspended' : 'Active')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap text-center ${
                        hotel.status === 'Active'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {hotel.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleApprovalChange(hotel.id, 'Approved')}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap text-center text-sm"
                    >
                      Approve
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/super-admin/hotels/${hotel.id}`} className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap text-center text-sm">
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDeleteHotel(hotel.id)}
                      className="flex-1 bg-red-100 text-red-800 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors cursor-pointer whitespace-nowrap text-center text-sm"
                    >
                      Delete
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