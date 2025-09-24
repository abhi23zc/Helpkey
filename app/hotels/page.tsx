'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HotelsMap from '@/components/HotelsMap';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { db } from '@/config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';

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

interface HotelItem {
  id: string;
  name: string;
  location: string;
  address: string;
  price: number; // This will be the minimum room price
  originalPrice: number; // This will be the minimum original room price
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
  distance?: number; // Distance from user's location in km
}

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
  if (Array.isArray(val) && val.length > 0) return val;
  return fallback;
}

function getSafeImage(images: any) {
  if (Array.isArray(images) && images.length > 0 && typeof images[0] === 'string' && images[0].trim() !== '') {
    return images[0];
  }
  // fallback image
  return '/hotel-placeholder.jpg';
}

function getSafePolicies(policies: any) {
  if (typeof policies === 'object' && policies !== null) {
    return {
      cancellation: getSafeString(policies.cancellation, 'See hotel policy'),
      checkIn: getSafeString(policies.checkIn, '12:00'),
      checkOut: getSafeString(policies.checkOut, '11:00'),
      pets: typeof policies.pets === 'boolean' ? policies.pets : false,
      smoking: typeof policies.smoking === 'boolean' ? policies.smoking : false,
    };
  }
  return {
    cancellation: 'See hotel policy',
    checkIn: '12:00',
    checkOut: '11:00',
    pets: false,
    smoking: false,
  };
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

function HotelsContent() {
  const searchParams = useSearchParams();
  const searchLocation = searchParams.get('location') || '';
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius');
  const nearby = searchParams.get('nearby');

  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [allHotels, setAllHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [maxPriceRange, setMaxPriceRange] = useState(2000);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const hotelsCollectionRef = collection(db, 'hotels');
        const data = await getDocs(hotelsCollectionRef);

        const fetchedHotels: HotelItem[] = await Promise.all(
          data.docs.map(async (doc) => {
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
            
            const minPrice = roomPrices.length > 0 ? Math.min(...roomPrices) : getSafeNumber(d.price, 0);
            const minOriginalPrice = roomOriginalPrices.length > 0 ? Math.min(...roomOriginalPrices) : getSafeNumber(d.originalPrice, d.price || 0);

            return {
              id: doc.id,
              name: getSafeString(d.name, 'Unnamed Hotel'),
              location: getSafeString(d.location, 'Unknown Location'),
              address: getSafeString(d.address, 'No address provided'),
              price: minPrice,
              originalPrice: minOriginalPrice,
              rating: getSafeNumber(d.rating, 4.2),
              reviews: getSafeNumber(d.reviews, Math.floor(Math.random() * 100) + 1),
              stars: getSafeNumber(d.stars, 3),
              image: getSafeImage(d.images),
              amenities: getSafeArray(d.amenities, ['Free WiFi']),
              approved: d.approved === true,
              status: getSafeString(d.status, 'inactive'),
              description: getSafeString(d.description, 'No description available.'),
              email: getSafeString(d.email, ''),
              phone: getSafeString(d.phone, ''),
              rooms: rooms,
              policies: getSafePolicies(d.policies),
              latitude: d.latitude || d.lat,
              longitude: d.longitude || d.lng,
            };
          })
        );

        const approvedHotels = fetchedHotels.filter(hotel => 
          hotel.approved === true && 
          hotel.status === 'active' && 
          hotel.rooms.length > 0 // Only show hotels that have rooms
        );

        // Update price range based on actual room prices
        if (approvedHotels.length > 0) {
          const maxPrice = Math.max(...approvedHotels.map(hotel => hotel.price));
          const newMaxPrice = Math.ceil(maxPrice / 100) * 100; // Round up to nearest 100
          setMaxPriceRange(newMaxPrice);
          if (maxPrice > 2000) {
            setPriceRange([0, newMaxPrice]);
          }
        }

        setAllHotels(approvedHotels);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching hotels:', error);
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchLocation, lat, lng, radius, nearby]);

  // Filtering by price, stars, amenities
  useEffect(() => {
    let filtered = allHotels;

    // Apply search filters first (location-based or text-based)
    if (nearby === 'true' && lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const searchRadiusKm = radius ? parseFloat(radius) : 10;

      filtered = filtered.filter(hotel => {
        if (!hotel.latitude || !hotel.longitude) {
          return false;
        }
        const distance = calculateDistance(userLat, userLng, hotel.latitude, hotel.longitude);
        hotel.distance = distance;
        return distance <= searchRadiusKm;
      }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (searchLocation) {
      const searchLower = searchLocation.toLowerCase();
      filtered = filtered.filter(hotel =>
        hotel.location?.toLowerCase().includes(searchLower) ||
        hotel.address?.toLowerCase().includes(searchLower) ||
        hotel.name?.toLowerCase().includes(searchLower)
      );
    }

    // Then apply price, stars, amenities filters
    filtered = filtered.filter(hotel => hotel.price >= priceRange[0] && hotel.price <= priceRange[1]);

    if (selectedStars.length > 0) {
      filtered = filtered.filter(hotel => selectedStars.includes(hotel.stars));
    }

    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(hotel =>
        selectedAmenities.every(a => hotel.amenities.includes(a))
      );
    }

    // Sorting
    if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'distance' && nearby === 'true') {
      filtered = [...filtered].sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    setHotels(filtered);
  }, [priceRange, selectedStars, selectedAmenities, sortBy, allHotels, nearby, lat, lng, radius, searchLocation]);

  const handleStarFilter = (stars: number) => {
    setSelectedStars(prev =>
      prev.includes(stars)
        ? prev.filter(s => s !== stars)
        : [...prev, stars]
    );
  };

  const handleAmenityFilter = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {nearby === 'true' ? 'Hotels Near You' : 
                 searchLocation ? `Hotels in ${searchLocation}` : 'All Hotels'}
              </h1>
              <p className="text-gray-600">
                {nearby === 'true' ? 
                  `Hotels within ${radius || 10} km of your location` :
                  searchLocation ? `Searching for "${searchLocation}"` : 'Showing all available hotels'}
              </p>
              {nearby === 'true' && lat && lng && (
                <div className="mt-2 text-sm text-blue-600">
                   Searching from coordinates: {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}
                </div>
              )}
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="md:hidden bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap"
            >
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                <input
                  type="range"
                  min="0"
                  max={maxPriceRange}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>₹0</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              {/* Star Rating */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Star Rating</h4>
                {[5, 4, 3, 2, 1].map(stars => (
                  <label key={stars} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStars.includes(stars)}
                      onChange={() => handleStarFilter(stars)}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      {[...Array(stars)].map((_, i) => (
                        <i key={i} className="ri-star-fill text-yellow-400 text-sm w-4 h-4 flex items-center justify-center"></i>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{stars} stars</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Amenities</h4>
                {["Free WiFi", "Pool", "Spa", "Restaurant", "Beach Access", "Parking", "Gym", "Room Service", "Airport Shuttle"].map(amenity => (
                  <label key={amenity} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => handleAmenityFilter(amenity)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Hotel List */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {loading ? 'Loading...' : `Showing ${hotels.length} hotels`}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  >
                    <option value="recommended">
                      {nearby === 'true' ? 'Distance (Closest First)' : 'Recommended'}
                    </option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Guest Rating</option>
                    {nearby === 'true' && (
                      <option value="distance">Distance Only</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading hotels...</p>
              </div>
            )}

            {/* No Results Message */}
            {!loading && hotels.length === 0 && (
              <div className="text-center py-12">
                {nearby === 'true' && lat && lng ? (
                  <>
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hotels found within {radius || 10} km</h3>
                    <p className="text-gray-600 mb-4">
                      We couldn't find any hotels within {radius || 10} km of your selected location.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                      <h4 className="font-semibold text-blue-900 mb-2">💡 Suggestions:</h4>
                      <ul className="text-sm text-blue-800 text-left space-y-1">
                        <li>• Try increasing the search radius</li>
                        <li>• Search for a different location</li>
                        <li>• Check if hotels in this area have location data</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">🏨</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hotels found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search criteria or filters.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Hotel Cards */}
            <div className="space-y-6">
              {!loading && hotels.map(hotel => (
                <div key={hotel.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-48 md:h-full object-cover object-top"
                        onError={e => { (e.target as HTMLImageElement).src = '/hotel-placeholder.jpg'; }}
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{hotel.name}</h3>
                          <div className="flex items-center mb-2">
                            {[...Array(hotel.stars)].map((_, i) => (
                              <i key={i} className="ri-star-fill text-yellow-400 text-sm w-4 h-4 flex items-center justify-center"></i>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">{hotel.stars} stars</span>
                          </div>
                          <p className="text-gray-600 flex items-center mb-3">
                            <i className="ri-map-pin-line mr-1 w-4 h-4 flex items-center justify-center"></i>
                            {hotel.location}
                            {nearby === 'true' && hotel.distance && (
                              <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                {hotel.distance.toFixed(1)} km away
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 text-sm mb-2">{hotel.address}</p>
                          <p className="text-blue-600 text-sm font-medium mb-2">
                            {hotel.rooms.length} room type{hotel.rooms.length !== 1 ? 's' : ''} available
                          </p>

                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">{hotel.rating}</span>
                            <span className="ml-2 text-sm text-gray-600">({hotel.reviews} reviews)</span>
                          </div>
                          {hotel.originalPrice > hotel.price && (
                            <span className="text-gray-400 line-through text-sm">₹{hotel.originalPrice}</span>
                          )}
                          <div className="text-2xl font-bold text-blue-600">₹{hotel.price}</div>
                          <span className="text-sm text-gray-600">from per night</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.amenities.slice(0, 4).map(amenity => (
                          <span key={amenity} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                            {amenity}
                          </span>
                        ))}
                        {hotel.amenities.length > 4 && (
                          <span className="text-blue-600 text-sm">+{hotel.amenities.length - 4} more</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 mb-2">
                        <span className="text-xs text-gray-500">Check-in: {hotel.policies.checkIn}</span>
                        <span className="text-xs text-gray-500">Check-out: {hotel.policies.checkOut}</span>
                        <span className="text-xs text-gray-500">Cancellation: {hotel.policies.cancellation}</span>
                        <span className="text-xs text-gray-500">Pets: {hotel.policies.pets ? 'Allowed' : 'Not allowed'}</span>
                        <span className="text-xs text-gray-500">Smoking: {hotel.policies.smoking ? 'Allowed' : 'Not allowed'}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <Link href={`/hotels/${hotel.id}`} className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer whitespace-nowrap">
                          View Details
                        </Link>
                        <Link href={`/hotels/${hotel.id}`} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && hotels.length === 0 && (
                <div className="text-center py-12">
                  <i className="ri-search-line text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                </div>
              )}
            </div>

            {/* Map Section */}
            {!loading && hotels.length > 0 && (
              <div className="mt-8">
                <HotelsMap
                  hotels={hotels}
                  userLocation={nearby === 'true' && lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined}
                  radius={radius ? parseFloat(radius) : undefined}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function Hotels() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">Loading hotels...</p></div></div>}>
      <HotelsContent />
    </Suspense>
  );
}
