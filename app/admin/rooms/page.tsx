'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/config/firebase';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface Room {
  id: string;
  amenities: string[];
  beds: string;
  capacity: number;
  hotelAdmin: string;
  hotelId: string;
  hotelName: string;
  images: string[];
  price: number;
  roomNumber: string;
  roomType: string;
  size: string;
  status: string;
}

interface Hotel {
  id: string;
  name: string;
}

export default function RoomManagement() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        // Fetch only hotels owned by the current user
        const hotelsQuery = query(
          collection(db, 'hotels'),
          where('hotelAdmin', '==', user.uid)
        );
        const hotelsSnapshot = await getDocs(hotelsQuery);
        const hotelsData = hotelsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          name: doc.data().name || doc.data().hotelName || 'Unnamed Hotel'
        }));
        setHotels(hotelsData);

        // Fetch only rooms from hotels owned by the current user
        const roomsQuery = query(
          collection(db, 'rooms'),
          where('hotelAdmin', '==', user.uid)
        );
        const roomsSnapshot = await getDocs(roomsQuery);
        const roomsData = roomsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Fix image URLs by removing backticks and extra spaces
            images: Array.isArray(data.images) ? data.images.map((url: string) => 
              url.replace(/[`\s]/g, '').trim()
            ).filter(Boolean) : []
          } as Room;
        });
        setRooms(roomsData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.uid]);

  const handleDelete = async (roomId: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteDoc(doc(db, 'rooms', roomId));
        setRooms(rooms.filter(room => room.id !== roomId));
      } catch (error) {
        console.error('Error deleting room: ', error);
        alert('Failed to delete room.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out of order': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available': return '✓';
      case 'occupied': return '👥';
      case 'maintenance': return '🔧';
      case 'out of order': return '⚠️';
      default: return '❓';
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.hotelName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHotel = selectedHotel === 'all' || room.hotelId === selectedHotel;
    const matchesStatus = selectedStatus === 'all' || room.status?.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesHotel && matchesStatus;
  });

  const stats = {
    available: rooms.filter(r => r.status?.toLowerCase() === 'available').length,
    occupied: rooms.filter(r => r.status?.toLowerCase() === 'occupied').length,
    maintenance: rooms.filter(r => r.status?.toLowerCase() === 'maintenance').length,
    total: rooms.length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Loading rooms...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
            <p className="text-gray-600 mt-2">Manage and monitor all hotel rooms efficiently</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <i className="ri-hotel-line text-2xl text-blue-600 w-6 h-6 flex items-center justify-center"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-3xl font-bold text-green-600">{stats.available}</p>
              </div>
              <div className="bg-green-100 rounded-lg p-3">
                <i className="ri-check-line text-2xl text-green-600 w-6 h-6 flex items-center justify-center"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-3xl font-bold text-blue-600">{stats.occupied}</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <i className="ri-user-line text-2xl text-blue-600 w-6 h-6 flex items-center justify-center"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.maintenance}</p>
              </div>
              <div className="bg-yellow-100 rounded-lg p-3">
                <i className="ri-tools-line text-2xl text-yellow-600 w-6 h-6 flex items-center justify-center"></i>
              </div>
            </div>
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
                  <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
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

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Loading rooms...</p>
          </div>
        )}

        {/* Rooms Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => (
              <div key={room.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={room.images[0]}
                      alt={room.roomType}
                      className="w-full h-48 object-cover object-top"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300/E5E7EB/9CA3AF?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                      {room.status || 'Unknown'}
                    </span>
                  </div>
                  {room.images && room.images.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      +{room.images.length - 1} more
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{room.roomType}</h3>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">₹{room.price}</p>
                      <p className="text-sm text-gray-500">per night</p>
                    </div>
                  </div>

                  <p className="text-gray-600 flex items-center mb-2">
                    <i className="ri-hotel-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                    {room.hotelName}
                  </p>
                  <p className="text-gray-500 flex items-center mb-2">
                    <i className="ri-door-open-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                    Room {room.roomNumber}
                  </p>

                  {/* Room Details */}
                  <div className="mb-2">
                    <p className="text-sm text-gray-500">Room Details</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{room.beds}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{room.capacity} guests</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">{room.size}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-500">Amenities</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {room.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{amenity}</span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">+{room.amenities.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 mt-4">
                    <Link href={`/admin/rooms/${room.id}`} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap text-center text-sm">
                      View Details
                    </Link>
                    <Link 
                      href={`/admin/rooms/${room.id}/edit`}
                      className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap text-center text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="flex-1 border border-red-300 text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap text-center text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRooms.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <i className="ri-hotel-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
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