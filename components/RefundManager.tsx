'use client';

import { useState } from 'react';
import { db } from '@/config/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface RefundManagerProps {
  bookingId: string;
  paymentId: string;
  totalAmount: number;
  bookingReference: string;
  onRefundSuccess?: () => void;
  onRefundError?: (error: string) => void;
}

interface RefundData {
  id: string;
  amount: number;
  currency: string;
  payment_id: string;
  status: string;
  created_at: number;
  notes: any;
}

export default function RefundManager({
  bookingId,
  paymentId,
  totalAmount,
  bookingReference,
  onRefundSuccess,
  onRefundError
}: RefundManagerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [refundAmount, setRefundAmount] = useState(totalAmount);
  const [refundReason, setRefundReason] = useState('Booking cancellation');
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundHistory, setRefundHistory] = useState<RefundData[]>([]);

  const handleRefund = async () => {
    if (!paymentId) {
      onRefundError?.('Payment ID not found');
      return;
    }

    setIsProcessing(true);

    try {
      // Process refund through Razorpay
      const refundResponse = await fetch('/api/razorpay/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          amount: refundAmount,
          reason: refundReason,
          notes: {
            booking_id: bookingId,
            booking_reference: bookingReference,
            refunded_by: 'admin'
          }
        }),
      });

      const refundData = await refundResponse.json();

      if (refundData.success) {
        // Update booking status in Firestore
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, {
          status: 'cancelled',
          refundInfo: {
            refundId: refundData.refund.id,
            refundAmount: refundData.refund.amount / 100, // Convert from paise
            refundStatus: refundData.refund.status,
            refundReason: refundReason,
            refundedAt: serverTimestamp(),
            refundedBy: 'admin'
          },
          updatedAt: serverTimestamp()
        });

        // Add to refund history
        setRefundHistory(prev => [refundData.refund, ...prev]);
        
        onRefundSuccess?.();
        setShowRefundForm(false);
        
        // Reset form
        setRefundAmount(totalAmount);
        setRefundReason('Booking cancellation');
      } else {
        throw new Error(refundData.error || 'Refund failed');
      }
    } catch (error: any) {
      console.error('Refund error:', error);
      onRefundError?.(error.message || 'Failed to process refund');
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchRefundHistory = async () => {
    try {
      const response = await fetch(`/api/razorpay/refund?payment_id=${paymentId}`);
      const data = await response.json();
      
      if (data.success) {
        setRefundHistory(data.refunds || []);
      }
    } catch (error) {
      console.error('Error fetching refund history:', error);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-IN');
  };

  return (
    <div className="space-y-4">
      {/* Refund Button */}
      <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div>
          <h3 className="font-semibold text-yellow-800">Process Refund</h3>
          <p className="text-sm text-yellow-700">
            Refund amount: {formatAmount(totalAmount * 100)}
          </p>
        </div>
        <button
          onClick={() => setShowRefundForm(!showRefundForm)}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          {showRefundForm ? 'Cancel' : 'Initiate Refund'}
        </button>
      </div>

      {/* Refund Form */}
      {showRefundForm && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4">Refund Details</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount (₹)
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                max={totalAmount}
                min={0}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum: ₹{totalAmount}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Reason
              </label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Booking cancellation">Booking cancellation</option>
                <option value="Customer request">Customer request</option>
                <option value="Hotel unavailable">Hotel unavailable</option>
                <option value="Payment error">Payment error</option>
                <option value="Duplicate payment">Duplicate payment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRefund}
                disabled={isProcessing || refundAmount <= 0}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="ri-refund-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                    Process Refund
                  </>
                )}
              </button>
              <button
                onClick={() => setShowRefundForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund History */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Refund History</h4>
          <button
            onClick={fetchRefundHistory}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
        
        {refundHistory.length > 0 ? (
          <div className="space-y-2">
            {refundHistory.map((refund) => (
              <div key={refund.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatAmount(refund.amount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Refund ID: {refund.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(refund.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      refund.status === 'processed' 
                        ? 'bg-green-100 text-green-800' 
                        : refund.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {refund.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No refunds processed yet</p>
        )}
      </div>
    </div>
  );
}
