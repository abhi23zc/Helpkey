'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
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
  description?: string;
}

export default function RoomDetails() {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [accessDenied, setAccessDenied] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    if (id && user?.uid) {
      const fetchRoom = async () => {
        try {
          const docRef = doc(db, 'rooms', id as string);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Check if the room belongs to the current user
            if (data.hotelAdmin !== user.uid) {
              setAccessDenied(true);
              setLoading(false);
              return;
            }
            
            const processedRoom: Room = {
              id: docSnap.id,
              ...data,
              // Fix image URLs by removing backticks and extra spaces
              images: Array.isArray(data.images) ? data.images.map((url: string) => 
                url.replace(/[`\s]/g, '').trim()
              ).filter(Boolean) : [],
              description: data.description || 'Experience luxury and comfort in this beautifully designed room with premium amenities and stunning views.'
            } as Room;
            
            setRoom(processedRoom);
          } else {
            console.log('Room not found');
          }
        } catch (error) {
          console.error('Error fetching room:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchRoom();
    }
  }, [id, user?.uid]);

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
      case 'available': return '✅';
      case 'occupied': return '👥';
      case 'maintenance': return '🔧';
      case 'out of order': return '⚠️';
      default: return '🏨';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Loading room details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-12">
              <i className="ri-shield-cross-line text-6xl text-red-400 w-16 h-16 flex items-center justify-center mx-auto mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600 mb-4">You don't have permission to view this room.</p>
              <button 
                onClick={() => router.push('/admin/rooms')} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Back to Rooms
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-12">
              <i className="ri-error-warning-line text-6xl text-gray-400 w-16 h-16 flex items-center justify-center mx-auto mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Room Not Found</h3>
              <p className="text-gray-600 mb-4">The room you're looking for doesn't exist.</p>
              <button 
                onClick={() => router.back()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Go Back
              </button>
            </div>
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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{room.roomType}</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                {room.status}
              </span>
            </div>
            <p className="text-gray-600 flex items-center gap-2">
              <i className="ri-hotel-line w-4 h-4 flex items-center justify-center"></i>
              {room.hotelName}
              <span className="text-gray-400">•</span>
              <span>Room {room.roomNumber}</span>
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => router.back()} 
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Back to Rooms
            </button>
            <button 
              onClick={() => router.push(`/admin/rooms/${room.id}/edit`)} 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Edit Room
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Main Image */}
              <div className="relative h-96 bg-gray-100">
                {room.images && room.images.length > 0 ? (
                  <img 
                    src={room.images[selectedImage]} 
                    alt={`${room.roomType} - Image ${selectedImage + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/800x600/E5E7EB/9CA3AF?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <i className="ri-image-line text-6xl text-gray-400 w-16 h-16 flex items-center justify-center mx-auto mb-4"></i>
                      <p className="text-gray-600">No images available</p>
                    </div>
                  </div>
                )}
                
                {/* Image Navigation */}
                {room.images && room.images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <button 
                      onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : room.images.length - 1)}
                      className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                    >
                      <i className="ri-arrow-left-line text-gray-700 w-5 h-5 flex items-center justify-center"></i>
                    </button>
                    <button 
                      onClick={() => setSelectedImage(prev => prev < room.images.length - 1 ? prev + 1 : 0)}
                      className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                    >
                      <i className="ri-arrow-right-line text-gray-700 w-5 h-5 flex items-center justify-center"></i>
                    </button>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {room.images && room.images.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {room.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img 
                          src={image} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/80x80/E5E7EB/9CA3AF?text=🖼️';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Room</h3>
              <p className="text-gray-600 leading-relaxed">{room.description}</p>
            </div>
          </div>

          {/* Room Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Price Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">₹{room.price}</p>
                  <p className="text-gray-600">per night</p>
                </div>
              </div>

              {/* Room Specs */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Specifications</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <i className="ri-ruler-line w-4 h-4 flex items-center justify-center"></i> Size
                    </span>
                    <span className="font-semibold">{room.size} sq ft</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <i className="ri-hotel-bed-line w-4 h-4 flex items-center justify-center"></i> Beds
                    </span>
                    <span className="font-semibold">{room.beds}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <i className="ri-user-line w-4 h-4 flex items-center justify-center"></i> Max Guests
                    </span>
                    <span className="font-semibold">{room.capacity} people</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <i className="ri-hashtag w-4 h-4 flex items-center justify-center"></i> Room Number
                    </span>
                    <span className="font-semibold">#{room.roomNumber}</span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                {room.amenities && room.amenities.length > 0 ? (
                  <div className="space-y-2">
                    {room.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <i className="ri-check-line text-green-500 w-4 h-4 flex items-center justify-center"></i>
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No amenities listed</p>
                )}
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                    Book This Room
                  </button>
                  <button 
                    onClick={() => router.push(`/admin/rooms/${room.id}/edit`)}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Edit Room Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}