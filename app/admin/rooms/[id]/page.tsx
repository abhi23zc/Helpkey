'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

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
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    if (id) {
      const fetchRoom = async () => {
        try {
          const docRef = doc(db, 'rooms', id as string);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
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
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'occupied': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'maintenance': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'out of order': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Room Not Found</h3>
              <p className="text-gray-600 mb-4">The room you're looking for doesn't exist.</p>
              <button 
                onClick={() => router.back()} 
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{room.roomType}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(room.status)}`}>
                  <span className="mr-1">{getStatusIcon(room.status)}</span>
                  {room.status}
                </span>
              </div>
              <p className="text-lg text-gray-600 flex items-center gap-2">
                <span>🏨</span> {room.hotelName}
                <span className="text-gray-400">•</span>
                <span>Room {room.roomNumber}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => router.back()} 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <span>←</span> Back
              </button>
              <button 
                onClick={() => router.push(`/admin/rooms/${room.id}/edit`)} 
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
              >
                <span>✏️</span> Edit Room
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🏨</div>
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
                      <span className="text-gray-700">❮</span>
                    </button>
                    <button 
                      onClick={() => setSelectedImage(prev => prev < room.images.length - 1 ? prev + 1 : 0)}
                      className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                    >
                      <span className="text-gray-700">❯</span>
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
                          selectedImage === index ? 'border-blue-500 scale-105' : 'border-gray-200 hover:border-gray-300'
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
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">About This Room</h3>
              <p className="text-gray-600 leading-relaxed">{room.description}</p>
            </div>
          </div>

          {/* Room Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Price Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">${room.price}</p>
                  <p className="text-gray-600">per night</p>
                </div>
              </div>

              {/* Room Specs */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Specifications</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <span>📏</span> Size
                    </span>
                    <span className="font-semibold">{room.size} sq ft</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <span>🛏️</span> Beds
                    </span>
                    <span className="font-semibold">{room.beds}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <span>👥</span> Max Guests
                    </span>
                    <span className="font-semibold">{room.capacity} people</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <span>🔢</span> Room Number
                    </span>
                    <span className="font-semibold">#{room.roomNumber}</span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                {room.amenities && room.amenities.length > 0 ? (
                  <div className="space-y-2">
                    {room.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No amenities listed</p>
                )}
              </div>

              {/* Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all">
                    Book This Room
                  </button>
                  <button 
                    onClick={() => router.push(`/admin/rooms/${room.id}/edit`)}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
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