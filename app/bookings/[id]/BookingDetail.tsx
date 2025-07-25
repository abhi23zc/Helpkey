'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';
import Link from 'next/link';

interface BookingDetailProps {
  bookingId: string;
}

export default function BookingDetail({ bookingId }: BookingDetailProps) {
  const [activeTab, setActiveTab] = useState('details');

  const bookingsData = {
    '1': {
      id: 1,
      hotelName: "Grand Luxury Resort",
      location: "Miami Beach, Florida",
      checkIn: "2024-03-15",
      checkOut: "2024-03-20",
      guests: 2,
      rooms: 1,
      totalPrice: 1495,
      bookingRef: "BK001234",
      status: "Confirmed",
      roomType: "Ocean View Suite",
      roomSize: "650 sq ft",
      beds: "1 King Bed",
      bookedDate: "2024-02-15",
      guestName: "John Smith",
      guestEmail: "john.smith@email.com",
      guestPhone: "+1 (555) 123-4567",
      specialRequests: "High floor room with ocean view, late check-out if possible",
      image: "https://readdy.ai/api/search-image?query=Luxury%20beachfront%20resort%20hotel%20with%20infinity%20pool%2C%20palm%20trees%2C%20modern%20architecture%2C%20ocean%20view%2C%20tropical%20paradise%2C%20white%20sand%20beach%2C%20elegant%20design%2C%20five%20star%20accommodation&width=800&height=400&seq=booking-detail-1&orientation=landscape",
      roomImage: "https://readdy.ai/api/search-image?query=Luxury%20hotel%20ocean%20view%20suite%20with%20king%20bed%2C%20elegant%20decor%2C%20private%20balcony%2C%20marble%20bathroom%2C%20sophisticated%20furnishings%2C%20five%20star%20accommodation%2C%20stunning%20sea%20views&width=600&height=400&seq=room-detail-1&orientation=landscape",
      priceBreakdown: {
        roomRate: 299,
        nights: 5,
        subtotal: 1495,
        taxes: 149,
        fees: 25,
        total: 1669
      },
      amenities: ["Free WiFi", "Ocean View", "Balcony", "Mini Bar", "Room Service", "Spa Access"],
      hotelContact: {
        phone: "+1 (305) 555-0123",
        email: "reservations@grandluxuryresort.com",
        address: "123 Ocean Drive, Miami Beach, FL 33139"
      }
    },
    '2': {
      id: 2,
      hotelName: "City Center Business Hotel",
      location: "Downtown Manhattan, New York",
      checkIn: "2024-04-10",
      checkOut: "2024-04-12",
      guests: 1,
      rooms: 1,
      totalPrice: 378,
      bookingRef: "BK001235",
      status: "Confirmed",
      roomType: "Business Room",
      roomSize: "400 sq ft",
      beds: "1 Queen Bed",
      bookedDate: "2024-03-01",
      guestName: "Sarah Johnson",
      guestEmail: "sarah.johnson@email.com",
      guestPhone: "+1 (555) 987-6543",
      specialRequests: "Quiet room for business meetings, early check-in requested",
      image: "https://readdy.ai/api/search-image?query=Modern%20business%20hotel%20in%20city%20center%2C%20sleek%20contemporary%20design%2C%20glass%20facade%2C%20urban%20setting%2C%20professional%20atmosphere%2C%20downtown%20location%2C%20sophisticated%20interior%2C%20four%20star%20accommodation&width=800&height=400&seq=booking-detail-2&orientation=landscape",
      roomImage: "https://readdy.ai/api/search-image?query=Modern%20business%20hotel%20room%20with%20work%20desk%2C%20queen%20bed%2C%20city%20views%2C%20professional%20decor%2C%20ergonomic%20furniture%2C%20business%20traveler%20amenities&width=600&height=400&seq=room-detail-2&orientation=landscape",
      priceBreakdown: {
        roomRate: 189,
        nights: 2,
        subtotal: 378,
        taxes: 38,
        fees: 15,
        total: 431
      },
      amenities: ["Free WiFi", "Work Desk", "City View", "Business Center", "Gym Access", "Room Service"],
      hotelContact: {
        phone: "+1 (212) 555-0456",
        email: "reservations@citycenterhotel.com",
        address: "456 Broadway, New York, NY 10013"
      }
    },
    '3': {
      id: 3,
      hotelName: "Boutique Garden Hotel",
      location: "Beverly Hills, California",
      checkIn: "2024-01-15",
      checkOut: "2024-01-18",
      guests: 2,
      rooms: 1,
      totalPrice: 675,
      bookingRef: "BK001230",
      status: "Completed",
      roomType: "Garden Suite",
      roomSize: "550 sq ft",
      beds: "1 King Bed",
      bookedDate: "2023-12-20",
      guestName: "Michael Chen",
      guestEmail: "michael.chen@email.com",
      guestPhone: "+1 (555) 456-7890",
      specialRequests: "Anniversary celebration, champagne and flowers arrangement",
      image: "https://readdy.ai/api/search-image?query=Boutique%20hotel%20with%20beautiful%20garden%20courtyard%2C%20elegant%20Victorian%20architecture%2C%20lush%20landscaping%2C%20intimate%20atmosphere%2C%20luxury%20amenities%2C%20charming%20facade%2C%20upscale%20neighborhood%20setting&width=800&height=400&seq=booking-detail-3&orientation=landscape",
      roomImage: "https://readdy.ai/api/search-image?query=Elegant%20boutique%20hotel%20garden%20suite%20with%20king%20bed%2C%20romantic%20decor%2C%20garden%20views%2C%20luxurious%20furnishings%2C%20intimate%20atmosphere%2C%20sophisticated%20design&width=600&height=400&seq=room-detail-3&orientation=landscape",
      priceBreakdown: {
        roomRate: 225,
        nights: 3,
        subtotal: 675,
        taxes: 68,
        fees: 20,
        total: 763
      },
      amenities: ["Free WiFi", "Garden View", "Concierge", "Spa Access", "Fine Dining", "Valet Parking"],
      hotelContact: {
        phone: "+1 (310) 555-0789",
        email: "reservations@boutiquegardenhotel.com",
        address: "789 Rodeo Drive, Beverly Hills, CA 90210"
      }
    }
  };

  const booking = bookingsData[bookingId] || bookingsData['1'];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateNights = () => {
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/bookings" className="flex items-center text-blue-600 hover:text-blue-700 cursor-pointer">
            <i className="ri-arrow-left-line mr-2 w-4 h-4 flex items-center justify-center"></i>
            Back to My Bookings
          </Link>
        </div>

        {/* Booking Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Details</h1>
              <p className="text-gray-600">Booking Reference: {booking.bookingRef}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Check-in</p>
              <p className="font-semibold text-lg">{formatDate(booking.checkIn)}</p>
              <p className="text-sm text-gray-600">3:00 PM</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Check-out</p>
              <p className="font-semibold text-lg">{formatDate(booking.checkOut)}</p>
              <p className="text-sm text-gray-600">11:00 AM</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-semibold text-lg">{calculateNights()} nights</p>
              <p className="text-sm text-gray-600">{booking.guests} guests, {booking.rooms} room</p>
            </div>
          </div>
        </div>

        {/* Hotel Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <img 
                src={booking.image}
                alt={booking.hotelName}
                className="w-full h-64 object-cover object-top rounded-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{booking.hotelName}</h2>
              <p className="text-gray-600 flex items-center mb-4">
                <i className="ri-map-pin-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                {booking.location}
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <i className="ri-phone-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                  <span className="text-gray-700">{booking.hotelContact.phone}</span>
                </div>
                <div className="flex items-center">
                  <i className="ri-mail-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                  <span className="text-gray-700">{booking.hotelContact.email}</span>
                </div>
                <div className="flex items-center">
                  <i className="ri-map-pin-2-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                  <span className="text-gray-700">{booking.hotelContact.address}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {booking.amenities.map(amenity => (
                  <span key={amenity} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'details', label: 'Booking Details' },
                { id: 'room', label: 'Room Information' },
                { id: 'guest', label: 'Guest Information' },
                { id: 'payment', label: 'Payment Details' }
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
            {activeTab === 'details' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Reservation Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booking Reference:</span>
                        <span className="font-medium">{booking.bookingRef}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booked Date:</span>
                        <span className="font-medium">{formatDate(booking.bookedDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold text-lg">${booking.priceBreakdown.total}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Important Information</h4>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Check-in: 3:00 PM</li>
                        <li>• Check-out: 11:00 AM</li>
                        <li>• Valid ID required at check-in</li>
                        <li>• Free cancellation until 24 hours before</li>
                        <li>• Contact hotel directly for special requests</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'room' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Room Information</h3>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    <img 
                      src={booking.roomImage}
                      alt={booking.roomType}
                      className="w-full h-64 object-cover object-top rounded-lg"
                    />
                  </div>
                  <div className="md:w-1/2">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{booking.roomType}</h4>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Size:</span>
                        <span className="font-medium">{booking.roomSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bed Type:</span>
                        <span className="font-medium">{booking.beds}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Occupancy:</span>
                        <span className="font-medium">Up to {booking.guests} guests</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of Rooms:</span>
                        <span className="font-medium">{booking.rooms}</span>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Room Amenities</h5>
                      <div className="flex flex-wrap gap-2">
                        {booking.amenities.map(amenity => (
                          <span key={amenity} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'guest' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Guest Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Primary Guest</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Full Name:</span>
                        <span className="font-medium">{booking.guestName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{booking.guestEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{booking.guestPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of Guests:</span>
                        <span className="font-medium">{booking.guests}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Special Requests</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm">
                        {booking.specialRequests || "No special requests"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Rate (per night):</span>
                        <span className="font-medium">${booking.priceBreakdown.roomRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of Nights:</span>
                        <span className="font-medium">{booking.priceBreakdown.nights}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">${booking.priceBreakdown.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxes:</span>
                        <span className="font-medium">${booking.priceBreakdown.taxes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Fees:</span>
                        <span className="font-medium">${booking.priceBreakdown.fees}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-gray-900">Total Paid:</span>
                          <span className="text-lg font-bold text-blue-600">${booking.priceBreakdown.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-medium">Credit Card</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Card Type:</span>
                          <span className="font-medium">Visa ****1234</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status:</span>
                          <span className="text-green-600 font-medium">Completed</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-medium">TXN{booking.bookingRef}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
          <div className="flex flex-wrap gap-3">
            {booking.status === 'Confirmed' && (
              <>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                  Modify Booking
                </button>
                <button className="border border-red-300 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap">
                  Cancel Booking
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  Download Confirmation
                </button>
              </>
            )}
            {booking.status === 'Completed' && (
              <>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                  Download Receipt
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  Write Review
                </button>
                <button className="border border-blue-300 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap">
                  Book Again
                </button>
              </>
            )}
            {booking.status === 'Cancelled' && (
              <>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                  Book Again
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  Download Cancellation Receipt
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}