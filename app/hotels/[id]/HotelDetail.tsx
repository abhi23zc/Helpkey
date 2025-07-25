
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HotelDetailProps {
  hotelId: string;
}

export default function HotelDetail({ hotelId }: HotelDetailProps) {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState('2024-03-15');
  const [checkOut, setCheckOut] = useState('2024-03-20');
  const [guests, setGuests] = useState(2);
  const [activeTab, setActiveTab] = useState('overview');

  const hotels = {
    '1': {
      id: 1,
      name: "Grand Luxury Resort",
      location: "Miami Beach, Florida",
      rating: 4.8,
      reviews: 1247,
      stars: 5,
      images: [
        "https://readdy.ai/api/search-image?query=Luxury%20beachfront%20resort%20hotel%20exterior%20with%20infinity%20pool%2C%20palm%20trees%2C%20modern%20architecture%2C%20ocean%20view%2C%20tropical%20paradise%2C%20white%20sand%20beach%2C%20elegant%20design%2C%20five%20star%20accommodation&width=800&height=500&seq=hotel-1-main&orientation=landscape",
        "https://readdy.ai/api/search-image?query=Luxury%20hotel%20lobby%20with%20marble%20floors%2C%20crystal%20chandeliers%2C%20elegant%20furniture%2C%20grand%20entrance%2C%20modern%20sophisticated%20design%2C%20five%20star%20hospitality%2C%20welcoming%20atmosphere&width=800&height=500&seq=hotel-1-lobby&orientation=landscape",
        "https://readdy.ai/api/search-image?query=Hotel%20infinity%20pool%20overlooking%20ocean%2C%20luxury%20pool%20deck%2C%20lounge%20chairs%2C%20tropical%20setting%2C%20crystal%20clear%20water%2C%20palm%20trees%2C%20resort%20atmosphere%2C%20relaxing%20environment&width=800&height=500&seq=hotel-1-pool&orientation=landscape",
        "https://readdy.ai/api/search-image?query=Fine%20dining%20restaurant%20in%20luxury%20hotel%2C%20elegant%20table%20settings%2C%20ocean%20view%2C%20sophisticated%20ambiance%2C%20gourmet%20cuisine%2C%20upscale%20interior%20design%2C%20romantic%20atmosphere&width=800&height=500&seq=hotel-1-restaurant&orientation=landscape"
      ],
      description: "Experience ultimate luxury at our beachfront resort featuring world-class amenities, stunning ocean views, and exceptional service. Perfect for romantic getaways and family vacations.",
      amenities: ["Free WiFi", "Infinity Pool", "Spa & Wellness", "Fine Dining", "Beach Access", "Valet Parking", "Concierge", "Room Service", "Fitness Center", "Tennis Court"],
      rooms: [
        {
          id: 1,
          type: "Ocean View Suite",
          price: 399,
          originalPrice: 499,
          size: "650 sq ft",
          beds: "1 King Bed",
          capacity: 2,
          amenities: ["Ocean View", "Balcony", "Mini Bar", "Marble Bathroom", "Separate Living Area"],
          image: "https://readdy.ai/api/search-image?query=Luxury%20hotel%20ocean%20view%20suite%20with%20king%20bed%2C%20elegant%20decor%2C%20private%20balcony%2C%20marble%20bathroom%2C%20sophisticated%20furnishings%2C%20five%20star%20accommodation%2C%20stunning%20sea%20views&width=600&height=400&seq=room-1-1&orientation=landscape"
        },
        {
          id: 2,
          type: "Beachfront Villa",
          price: 599,
          originalPrice: 699,
          size: "1200 sq ft",
          beds: "2 Queen Beds",
          capacity: 4,
          amenities: ["Private Beach Access", "Outdoor Shower", "Kitchenette", "Terrace", "Premium Amenities"],
          image: "https://readdy.ai/api/search-image?query=Beachfront%20villa%20with%20private%20terrace%2C%20outdoor%20shower%2C%20luxury%20furnishings%2C%20direct%20beach%20access%2C%20tropical%20paradise%2C%20premium%20accommodation%2C%20elegant%20design&width=600&height=400&seq=room-1-2&orientation=landscape"
        },
        {
          id: 3,
          type: "Garden View Room",
          price: 299,
          originalPrice: 349,
          size: "450 sq ft",
          beds: "1 Queen Bed",
          capacity: 2,
          amenities: ["Garden View", "Modern Bathroom", "Work Desk", "Coffee Machine", "Air Conditioning"],
          image: "https://readdy.ai/api/search-image?query=Elegant%20hotel%20garden%20view%20room%20with%20queen%20bed%2C%20modern%20decor%2C%20work%20desk%2C%20coffee%20station%2C%20comfortable%20furnishings%2C%20peaceful%20garden%20views%2C%20four%20star%20comfort&width=600&height=400&seq=room-1-3&orientation=landscape"
        }
      ]
    },
    '2': {
      id: 2,
      name: "City Center Business Hotel",
      location: "Downtown Manhattan, New York",
      rating: 4.6,
      reviews: 892,
      stars: 4,
      images: [
        "https://readdy.ai/api/search-image?query=Modern%20business%20hotel%20in%20city%20center%2C%20sleek%20contemporary%20design%2C%20glass%20facade%2C%20urban%20setting%2C%20professional%20atmosphere%2C%20downtown%20location%2C%20sophisticated%20interior%2C%20four%20star%20accommodation&width=800&height=500&seq=hotel-2-main&orientation=landscape",
        "https://readdy.ai/api/search-image?query=Modern%20hotel%20lobby%20with%20sleek%20design%2C%20contemporary%20furniture%2C%20city%20views%2C%20professional%20atmosphere%2C%20business%20travelers%2C%20urban%20sophistication%2C%20clean%20lines&width=800&height=500&seq=hotel-2-lobby&orientation=landscape",
        "https://readdy.ai/api/search-image?query=Hotel%20business%20center%20with%20modern%20workstations%2C%20meeting%20rooms%2C%20professional%20environment%2C%20city%20skyline%20views%2C%20corporate%20facilities%2C%20productivity%20space&width=800&height=500&seq=hotel-2-business&orientation=landscape",
        "https://readdy.ai/api/search-image?query=Urban%20hotel%20restaurant%20with%20city%20views%2C%20modern%20cuisine%2C%20professional%20dining%2C%20business%20lunch%20atmosphere%2C%20contemporary%20design%2C%20metropolitan%20setting&width=800&height=500&seq=hotel-2-restaurant&orientation=landscape"
      ],
      description: "Located in the heart of Manhattan, our business hotel offers modern amenities and professional service for both business and leisure travelers.",
      amenities: ["Free WiFi", "Business Center", "Fitness Center", "Restaurant & Bar", "Meeting Rooms", "Concierge", "Room Service", "Valet Parking", "Airport Shuttle", "Laundry Service"],
      rooms: [
        {
          id: 1,
          type: "Executive Suite",
          price: 289,
          originalPrice: 349,
          size: "800 sq ft",
          beds: "1 King Bed",
          capacity: 2,
          amenities: ["City View", "Separate Work Area", "Executive Lounge Access", "Premium WiFi", "Marble Bathroom"],
          image: "https://readdy.ai/api/search-image?query=Executive%20hotel%20suite%20with%20city%20skyline%20views%2C%20modern%20business%20desk%2C%20king%20bed%2C%20sophisticated%20urban%20decor%2C%20professional%20atmosphere%2C%20luxury%20amenities&width=600&height=400&seq=room-2-1&orientation=landscape"
        },
        {
          id: 2,
          type: "Business Room",
          price: 189,
          originalPrice: 229,
          size: "400 sq ft",
          beds: "1 Queen Bed",
          capacity: 2,
          amenities: ["Work Desk", "Ergonomic Chair", "High-Speed Internet", "Coffee Station", "City View"],
          image: "https://readdy.ai/api/search-image?query=Modern%20business%20hotel%20room%20with%20work%20desk%2C%20queen%20bed%2C%20city%20views%2C%20professional%20decor%2C%20ergonomic%20furniture%2C%20business%20traveler%20amenities&width=600&height=400&seq=room-2-2&orientation=landscape"
        }
      ]
    }
  };

  const hotel = hotels[hotelId] || hotels['1'];

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const calculateNights = () => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const getTotalPrice = () => {
    if (!selectedRoom) return 0;
    return selectedRoom.price * calculateNights();
  };

  const handleBookNow = () => {
    if (!selectedRoom) return;

    const nights = calculateNights();
    const bookingParams = new URLSearchParams({
      hotel: hotel.id.toString(),
      room: selectedRoom.id.toString(),
      checkin: checkIn,
      checkout: checkOut,
      guests: guests.toString(),
      price: selectedRoom.price.toString(),
      nights: nights.toString()
    });

    router.push(`/booking?${bookingParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hotel Images Gallery */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="lg:col-span-2 lg:row-span-2">
            <img 
              src={hotel.images[0]}
              alt={hotel.name}
              className="w-full h-64 lg:h-full object-cover object-top rounded-lg"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 lg:col-span-2">
            {hotel.images.slice(1).map((image, index) => (
              <img 
                key={index}
                src={image}
                alt={`${hotel.name} view ${index + 1}`}
                className="w-full h-32 object-cover object-top rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Hotel Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                  <div className="flex items-center mb-2">
                    {[...Array(hotel.stars)].map((_, i) => (
                      <i key={i} className="ri-star-fill text-yellow-400 text-lg w-5 h-5 flex items-center justify-center"></i>
                    ))}
                    <span className="ml-2 text-gray-600">{hotel.stars} stars</span>
                  </div>
                  <p className="text-gray-600 flex items-center">
                    <i className="ri-map-pin-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                    {hotel.location}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-lg font-semibold">
                      {hotel.rating}
                    </span>
                    <span className="ml-2 text-gray-600">({hotel.reviews} reviews)</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'rooms', label: 'Rooms' },
                    { id: 'amenities', label: 'Amenities' },
                    { id: 'reviews', label: 'Reviews' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 text-sm font-medium whitespace-nowrap cursor-pointer border-b-2 ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">About This Hotel</h3>
                    <p className="text-gray-700 mb-6">{hotel.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Popular Amenities</h4>
                        <ul className="space-y-1">
                          {hotel.amenities.slice(0, 5).map(amenity => (
                            <li key={amenity} className="flex items-center text-gray-700">
                              <i className="ri-check-line text-green-500 mr-2 w-4 h-4 flex items-center justify-center"></i>
                              {amenity}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Property Highlights</h4>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Free cancellation available</li>
                          <li>• 24-hour front desk</li>
                          <li>• Mobile check-in</li>
                          <li>• Multilingual staff</li>
                          <li>• Pet-friendly options</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'rooms' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Available Rooms</h3>
                    <div className="space-y-4">
                      {hotel.rooms.map(room => (
                        <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="md:w-1/3">
                              <img 
                                src={room.image}
                                alt={room.type}
                                className="w-full h-48 object-cover object-top rounded-lg"
                              />
                            </div>
                            <div className="md:w-2/3">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">{room.type}</h4>
                                <div className="text-right">
                                  <span className="text-gray-400 line-through text-sm">${room.originalPrice}</span>
                                  <div className="text-xl font-bold text-blue-600">${room.price}</div>
                                  <span className="text-sm text-gray-600">per night</span>
                                </div>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 mb-3">
                                <span className="mr-4">{room.size}</span>
                                <span className="mr-4">{room.beds}</span>
                                <span>Up to {room.capacity} guests</span>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {room.amenities.map(amenity => (
                                  <span key={amenity} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                              <button
                                onClick={() => handleRoomSelect(room)}
                                className={`px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap ${
                                  selectedRoom?.id === room.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {selectedRoom?.id === room.id ? 'Selected' : 'Select Room'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'amenities' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Hotel Amenities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {hotel.amenities.map(amenity => (
                        <div key={amenity} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <i className="ri-check-line text-green-500 mr-3 w-5 h-5 flex items-center justify-center"></i>
                          <span className="text-gray-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Guest Reviews</h3>
                    <div className="space-y-4">
                      {[
                        { name: "Sarah Johnson", rating: 5, date: "March 2024", review: "Absolutely stunning hotel! The ocean view from our suite was breathtaking. Staff was incredibly helpful and the amenities were top-notch." },
                        { name: "Michael Chen", rating: 4, date: "February 2024", review: "Great location and beautiful property. The pool area was fantastic and the restaurant had excellent food. Would definitely stay again." },
                        { name: "Emma Davis", rating: 5, date: "January 2024", review: "Perfect for our anniversary trip. The spa services were amazing and the beachfront location couldn't be better. Highly recommended!" }
                      ].map((review, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-semibold text-gray-900">{review.name}</h5>
                              <div className="flex items-center">
                                {[...Array(review.rating)].map((_, i) => (
                                  <i key={i} className="ri-star-fill text-yellow-400 text-sm w-4 h-4 flex items-center justify-center"></i>
                                ))}
                                <span className="ml-2 text-sm text-gray-600">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.review}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-semibold mb-4">Book Your Stay</h3>

              {/* Date Selection */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                  </select>
                </div>
              </div>

              {/* Selected Room */}
              {selectedRoom && (
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Selected Room</h4>
                  <p className="text-gray-700">{selectedRoom.type}</p>
                  <p className="text-sm text-gray-600">{selectedRoom.size} • {selectedRoom.beds}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-blue-600">${selectedRoom.price}</span>
                    <span className="text-sm text-gray-600">per night</span>
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Nights</span>
                  <span className="text-gray-900">{calculateNights()}</span>
                </div>
                {selectedRoom && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">${selectedRoom.price} x {calculateNights()} nights</span>
                      <span className="text-gray-900">${getTotalPrice()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Taxes & fees</span>
                      <span className="text-gray-900">${Math.round(getTotalPrice() * 0.15)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-blue-600">${getTotalPrice() + Math.round(getTotalPrice() * 0.15)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleBookNow}
                disabled={!selectedRoom}
                className={`w-full py-3 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
                  selectedRoom
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedRoom ? 'Book Now' : 'Select a Room'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-2">
                Free cancellation within 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
