import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { reportPreventiveMaintenance, fetchInventory, fetchPreventiveReports } from '../services/apiServices';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

export default function ReportPreventive({ navigation, route }) {
    const data = route.params.data;
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        preventive_id: data.id
    })
    const [inventory, setInventory] = useState([]);
    const [reports, setReports] = useState([]);
    const [mainDataLoading, setMainDataLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(false);
        // Validate form fields
        if (!formData.inventory_id) return Toast.show({ type: 'error', text1: 'Error', text2: 'Please select equipment' });
        if (!formData.preventive_id) return Toast.show({ type: 'error', text1: 'Error', text2: 'Please select preventive task' });
        if (!formData.condition) return Toast.show({ type: 'error', text1: 'Error', text2: 'Condition is required' });
        if (!formData.health) return Toast.show({ type: 'error', text1: 'Error', text2: 'Health is required' });
        console.log('wewew')
        try {
            setLoading(true);
            const response = await reportPreventiveMaintenance(formData);
            Toast.show({ type: 'success', text1: 'Success', text2: 'Request submitted successfully' });
            setTimeout(() => {
                navigation.goBack();
            }, 1000);
        } catch (error) {
            console.log(error)
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        } finally {
            setLoading(false);
        }
    };

    const getInventory = async () => {
        setMainDataLoading(true);

        try {
            const response = await fetchInventory();
            setInventory(response); // Update the state with the fetched data
            console.log('Available Equipment:', response); // Correct log after fetching data
        } catch (error) {
            console.log(error);
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        } finally {
            setMainDataLoading(false);
        }
    };

    const getPreventiveReports = async () => {
        setMainDataLoading(true);

        try {
            const response = await fetchPreventiveReports();
            setReports(response); // Update the state with the fetched data
            console.log('Available Services:', response); // Correct log after fetching data
        } catch (error) {
            console.log(error);
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        } finally {
            setMainDataLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            getInventory();
            getPreventiveReports();
        }, [])
    );

    return (
        <View>
            <View className="py-4 ps-4 sticky bg-white">
                <Text className="text-2xl">FORM</Text>
            </View>
            <ScrollView className="bg-white m-2 p-4">
                <Text className="text-2xl mb-2">{data.name}</Text>
                <Text className="text-lg mb-2">Description: {data.description}</Text>
                {/* Classification */}

                <View className="mb-4 bg-white border border-gray-300 rounded-lg p-4 shadow-md">
                    <Text className="text-lg font-semibold">Equipment</Text>
                    <Picker
                        selectedValue={formData.inventory_id}
                        onValueChange={(value) => setFormData({ ...formData, inventory_id: value })}
                        style={{ height: 50, width: '100%' }}
                    >
                        <Picker.Item label="Select Classification" value="" enabled={false} />
                        {/* Map over the requested services to create Picker items */}
                        {inventory.map((item, index) => {
                            // Check if item.id exists in reports' item_request_id
                            {/* const isDisabled = reports.some((report) => report.item_request_id === item.id); */}

                            return (
                                <Picker.Item
                                    key={index}
                                    label={`${item.name} (${item.model}) Assigned: ${item.requested.firstname} ${item.requested.lastname}`}  // Adjust based on your item object structure
                                    value={item.id}    // Use the ID or whatever value corresponds to the classification
                                    // enabled={!isDisabled} // Disable the item if the condition matches
                                />
                            );
                        })}
                    </Picker>

                </View>
                {/* Description */}
                <View className="mb-4 bg-white border border-gray-300 rounded-lg p-4 shadow-md">
                    <Text className="text-lg font-semibold">Condition</Text>
                    <TextInput
                        placeholder="Enter service description"
                        value={formData.condition}
                        onChangeText={(value) => setFormData({ ...formData, condition: value })}
                        className="border border-gray-300 p-2 mt-2 rounded"
                    />
                </View>
                {/* Health */}
                <View className="mb-4 bg-white border border-gray-300 rounded-lg p-4 shadow-md">
                    <Text className="text-lg font-semibold">Health (10)</Text>
                    <TextInput
                        placeholder="Enter service description"
                        value={formData.health}
                        onChangeText={(value) => setFormData({ ...formData, health: value })}
                        className="border border-gray-300 p-2 mt-2 rounded"
                        keyboardType='numeric'
                    />
                </View>
                {/* Description */}
                <View className="mb-4 bg-white border border-gray-300 rounded-lg p-4 shadow-md">
                    <Text className="text-lg font-semibold">Other Information</Text>
                    <TextInput
                        placeholder="Enter service description"
                        value={formData.other_info}
                        onChangeText={(value) => setFormData({ ...formData, other_info: value })}
                        className="border border-gray-300 p-2 mt-2 rounded"
                    />
                </View>
                {/* Submit Button */}
                <TouchableOpacity onPress={handleSubmit} className="p-4 bg-emerald-500 mb-5 rounded-lg">
                    <Text className="text-center text-white font-bold">SUBMIT REQUEST</Text>
                </TouchableOpacity>
            </ScrollView>
            <Toast />
        </View>
    )
}