'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchForm from '@/components/SearchForm';
import { db } from '@/config/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

// Helper functions for safe data handling
function getSafeString(val: any, fallback = 'N/A') {
  if (typeof val === 'string' && val.trim() !== '') return val;
  return fallback;
}

function getSafeNumber(val: any, fallback = 0) {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string' && !isNaN(Number(val))) return Number(val);
  return fallback;
}

function getSafeArray(val: any, fallback: any[] = []) {
  if (Array.isArray(val)) return val;
  return fallback;
}

interface Room {
  id: string;
  type: string;
  price: number;
  size: string;
  beds: string;
  capacity: number;
  image: string | null;
  amenities: string[];
  originalPrice?: number;
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  address: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  stars: number;
  image: string;
  amenities: string[];
  approved: boolean;
  status: string;
  description: string;
  email: string;
  phone: string;
  rooms: Room[];
  policies: {
    cancellation?: string;
    checkIn?: string;
    checkOut?: string;
    pets?: boolean;
    smoking?: boolean;
  };
  latitude?: number;
  longitude?: number;
  distance?: number;
}

interface Destination {
  name: string;
  image: string;
  description: string;
  hotelCount: number;
  avgPrice: number;
  popular: boolean;
}

export default function Home() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyHotels, setNearbyHotels] = useState<Hotel[]>([]);
  const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalBookings: 0,
    happyCustomers: 0,
    destinations: 0
  });

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get user location
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Default to Delhi if location access denied
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      // Default to Delhi if geolocation not supported
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, [mounted]);

  // Fetch hotels and data
  useEffect(() => {
    if (!mounted) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all approved hotels
        const hotelsQuery = query(
          collection(db, 'hotels'),
          where('approved', '==', true),
          where('status', '==', 'active')
        );
        const hotelsSnapshot = await getDocs(hotelsQuery);
        
        const allHotels: Hotel[] = await Promise.all(
          hotelsSnapshot.docs.map(async (doc) => {
            const d = doc.data() as any;
            
            // Fetch rooms for this hotel
            const roomsQuery = query(
              collection(db, 'rooms'),
              where('hotelId', '==', doc.id)
            );
            const roomsSnapshot = await getDocs(roomsQuery);
            const rooms: Room[] = roomsSnapshot.docs.map(roomDoc => {
              const roomData = roomDoc.data();
              return {
                id: roomDoc.id,
                type: getSafeString(roomData.roomType, 'Standard Room'),
                price: getSafeNumber(roomData.price, 0),
                size: getSafeString(roomData.size, ''),
                beds: getSafeString(roomData.beds, ''),
                capacity: getSafeNumber(roomData.capacity, 2),
                image: roomData.images?.[0] || null,
                amenities: getSafeArray(roomData.amenities, []),
                originalPrice: getSafeNumber(roomData.originalPrice, roomData.price || 0),
              };
            });

            // Calculate minimum room prices
            const roomPrices = rooms.map(room => room.price).filter(price => price > 0);
            const roomOriginalPrices = rooms.map(room => room.originalPrice || room.price).filter(price => price > 0);
            
            const minPrice = roomPrices.length > 0 ? Math.min(...roomPrices) : 0;
            const minOriginalPrice = roomOriginalPrices.length > 0 ? Math.min(...roomOriginalPrices) : minPrice;

            return {
              id: doc.id,
              name: getSafeString(d.name, 'Unnamed Hotel'),
              location: getSafeString(d.location, 'Unknown Location'),
              address: getSafeString(d.address, ''),
              price: minPrice,
              originalPrice: minOriginalPrice,
              rating: getSafeNumber(d.rating, 0),
              reviews: getSafeNumber(d.reviews, 0),
              stars: getSafeNumber(d.stars, 0),
              image: getSafeString(d.images?.[0], 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'),
              amenities: getSafeArray(d.amenities, []),
              approved: d.approved || false,
              status: getSafeString(d.status, 'inactive'),
              description: getSafeString(d.description, ''),
              email: getSafeString(d.email, ''),
              phone: getSafeString(d.phone, ''),
              rooms: rooms,
              policies: {
                cancellation: getSafeString(d.policies?.cancellation, ''),
                checkIn: getSafeString(d.policies?.checkIn, ''),
                checkOut: getSafeString(d.policies?.checkOut, ''),
                pets: d.policies?.pets || false,
                smoking: d.policies?.smoking || false,
              },
              latitude: getSafeNumber(d.latitude),
              longitude: getSafeNumber(d.longitude),
            };
          })
        );

        // Get featured hotels (top rated)
        const featured = allHotels
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 6);
        setFeaturedHotels(featured);

        // Get nearby hotels if location available
        if (userLocation) {
          const nearby = allHotels
            .filter(hotel => hotel.latitude && hotel.longitude)
            .map(hotel => ({
              ...hotel,
              distance: calculateDistance(
                userLocation.lat,
                userLocation.lng,
                hotel.latitude!,
                hotel.longitude!
              )
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 8);
          setNearbyHotels(nearby);
        }

        // Create destinations data
        const destinationsData: Destination[] = [
          {
            name: 'Mumbai',
            image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
            description: 'The financial capital with stunning beaches and vibrant nightlife',
            hotelCount: allHotels.filter(h => h.location.toLowerCase().includes('mumbai')).length || 150,
            avgPrice: 3500,
            popular: true
          },
          {
            name: 'Delhi',
            image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
            description: 'Historic capital city with rich culture and heritage',
            hotelCount: allHotels.filter(h => h.location.toLowerCase().includes('delhi')).length || 200,
            avgPrice: 2800,
            popular: true
          },
          {
            name: 'Goa',
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
            description: 'Tropical paradise with golden beaches and laid-back vibes',
            hotelCount: allHotels.filter(h => h.location.toLowerCase().includes('goa')).length || 120,
            avgPrice: 2200,
            popular: true
          },
          {
            name: 'Bangalore',
            image: 'https://images.unsplash.com/photo-1529258283598-8d6fe60b27f4?auto=format&fit=crop&w=600&q=80',
            description: 'Tech hub with modern amenities and pleasant weather',
            hotelCount: allHotels.filter(h => h.location.toLowerCase().includes('bangalore')).length || 180,
            avgPrice: 3200,
            popular: true
          },
          {
            name: 'Jaipur',
            image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
            description: 'The Pink City with royal palaces and rich history',
            hotelCount: allHotels.filter(h => h.location.toLowerCase().includes('jaipur')).length || 90,
            avgPrice: 1800,
            popular: true
          },
          {
            name: 'Kerala',
            image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
            description: 'God\'s Own Country with backwaters and lush greenery',
            hotelCount: allHotels.filter(h => h.location.toLowerCase().includes('kerala')).length || 80,
            avgPrice: 2500,
            popular: true
          }
        ];
        setDestinations(destinationsData);

        // Set statistics with real data
        setStats({
          totalHotels: allHotels.length,
          totalBookings: allHotels.reduce((sum, hotel) => sum + hotel.reviews, 0), // Use reviews as booking indicator
          happyCustomers: allHotels.reduce((sum, hotel) => sum + hotel.reviews, 0), // Use reviews as happy customers
          destinations: destinationsData.length
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userLocation !== null) {
      fetchData();
    }
  }, [userLocation, mounted]);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleHotelClick = (hotelId: string) => {
    router.push(`/hotels/${hotelId}`);
  };

  const handleDestinationClick = (destination: string) => {
    router.push(`/hotels?location=${encodeURIComponent(destination)}`);
  };

  // Show loading during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80')`
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Find Your Perfect Stay
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed">
              Discover amazing hotels, resorts, and accommodations with the best prices guaranteed. 
              {mounted && stats.totalHotels > 0 && ` Over ${stats.totalHotels.toLocaleString()} hotels worldwide.`}
            </p>
            <div className="mt-6 sm:mt-8 max-w-4xl mx-auto">
              <SearchForm />
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-8 sm:mt-12 lg:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-5xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 lg:p-6">
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">{mounted ? `${stats.totalHotels.toLocaleString()}+` : '0+'}</div>
                <div className="text-xs sm:text-sm text-white/80">Hotels</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 lg:p-6">
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">{mounted ? `${stats.totalBookings.toLocaleString()}+` : '0+'}</div>
                <div className="text-xs sm:text-sm text-white/80">Bookings</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 lg:p-6">
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">{mounted ? `${stats.happyCustomers.toLocaleString()}+` : '0+'}</div>
                <div className="text-xs sm:text-sm text-white/80">Happy Customers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 lg:p-6">
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">{mounted ? `${stats.destinations}+` : '0+'}</div>
                <div className="text-xs sm:text-sm text-white/80">Destinations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm sm:text-base text-gray-600">Loading hotels...</p>
            </div>
          </div>
        </section>
      )}

      {/* Nearby Hotels Section */}
      {!loading && nearbyHotels.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Hotels Near You
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                Discover amazing accommodations close to your location
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {nearbyHotels.slice(0, 4).map((hotel) => (
                <div 
                  key={hotel.id}
                  onClick={() => handleHotelClick(hotel.id)}
                  className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative">
                    <img 
                      src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'}
                      alt={hotel.name}
                      className="w-full h-40 sm:h-48 lg:h-52 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium">
                      {hotel.distance?.toFixed(1)} km
                    </div>
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      {hotel.stars}★
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 lg:p-5">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {hotel.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">{hotel.location}</p>
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${i < hotel.stars ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-xs sm:text-sm text-gray-600">
                        {hotel.rating} ({hotel.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-base sm:text-lg font-bold text-blue-600">
                          ₹{hotel.price ? hotel.price.toLocaleString() : '0'}
                        </span>
                        {hotel.originalPrice && hotel.originalPrice > hotel.price && (
                          <span className="ml-2 text-xs sm:text-sm text-gray-500 line-through">
                            ₹{hotel.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Hotels Section */}
      {!loading && featuredHotels.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Featured Hotels
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                Handpicked accommodations with exceptional ratings and reviews
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredHotels.map((hotel) => (
                <div 
                  key={hotel.id}
                  onClick={() => handleHotelClick(hotel.id)}
                  className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative">
                    <img 
                      src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'}
                      alt={hotel.name}
                      className="w-full h-48 sm:h-56 lg:h-64 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Featured
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 lg:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                      {hotel.name}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3">{hotel.location}</p>
                    <p className="text-xs sm:text-sm text-gray-700 mb-4 line-clamp-2">
                      {hotel.description}
                    </p>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${i < hotel.stars ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-xs sm:text-sm text-gray-600">
                        {hotel.rating} ({hotel.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg sm:text-xl font-bold text-blue-600">
                          ₹{hotel.price ? hotel.price.toLocaleString() : '0'}
                        </span>
                        {hotel.originalPrice && hotel.originalPrice > hotel.price && (
                          <span className="ml-2 text-xs sm:text-sm text-gray-500 line-through">
                            ₹{hotel.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="block text-xs sm:text-sm text-gray-600">per night</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Destinations */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Popular Destinations
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover India's most incredible places to stay
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {destinations.map((destination) => (
              <div 
                key={destination.name}
                onClick={() => handleDestinationClick(destination.name)}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative">
                  <img 
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-40 sm:h-48 lg:h-52 object-cover"
                    loading="lazy"
                  />
                  {destination.popular && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Popular
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5 lg:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                    {destination.name}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">{destination.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm sm:text-base text-blue-600 font-semibold">
                        {destination.hotelCount} hotels
                      </span>
                      <span className="block text-xs sm:text-sm text-gray-500">
                        From ₹{destination.avgPrice.toLocaleString()}/night
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Choose Helpkey?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              We make hotel booking simple, secure, and rewarding
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-6">
              <div className="bg-blue-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Easy Search
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Find the perfect hotel with our advanced search filters and real-time availability
              </p>
            </div>

            <div className="text-center p-4 sm:p-6">
              <div className="bg-green-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Best Prices
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Get the lowest prices with our price match guarantee and exclusive deals
              </p>
            </div>

            <div className="text-center p-4 sm:p-6">
              <div className="bg-purple-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                24/7 Support
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Our dedicated support team is available around the clock to help you
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              What Our Customers Say
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Real experiences from real travelers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-700 mb-4">
                "Amazing experience! Found the perfect hotel at a great price. The booking process was smooth and hassle-free."
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                  R
                </div>
                <div className="ml-3">
                  <div className="text-sm sm:text-base font-semibold text-gray-900">Rajesh Kumar</div>
                  <div className="text-xs sm:text-sm text-gray-600">Mumbai, India</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-700 mb-4">
                "Excellent customer service and great deals. I've been using Helpkey for all my travel bookings."
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                  P
                </div>
                <div className="ml-3">
                  <div className="text-sm sm:text-base font-semibold text-gray-900">Priya Sharma</div>
                  <div className="text-xs sm:text-sm text-gray-600">Delhi, India</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-700 mb-4">
                "User-friendly interface and competitive prices. Highly recommended for anyone looking to book hotels."
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                  A
                </div>
                <div className="ml-3">
                  <div className="text-sm sm:text-base font-semibold text-gray-900">Amit Patel</div>
                  <div className="text-xs sm:text-sm text-gray-600">Bangalore, India</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-16 lg:py-20 bg-blue-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto">
            Join millions of travelers who trust Helpkey for their perfect stay
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <button 
              onClick={() => router.push('/hotels')}
              className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer text-sm sm:text-base"
            >
              Explore Hotels
            </button>
            <button 
              onClick={() => router.push('/profile')}
              className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer text-sm sm:text-base"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}