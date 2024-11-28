import React, { useEffect, useState, useCallback, ActivityIndicator } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
// component
import Header from '../components/Header';
import Toast from 'react-native-toast-message';
// data
// import { updateUser } from '../services/apiServices';
import { updateUser } from '../services/apiServices';
import { storeData } from '../utils/LocalStorage';
import { useUserStore } from '../store/userStore';
import { useCurrentNavStore } from '../store/currentNavStore';

export default function WorkerSettings({ navigation }) {
    const { user, setUser } = useUserStore();
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mainDataLoading, setMainDataLoading] = useState(false);
    const { setNavigation } = useCurrentNavStore();

    const [formData, setFormData] = useState({
        firstname: user?.firstname || '',
        middlename: user?.middlename || '',
        lastname: user?.lastname || '',
        email: user?.email || '',
        gender: user?.gender || '',
        role: user?.role || '',
        department: user?.department || '',
        created_at: user?.created_at || '',
        id: user?.id
    });

    const handleToggleEdit = () => {
        setIsEdit(!isEdit);
    };

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmits = async () => {
        setLoading(false);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (formData?.firstname === '' || !formData?.firstname) return Toast.show({ type: 'error', text1: 'Error', text2: 'First Name is required.' });
        if (formData?.lastname === '' || !formData?.lastname) return Toast.show({ type: 'error', text1: 'Error', text2: 'Last Name is required' });
        if (formData?.email === '' || !formData?.email) return Toast.show({ type: 'error', text1: 'Error', text2: 'Email is required.' });
        if (!emailRegex.test(formData.email)) return Toast.show({ type: 'error', text2: 'Invalid email format' });
        if (formData?.type === '') return Toast.show({ type: 'error', text1: 'Error', text2: 'Type is required' });
        if (formData.department === '') return Toast.show({ type: 'error', text1: 'Error', text2: 'Please select department' });

        try {
            setLoading(true);
            console.log(formData)
            // const response = await axios.put(`/users/${formData.id}`, formData)
            await updateUser(formData);
            // console.log('New DATA', response); // Correct log after fetching data
            // Toast.show({ type: 'success', text1: 'Success Message', text2: 'Successfully updated' });
            // setUser(response);
            // await storeData('user', response)
            // setIsEdit(false);
        } catch (error) {
            console.error(error)
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        } finally {
            setLoading(false);
        }

    }
    const handleSubmit = async () => {
        // if (formData?.firstname === '' || !formData?.firstname) return Toast.show({ type: 'error', txt1: 'Error', txt2: 'First Name is required.' });
        // if (formData?.lastname === '' || !formData?.lastname) return Toast.show({ type: 'error', text1: 'Error', text2: 'Last Name is required' });
        // if (formData?.email === '' || !formData?.email) return Toast.show({ type: 'error', text1: 'Error', text2: 'Email is required.' });
        // if (!emailRegex.test(formData.email)) return Toast.show({ type: 'error', text2: 'Invalid email format' });
        // if (formData?.type === '') return Toast.show({ type: 'error', text1: 'Error', text2: 'Type is required' });
        // if (formData.department === '') return Toast.show({ type: 'error', text1: 'Error', text2: 'Please select department' });
        
        const response = await updateUser(formData);
        Toast.show({ type: 'success', text1: 'Success Message', text2: 'Successfully updated' });
        setUser(response);
        await storeData('user', response);
        setIsEdit(false);
    }

    useFocusEffect(
        useCallback(() => {
            setNavigation('Settings')
        }, [])
    );

    if (mainDataLoading) return <ActivityIndicator color={'blue'} />

    return (
        <View className="py-6 bg-slate-200">
            <Header navigation={navigation} />
            <View className="pt-4 pl-4 bg-white">
                <Text className="text-2xl font-bold border-b-2 border-slate-200">Personal Information</Text>
            </View>
            <ScrollView className="p-2 bg-white h-[85%]">
                {/* Edit Mode Toggle */}
                <View className="mb-4 px-4 flex-row justify-between items-center">
                    <Text className="text-xl font-bold">Edit Mode</Text>
                    <TouchableOpacity
                        onPress={handleToggleEdit}
                        className={`flex-row items-center p-2 rounded-md ${isEdit ? 'bg-green-500' : 'bg-blue-500'}`}
                    >
                        <MaterialIcons name={isEdit ? 'check-box' : 'edit'} size={24} color="white" />
                        <Text className="ml-2 text-lg text-white">
                            {isEdit ? 'Save' : 'Edit'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Editable Fields */}
                <View className="mb-4">
                    <Text className="text-sm text-gray-500">First Name</Text>
                    <TextInput
                        value={formData.firstname}
                        onChangeText={(value) => setFormData({...formData, firstname: value})}
                        className={`border p-2 rounded-lg ${isEdit ? 'border-green-500 bg-green-100' : 'border-gray-300'}`}
                        editable={isEdit}
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-sm text-gray-500">Middle Name</Text>
                    <TextInput
                        value={formData.middlename}
                        onChangeText={(value) => setFormData({...formData, middlename: value})}
                        className={`border p-2 rounded-lg ${isEdit ? 'border-green-500 bg-green-100' : 'border-gray-300'}`}
                        editable={isEdit}
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-sm text-gray-500">Last Name</Text>
                    <TextInput
                        value={formData.lastname}
                        onChangeText={(value) => setFormData({...formData, lastname: value})}
                        className={`border p-2 rounded-lg ${isEdit ? 'border-green-500 bg-green-100' : 'border-gray-300'}`}
                        editable={isEdit}
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-sm text-gray-500">Email</Text>
                    <TextInput
                        value={formData.email}
                        onChangeText={(value) => setFormData({...formData, email: value})}
                        className={`border border-gray-300 p-2 rounded-lg`}
                        editable={false}
                    />
                </View>

                {/* Gender Picker */}
                <View className={`border p-2 rounded-lg mb-4 ${isEdit ? 'border-green-500 bg-green-100' : 'border-gray-300'}`}>
                    <Text className="text-sm text-gray-500">Gender</Text>
                    <Picker
                        selectedValue={formData.gender}
                        onValueChange={(value) => setFormData({...formData, gender: value})}
                        enabled={isEdit}
                    >
                        <Picker.Item label="Male" value="male" />
                        <Picker.Item label="Female" value="female" />
                    </Picker>
                </View>

                {/* Role Picker */}
                <View className={`border border-gray-300  p-2 rounded-lg mb-4`}>
                    <Text className="text-sm text-gray-500">Role</Text>
                    <Picker
                        selectedValue={formData.role}
                        onValueChange={(value) => setFormData({...formData, role: value})}
                        enabled={false}
                    >
                        <Picker.Item label="Admin" value="admin" />
                        <Picker.Item label="User" value="user" />
                    </Picker>
                </View>

                {/* Department */}
                <View className="mb-4">
                    <Text className="text-sm text-gray-500">Department</Text>
                    <TextInput
                        value={formData.department}
                        onChangeText={(value) => setFormData({...formData, department: value})}
                        className={`border border-gray-300  p-2 rounded-lg`}
                        editable={false}
                    />
                </View>

                {/* Timestamps */}
                <Text className="text-xl font-bold mb-4">Timestamps</Text>

                <View className="mb-4">
                    <Text className="text-sm text-gray-500">Created At</Text>
                    <TextInput
                        value={formData.created_at}
                        className="border border-gray-300 p-2 rounded-lg"
                        editable={false}
                    />
                </View>

                {/* Save Button */}
                <View className="mb-2">
                    {loading && <ActivityIndicator color={'blue'} />}
                </View>
                {isEdit && (
                    <TouchableOpacity className="bg-green-500 p-4 rounded-lg mt-4 mb-5" onPress={handleSubmit}>
                        <Text className="text-center text-white text-lg font-bold">Save Changes</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
            <Toast />
        </View>
    );
}
