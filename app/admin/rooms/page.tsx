'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RoomManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const hotels = [
    { id: 1, name: "Grand Luxury Resort" },
    { id: 2, name: "City Center Business Hotel" },
    { id: 3, name: "Boutique Garden Hotel" },
    { id: 4, name: "Mountain View Lodge" },
    { id: 5, name: "Seaside Resort & Spa" }
  ];

  const rooms = [
    {
      id: 1,
      hotelId: 1,
      hotelName: "Grand Luxury Resort",
      roomType: "Ocean View Suite",
      roomNumber: "101",
      price: 399,
      size: "650 sq ft",
      beds: "1 King Bed",
      capacity: 2,
      status: "Available",
      amenities: ["Ocean View", "Balcony", "Mini Bar", "Marble Bathroom"],
      image: "https://readdy.ai/api/search-image?query=Luxury%20hotel%20ocean%20view%20suite%20with%20king%20bed%2C%20elegant%20decor%2C%20private%20balcony%2C%20marble%20bathroom%2C%20sophisticated%20furnishings%2C%20five%20star%20accommodation%2C%20stunning%20sea%20views&width=400&height=300&seq=admin-room-1&orientation=landscape"
    },
    {
      id: 2,
      hotelId: 1,
      hotelName: "Grand Luxury Resort",
      roomType: "Beachfront Villa",
      roomNumber: "201",
      price: 599,
      size: "1200 sq ft",
      beds: "2 Queen Beds",
      capacity: 4,
      status: "Occupied",
      amenities: ["Private Beach Access", "Outdoor Shower", "Kitchenette", "Terrace"],
      image: "https://readdy.ai/api/search-image?query=Beachfront%20villa%20with%20private%20terrace%2C%20outdoor%20shower%2C%20luxury%20furnishings%2C%20direct%20beach%20access%2C%20tropical%20paradise%2C%20premium%20accommodation%2C%20elegant%20design&width=400&height=300&seq=admin-room-2&orientation=landscape"
    },
    {
      id: 3,
      hotelId: 2,
      hotelName: "City Center Business Hotel",
      roomType: "Executive Suite",
      roomNumber: "301",
      price: 289,
      size: "800 sq ft",
      beds: "1 King Bed",
      capacity: 2,
      status: "Available",
      amenities: ["City View", "Work Area", "Executive Lounge Access", "Premium WiFi"],
      image: "https://readdy.ai/api/search-image?query=Executive%20hotel%20suite%20with%20city%20skyline%20views%2C%20modern%20business%20desk%2C%20king%20bed%2C%20sophisticated%20urban%20decor%2C%20professional%20atmosphere%2C%20luxury%20amenities&width=400&height=300&seq=admin-room-3&orientation=landscape"
    },
    {
      id: 4,
      hotelId: 2,
      hotelName: "City Center Business Hotel",
      roomType: "Business Room",
      roomNumber: "401",
      price: 189,
      size: "400 sq ft",
      beds: "1 Queen Bed",
      capacity: 2,
      status: "Maintenance",
      amenities: ["Work Desk", "Ergonomic Chair", "High-Speed Internet", "City View"],
      image: "https://readdy.ai/api/search-image?query=Modern%20business%20hotel%20room%20with%20work%20desk%2C%20queen%20bed%2C%20city%20views%2C%20professional%20decor%2C%20ergonomic%20furniture%2C%20business%20traveler%20amenities&width=400&height=300&seq=admin-room-4&orientation=landscape"
    },
    {
      id: 5,
      hotelId: 3,
      hotelName: "Boutique Garden Hotel",
      roomType: "Garden Suite",
      roomNumber: "501",
      price: 225,
      size: "550 sq ft",
      beds: "1 King Bed",
      capacity: 2,
      status: "Available",
      amenities: ["Garden View", "Fireplace", "Jacuzzi", "Private Patio"],
      image: "https://readdy.ai/api/search-image?query=Elegant%20boutique%20hotel%20garden%20suite%20with%20king%20bed%2C%20romantic%20decor%2C%20garden%20views%2C%20luxurious%20furnishings%2C%20intimate%20atmosphere%2C%20sophisticated%20design&width=400&height=300&seq=admin-room-5&orientation=landscape"
    },
    {
      id: 6,
      hotelId: 4,
      hotelName: "Mountain View Lodge",
      roomType: "Mountain View Room",
      roomNumber: "601",
      price: 149,
      size: "350 sq ft",
      beds: "1 Queen Bed",
      capacity: 2,
      status: "Available",
      amenities: ["Mountain View", "Fireplace", "Ski Storage", "Hot Tub Access"],
      image: "https://readdy.ai/api/search-image?query=Mountain%20lodge%20room%20with%20stunning%20mountain%20views%2C%20rustic%20luxury%20decor%2C%20fireplace%2C%20cozy%20atmosphere%2C%20ski%20resort%20accommodation%2C%20natural%20wood%20furnishings&width=400&height=300&seq=admin-room-6&orientation=landscape"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Occupied': return 'bg-blue-100 text-blue-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Order': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.hotelName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHotel = selectedHotel === 'all' || room.hotelId.toString() === selectedHotel;
    const matchesStatus = selectedStatus === 'all' || room.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesHotel && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
            <p className="text-gray-600 mt-2">Manage rooms across all hotels</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/admin" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
              Back to Dashboard
            </Link>
            <Link href="/admin/rooms/add" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
              Add New Room
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Rooms</label>
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-3 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by room type, number, or hotel..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Hotel</label>
              <select
                value={selectedHotel}
                onChange={(e) => setSelectedHotel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
              >
                <option value="all">All Hotels</option>
                {hotels.map(hotel => (
                  <option key={hotel.id} value={hotel.id.toString()}>{hotel.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="out of order">Out of Order</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-2">
                <i className="ri-check-line text-green-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-lg font-semibold text-gray-900">
                  {rooms.filter(r => r.status === 'Available').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-2">
                <i className="ri-user-line text-blue-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Occupied</p>
                <p className="text-lg font-semibold text-gray-900">
                  {rooms.filter(r => r.status === 'Occupied').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-2">
                <i className="ri-tools-line text-yellow-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Maintenance</p>
                <p className="text-lg font-semibold text-gray-900">
                  {rooms.filter(r => r.status === 'Maintenance').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-gray-100 rounded-lg p-2">
                <i className="ri-hotel-bed-line text-gray-600 text-lg w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Rooms</p>
                <p className="text-lg font-semibold text-gray-900">{rooms.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => (
            <div key={room.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative">
                <img
                  src={room.image}
                  alt={room.roomType}
                  className="w-full h-48 object-cover object-top"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Room {room.roomNumber}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{room.roomType}</h3>
                <p className="text-gray-600 text-sm mb-3">{room.hotelName}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Price per night</p>
                    <p className="text-lg font-semibold text-blue-600">${room.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Capacity</p>
                    <p className="text-lg font-semibold text-gray-900">{room.capacity} guests</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Room Details</p>
                  <p className="text-sm text-gray-700">{room.size} • {room.beds}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 3).map(amenity => (
                      <span key={amenity} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="text-gray-500 text-xs">+{room.amenities.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/admin/rooms/${room.id}`} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap text-center text-sm">
                    View Details
                  </Link>
                  <Link href={`/admin/rooms/${room.id}/edit`} className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap text-center text-sm">
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRooms.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <i className="ri-hotel-bed-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Rooms Found</h3>
            <p className="text-gray-600 mb-4">No rooms match your current search criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedHotel('all');
                setSelectedStatus('all');
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