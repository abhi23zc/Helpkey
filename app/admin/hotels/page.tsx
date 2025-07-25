'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HotelManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');

  const hotels = [
    {
      id: 1,
      name: "Grand Luxury Resort",
      location: "Miami Beach, Florida",
      rooms: 45,
      stars: 5,
      status: "Active",
      revenue: 125000,
      occupancy: 85.5,
      image: "https://readdy.ai/api/search-image?query=Luxury%20beachfront%20resort%20hotel%20exterior%20with%20infinity%20pool%2C%20palm%20trees%2C%20modern%20architecture%2C%20ocean%20view%2C%20tropical%20paradise%2C%20white%20sand%20beach%2C%20elegant%20design%2C%20five%20star%20accommodation&width=400&height=300&seq=admin-hotel-1&orientation=landscape"
    },
    {
      id: 2,
      name: "City Center Business Hotel",
      location: "Downtown Manhattan, New York",
      rooms: 78,
      stars: 4,
      status: "Active",
      revenue: 198000,
      occupancy: 92.3,
      image: "https://readdy.ai/api/search-image?query=Modern%20business%20hotel%20in%20city%20center%2C%20sleek%20contemporary%20design%2C%20glass%20facade%2C%20urban%20setting%2C%20professional%20atmosphere%2C%20downtown%20location%2C%20sophisticated%20interior%2C%20four%20star%20accommodation&width=400&height=300&seq=admin-hotel-2&orientation=landscape"
    },
    {
      id: 3,
      name: "Boutique Garden Hotel",
      location: "Beverly Hills, California",
      rooms: 33,
      stars: 4,
      status: "Active",
      revenue: 89000,
      occupancy: 78.9,
      image: "https://readdy.ai/api/search-image?query=Boutique%20hotel%20with%20beautiful%20garden%20courtyard%2C%20elegant%20Victorian%20architecture%2C%20lush%20landscaping%2C%20intimate%20atmosphere%2C%20luxury%20amenities%2C%20charming%20facade%2C%20upscale%20neighborhood%20setting&width=400&height=300&seq=admin-hotel-3&orientation=landscape"
    },
    {
      id: 4,
      name: "Mountain View Lodge",
      location: "Aspen, Colorado",
      rooms: 28,
      stars: 3,
      status: "Maintenance",
      revenue: 45000,
      occupancy: 0,
      image: "https://readdy.ai/api/search-image?query=Mountain%20lodge%20hotel%20with%20wooden%20architecture%2C%20alpine%20setting%2C%20snow-capped%20peaks%2C%20rustic%20luxury%2C%20cozy%20atmosphere%2C%20ski%20resort%20location%2C%20natural%20materials%2C%20three%20star%20accommodation&width=400&height=300&seq=admin-hotel-4&orientation=landscape"
    },
    {
      id: 5,
      name: "Seaside Resort & Spa",
      location: "Malibu, California",
      rooms: 52,
      stars: 5,
      status: "Active",
      revenue: 156000,
      occupancy: 88.7,
      image: "https://readdy.ai/api/search-image?query=Seaside%20resort%20hotel%20with%20spa%20facilities%2C%20oceanfront%20location%2C%20luxury%20amenities%2C%20wellness%20center%2C%20peaceful%20atmosphere%2C%20coastal%20design%2C%20premium%20accommodation%2C%20five%20star%20service&width=400&height=300&seq=admin-hotel-5&orientation=landscape"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || hotel.status.toLowerCase() === filterBy.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'location':
        return a.location.localeCompare(b.location);
      case 'rooms':
        return b.rooms - a.rooms;
      case 'revenue':
        return b.revenue - a.revenue;
      case 'occupancy':
        return b.occupancy - a.occupancy;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hotel Management</h1>
            <p className="text-gray-600 mt-2">Manage your hotel properties</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/admin" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
              Back to Dashboard
            </Link>
            <Link href="/admin/hotels/add" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
              Add New Hotel
            </Link>
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
                  placeholder="Search by name or location..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
              >
                <option value="name">Name</option>
                <option value="location">Location</option>
                <option value="rooms">Number of Rooms</option>
                <option value="revenue">Revenue</option>
                <option value="occupancy">Occupancy Rate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedHotels.map(hotel => (
            <div key={hotel.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-48 object-cover object-top"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hotel.status)}`}>
                    {hotel.status}
                  </span>
                </div>
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

                <p className="text-gray-600 flex items-center mb-4">
                  <i className="ri-map-pin-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                  {hotel.location}
                </p>

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

                <div className="mb-4">
                  <p className="text-sm text-gray-500">Monthly Revenue</p>
                  <p className="text-lg font-semibold text-green-600">${hotel.revenue.toLocaleString()}</p>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/admin/hotels/${hotel.id}`} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap text-center text-sm">
                    View Details
                  </Link>
                  <Link href={`/admin/hotels/${hotel.id}/edit`} className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap text-center text-sm">
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedHotels.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <i className="ri-hotel-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hotels Found</h3>
            <p className="text-gray-600 mb-4">No hotels match your current search criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterBy('all');
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