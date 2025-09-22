"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RefundRequest from '@/components/RefundRequest';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { db } from '@/config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface BookingDetailProps {
	bookingId: string;
}

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
	roomDetails?: { type?: string; price?: number; size?: string; beds?: string; image?: string; roomNumber?: string | null };
	guestInfo?: Array<{ firstName?: string; lastName?: string; email?: string; phone?: string; specialRequests?: string }>;
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

export default function BookingDetail({ bookingId }: BookingDetailProps) {
	const { user } = useAuth();
	const [booking, setBooking] = useState<BookingDoc | null>(null);
	const [activeTab, setActiveTab] = useState<'details' | 'room' | 'guest' | 'payment'>('details');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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
					setBooking(data);
				}
			} catch (e: any) {
				console.error(e);
				setError(e.message || 'Failed to load booking');
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [bookingId]);

	const canModify = useMemo(() => {
		if (!user || !booking || booking.userId !== user.uid) return false;
		const status = (booking.status || '').toLowerCase();
		return status === 'confirmed';
	}, [user, booking]);

	const calculateNights = () => {
		if (!booking) return 0;
		const checkInDate = new Date(booking.checkIn);
		const checkOutDate = new Date(booking.checkOut);
		const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
		return Math.ceil(timeDiff / (1000 * 3600 * 24));
	};

	const onCancel = async () => {
		if (!booking || !canModify) return;
		if (!confirm('Are you sure you want to cancel this booking?')) return;
		try {
			await updateDoc(doc(db, 'bookings', booking.id), { status: 'cancelled' });
			setBooking({ ...booking, status: 'cancelled' });
		} catch (e) {
			console.error('Cancel failed', e);
			alert('Failed to cancel booking');
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Header />
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading booking…</p>
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
					<p className="text-red-600">{error || 'Booking not found'}</p>
					<Link href="/bookings" className="text-blue-600 hover:underline">Back to My Bookings</Link>
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
					<Link href="/bookings" className="flex items-center text-blue-600 hover:text-blue-700 cursor-pointer">
						<i className="ri-arrow-left-line mr-2 w-4 h-4 flex items-center justify-center"></i>
						Back to My Bookings
					</Link>
				</div>

				<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
					<div className="flex flex-col md:flex-row justify-between items-start mb-4">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Details</h1>
							<p className="text-gray-600">Booking Reference: {booking.reference}</p>
						</div>
						<span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
							{booking.status}
						</span>
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
							<p className="font-semibold text-lg">{calculateNights()} nights</p>
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
											{booking.roomDetails?.roomNumber && (
												<div className="flex justify-between">
													<span className="text-gray-600">Room Number:</span>
													<span className="font-medium text-green-600">{booking.roomDetails.roomNumber}</span>
												</div>
											)}
										</div>
									</div>
									<div>
										<h4 className="font-semibold text-gray-900 mb-3">Important Information</h4>
										<div className="bg-blue-50 rounded-lg p-4">
											<ul className="text-sm text-blue-700 space-y-1">
												<li>• Check-in: 3:00 PM</li>
												<li>• Check-out: 11:00 AM</li>
												<li>• Valid ID required at check-in</li>
												<li>• Free cancellation until 24 hours before</li>
												<li>• Contact hotel directly for special requests</li>
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
											src={booking.roomDetails?.image || ''}
											alt={booking.roomDetails?.type || 'Room'}
											className="w-full h-64 object-cover object-top rounded-lg"
										/>
									</div>
									<div className="md:w-1/2">
										<h4 className="text-lg font-semibold text-gray-900 mb-2">{booking.roomDetails?.type || 'Room'}</h4>
										
										{/* Room Number Display */}
										{booking.roomDetails?.roomNumber && (
											<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
												<div className="flex items-center">
													<i className="ri-door-open-line text-green-600 mr-2 w-5 h-5 flex items-center justify-center"></i>
													<span className="text-green-800 font-semibold">Your Room: {booking.roomDetails.roomNumber}</span>
												</div>
											</div>
										)}
										
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
												<span className="font-medium">₹{booking.roomDetails?.price}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Number of Nights:</span>
												<span className="font-medium">{calculateNights()}</span>
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

								{/* Refund Request - Only for cancelled bookings with payments */}
								{booking.paymentInfo?.paymentId && booking.status.toLowerCase() === 'cancelled' && (
									<div className="border-t pt-6">
										<RefundRequest
											bookingId={booking.id}
											bookingReference={booking.reference}
											totalAmount={booking.totalAmount}
											onRequestSubmitted={() => {
												alert('Refund request submitted successfully. We will process it within 2-3 business days.');
											}}
										/>
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
					<div className="flex flex-wrap gap-3">
						{canModify && (
							<button onClick={onCancel} className="border border-red-300 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap">
								Cancel Booking
							</button>
						)}
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
