
import HotelDetail from './HotelDetail';

export default function HotelDetailPage({ params }: { params: { id: string } }) {
  return <HotelDetail hotelId={params.id} />;
}
