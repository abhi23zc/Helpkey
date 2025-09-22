"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/config/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
    roomNumber?: string | null; 
  };
  guestInfo?: Array<{ 
    firstName?: string; 
    lastName?: string; 
    email?: string; 
    phone?: string; 
    specialRequests?: string; 
  }>;
  paymentInfo?: { 
    paymentId?: string;
    orderId?: string;
    signature?: string;
    method?: string;
    status?: string;
    cardholderName?: string; 
    lastFourDigits?: string; 
    billingAddress?: string; 
    city?: string; 
    zipCode?: string; 
    country?: string; 
  };
  refundInfo?: {
    refundId?: string;
    refundAmount?: number;
    refundStatus?: string;
    refundReason?: string;
    refundedAt?: any;
    refundedBy?: string;
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
  const [refundRequest, setRefundRequest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'room' | 'guest' | 'payment'>('details');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [updatingRoomNumber, setUpdatingRoomNumber] = useState(false);

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
          
          // Initialize room number state
          setRoomNumber(data.roomDetails?.roomNumber || '');
          
          // Fetch refund request for this booking
          try {
            const refundQuery = query(
              collection(db, 'refundRequests'),
              where('bookingId', '==', bookingId)
            );
            const refundSnap = await getDocs(refundQuery);
            if (!refundSnap.empty) {
              const refundData = refundSnap.docs[0].data();
              setRefundRequest({ id: refundSnap.docs[0].id, ...refundData });
            }
          } catch (refundError) {
            console.error('Error fetching refund request:', refundError);
          }
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

  const handleUpdateRoomNumber = async () => {
    if (!booking || !roomNumber.trim()) return;
    
    setUpdatingRoomNumber(true);
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        'roomDetails.roomNumber': roomNumber.trim()
      });
      
      // Update local state
      setBooking(prev => prev ? {
        ...prev,
        roomDetails: {
          ...prev.roomDetails,
          roomNumber: roomNumber.trim()
        }
      } : null);
      
      alert('Room number updated successfully!');
    } catch (error) {
      console.error('Error updating room number:', error);
      alert('Failed to update room number. Please try again.');
    } finally {
      setUpdatingRoomNumber(false);
    }
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
                <p className="text-2xl font-bold text-blue-600">₹{booking.totalAmount}</p>
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
                        <span className="font-bold text-lg">₹{booking.totalAmount}</span>
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
                    
                    {/* Room Number Assignment */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-3">Room Assignment</h5>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          placeholder="Enter room number (e.g., 101, A-205)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleUpdateRoomNumber}
                          disabled={updatingRoomNumber || !roomNumber.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {updatingRoomNumber ? 'Updating...' : 'Assign Room'}
                        </button>
                      </div>
                      {booking.roomDetails?.roomNumber && (
                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm text-green-800">
                            <i className="ri-check-line mr-1 w-4 h-4 inline"></i>
                            Assigned Room: <span className="font-semibold">{booking.roomDetails.roomNumber}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      {booking.roomDetails?.size && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Room Size:</span>
                          <span className="font-medium">{booking.roomDetails.size}</span>
                        </div>
                      )}
                      {booking.roomDetails?.beds && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bed Type:</span>
                          <span className="font-medium">{booking.roomDetails.beds}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Occupancy:</span>
                        <span className="font-medium">Up to {booking.guests} guests</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price per Night:</span>
                        <span className="font-medium">₹{booking.unitPrice || booking.roomDetails?.price || 0}</span>
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
                        <span className="font-medium">
                          {booking.guestInfo?.[0] ? `${booking.guestInfo[0].firstName || ''} ${booking.guestInfo[0].lastName || ''}`.trim() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{booking.guestInfo?.[0]?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{booking.guestInfo?.[0]?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of Guests:</span>
                        <span className="font-medium">{booking.guests}</span>
                      </div>
                    </div>
                    
                    {/* Show additional guests if any */}
                    {booking.guestInfo && booking.guestInfo.length > 1 && (
                      <div className="mt-6">
                        <h5 className="font-semibold text-gray-900 mb-3">Additional Guests</h5>
                        <div className="space-y-3">
                          {booking.guestInfo.slice(1).map((guest, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3">
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 text-sm">Name:</span>
                                  <span className="font-medium text-sm">
                                    {`${guest.firstName || ''} ${guest.lastName || ''}`.trim() || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 text-sm">Email:</span>
                                  <span className="font-medium text-sm">{guest.email || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 text-sm">Phone:</span>
                                  <span className="font-medium text-sm">{guest.phone || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Special Requests</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm">
                        {booking.guestInfo?.[0]?.specialRequests || 'No special requests'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Rate (per night):</span>
                        <span className="font-medium">₹{booking.unitPrice || booking.roomDetails?.price || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of Nights:</span>
                        <span className="font-medium">{booking.nights || calculateNights()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">₹{booking.totalPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxes & Fees:</span>
                        <span className="font-medium">₹{booking.taxesAndFees}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-gray-900">Total Paid:</span>
                          <span className="text-lg font-bold text-blue-600">₹{booking.totalAmount}</span>
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
                          <span className="font-medium">{booking.paymentInfo?.method || 'Razorpay'}</span>
                        </div>
                        {booking.paymentInfo?.paymentId && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment ID:</span>
                            <span className="font-medium text-xs">{booking.paymentInfo.paymentId}</span>
                          </div>
                        )}
                        {booking.paymentInfo?.orderId && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order ID:</span>
                            <span className="font-medium text-xs">{booking.paymentInfo.orderId}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.paymentInfo?.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.paymentInfo?.status || 'completed'}
                          </span>
                        </div>
                        {booking.paymentInfo?.cardholderName && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cardholder:</span>
                            <span className="font-medium">{booking.paymentInfo.cardholderName}</span>
                          </div>
                        )}
                        {booking.paymentInfo?.lastFourDigits && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Card Number:</span>
                            <span className="font-medium">**** **** **** {booking.paymentInfo.lastFourDigits}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refund Information */}
                {booking.refundInfo && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-3">Refund Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-red-700">Refund ID:</span>
                          <span className="font-medium text-xs">{booking.refundInfo.refundId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-700">Refund Amount:</span>
                          <span className="font-bold text-red-800">₹{booking.refundInfo.refundAmount}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-red-700">Refund Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.refundInfo.refundStatus === 'processed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.refundInfo.refundStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-700">Refund Reason:</span>
                          <span className="font-medium">{booking.refundInfo.refundReason}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Refund Status Information - Only for cancelled bookings with payments */}
                {booking.paymentInfo?.paymentId && booking.status.toLowerCase() === 'cancelled' && (
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Refund Status</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center text-blue-700 mb-2">
                        <i className="ri-information-line mr-2 w-5 h-5 flex items-center justify-center"></i>
                        <span className="font-medium">Refund Information</span>
                      </div>
                      <p className="text-sm text-blue-600">
                        Refund processing is handled by the super-admin team. 
                        If a customer has requested a refund, the status will be updated here once processed.
                      </p>
                      
                      {/* Show refund request status if exists */}
                      {refundRequest && (
                        <div className="mt-3 p-3 bg-orange-50 rounded border border-orange-200">
                          <h5 className="font-medium text-orange-900 mb-2">Refund Request Status</h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-orange-700">Request Status:</span>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                refundRequest.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : refundRequest.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : refundRequest.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {refundRequest.status}
                              </span>
                            </div>
                            <div>
                              <span className="text-orange-700">Requested Amount:</span>
                              <span className="ml-2 font-medium">₹{refundRequest.totalAmount}</span>
                            </div>
                            <div>
                              <span className="text-orange-700">Reason:</span>
                              <span className="ml-2">{refundRequest.reason}</span>
                            </div>
                            <div>
                              <span className="text-orange-700">Requested:</span>
                              <span className="ml-2">{refundRequest.requestedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</span>
                            </div>
                          </div>
                          {refundRequest.adminNotes && (
                            <div className="mt-2 pt-2 border-t border-orange-200">
                              <span className="text-orange-700 text-sm">Admin Notes:</span>
                              <p className="text-sm text-orange-800 mt-1">{refundRequest.adminNotes}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show processed refund information if exists */}
                      {booking.refundInfo && (
                        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                          <h5 className="font-medium text-green-900 mb-2">Processed Refund</h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-green-700">Refund Status:</span>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                booking.refundInfo.refundStatus === 'processed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.refundInfo.refundStatus}
                              </span>
                            </div>
                            <div>
                              <span className="text-green-700">Refund Amount:</span>
                              <span className="ml-2 font-medium">₹{booking.refundInfo.refundAmount}</span>
                            </div>
                            <div>
                              <span className="text-green-700">Refund ID:</span>
                              <span className="ml-2 font-mono text-xs">{booking.refundInfo.refundId}</span>
                            </div>
                            <div>
                              <span className="text-green-700">Refunded At:</span>
                              <span className="ml-2">{booking.refundInfo.refundedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Show message if no refund request or processed refund */}
                      {!refundRequest && !booking.refundInfo && (
                        <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                          <p className="text-sm text-gray-700">
                            No refund request or processed refund for this booking.
                          </p>
                        </div>
                      )}
                  </div>
                </div>
                )}
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
