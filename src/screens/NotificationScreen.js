import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { notifMarkAsRead } from '../services/apiServices';
import Toast from 'react-native-toast-message';
import { timeAgo } from '../utils/convertDate';

export default function NotificationScreen({ navigation, route }) {
    const notifications = route.params.data;
    const [mainDataLoading, setMainDataLoading] = useState(false);

    const handleReadNotif = async (notification) => {

        try {
            await notifMarkAsRead(notification.id); // Adjust according to your insert function
            const type = notification.type;
            if (type === 'assign-task') {
                navigation.navigate('MainApp', { data: notification })
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        }
    }



    return (
        <View className="flex-1">
            <Text className="pt-2 pl-4 text-lg">New</Text>
            <ScrollView className="p-2">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <TouchableOpacity
                            key={notification.id}
                            className={`p-4 py-2 mb-2 rounded-lg ${notification.isRead === 0 ? 'bg-slate-200' : 'bg-white'}`}
                            onPress={() => handleReadNotif(notification)}>
                            <Text className="font-bold text-lg">{notification.message}</Text>
                            <Text className="text-sm">Type: {notification.type === 'assign-tast' ? '' : 'TASK' }</Text>
                            <Text className="text-sm text-blue-600">{timeAgo(notification.created_at)}</Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={`text-gray-500`}>No notifications</Text>
                )}
            </ScrollView>
            {/* <TouchableOpacity
                style={`bg-blue-500 rounded-lg py-2 px-4`}
                onPress={() => setModalVisible(false)}
            >
            </TouchableOpacity> */}
            <Toast />
        </View>
    );
}
