// src/screens/LoginScreen.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';  // Import axios
import { View, TextInput, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message'; // Import Toast
import Loading from '../components/Loading';
import { useUserStore } from '../store/userStore';
import { storeData } from '../utils/LocalStorage';
import { Platform } from 'react-native';
import { API_URL, API_KEY, MAIN_URL, PROJECT_ID } from '@env'; // Import your project ID
import * as Notifications from 'expo-notifications'; // Import Notifications
import { AntDesign, FontAwesome } from '@expo/vector-icons'; // Import Expo Vector Icons

const LoginScreen = ({ navigation }) => {
    const { setUser, setAccessToken } = useUserStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pushToken, setPushToken] = useState('');

    const getPushToken = async () => {
        try {
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({
                    projectId: PROJECT_ID,
                })
            ).data;
            console.log({ tokens: pushTokenString });
            setPushToken(pushTokenString)
            return pushTokenString;
        } catch (e) {
            setPushToken('ExponentPushToken[9PfRzpxQ692uQL0lz0m8QN]')
            handleRegistrationError(`${e}`);
        }
    }


    const handleLogin = async () => {
        try {
            setIsLoading(true); // Prevent UI conflicts

            const response = await axios.post(`${API_URL}/login`, {
                email,
                password,
                expo_push_token: pushToken,
            });

            const userData = response.data;

            if (userData.user?.type === 'general_service') return Toast.show({ type: 'error', text1: 'Not Allowed', text2: 'For admin account, please login using web' })

            if (response && response.status === 200) {
                setUser(userData.user); // Save user data in your store
                setAccessToken(userData.token); // Save user data in your store
                Toast.show({ type: 'success', text1: 'Login Successful!' });
                await storeData('accessToken', userData.token);
                await storeData('user', userData.user);
                setTimeout(() => {
                    if (userData.user?.type === 'faculty') {
                        navigation.navigate('FacultyApp'); // Navigate to FacultyApp
                    } else {
                        navigation.navigate('MainApp'); // Navigate to WorkerApp
                    }
                }, 1500);
                console.log(userData)
            } else {
                Toast.show({ type: 'error', text1: 'Error', text2: 'Invalid login credentials' });
            }

        } catch (error) {
            console.log("Login Error:", error);
            Toast.show({ type: 'error', text1: 'Error', text2: error.response.data.message });
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };


    useEffect(() => {
        getPushToken();
    }, [])

    return (
        <View className="flex-1 justify-center items-center bg-gray-100 p-6">
            {/* Email input */}
            <View className="flex-row items-center bg-white w-full p-4 mb-4 rounded-lg shadow-md">
                <AntDesign name="mail" size={20} color="gray" />
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    className="flex-1 ml-2 text-lg"
                    autoCapitalize="none"
                />
            </View>

            {/* Password input */}
            <View className="flex-row items-center bg-white w-full p-4 mb-6 rounded-lg shadow-md">
                <FontAwesome name="lock" size={20} color="gray" />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    className="flex-1 ml-2 text-lg"
                    secureTextEntry
                />
            </View>

            <View className="mb-2">
                {isLoading && <ActivityIndicator color={'blue'} />}
            </View>

            <TouchableOpacity
                onPress={handleLogin}
                className="flex gap-2 bg-blue-500 w-full p-4 rounded-lg items-center shadow-lg"
                disabled={isLoading}
            >
                <Text className="text-white flex gap-2 items-center text-lg font-bold">
                    Login</Text>
            </TouchableOpacity>

            {/* Sign up link */}
            <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                className="mt-4"
            >
                <Text>Don't have an account?
                    <Text className="text-blue-500 underline"> Sign up</Text>
                </Text>
            </TouchableOpacity>

            {/* {isLoading && <Loading />} */}
            <Toast />
        </View>
    );
};

export default LoginScreen;
