'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { uploadToCloudinary } from '@/utils/cloudinary';

type HotelFormData = {
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  stars: number;
  description: string;
  amenities: string[];
  images: string[];
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
    pets: boolean;
    smoking: boolean;
  };
};

type UploadingImage = {
  file: File;
  progress: number;
  url?: string;
  error?: string;
};

export default function AddHotel() {
  const router = useRouter();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<HotelFormData>({
    name: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    stars: 3,
    description: '',
    amenities: [],
    images: [],
    policies: {
      checkIn: '15:00',
      checkOut: '11:00',
      cancellation: 'Free cancellation within 24 hours',
      pets: false,
      smoking: false,
    },
  });

  const [currentAmenity, setCurrentAmenity] = useState('');
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const amenityOptions: string[] = [
    'Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa & Wellness', 'Restaurant',
    'Room Service', 'Concierge', 'Valet Parking', 'Business Center', 'Meeting Rooms',
    'Bar/Lounge', 'Laundry Service', 'Airport Shuttle', 'Pet Friendly', 'Air Conditioning',
    'Balcony', 'Ocean View', 'Mountain View', 'Garden View', 'Beach Access',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stars' ? parseInt(value) : value,
    }));
  };

  const handlePolicyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      policies: {
        ...prev.policies,
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
  };

  const addAmenity = () => {
    if (!currentAmenity) return;
    setFormData(prev => {
      if (prev.amenities.includes(currentAmenity)) return prev;
      return { ...prev, amenities: [...prev.amenities, currentAmenity] };
    });
    setCurrentAmenity('');
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsUploading(true);
    const newUploads = files.map(file => ({ file, progress: 0 }));
    setUploadingImages(prev => [...prev, ...newUploads]);

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadingImages(prev =>
          prev.map(upload =>
            upload.file === file
              ? { ...upload, error: 'File too large (max 10MB)' }
              : upload
          )
        );
        continue;
      }

      try {
        const progressInterval = setInterval(() => {
          setUploadingImages(prev =>
            prev.map(upload =>
              upload.file === file && upload.progress < 90
                ? { ...upload, progress: Math.min(upload.progress + 10, 90) }
                : upload
            )
          );
        }, 200);

        const result = await uploadToCloudinary(file, 'hotels');
        clearInterval(progressInterval);

        setUploadingImages(prev =>
          prev.filter(upload => upload.file !== file)
        );

        setFormData(prev => ({
          ...prev,
          images: [...prev.images, result.secure_url],
        }));
      } catch (err) {
        console.error('Error uploading image:', err);
        setUploadingImages(prev =>
          prev.map(upload =>
            upload.file === file
              ? { ...upload, error: 'Upload failed' }
              : upload
          )
        );
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== url),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const requiredFields = [
      { field: formData.name, message: 'Hotel name is required' },
      { field: formData.location, message: 'Location is required' },
      { field: formData.address, message: 'Address is required' },
      { field: formData.phone, message: 'Phone number is required' },
      { field: formData.email, message: 'Email is required' },
      { field: formData.description, message: 'Description is required' },
    ];

    for (const { field, message } of requiredFields) {
      if (!field.trim()) {
        setError(message);
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!user?.uid) {
      setError('You must be logged in to add a hotel');
      return;
    }

    setIsSubmitting(true);
    try {
      const hotelData = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        addedAt: new Date().toISOString(),
        approved: false,
        hotelAdmin: user.uid,
      };

      const docRef = await addDoc(collection(db, 'hotels'), hotelData);
      console.log('Hotel added with ID:', docRef.id);
      setShowSuccess(true);

      setTimeout(() => {
        router.push('/admin/hotels');
      }, 2000);
    } catch (err: any) {
      console.error('Error adding hotel:', err);
      setError(err.message || 'Error adding hotel. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* --- rest of your JSX remains unchanged --- */}
      <Footer />
    </div>
  );
}
