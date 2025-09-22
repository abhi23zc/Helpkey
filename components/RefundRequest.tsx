'use client';

import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

interface RefundRequestProps {
  bookingId: string;
  bookingReference: string;
  totalAmount: number;
  onRequestSubmitted?: () => void;
}

export default function RefundRequest({
  bookingId,
  bookingReference,
  totalAmount,
  onRequestSubmitted
}: RefundRequestProps) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [formData, setFormData] = useState({
    reason: 'Booking cancellation',
    description: '',
    contactPhone: '',
    preferredRefundMethod: 'original_payment_method'
  });

  // Check for existing refund request
  useEffect(() => {
    const checkExistingRequest = async () => {
      try {
        const q = query(
          collection(db, 'refundRequests'),
          where('bookingId', '==', bookingId)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const request = querySnapshot.docs[0].data();
          setExistingRequest({
            id: querySnapshot.docs[0].id,
            ...request
          });
        }
      } catch (error) {
        console.error('Error checking existing refund request:', error);
      } finally {
        setLoadingRequest(false);
      }
    };

    checkExistingRequest();
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create refund request in Firestore
      await addDoc(collection(db, 'refundRequests'), {
        bookingId,
        bookingReference,
        totalAmount,
        reason: formData.reason,
        description: formData.description,
        contactPhone: formData.contactPhone,
        preferredRefundMethod: formData.preferredRefundMethod,
        status: 'pending',
        requestedAt: serverTimestamp(),
        requestedBy: 'customer'
      });

      onRequestSubmitted?.();
      setShowForm(false);
      
      // Reset form
      setFormData({
        reason: 'Booking cancellation',
        description: '',
        contactPhone: '',
        preferredRefundMethod: 'original_payment_method'
      });

      alert('Refund request submitted successfully. We will process it within 2-3 business days.');
    } catch (error) {
      console.error('Error submitting refund request:', error);
      alert('Failed to submit refund request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loadingRequest) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // If refund request already exists, show status
  if (existingRequest) {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'approved': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        case 'processed': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Refund Request Status</h3>
            <p className="text-sm text-gray-600">
              You have already submitted a refund request for this booking.
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(existingRequest.status)}`}>
            {existingRequest.status.charAt(0).toUpperCase() + existingRequest.status.slice(1)}
          </span>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          <p><strong>Reason:</strong> {existingRequest.reason}</p>
          <p><strong>Requested:</strong> {existingRequest.requestedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
          {existingRequest.adminNotes && (
            <p><strong>Admin Notes:</strong> {existingRequest.adminNotes}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refund Request Button */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div>
          <h3 className="font-semibold text-blue-800">Request Refund</h3>
          <p className="text-sm text-blue-700">
            Your booking has been cancelled. Submit a refund request to get your money back.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Request Refund'}
        </button>
      </div>

      {/* Refund Request Form */}
      {showForm && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4">Refund Request Details</h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Refund *
              </label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Booking cancellation">Booking cancellation</option>
                <option value="Change of plans">Change of plans</option>
                <option value="Hotel unavailable">Hotel unavailable</option>
                <option value="Payment error">Payment error</option>
                <option value="Duplicate booking">Duplicate booking</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide any additional details about your refund request..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone Number *
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Refund Method
              </label>
              <select
                name="preferredRefundMethod"
                value={formData.preferredRefundMethod}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="original_payment_method">Original Payment Method</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="wallet">Digital Wallet</option>
              </select>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <i className="ri-information-line text-yellow-600 mr-2 mt-0.5 w-4 h-4 flex items-center justify-center"></i>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Refund Policy:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Refunds are processed within 2-3 business days</li>
                    <li>• Full refund available until 24 hours before check-in</li>
                    <li>• Partial refund may apply for cancellations within 24 hours</li>
                    <li>• Refund amount will be credited to your original payment method</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                    Submit Request
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
