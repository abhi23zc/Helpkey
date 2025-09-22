import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { RAZORPAY_CONFIG } from '@/config/razorpay';

const razorpay = new Razorpay({
  key_id: RAZORPAY_CONFIG.key_id,
  key_secret: RAZORPAY_CONFIG.key_secret,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_id, amount, reason = 'Booking cancellation', notes = {} } = body;

    if (!payment_id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Create refund
    const refund = await razorpay.payments.refund(payment_id, {
      amount: amount ? amount * 100 : undefined, // Convert to paise if amount specified
      notes: {
        reason: reason,
        refund_type: 'booking_cancellation',
        timestamp: new Date().toISOString(),
        ...notes
      }
    });

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        payment_id: refund.payment_id,
        status: refund.status,
        created_at: refund.created_at,
        notes: refund.notes
      }
    });

  } catch (error: any) {
    console.error('Error processing refund:', error);
    
    // Handle specific Razorpay errors
    if (error.error) {
      return NextResponse.json(
        { 
          error: error.error.description || 'Refund failed',
          code: error.error.code,
          details: error.error
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}

// Get refund details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refund_id = searchParams.get('refund_id');
    const payment_id = searchParams.get('payment_id');

    if (!refund_id && !payment_id) {
      return NextResponse.json(
        { error: 'Either refund_id or payment_id is required' },
        { status: 400 }
      );
    }

    let refund;
    if (refund_id) {
      refund = await razorpay.refunds.fetch(refund_id);
    } else {
      // Get all refunds for a payment
      const refunds = await razorpay.payments.fetchAllRefunds(payment_id!);
      return NextResponse.json({
        success: true,
        refunds: refunds.items
      });
    }

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        payment_id: refund.payment_id,
        status: refund.status,
        created_at: refund.created_at,
        notes: refund.notes
      }
    });

  } catch (error: any) {
    console.error('Error fetching refund:', error);
    
    if (error.error) {
      return NextResponse.json(
        { 
          error: error.error.description || 'Failed to fetch refund',
          code: error.error.code
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch refund details' },
      { status: 500 }
    );
  }
}
