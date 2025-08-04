'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/config/firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { uploadToCloudinary } from '@/utils/cloudinary';

export default function EditRoom() {
  const [hotelId, setHotelId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [beds, setBeds] = useState('');
  const [capacity, setCapacity] = useState('');
  const [status, setStatus] = useState('Available');
  const [amenities, setAmenities] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<Array<{
    file: File;
    progress: number;
    preview: string;
  }>>([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    const fetchHotels = async () => {
      const hotelsSnapshot = await getDocs(collection(db, 'hotels'));
      const hotelsData = hotelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHotels(hotelsData);
    };
    fetchHotels();

    if (id) {
      const fetchRoom = async () => {
        const docRef = doc(db, 'rooms', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const roomData = docSnap.data();
          setHotelId(roomData.hotelId);
          setRoomNumber(roomData.roomNumber);
          setRoomType(roomData.roomType);
          setPrice(roomData.price.toString());
          setSize(roomData.size);
          setBeds(roomData.beds);
          setCapacity(roomData.capacity.toString());
          setStatus(roomData.status);
          setAmenities(roomData.amenities.join(', '));
          setImages(roomData.images || []);
        }
      };
      fetchRoom();
    }
  }, [id]);

  const handleFileSelect = async (files: FileList) => {
    const newFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    if (newFiles.length === 0) {
      alert('Please select valid image files (max 5MB each)');
      return;
    }

    const newUploadingImages = newFiles.map(file => ({
      file,
      progress: 0,
      preview: URL.createObjectURL(file)
    }));

    setUploadingImages(prev => [...prev, ...newUploadingImages]);

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const index = uploadingImages.length + i;

      try {
        const imageUrl = await uploadToCloudinary(file, (progress) => {
          setUploadingImages(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], progress };
            return updated;
          });
        });

        setImages(prev => [...prev, imageUrl]);
        setUploadingImages(prev => prev.filter((_, idx) => idx !== index));
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload image. Please try again.');
        setUploadingImages(prev => prev.filter((_, idx) => idx !== index));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadingImage = (index: number) => {
    setUploadingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedHotel = hotels.find(h => h.id === hotelId);
      const roomRef = doc(db, 'rooms', id as string);
      await updateDoc(roomRef, {
        hotelId,
        hotelName: selectedHotel ? selectedHotel.name : '',
        roomNumber,
        roomType,
        price: parseFloat(price),
        size,
        beds,
        capacity: parseInt(capacity, 10),
        status,
        amenities: amenities.split(',').map(item => item.trim()),
        images,
      });
      router.push('/admin/rooms');
    } catch (error) {
      console.error('Error updating room: ', error);
      alert('Failed to update room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Room</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="hotel" className="block text-sm font-medium text-gray-700">Hotel</label>
              <select
                id="hotel"
                value={hotelId}
                onChange={(e) => setHotelId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select a hotel</option>
                {hotels.map(hotel => (
                  <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">Room Number</label>
                <input
                  type="text"
                  id="roomNumber"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="roomType" className="block text-sm font-medium text-gray-700">Room Type</label>
                <input
                  type="text"
                  id="roomType"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price per Night ($)</label>
                    <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity</label>
                    <input
                    type="number"
                    id="capacity"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700">Size (e.g., 1200 sq ft)</label>
                <input
                  type="text"
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="beds" className="block text-sm font-medium text-gray-700">Beds (e.g., 2 Queen Beds)</label>
                <input
                  type="text"
                  id="beds"
                  value={beds}
                  onChange={(e) => setBeds(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="amenities" className="block text-sm font-medium text-gray-700">Amenities (comma-separated)</label>
              <input
                type="text"
                id="amenities"
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Images</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400"
              >
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <span className="relative bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload files</span>
                    </span>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {(uploadingImages.length > 0 || images.length > 0) && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadingImages.map((uploading, index) => (
                    <div key={`uploading-${index}`} className="relative">
                      <img src={uploading.preview} alt="Uploading..." className="w-full h-24 object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <div className="text-white text-sm">{uploading.progress}%</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUploadingImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {images.map((image, index) => (
                    <div key={`image-${index}`} className="relative">
                      <img src={image} alt={`Room image ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option>Available</option>
                <option>Occupied</option>
                <option>Maintenance</option>
                <option>Out of Order</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => router.back()} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Room'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}