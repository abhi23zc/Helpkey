export interface UserData {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'user' | 'admin';
  isBanned: boolean;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  dateOfBirth?: string;
  gender?: string;
  emergencyContact?: string;
  preferences?: {
    notifications: boolean;
    marketing: boolean;
    sms: boolean;
  };
  idProofs?: {
    aadhaar?: string;
    pan?: string;
  };
  createdAt: any;
  updatedAt: any;
}
