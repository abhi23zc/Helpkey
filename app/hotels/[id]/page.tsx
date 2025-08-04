
import { Metadata } from 'next';
import HotelDetail from './HotelDetail';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HotelDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <HotelDetail hotelId={id} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Hotel ${id} - Helpkey`,
    description: `View details for hotel ${id}`,
  };
}
