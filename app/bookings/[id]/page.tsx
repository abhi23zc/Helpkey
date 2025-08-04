import { Metadata } from 'next';
import BookingDetail from './BookingDetail';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <BookingDetail bookingId={id} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Booking ${id} - Helpkey`,
    description: `View details for booking ${id}`,
  };
}