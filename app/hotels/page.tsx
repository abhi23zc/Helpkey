'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';

export default function Hotels() {
  const searchParams = useSearchParams();
  const searchLocation = searchParams.get('location') || '';

  const [hotels, setHotels] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const hotelsCollectionRef = collection(db, 'hotels');
        const data = await getDocs(hotelsCollectionRef);

        const fetchedHotels = data.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          name: doc.data().name,
          location: doc.data().location,
          price: doc.data().price || 0,
          originalPrice: doc.data().originalPrice || doc.data().price || 0,
          rating: doc.data().rating || 0,
          reviews: doc.data().reviews || 0,
          stars: parseInt(doc.data().stars) || 0,
          image: doc.data().images && doc.data().images.length > 0 ? doc.data().images[0] : '',
          amenities: doc.data().amenities || [],
        }));

        setAllHotels(fetchedHotels);

        if (searchLocation) {
          const searchLower = searchLocation.toLowerCase();
          const filteredHotels = fetchedHotels.filter(hotel =>
            hotel.location?.toLowerCase().includes(searchLower) ||
            hotel.address?.toLowerCase().includes(searchLower) ||
            hotel.name?.toLowerCase().includes(searchLower)
          );

          setHotels(filteredHotels.length > 0 ? filteredHotels : fetchedHotels);
        } else {
          setHotels(fetchedHotels);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching hotels:', error);
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchLocation]);

  const handleStarFilter = (stars) => {
    setSelectedStars(prev =>
      prev.includes(stars)
        ? prev.filter(s => s !== stars)
        : [...prev, stars]
    );
  };

  const handleAmenityFilter = (amenity) => {
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
                {searchLocation ? `Hotels in ${searchLocation}` : 'All Hotels'}
              </h1>
              <p className="text-gray-600">
                {searchLocation ? `Searching for "${searchLocation}"` : 'Showing all available hotels'}
              </p>
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
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>$0</span>
                  <span>${priceRange[1]}</span>
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
                {["Free WiFi", "Pool", "Spa", "Restaurant", "Beach Access", "Parking", "Gym"].map(amenity => (
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
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Guest Rating</option>
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
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">{hotel.rating}</span>
                            <span className="ml-2 text-sm text-gray-600">({hotel.reviews} reviews)</span>
                          </div>
                          <span className="text-gray-400 line-through text-sm">${hotel.originalPrice}</span>
                          <div className="text-2xl font-bold text-blue-600">${hotel.price}</div>
                          <span className="text-sm text-gray-600">per night</span>
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

                      <div className="flex justify-between items-center">
                        <Link href={`/hotels/${hotel.id}`} className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer whitespace-nowrap">
                          View Details
                        </Link>
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                          Book Now
                        </button>
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
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
