import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { fetchMyTask, updateTaskStatus, uploadProof } from '../services/apiServices';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // For picking proof images
import { MaterialIcons } from '@expo/vector-icons'; // Importing the icons from Expo
import Header from '../components/Header';

export default function WorkerScreen({ navigation }) {
    const [tasks, setTasks] = useState([]);
    const [mainDataLoading, setMainDataLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const initialDisplayCount = 3;

    const getMyTasks = async () => {
        setMainDataLoading(true);
        try {
            const response = await fetchMyTask();
            setTasks(response);
        } catch (error) {
            console.log(error);
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        } finally {
            setMainDataLoading(false);
        }
    };

    // Use useFocusEffect to trigger getMyTasks when screen regains focus
    useFocusEffect(
        useCallback(() => {
            getMyTasks();
        }, [])
    );

    // Function to update task status
    const updateStatus = async (id, status) => {
        setLoading(true);
        try {
            await updateTaskStatus({ id, status });
            Toast.show({ type: 'success', text1: 'Status Updated', text2: `Task is now ${status}` });
            getMyTasks(); // Refresh tasks
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        } finally {
            setLoading(false);
        }
    };

    // Function to pick an image for proof
    const pickImage = async (taskId, proof) => {
        // Check if proof already exists
        if (proof) {
            // Show confirmation alert to the user
            Alert.alert(
                'Confirmation',
                'You already uploaded proof of work. Do you want to upload a new?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Yes',
                        onPress: async () => {
                            await openImagePicker(taskId); // Proceed to image picker
                        },
                    },
                ]
            );
        } else {
            // No existing proof, directly open the image picker
            await openImagePicker(taskId);
        }
    };

    const openImagePicker = async (taskId) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            await uploadProof(taskId, result.assets[0].uri); // Upload proof image
            Toast.show({ type: 'success', text1: 'Uploaded', text2: 'Image uploaded successfully' });
            getMyTasks(); // Refresh tasks
        } else {
            Toast.show({ type: 'error', text1: 'Not Found', text2: 'Image upload not successful' });
        }
    };


    if (mainDataLoading) return <ActivityIndicator color={'blue'} />;

    // Render a single task
    const renderTask = ({ item }) => {
        const { service_request, utility_workers, deadline, status } = item;
        const { service, requested, approver } = service_request;  

        return (
            <View className="flex-1 gap-2 mb-6 p-2 bg-white rounded-lg">
                <View key={item.id}>
                    {/* Task Details */}
                    <Text className="text-xl font-bold text-gray-800">{service?.name || 'N/A'}</Text>
                    <Text className="text-gray-600 mb-1 text-lg">Where: {requested?.department || 'N/A'}</Text>
                    <Text className="text-gray-600 mb-1 text-lg">Classification: {service_request?.classification?.toUpperCase() || 'N/A'}</Text>
                    <Text className="text-gray-600 mb-1 text-lg">Description: {service_request?.description || 'N/A'}</Text>
                    <Text className="text-gray-700 mb-1 text-lg">Task Status:
                        <Text
                            className={`text-white ${status === 'in_progress' ? 'bg-blue-400'
                                : status === 'pending' ? 'bg-yellow-400' : 'bg-emerald-400'}`}>
                            {" " + status.toUpperCase() + " "}
                        </Text>
                    </Text>
                    <Text className="text-gray-700 mb-1 text-lg">Deadline: {deadline}</Text>

                    {/* Service Request Details */}
                    <Text className="mt-4 font-semibold text-gray-800 text-lg">Service Request</Text>
                    <Text className="text-gray-700 text-lg">Requested By: {requested ? `${requested.firstname} ${requested.lastname}` : 'N/A'}</Text>
                    <Text className="text-gray-700 text-lg">Approved By: {approver ? `${approver.firstname} ${approver.lastname}` : 'N/A'}</Text>

                    {/* Utility Worker Details */}
                    <Text className="mt-4 font-semibold text-gray-800 text-lg">Assigned Utility Worker</Text>
                    {/* {
                        utility_workers.map(worker => (
                            <Text className="text-gray-700 pl-2">{worker ? `${worker.firstname} ${worker.lastname} ( ${worker.department} )`  : 'N/A'}</Text>
                        ))
                    } */}

                    <View style={{ minHeight: 50 }}>
                        {
                            utility_workers.slice(0, showAll ? utility_workers.length : initialDisplayCount)
                                .map((worker, index) => (
                                    <Text key={index} className="text-gray-700 pl-2 text-lg">
                                        {worker ? `${worker.firstname} ${worker.lastname} ( ${worker.department} )` : 'N/A'}
                                    </Text>
                                ))
                        }
                    </View>

                    {/* Display "See More" if there are more workers to show */}
                    {utility_workers.length > initialDisplayCount && (
                        <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                            <Text className={`pl-2 ${showAll ? 'hidden' : ''}`}>...</Text>
                            <Text className="text-blue-600">
                                {showAll ? "See Less" : "See More"}
                            </Text>
                        </TouchableOpacity>
                    )}

                </View>

                {/* Actions */}
                <View className="flex flex-row items-center justify-center">
                    {status === 'pending' && (
                        <TouchableOpacity
                            onPress={() => updateStatus(item.id, 'in_progress')}
                            className="flex-row items-center p-2 bg-blue-400 rounded ml-2 w-full justify-center"
                        >
                            <MaterialIcons name="autorenew" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Start Task</Text>
                        </TouchableOpacity>
                    )}
                    {status === 'in_progress' && (
                        <TouchableOpacity
                            onPress={() => pickImage(item.id, item.proof)}
                            className="flex-row items-center p-2 bg-green-400 rounded ml-2"
                        >
                            <MaterialIcons name="cloud-upload" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Proof</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };


    return (
        <View className="flex-1 py-6 bg-gray-100">
            <Header navigation={navigation} />
            <View className="px-4 py-6 mb-16">
                <Text className="text-2xl font-bold mb-6">My Tasks</Text>
                {mainDataLoading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <FlatList
                        data={tasks}
                        keyExtractor={(item) => item.id?.toString()}
                        renderItem={renderTask}
                        ListEmptyComponent={<Text className="text-center text-gray-600 mt-4">No tasks available</Text>}
                    />
                )}
                <Toast />
            </View>
        </View>
    );
}
