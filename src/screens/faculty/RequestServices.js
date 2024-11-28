import { View, Text, Button, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { fetchAvailableServices, sendRequest } from '../../services/apiServices';
// import Loading from '../../Loading';
import { Picker } from '@react-native-picker/picker';
import { useUserStore } from '../../store/userStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';

export default function RequestServices({ navigation }) {
    const [availableServices, setAvailableServices] = useState([]); // Initialize as an empty array
    const [mainDataLoading, setMainDataLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showDatePicker2, setShowDatePicker2] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useUserStore();

    const userData = user;

    const [formData, setFormData] = useState({
        requested_by: userData?.id,
        status: 'pending',
        service_id: '',
        description: '',
        expected_start_date: new Date(),
        expected_end_date: new Date(),
        number_of_personnel: '',
        classification: '',
        other: ''
    }); // Initialize formData

    const getAvailableServices = async () => {
        setMainDataLoading(true);
        try {
            const response = await fetchAvailableServices();
            setAvailableServices(response); // Update the state with the fetched data
            console.log('Available Services:', response); // Correct log after fetching data
        } catch (error) {
            console.log(error);
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        } finally {
            setMainDataLoading(false);
        }
    };

    const handleRequest = async () => {
        setLoading(false);
        console.log(formData)
        // Validate form fields
        if (!formData.requested_by) return Toast.show({ type: 'error', text1: 'Error', text2: 'Please login first' });
        if (!formData.service_id) return Toast.show({ type: 'error', text1: 'Error', text2: 'Please select a service' });
        if (!formData.description) return Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter a description' });
        if (!formData.expected_start_date) return Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter expected start date' });
        if (!formData.expected_end_date) return Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter end date' });
        if (!formData.number_of_personnel) return Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter the number of personnel' });
        if (!formData.classification) return Toast.show({ type: 'error', text1: 'Error', text2: 'Please select classification' });

        try {
            setLoading(true);
            const response = await sendRequest(formData);
            Toast.show({ type: 'success', text1: 'Success', text2: 'Request submitted successfully' });
            setTimeout(() => {
                getAvailableServices();
                navigation.goBack();
            }, 1000);
        } catch (error) {
            console.log(error)
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        } finally {
            setLoading(false);
        }
    };

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || new Date();
        setShowDatePicker(false); // Hide the date picker after selection
        setFormData({ ...formData, expected_start_date: currentDate }); // Update the selected date
    };

    const onChangeDate2 = (event, selectedDate) => {
        const currentDate = selectedDate || new Date();
        setShowDatePicker2(false); // Hide the date picker after selection
        setFormData({ ...formData, expected_end_date: currentDate }); // Update the selected date
    };

    useFocusEffect(
        useCallback(() => {
            getAvailableServices(); // Fetch services on component mount
        }, [])
    );

    // Render a message while loading
    if (mainDataLoading) return <ActivityIndicator color={'blue'} />;

    return (
        <View className="flex-1 bg-white">
            <View className="mt-4 ms-4 mb-2 fixed">
                <Text className="text-2xl">FORM</Text>
            </View>
            <ScrollView className="p-4">
                {/* Service Picker */}
                <View className="border border-gray-300 rounded-lg mb-4 bg-white shadow-md">
                    <Picker
                        selectedValue={formData.service_id}
                        onValueChange={(value) => setFormData({ ...formData, service_id: value })}
                        style={{ height: 50, width: '100%' }}
                    >
                        <Picker.Item label="Select Type of Service" value="" enabled={false} />
                        {availableServices.length > 0 ? (
                            availableServices.map((service) => (
                                <Picker.Item
                                    key={service?.id}
                                    label={service?.name}
                                    value={service?.id}
                                />
                            ))
                        ) : (
                            <Picker.Item label="No available services" value="" enabled={false} />
                        )}
                    </Picker>
                </View>

                {/* Description */}
                <View className="mb-4 bg-white border border-gray-300 rounded-lg p-4 shadow-md">
                    <Text className="text-lg font-semibold">Description</Text>
                    <TextInput
                        placeholder="Enter service description"
                        value={formData.description}
                        onChangeText={(value) => setFormData({ ...formData, description: value })}
                        className="border border-gray-300 p-2 mt-2 rounded"
                    />
                </View>

                {/* Other */}
                <View className="mb-4 bg-white border border-gray-300 rounded-lg p-4 shadow-md">
                    <Text className="text-lg font-semibold">Other</Text>
                    <TextInput
                        placeholder="Other Information"
                        value={formData.other}
                        onChangeText={(value) => setFormData({ ...formData, other: value })}
                        className="border border-gray-300 p-2 mt-2 rounded"
                    />
                </View>

                {/* start date */}
                <Text className="text-lg font-bold py-2">Expected Start Date</Text>
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 8,
                        backgroundColor: '#fff',
                    }}
                    className="mb-2 p-3"
                >
                    <Text>{formData.expected_start_date.toLocaleDateString()}</Text>
                </TouchableOpacity>

                {/* Date picker modal */}
                {showDatePicker && (
                    <DateTimePicker
                        value={new Date(formData.expected_start_date)}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                    />
                )}

                {/* end date */}
                <Text className="text-lg font-bold py-2">Expected End Date</Text>
                <TouchableOpacity
                    onPress={() => setShowDatePicker2(true)}
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 8,
                        backgroundColor: '#fff',
                    }}
                    className="mb-2 p-3"
                >
                    <Text>{formData.expected_end_date.toLocaleDateString()}</Text>
                </TouchableOpacity>

                {/* Date picker modal */}
                {showDatePicker2 && (
                    <DateTimePicker
                        value={new Date(formData.expected_end_date)}
                        mode="date"
                        display="default"
                        onChange={onChangeDate2}
                    />
                )}

                {/* Number of Personnel */}
                <View className="mb-4 bg-white border border-gray-300 rounded-lg p-4 shadow-md">
                    <Text className="text-lg font-semibold">Number of Personnel</Text>
                    <TextInput
                        placeholder="Enter number of personnel"
                        keyboardType="numeric"
                        value={formData.number_of_personnel}
                        onChangeText={(value) => setFormData({ ...formData, number_of_personnel: value })}
                        className="border border-gray-300 p-2 mt-2 rounded"
                    />
                </View>

                {/* Classification */}
                <View className="mb-4 bg-white border border-gray-300 rounded-lg p-4 shadow-md">
                    <Text className="text-lg font-semibold">Classification</Text>
                    <Picker
                        selectedValue={formData.classification}
                        onValueChange={(value) => setFormData({ ...formData, classification: value })}
                        style={{ height: 50, width: '100%' }}
                    >
                        <Picker.Item label="Select Classification" value="" enabled={false} />
                        <Picker.Item label="Immediate" value="immediate" />
                        <Picker.Item label="Short Term" value="short term" />
                        <Picker.Item label="Minimum Term" value="minimum term" />
                        <Picker.Item label="Project" value="project" />
                    </Picker>
                </View>

                {/* Requestor Information */}
                <View className="bg-white border border-gray-300 rounded-lg p-4 shadow-md mb-4">
                    <Text className="text-lg font-semibold mb-2">
                        Requestor Information
                        <Text className="text-sm text-slate-600"> ( Please review before making request )</Text>
                    </Text>
                    <Text className="text-gray-700">First Name: {userData?.firstname}</Text>
                    <Text className="text-gray-700">Middle Name: {userData?.middlename}</Text>
                    <Text className="text-gray-700">Last Name: {userData?.lastname}</Text>
                    <Text className="text-gray-700">Department: {userData?.department}</Text>
                </View>

                <View className="mb-2">
                    {loading && <ActivityIndicator color={'blue'} />}
                </View>

                {/* Submit Button */}
                <TouchableOpacity onPress={() => handleRequest()} className="p-4 bg-emerald-500 mb-5 rounded-lg">
                    <Text className="text-center text-white font-bold">SUBMIT REQUEST</Text>
                </TouchableOpacity>

                {/* {loading && <Loading />} */}

            </ScrollView>
            <Toast />
        </View>

    );
}
