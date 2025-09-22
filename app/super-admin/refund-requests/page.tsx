'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RefundManager from '@/components/RefundManager';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/config/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface RefundRequest {
  id: string;
  bookingId: string;
  bookingReference: string;
  totalAmount: number;
  reason: string;
  description: string;
  contactPhone: string;
  preferredRefundMethod: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedAt: any;
  requestedBy: string;
  processedAt?: any;
  processedBy?: string;
  adminNotes?: string;
}

interface BookingDetails {
  id: string;
  reference: string;
  userId?: string;
  userEmail?: string;
  hotelId: string;
  roomId: string;
  hotelAdmin?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  taxesAndFees: number;
  totalAmount: number;
  status: string;
  createdAt?: any;
  guestInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    specialRequests?: string;
  };
  hotelDetails?: {
    name?: string;
    location?: string;
    image?: string;
  };
  roomDetails?: {
    type?: string;
    price?: number;
    size?: string;
    beds?: string;
    image?: string;
  };
  paymentInfo?: {
    paymentId?: string;
    orderId?: string;
    method?: string;
    status?: string;
    cardholderName?: string;
    lastFourDigits?: string;
  };
}

export default function SuperAdminRefundRequests() {
  const { user } = useAuth();
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [bookingDetails, setBookingDetails] = useState<{[key: string]: BookingDetails}>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'processed'>('all');
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'refundRequests'),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RefundRequest[];
      setRefundRequests(requests);

      // Fetch booking details for all requests
      const bookingDetailsMap: {[key: string]: BookingDetails} = {};
      for (const request of requests) {
        try {
          const bookingSnap = await getDoc(doc(db, 'bookings', request.bookingId));
          if (bookingSnap.exists()) {
            bookingDetailsMap[request.bookingId] = {
              id: bookingSnap.id,
              ...bookingSnap.data()
            } as BookingDetails;
          }
        } catch (error) {
          console.error('Error fetching booking details:', error);
        }
      }
      setBookingDetails(bookingDetailsMap);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const filteredRequests = refundRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const handleStatusUpdate = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    setProcessing(true);
    try {
      await updateDoc(doc(db, 'refundRequests', requestId), {
        status: newStatus,
        processedAt: serverTimestamp(),
        processedBy: user?.uid,
        adminNotes: adminNotes
      });
      setSelectedRequest(null);
      setAdminNotes('');
      alert(`Refund request ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating refund request:', error);
      alert('Failed to update refund request');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-IN');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading refund requests...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Refund Management</h1>
              <p className="text-gray-600 mt-2">Process customer refund requests</p>
            </div>
            <Link href="/super-admin" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'all', label: 'All Requests', count: refundRequests.length },
                { id: 'pending', label: 'Pending', count: refundRequests.filter(r => r.status === 'pending').length },
                { id: 'approved', label: 'Approved', count: refundRequests.filter(r => r.status === 'approved').length },
                { id: 'rejected', label: 'Rejected', count: refundRequests.filter(r => r.status === 'rejected').length },
                { id: 'processed', label: 'Processed', count: refundRequests.filter(r => r.status === 'processed').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                    filter === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Refund Requests List */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <i className="ri-inbox-line text-gray-400 text-4xl mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No refund requests found</h3>
              <p className="text-gray-500">No refund requests match your current filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => {
                    const booking = bookingDetails[request.bookingId];
                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.bookingReference}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.reason}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.contactPhone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking?.hotelDetails?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking?.guestInfo?.firstName} {booking?.guestInfo?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking?.guestInfo?.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatAmount(request.totalAmount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.preferredRefundMethod.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.requestedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-blue-600 hover:text-blue-900 cursor-pointer"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Refund Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Refund Request Details
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line w-6 h-6 flex items-center justify-center"></i>
                </button>
              </div>

              <div className="space-y-6">
                {/* Request Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Booking Reference</label>
                    <p className="text-sm text-gray-900">{selectedRequest.bookingReference}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="text-sm text-gray-900 font-semibold">{formatAmount(selectedRequest.totalAmount)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <p className="text-sm text-gray-900">{selectedRequest.reason}</p>
                </div>

                {selectedRequest.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900">{selectedRequest.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                    <p className="text-sm text-gray-900">{selectedRequest.contactPhone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Method</label>
                    <p className="text-sm text-gray-900">{selectedRequest.preferredRefundMethod.replace('_', ' ')}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Requested At</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedRequest.requestedAt)}</p>
                </div>

                {/* Booking Details */}
                {bookingDetails[selectedRequest.bookingId] && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hotel</label>
                        <p className="text-sm text-gray-900">{bookingDetails[selectedRequest.bookingId].hotelDetails?.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Room Type</label>
                        <p className="text-sm text-gray-900">{bookingDetails[selectedRequest.bookingId].roomDetails?.type}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Check-in</label>
                        <p className="text-sm text-gray-900">{new Date(bookingDetails[selectedRequest.bookingId].checkIn).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Check-out</label>
                        <p className="text-sm text-gray-900">{new Date(bookingDetails[selectedRequest.bookingId].checkOut).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Details */}
                {bookingDetails[selectedRequest.bookingId]?.paymentInfo && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Payment Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                        <p className="text-sm text-gray-900">{bookingDetails[selectedRequest.bookingId].paymentInfo?.method || 'Razorpay'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Payment ID</label>
                        <p className="text-sm text-gray-900 font-mono">{bookingDetails[selectedRequest.bookingId].paymentInfo?.paymentId}</p>
                      </div>
                      {bookingDetails[selectedRequest.bookingId].paymentInfo?.cardholderName && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Cardholder</label>
                          <p className="text-sm text-gray-900">{bookingDetails[selectedRequest.bookingId].paymentInfo?.cardholderName}</p>
                        </div>
                      )}
                      {bookingDetails[selectedRequest.bookingId].paymentInfo?.lastFourDigits && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Card Number</label>
                          <p className="text-sm text-gray-900">**** **** **** {bookingDetails[selectedRequest.bookingId].paymentInfo?.lastFourDigits}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add notes about this refund request..."
                  />
                </div>

                {selectedRequest.status === 'pending' && (
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                      disabled={processing}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
                    >
                      {processing ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                      disabled={processing}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                    >
                      {processing ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                )}

                {/* Refund Processing */}
                {selectedRequest.status === 'approved' && bookingDetails[selectedRequest.bookingId]?.paymentInfo?.paymentId && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Process Refund</h4>
                    <RefundManager
                      bookingId={selectedRequest.bookingId}
                      paymentId={bookingDetails[selectedRequest.bookingId].paymentInfo!.paymentId!}
                      totalAmount={selectedRequest.totalAmount}
                      bookingReference={selectedRequest.bookingReference}
                      onRefundSuccess={() => {
                        setSelectedRequest(null);
                        alert('Refund processed successfully!');
                      }}
                      onRefundError={(error) => {
                        alert(`Refund Error: ${error}`);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
