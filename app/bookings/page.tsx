
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';

type BookingDoc = {
  id: string;
  reference: string;
  userId?: string | null;
  userEmail?: string;
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  taxesAndFees: number;
  totalAmount: number;
  status: 'confirmed' | 'completed' | 'cancelled' | string;
  createdAt?: any;
  hotelDetails?: { name?: string; location?: string; image?: string };
  roomDetails?: { type?: string; price?: number; size?: string; beds?: string; image?: string };
};

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'confirmed': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function Bookings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const items: BookingDoc[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<BookingDoc, 'id'>) }));
        setBookings(items);
      } catch (e: any) {
        console.error(e);
        setError(e.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const grouped = useMemo(() => {
    const now = new Date();
    const upcoming: BookingDoc[] = [];
    const completed: BookingDoc[] = [];
    const cancelled: BookingDoc[] = [];
    for (const b of bookings) {
      const status = (b.status || '').toLowerCase();
      if (status === 'cancelled') {
        cancelled.push(b);
        continue;
      }
      if (status === 'completed') {
        completed.push(b);
        continue;
      }
      // Determine by dates if needed
      const checkOut = new Date(b.checkOut);
      if (checkOut < now) completed.push(b); else upcoming.push(b);
    }
    return { upcoming, completed, cancelled } as const;
  }, [bookings]);

  const onCancel = async (booking: BookingDoc) => {
    if (!user || booking.userId !== user.uid) return;
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await updateDoc(doc(db, 'bookings', booking.id), { status: 'cancelled' });
      setBookings(prev => prev.map(b => (b.id === booking.id ? { ...b, status: 'cancelled' } : b)));
    } catch (e) {
      console.error('Cancel failed', e);
      alert('Failed to cancel booking');
    }
  };

  const tabCounts = {
    upcoming: grouped.upcoming.length,
    completed: grouped.completed.length,
    cancelled: grouped.cancelled.length,
  };

  const list = grouped[activeTab];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your hotel reservations and travel history</p>
        </div>

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
                Upcoming ({tabCounts.upcoming})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                  activeTab === 'completed' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Completed ({tabCounts.completed})
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                  activeTab === 'cancelled' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Cancelled ({tabCounts.cancelled})
              </button>
            </nav>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings…</p>
          </div>
        ) : (
          <div className="space-y-6">
            {list.map(booking => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4">
                    <img 
                      src={booking.hotelDetails?.image || booking.roomDetails?.image || ''}
                      alt={booking.hotelDetails?.name || 'Hotel'}
                      className="w-full h-48 md:h-full object-cover object-top"
                    />
                  </div>
                  <div className="md:w-3/4 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {booking.hotelDetails?.name || 'Hotel'}
                        </h3>
                        <p className="text-gray-600 flex items-center mb-2">
                          <i className="ri-map-pin-line mr-1 w-4 h-4 flex items-center justify-center"></i>
                          {booking.hotelDetails?.location || ''}
                        </p>
                        <p className="text-sm text-gray-500">
                          Booking Reference: {booking.reference}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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
                        <p className="font-medium">{booking.guests} guests, 1 room</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Price</p>
                        <p className="font-medium text-lg">${booking.totalAmount}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {activeTab === 'upcoming' && (
                        <>
                          <Link href={`/bookings/${booking.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                            View Details
                          </Link>
                          <button onClick={() => onCancel(booking)} className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap">
                            Cancel Booking
                          </button>
                        </>
                      )}
                      {activeTab === 'completed' && (
                        <>
                          <Link href={`/bookings/${booking.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                            View Receipt
                          </Link>
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
        )}

        {!loading && list.length === 0 && (
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
            <Link href="/hotels" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
              Search Hotels
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
