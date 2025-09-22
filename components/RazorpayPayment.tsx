'use client';

import { useEffect, useState } from 'react';
import { RAZORPAY_CONFIG, RazorpayOptions, RazorpayResponse, RazorpayError } from '@/config/razorpay';

interface RazorpayPaymentProps {
  amount: number;
  currency?: string;
  orderId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  onSuccess: (response: RazorpayResponse) => void;
  onError: (error: RazorpayError) => void;
  onClose: () => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayPayment({
  amount,
  currency = 'INR',
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  description = 'Hotel Booking Payment',
  onSuccess,
  onError,
  onClose,
  disabled = false
}: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setScriptLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded || !window.Razorpay) {
      console.error('Razorpay script not loaded');
      return;
    }

    if (disabled) return;

    setIsLoading(true);

    try {
      const options: RazorpayOptions = {
        key: RAZORPAY_CONFIG.key_id,
        amount: amount * 100, // Convert to paise
        currency: currency,
        name: RAZORPAY_CONFIG.name,
        description: description,
        image: RAZORPAY_CONFIG.image,
        order_id: orderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        notes: {
          booking_reference: orderId,
          hotel_booking: 'true'
        },
        theme: RAZORPAY_CONFIG.theme,
        handler: (response: RazorpayResponse) => {
          setIsLoading(false);
          onSuccess(response);
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            onClose();
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response: RazorpayError) => {
        setIsLoading(false);
        onError(response);
      });

      razorpay.open();
    } catch (error) {
      console.error('Error initializing Razorpay:', error);
      setIsLoading(false);
      onError({
        code: 'INITIALIZATION_ERROR',
        description: 'Failed to initialize payment',
        source: 'client',
        step: 'initialization',
        reason: 'script_error',
        metadata: {
          order_id: orderId,
          payment_id: ''
        }
      });
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || isLoading || !scriptLoaded}
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Processing...
        </>
      ) : !scriptLoaded ? (
        'Loading Payment...'
      ) : (
        <>
          <i className="ri-secure-payment-line mr-2 w-4 h-4 flex items-center justify-center"></i>
          Pay with Razorpay
        </>
      )}
    </button>
  );
}
