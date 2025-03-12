import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { fetchComments, postComment } from '../../services/apiServices';
import Toast from 'react-native-toast-message';
import { useUserStore } from '../../store/userStore';
import Loading from '../../components/Loading';
import Fontisto from '@expo/vector-icons/Fontisto';

export default function Comments({ navigation, route }) {
    const userStore = useUserStore();
    const requested = route.params.data;
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mainDataLoading, setMainDataLoading] = useState(false);

    const handleComment = async () => {
        setLoading(false);
        // Validate form fields
        if (!comment) return Toast.show({ type: 'error', text1: 'Error', text2: 'Please write something' });

        const payload = {
            'service_request_id': requested.id,
            'user_id': userStore.user.id,
            comment: comment
        }

        try {
            setLoading(true);
            const response = await postComment(payload);
            Toast.show({ type: 'success', text1: 'Success', text2: 'Request submitted successfully' });
            getComments();
            setComment('');
        } catch (error) {
            console.log(error)
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        } finally {
            setLoading(false);
        }
    };

    const getComments = async () => {
        setMainDataLoading(true);
        try {
            const response = await fetchComments(requested.id);
            setComments(response); // Update the state with the fetched data
        } catch (error) {
            console.log(error);
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        } finally {
            setMainDataLoading(false);
        }
    };

    useEffect(() => {
        getComments();
    }, [])

    if (mainDataLoading) return <Loading />;

    return (
        <View className="flex-1 bg-white">
            {loading && <Loading />}
            <View className="mt-4 p-2 mb-2 fixed border-b-2 border-slate-200">
                <Text className="text-2xl">{requested.service.name}</Text>
                <Text className="text-lg text-slate-600">{requested.description}</Text>
            </View>

            <ScrollView className="p-4">
                {
                    comments.length === 0 ? <Text>No Comments</Text> :
                        comments.map(data => (
                            <View className="flex flex-row gap-2 mt-2">
                                <View className="bg-slate-200 rounded-full w-14 h-14 flex justify-center items-center p-2">
                                    {
                                        data.user.gender === 'male' ?
                                            <Fontisto name="male" size={24} color="black" /> :
                                            <Fontisto name="female" size={24} color="black" />
                                    }

                                </View>
                                <View className="w-5/6 rounded-md bg-slate-100 p-2">
                                    <Text className="font-bold">{data.user.lastname}, {data.user.firstname}</Text>
                                    <Text className="text-slate-500">{data.comment}</Text>
                                </View>
                            </View>
                        ))
                }
            </ScrollView>
            <View className="mb-4 bg-white border border-gray-300 rounded-lg p-4 shadow-md m-2">
                <Text className="text-lg font-semibold">Comments</Text>
                <TextInput
                    placeholder="Write Comments"
                    value={comment}
                    onChangeText={(value) => setComment(value)}
                    className="border border-gray-300 p-2 mt-2 rounded"
                />
                <TouchableOpacity className="bg-blue-400 w-32 p-2 rounded-md mt-2">
                    <Text className="text-center text-white" onPress={handleComment}>
                        SEND
                    </Text>
                </TouchableOpacity>
            </View>
            <Toast />
        </View>
    )
}