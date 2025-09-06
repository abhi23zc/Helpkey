import { Metadata } from 'next';
import AdminBookingDetail from './AdminBookingDetail';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminBookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminBookingDetail bookingId={id} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Booking ${id} - Admin Dashboard`,
    description: `View and manage booking details for booking ${id}`,
  };
}
