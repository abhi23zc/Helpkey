
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';
import Link from 'next/link';

export default function Bookings() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const bookings = {
    upcoming: [
      {
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
        image: "https://readdy.ai/api/search-image?query=Luxury%20beachfront%20resort%20hotel%20with%20infinity%20pool%2C%20palm%20trees%2C%20modern%20architecture%2C%20ocean%20view%2C%20tropical%20paradise%2C%20white%20sand%20beach%2C%20elegant%20design%2C%20five%20star%20accommodation&width=300&height=200&seq=booking-1&orientation=landscape"
      },
      {
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
        image: "https://readdy.ai/api/search-image?query=Modern%20business%20hotel%20in%20city%20center%2C%20sleek%20contemporary%20design%2C%20glass%20facade%2C%20urban%20setting%2C%20professional%20atmosphere%2C%20downtown%20location%2C%20sophisticated%20interior%2C%20four%20star%20accommodation&width=300&height=200&seq=booking-2&orientation=landscape"
      }
    ],
    completed: [
      {
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
        image: "https://readdy.ai/api/search-image?query=Boutique%20hotel%20with%20beautiful%20garden%20courtyard%2C%20elegant%20Victorian%20architecture%2C%20lush%20landscaping%2C%20intimate%20atmosphere%2C%20luxury%20amenities%2C%20charming%20facade%2C%20upscale%20neighborhood%20setting&width=300&height=200&seq=booking-3&orientation=landscape"
      },
      {
        id: 4,
        hotelName: "Seaside Resort & Spa",
        location: "Malibu, California",
        checkIn: "2023-12-20",
        checkOut: "2023-12-25",
        guests: 3,
        rooms: 2,
        totalPrice: 1745,
        bookingRef: "BK001228",
        status: "Completed",
        image: "https://readdy.ai/api/search-image?query=Oceanfront%20resort%20and%20spa%20with%20dramatic%20cliffs%2C%20panoramic%20ocean%20views%2C%20luxury%20amenities%2C%20infinity%20pool%2C%20modern%20coastal%20architecture%2C%20serene%20atmosphere%2C%20five%20star%20wellness%20retreat&width=300&height=200&seq=booking-4&orientation=landscape"
      }
    ],
    cancelled: [
      {
        id: 5,
        hotelName: "Historic Downtown Inn",
        location: "Old Town, Boston",
        checkIn: "2024-02-10",
        checkOut: "2024-02-12",
        guests: 2,
        rooms: 1,
        totalPrice: 290,
        bookingRef: "BK001232",
        status: "Cancelled",
        image: "https://readdy.ai/api/search-image?query=Historic%20inn%20in%20charming%20old%20town%2C%20brick%20facade%2C%20traditional%20architecture%2C%20cobblestone%20streets%2C%20vintage%20charm%2C%20cozy%20atmosphere%2C%20heritage%20building%2C%20classic%20New%20England%20style&width=300&height=200&seq=booking-5&orientation=landscape"
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your hotel reservations and travel history</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                  activeTab === 'upcoming' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Upcoming ({bookings.upcoming.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                  activeTab === 'completed' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Completed ({bookings.completed.length})
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                  activeTab === 'cancelled' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Cancelled ({bookings.cancelled.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Booking Cards */}
        <div className="space-y-6">
          {bookings[activeTab].map(booking => (
            <div key={booking.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4">
                  <img 
                    src={booking.image}
                    alt={booking.hotelName}
                    className="w-full h-48 md:h-full object-cover object-top"
                  />
                </div>
                <div className="md:w-3/4 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {booking.hotelName}
                      </h3>
                      <p className="text-gray-600 flex items-center mb-2">
                        <i className="ri-map-pin-line mr-1 w-4 h-4 flex items-center justify-center"></i>
                        {booking.location}
                      </p>
                      <p className="text-sm text-gray-500">
                        Booking Reference: {booking.bookingRef}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-medium">{formatDate(booking.checkIn)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-medium">{formatDate(booking.checkOut)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Guests</p>
                      <p className="font-medium">{booking.guests} guests, {booking.rooms} room</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="font-medium text-lg">${booking.totalPrice}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {activeTab === 'upcoming' && (
                      <>
                        <Link href={`/bookings/${booking.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                          View Details
                        </Link>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                          Modify Booking
                        </button>
                        <button className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap">
                          Cancel Booking
                        </button>
                      </>
                    )}
                    {activeTab === 'completed' && (
                      <>
                        <Link href={`/bookings/${booking.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                          View Receipt
                        </Link>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                          Write Review
                        </button>
                        <button className="border border-blue-300 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap">
                          Book Again
                        </button>
                      </>
                    )}
                    {activeTab === 'cancelled' && (
                      <>
                        <Link href={`/bookings/${booking.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                          View Details
                        </Link>
                        <button className="border border-blue-300 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap">
                          Book Again
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {bookings[activeTab].length === 0 && (
          <div className="text-center py-12">
            <i className="ri-calendar-line text-6xl text-gray-300 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No {activeTab} bookings
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming reservations." 
                : `You don't have any ${activeTab} bookings.`}
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
              Search Hotels
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
