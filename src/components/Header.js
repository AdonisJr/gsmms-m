import { View, Text, TouchableOpacity, Modal } from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { useUserStore } from '../store/userStore';
import { useCurrentNavStore } from '../store/currentNavStore';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { fetchNotifications, logoutFromBE } from '../services/apiServices';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';

export default function Header({ navigation }) {
    const { user, logout } = useUserStore();
    const { currentApp } = useCurrentNavStore();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleLogout = async () => {
        // try {
            // await logoutFromBE();
            Toast.show({ type: 'success', text1: 'Success', text2: 'Successfully logged out' });
            setTimeout(() => {
                logout();
                navigation.navigate('Login');
                setDropdownVisible(false);
            }, 1000)
        // } catch (error) {
        //     Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        // }
    };

    const getNotifications = async () => {
        try {
            const response = await fetchNotifications();
            setNotifications(response);

            // Filter unread notifications and count them
            const unreadNotifications = response.filter(notification => !notification.isRead);
            setUnreadCount(unreadNotifications.length);
            // console.log('Requested Services:', response);
        } catch (error) {
            console.log(error);
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        }
    };

    // Set up the notification listener
    useEffect(() => {
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            // Whenever a notification is received, trigger getNotifications
            console.log('Notification received:', notification);
            getNotifications();
        });

        // Cleanup the listener when the component unmounts
        return () => {
            notificationListener.remove();
        };
    }, [getNotifications]);

    // Use useFocusEffect to call getNotifications when the screen is focused
    useFocusEffect(
        useCallback(() => {
            // Fetch notifications when screen is focused
            getNotifications();
            // console.log({ notif: notifications });
        }, []) // Re-run when notifications state changes
    );

    return (
        <View className="bg-slate-100">
            <View className="p-4 bg-blue-800 rounded-3xl mx-2">
                <View className="absolute -top-2 flex-row w-screen justify-center">
                    <View className="bg-slate-100 w-72 h-5 rounded-lg">
                        <Text></Text>
                    </View>
                </View>
                <View className="flex-row justify-between items-center pl-2">
                    <TouchableOpacity
                        className="flex-col items-center"
                        onPress={() =>
                            currentApp === 'Main'
                                ? navigation.navigate('Services')
                                : currentApp === 'Faculty'
                                    ? navigation.navigate('Services')
                                    : navigation.navigate('AvailableTask')
                        }
                    >
                        <View className="flex-col justify-center items-center">
                            <FontAwesome5 name="tools" size={24} color="white" />
                            <Text className="text-xs font-bold text-white">GSMMS</Text>
                        </View>
                    </TouchableOpacity>

                    <View className="flex-row items-center gap-4">
                        <TouchableOpacity className="relative" onPress={() => navigation.navigate('Notifications', { data: notifications })}>
                            {unreadCount > 0 && (
                                <View className="absolute top-0 -right-2 bg-red-500 rounded-full flex items-center justify-center z-40 w-5 h-3">
                                    <Text className="text-xs text-white font-bold">{unreadCount}</Text>
                                </View>
                            )}
                            <MaterialCommunityIcons name="bell-badge" size={22} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setDropdownVisible(true)}>
                            <View className="bg-white p-2 rounded-full">
                                <Entypo name="user" size={20} color="black" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <Modal
                transparent={true}
                visible={dropdownVisible}
                animationType="fade"
                onRequestClose={() => setDropdownVisible(false)}
            >
                <View
                    onPress={() => setDropdownVisible(false)}
                    className="bg-black bg-opacity-30">
                </View>
                <TouchableOpacity
                    className="flex-1"
                    onPress={() => setDropdownVisible(false)}
                    activeOpacity={1}
                >
                    <View className="absolute top-14 right-4 bg-slate-100 shadow-lg rounded-lg p-4 w-40">
                        <Text className="text-lg font-bold mb-2 text-gray-800">{user?.firstname} {user?.lastname}</Text>
                        <TouchableOpacity
                            className="flex-row items-center py-2"
                            onPress={() => {
                                navigation.navigate('Settings');
                                setDropdownVisible(false);
                            }}
                        >
                            <MaterialIcons name="settings" size={20} color="gray" />
                            <Text className="ml-2 text-gray-800">Settings</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center py-2"
                            onPress={handleLogout}
                        >
                            <AntDesign name="logout" size={20} color="gray" />
                            <Text className="ml-2 text-gray-800">Logout</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
