'use client';

import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { geocodeAddress } from '@/utils/geocoding';
import { useGoogleMaps } from '@/context/GoogleMapsContext';

interface Hotel {
  id: string;
  name: string;
  address: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export default function AddCoordinatesPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const { isLoaded: isGoogleMapsLoaded } = useGoogleMaps();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!user || userData?.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [user, userData, router]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const hotelsCollectionRef = collection(db, 'hotels');
        const data = await getDocs(hotelsCollectionRef);

        const fetchedHotels: Hotel[] = data.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            name: d.name || 'Unnamed Hotel',
            address: d.address || '',
            location: d.location || '',
            latitude: d.latitude || d.lat,
            longitude: d.longitude || d.lng,
          };
        });

        setHotels(fetchedHotels);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hotels:', error);
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const handleAddCoordinates = async (hotel: Hotel) => {
    if (!isGoogleMapsLoaded) {
      alert('Google Maps is not loaded yet. Please wait...');
      return;
    }

    setUpdating(hotel.id);
    try {
      // Try to geocode the address
      const address = `${hotel.address}, ${hotel.location}`;
      const result = await geocodeAddress(address);
      
      if (result) {
        // Update the hotel with coordinates
        const hotelRef = doc(db, 'hotels', hotel.id);
        await updateDoc(hotelRef, {
          latitude: result.latitude,
          longitude: result.longitude,
        });

        // Update local state
        setHotels(prev => prev.map(h => 
          h.id === hotel.id 
            ? { ...h, latitude: result.latitude, longitude: result.longitude }
            : h
        ));

        alert(`✅ Coordinates added for ${hotel.name}: ${result.latitude}, ${result.longitude}`);
      } else {
        alert(`❌ Could not find coordinates for ${hotel.name}`);
      }
    } catch (error) {
      console.error('Error adding coordinates:', error);
      alert(`❌ Error adding coordinates for ${hotel.name}`);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotels...</p>
        </div>
      </div>
    );
  }

  const hotelsWithoutCoords = hotels.filter(hotel => !hotel.latitude || !hotel.longitude);
  const hotelsWithCoords = hotels.filter(hotel => hotel.latitude && hotel.longitude);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Coordinates to Hotels</h1>
          <p className="text-gray-600 mt-2">
            This tool helps you add latitude and longitude coordinates to hotels for location-based search.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-green-600 mb-2">
              ✅ Hotels with Coordinates ({hotelsWithCoords.length})
            </h2>
            <p className="text-gray-600 text-sm">
              These hotels can be found in location-based searches.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              ❌ Hotels without Coordinates ({hotelsWithoutCoords.length})
            </h2>
            <p className="text-gray-600 text-sm">
              These hotels need coordinates to appear in nearby searches.
            </p>
          </div>
        </div>

        {hotelsWithoutCoords.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Hotels Needing Coordinates</h2>
              <p className="text-gray-600 text-sm mt-1">
                Click "Add Coordinates" to automatically geocode the hotel's address.
              </p>
            </div>
            <div className="divide-y">
              {hotelsWithoutCoords.map((hotel) => (
                <div key={hotel.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">
                        <strong>Address:</strong> {hotel.address}
                      </p>
                      <p className="text-gray-600 text-sm">
                        <strong>Location:</strong> {hotel.location}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddCoordinates(hotel)}
                      disabled={updating === hotel.id || !isGoogleMapsLoaded}
                      className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {updating === hotel.id ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Adding...</span>
                        </div>
                      ) : (
                        'Add Coordinates'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hotelsWithoutCoords.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-green-600 text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">All Set!</h2>
            <p className="text-green-700">
              All hotels have coordinates. Location-based search should work perfectly now!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

