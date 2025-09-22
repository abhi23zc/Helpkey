// Razorpay configuration
export const RAZORPAY_CONFIG = {
  key_id: "rzp_test_HQ4tZ6kBqnghIu" || '',
  key_secret: "MfDx0p5Ngmqb2G9Vk4GZeSMe" || '',
  currency: 'INR',
  name: 'Helpkey Hotels',
  description: 'Hotel Booking Payment',
  // image: '/logo.png', // Add your logo path if you have one
  theme: {
    color: '#2563eb'
  }
};

// Razorpay types
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    [key: string]: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: {
    order_id: string;
    payment_id: string;
  };
}
