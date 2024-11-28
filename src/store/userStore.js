// src/useStore.js
import { create } from 'zustand';
import { removeData } from '../utils/LocalStorage';

export const useUserStore = create((set) => ({
    user: null, // Initialize user as null
    accessToken: null,
    setUser: (newUser) => set({ user: newUser }), // Method to set user
    setAccessToken: (token) => set({ accessToken: token }), // Method to set user
    logout: () => {
        set({ user: null, accessToken: null }); // Clear the in-memory state
        removeData('user'); // Remove user data from AsyncStorage
        removeData('accessToken'); // Remove accessToken from AsyncStorage
        console.log('User logged out and data removed');
    },
}));
