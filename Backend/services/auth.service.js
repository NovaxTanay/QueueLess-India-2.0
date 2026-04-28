// ============================================
// QueueLess India 2.0 — Auth Service
// ============================================
// Handles Firebase Authentication + user profile in Firestore

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

/**
 * Register a new user with Firebase Auth + Firestore profile
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @param {string} role - 'user' or 'admin'
 * @returns {object} user profile data
 */
export const registerUser = async (email, password, name, role = 'user') => {
  try {
    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name in Auth
    await updateProfile(user, { displayName: name });

    // Create user profile document in Firestore
    const userProfile = {
      name,
      email,
      role,
      serviceIds: [], // populated when admin registers services
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    return {
      uid: user.uid,
      ...userProfile,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {object} user profile data
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUserProfile(userCredential.user.uid);
    return {
      uid: userCredential.user.uid,
      ...profile,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Failed to logout. Please try again.');
  }
};

/**
 * Get user profile from Firestore
 * @param {string} uid
 * @returns {object|null} user profile
 */
export const getUserProfile = async (uid) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Get profile error:', error);
    throw new Error('Failed to load user profile.');
  }
};

/**
 * Listen to auth state changes
 * @param {function} callback - called with (user | null)
 * @returns {function} unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Append a serviceId to the user's serviceIds array (no overwrite)
 * @param {string} uid
 * @param {string} serviceId
 */
export const updateUserServiceIds = async (uid, serviceId) => {
  try {
    await setDoc(
      doc(db, 'users', uid),
      { serviceIds: arrayUnion(serviceId) },
      { merge: true }
    );
  } catch (error) {
    console.error('Update serviceIds error:', error);
    throw new Error('Failed to link service to account.');
  }
};

/**
 * Get all services owned by an admin
 * @param {string} uid - admin UID
 * @returns {Array} services
 */
export const getAdminServices = async (uid) => {
  try {
    const q = query(
      collection(db, 'services'),
      where('adminUid', '==', uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Get admin services error:', error);
    return [];
  }
};

/**
 * Convert Firebase Auth error codes to user-friendly messages
 */
const getAuthErrorMessage = (code) => {
  const messages = {
    'auth/email-already-in-use': 'This email is already registered. Try logging in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
  };
  return messages[code] || 'Authentication failed. Please try again.';
};
