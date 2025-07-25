
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';
import Link from 'next/link';

export default function Hotels() {
  const [sortBy, setSortBy] = useState('recommended');
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const hotels = [
    {
      id: 1,
      name: "Grand Luxury Resort",
      location: "Miami Beach, Florida",
      price: 299,
      originalPrice: 399,
      rating: 4.8,
      reviews: 1247,
      stars: 5,
      image: "https://readdy.ai/api/search-image?query=Luxury%20beachfront%20resort%20hotel%20with%20infinity%20pool%2C%20palm%20trees%2C%20modern%20architecture%2C%20ocean%20view%2C%20tropical%20paradise%2C%20white%20sand%20beach%2C%20elegant%20design%2C%20five%20star%20accommodation&width=400&height=300&seq=hotel-1&orientation=landscape",
      amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "Beach Access", "Parking"]
    },
    {
      id: 2,
      name: "City Center Business Hotel",
      location: "Downtown Manhattan, New York",
      price: 189,
      originalPrice: 249,
      rating: 4.6,
      reviews: 892,
      stars: 4,
      image: "https://readdy.ai/api/search-image?query=Modern%20business%20hotel%20in%20city%20center%2C%20sleek%20contemporary%20design%2C%20glass%20facade%2C%20urban%20setting%2C%20professional%20atmosphere%2C%20downtown%20location%2C%20sophisticated%20interior%2C%20four%20star%20accommodation&width=400&height=300&seq=hotel-2&orientation=landscape",
      amenities: ["Free WiFi", "Gym", "Business Center", "Restaurant", "Room Service", "Parking"]
    },
    {
      id: 3,
      name: "Boutique Garden Hotel",
      location: "Beverly Hills, California",
      price: 225,
      originalPrice: 295,
      rating: 4.7,
      reviews: 634,
      stars: 4,
      image: "https://readdy.ai/api/search-image?query=Boutique%20hotel%20with%20beautiful%20garden%20courtyard%2C%20elegant%20Victorian%20architecture%2C%20lush%20landscaping%2C%20intimate%20atmosphere%2C%20luxury%20amenities%2C%20charming%20facade%2C%20upscale%20neighborhood%20setting&width=400&height=300&seq=hotel-3&orientation=landscape",
      amenities: ["Free WiFi", "Garden", "Concierge", "Restaurant", "Spa", "Valet"]
    },
    {
      id: 4,
      name: "Seaside Resort & Spa",
      location: "Malibu, California",
      price: 349,
      originalPrice: 449,
      rating: 4.9,
      reviews: 1156,
      stars: 5,
      image: "https://readdy.ai/api/search-image?query=Oceanfront%20resort%20and%20spa%20with%20dramatic%20cliffs%2C%20panoramic%20ocean%20views%2C%20luxury%20amenities%2C%20infinity%20pool%2C%20modern%20coastal%20architecture%2C%20serene%20atmosphere%2C%20five%20star%20wellness%20retreat&width=400&height=300&seq=hotel-4&orientation=landscape",
      amenities: ["Free WiFi", "Spa", "Pool", "Beach Access", "Restaurant", "Yoga"]
    },
    {
      id: 5,
      name: "Historic Downtown Inn",
      location: "Old Town, Boston",
      price: 145,
      originalPrice: 185,
      rating: 4.4,
      reviews: 723,
      stars: 3,
      image: "https://readdy.ai/api/search-image?query=Historic%20inn%20in%20charming%20old%20town%2C%20brick%20facade%2C%20traditional%20architecture%2C%20cobblestone%20streets%2C%20vintage%20charm%2C%20cozy%20atmosphere%2C%20heritage%20building%2C%20classic%20New%20England%20style&width=400&height=300&seq=hotel-5&orientation=landscape",
      amenities: ["Free WiFi", "Historic Charm", "Restaurant", "Bar", "Room Service"]
    },
    {
      id: 6,
      name: "Mountain Lodge Resort",
      location: "Aspen, Colorado",
      price: 275,
      originalPrice: 350,
      rating: 4.8,
      reviews: 945,
      stars: 4,
      image: "https://readdy.ai/api/search-image?query=Mountain%20lodge%20resort%20with%20snow-capped%20peaks%2C%20rustic%20wooden%20architecture%2C%20cozy%20fireplace%2C%20ski%20slopes%2C%20winter%20wonderland%2C%20alpine%20setting%2C%20luxury%20cabin%20style%2C%20four%20star%20mountain%20retreat&width=400&height=300&seq=hotel-6&orientation=landscape",
      amenities: ["Free WiFi", "Ski Access", "Spa", "Restaurant", "Fireplace", "Hiking"]
    }
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">Hotels in Miami</h1>
              <p className="text-gray-600">March 15 - March 20, 2024 • 2 guests • 1 room</p>
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
                <div className="space-y-2">
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
              </div>

              {/* Star Rating */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Star Rating</h4>
                <div className="space-y-2">
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
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Amenities</h4>
                <div className="space-y-2">
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
          </div>

          {/* Hotel List */}
          <div className="lg:w-3/4">
            {/* Sort Options */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Showing {hotels.length} hotels</span>
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

            {/* Hotel Cards */}
            <div className="space-y-6">
              {hotels.map(hotel => (
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
                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
                              {hotel.rating}
                            </span>
                            <span className="ml-2 text-sm text-gray-600">({hotel.reviews} reviews)</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 line-through text-sm">${hotel.originalPrice}</span>
                            <div className="text-2xl font-bold text-blue-600">${hotel.price}</div>
                            <span className="text-sm text-gray-600">per night</span>
                          </div>
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
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
