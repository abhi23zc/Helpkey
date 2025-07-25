import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Function to get user data from Firestore
export const getUserData = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      console.log('No such user document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Function to update user data in Firestore
export const updateUserData = async (uid: string, data: any) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
};

// Function to update user ID proofs
export const updateUserIdProofs = async (uid: string, proofType: 'aadhaar' | 'pan', url: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      [`idProofs.${proofType}`]: url,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating ID proof:', error);
    return false;
  }
};