# Razorpay Integration Setup

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

## Getting Razorpay Credentials

1. Sign up for a Razorpay account at https://razorpay.com
2. Go to Settings > API Keys
3. Generate API keys for your application
4. Copy the Key ID and Key Secret
5. Add them to your `.env.local` file

## Features Implemented

- ✅ Razorpay payment integration
- ✅ Order creation API endpoint
- ✅ Payment verification API endpoint
- ✅ Secure payment processing
- ✅ Error handling for failed payments
- ✅ Payment success/failure callbacks
- ✅ Booking creation after successful payment
- ✅ Support for multiple payment methods (cards, UPI, net banking, wallets)
- ✅ **Refund Management System**
- ✅ Admin refund processing interface
- ✅ Customer refund request system
- ✅ Refund history tracking
- ✅ Automatic refund processing through Razorpay

## Payment Flow

1. User fills guest information
2. System creates Razorpay order
3. User completes payment through Razorpay
4. Payment is verified on server
5. Booking is created in Firestore
6. User is redirected to bookings page

## Refund Flow

### For Customers:
1. Customer submits refund request through booking details page
2. Request is stored in Firestore with status "pending"
3. Admin reviews and approves/rejects the request
4. If approved, admin processes refund through Razorpay
5. Refund is automatically processed to original payment method
6. Customer receives confirmation

### For Admins:
1. View all refund requests in admin panel
2. Review request details and customer information
3. Approve or reject requests with admin notes
4. Process approved refunds directly through Razorpay
5. Track refund history and status

## Security Features

- Payment verification using Razorpay signatures
- Server-side order creation
- Secure API endpoints
- No sensitive payment data stored in frontend
- PCI DSS compliant through Razorpay

## Testing

For testing, you can use Razorpay's test mode:
- Use test API keys
- Use test card numbers provided by Razorpay
- All test payments will be successful

## Production Deployment

1. Switch to live API keys
2. Ensure HTTPS is enabled
3. Configure webhook endpoints for additional security
4. Set up proper error monitoring
