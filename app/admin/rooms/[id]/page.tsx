'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function RoomDetails() {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    if (id) {
      const fetchRoom = async () => {
        const docRef = doc(db, 'rooms', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRoom({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log('No such document!');
        }
        setLoading(false);
      };
      fetchRoom();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!room) {
    return <div>Room not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{room.roomType}</h1>
                <p className="text-lg text-gray-600">{room.hotelName}</p>
            </div>
            <div className="flex space-x-3">
                <button onClick={() => router.back()} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Back
                </button>
                <button onClick={() => router.push(`/admin/rooms/${id}/edit`)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Edit Room
                </button>
            </div>
          </div>

          <div className="mt-8">
            <img src={room.image} alt={room.roomType} className="w-full h-64 object-cover rounded-lg mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Room Details</h3>
                    <ul className="mt-2 space-y-2 text-gray-600">
                        <li><strong>Room Number:</strong> {room.roomNumber}</li>
                        <li><strong>Price:</strong> ${room.price}/night</li>
                        <li><strong>Size:</strong> {room.size}</li>
                        <li><strong>Beds:</strong> {room.beds}</li>
                        <li><strong>Capacity:</strong> {room.capacity} people</li>
                        <li><strong>Status:</strong> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${room.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{room.status}</span></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Amenities</h3>
                    <ul className="mt-2 space-y-2 text-gray-600 list-disc list-inside">
                        {room.amenities.map((amenity, index) => (
                            <li key={index}>{amenity}</li>
                        ))}
                    </ul>
                </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}