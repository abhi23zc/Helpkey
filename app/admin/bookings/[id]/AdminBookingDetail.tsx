"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface AdminBookingDetailProps {
  bookingId: string;
}

type BookingDoc = {
  id: string;
  reference: string;
  userId?: string | null;
  userEmail?: string;
  hotelId: string;
  roomId: string;
  hotelAdmin?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights?: number;
  totalPrice: number;
  taxesAndFees: number;
  totalAmount: number;
  unitPrice?: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending' | string;
  createdAt?: any;
  hotelDetails?: { 
    name?: string; 
    location?: string; 
    image?: string; 
    hotelId?: string; 
  };
  roomDetails?: { 
    type?: string; 
    price?: number; 
    size?: string; 
    beds?: string; 
    image?: string; 
    roomId?: string; 
  };
  guestInfo?: { 
    firstName?: string; 
    lastName?: string; 
    email?: string; 
    phone?: string; 
    specialRequests?: string; 
  };
  paymentInfo?: { 
    cardholderName?: string; 
    lastFourDigits?: string; 
    billingAddress?: string; 
    city?: string; 
    zipCode?: string; 
    country?: string; 
  };
};

function getStatusColor(status: string) {
  switch ((status || '').toLowerCase()) {
    case 'confirmed': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function AdminBookingDetail({ bookingId }: AdminBookingDetailProps) {
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingDoc | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'room' | 'guest' | 'payment'>('details');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDoc(doc(db, 'bookings', bookingId));
        if (!snap.exists()) {
          setError('Booking not found');
        } else {
          const data = { id: snap.id, ...(snap.data() as Omit<BookingDoc, 'id'>) } as BookingDoc;
          
          // Check if the current user is the hotel admin for this booking
          if (data.hotelAdmin !== user?.uid) {
            setError('You do not have permission to view this booking');
            return;
          }
          
          setBooking(data);
        }
      } catch (e: any) {
        console.error(e);
        setError(e.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.uid) {
      load();
    }
  }, [bookingId, user?.uid]);

  const calculateNights = () => {
    if (!booking) return 0;
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!booking) return;
    
    const confirmMessage = newStatus === 'cancelled' 
      ? 'Are you sure you want to cancel this booking?'
      : `Are you sure you want to change the status to ${newStatus}?`;
    
    if (!confirm(confirmMessage)) return;
    
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'bookings', booking.id), { status: newStatus });
      setBooking({ ...booking, status: newStatus });
      alert(`Booking status updated to ${newStatus}`);
    } catch (e) {
      console.error('Status update failed', e);
      alert('Failed to update booking status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <i className="ri-error-warning-line text-red-400 text-4xl mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error || 'Booking not found'}</p>
            <Link href="/admin/bookings" className="text-blue-600 hover:underline">
              Back to Booking Management
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/admin/bookings" className="flex items-center text-blue-600 hover:text-blue-700 cursor-pointer">
            <i className="ri-arrow-left-line mr-2 w-4 h-4 flex items-center justify-center"></i>
            Back to Booking Management
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Details</h1>
              <p className="text-gray-600">Booking Reference: {booking.reference}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              {updating && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
            </div>
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
              <p className="font-semibold text-lg">{booking.nights || calculateNights()} nights</p>
              <p className="text-sm text-gray-600">{booking.guests} guests, 1 room</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <img 
                src={booking.hotelDetails?.image || booking.roomDetails?.image || ''}
                alt={booking.hotelDetails?.name || 'Hotel'}
                className="w-full h-64 object-cover object-top rounded-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{booking.hotelDetails?.name || 'Hotel'}</h2>
              <p className="text-gray-600 flex items-center mb-4">
                <i className="ri-map-pin-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                {booking.hotelDetails?.location || ''}
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Revenue</h4>
                <p className="text-2xl font-bold text-blue-600">${booking.totalAmount}</p>
                <p className="text-sm text-blue-700">Total booking value</p>
              </div>
            </div>
          </div>
        </div>

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
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap cursor-pointer border-b-2 ${
                    activeTab === (tab.id as any)
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
                        <span className="font-medium">{booking.reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold text-lg">${booking.totalAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booking Date:</span>
                        <span className="font-medium">
                          {booking.createdAt ? 
                            (booking.createdAt.toDate ? booking.createdAt.toDate().toLocaleDateString() : new Date(booking.createdAt).toLocaleDateString()) 
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Hotel Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Hotel: {booking.hotelDetails?.name || 'N/A'}</li>
                        <li>• Location: {booking.hotelDetails?.location || 'N/A'}</li>
                        <li>• Room Type: {booking.roomDetails?.type || 'N/A'}</li>
                        <li>• Check-in: 3:00 PM</li>
                        <li>• Check-out: 11:00 AM</li>
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
                      src={booking.roomDetails?.image || booking.hotelDetails?.image || ''}
                      alt={booking.roomDetails?.type || 'Room'}
                      className="w-full h-64 object-cover object-top rounded-lg"
                    />
                  </div>
                  <div className="md:w-1/2">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{booking.roomDetails?.type || 'Room'}</h4>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Size:</span>
                        <span className="font-medium">{booking.roomDetails?.size || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bed Type:</span>
                        <span className="font-medium">{booking.roomDetails?.beds || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Occupancy:</span>
                        <span className="font-medium">Up to {booking.guests} guests</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price per Night:</span>
                        <span className="font-medium">${booking.unitPrice || booking.roomDetails?.price || 0}</span>
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
                        <span className="font-medium">{booking.guestInfo?.firstName} {booking.guestInfo?.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{booking.guestInfo?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{booking.guestInfo?.phone}</span>
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
                        {booking.guestInfo?.specialRequests || 'No special requests'}
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
                        <span className="font-medium">${booking.unitPrice || booking.roomDetails?.price || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of Nights:</span>
                        <span className="font-medium">{booking.nights || calculateNights()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">${booking.totalPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxes & Fees:</span>
                        <span className="font-medium">${booking.taxesAndFees}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-gray-900">Total Paid:</span>
                          <span className="text-lg font-bold text-blue-600">${booking.totalAmount}</span>
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
                          <span className="text-gray-600">Cardholder:</span>
                          <span className="font-medium">{booking.paymentInfo?.cardholderName} ****{booking.paymentInfo?.lastFourDigits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Billing:</span>
                          <span className="font-medium">{booking.paymentInfo?.billingAddress}, {booking.paymentInfo?.city}, {booking.paymentInfo?.zipCode}, {booking.paymentInfo?.country}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Management</h3>
          <div className="flex flex-wrap gap-3">
            {booking.status.toLowerCase() === 'pending' && (
              <button 
                onClick={() => handleStatusChange('confirmed')}
                disabled={updating}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line w-4 h-4 flex items-center justify-center"></i>
                    Confirm Booking
                  </>
                )}
              </button>
            )}
            
            {booking.status.toLowerCase() === 'confirmed' && (
              <button 
                onClick={() => handleStatusChange('completed')}
                disabled={updating}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="ri-check-double-line w-4 h-4 flex items-center justify-center"></i>
                    Mark as Completed
                  </>
                )}
              </button>
            )}
            
            {booking.status.toLowerCase() !== 'cancelled' && (
              <button 
                onClick={() => handleStatusChange('cancelled')}
                disabled={updating}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="ri-close-line w-4 h-4 flex items-center justify-center"></i>
                    Cancel Booking
                  </>
                )}
              </button>
            )}
            
            {booking.status.toLowerCase() === 'cancelled' && (
              <button 
                onClick={() => handleStatusChange('confirmed')}
                disabled={updating}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="ri-refresh-line w-4 h-4 flex items-center justify-center"></i>
                    Reactivate Booking
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
