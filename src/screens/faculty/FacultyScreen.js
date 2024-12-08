import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { fetchServicesByCurrentUser } from '../../services/apiServices';
import Toast from 'react-native-toast-message';
import Header from '../../components/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useCurrentNavStore } from '../../store/currentNavStore';
import Loading from '../../components/Loading';

export default function FacultyScreen({ navigation }) {
  const [requestedServices, setRequestedServices] = useState([]);
  const [mainDataLoading, setMainDataLoading] = useState(false);
  const { setNavigation } = useCurrentNavStore();

  const getRequestedServices = async () => {
    setMainDataLoading(true);
    try {
      const response = await fetchServicesByCurrentUser();
      setRequestedServices(response); // Update the state with the fetched data
      // console.log('Available Services:', response); // Correct log after fetching data
    } catch (error) {
      console.log(error);
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    } finally {
      setMainDataLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getRequestedServices();
      setNavigation('Faculty Screen')
    }, [])
  );

  if (mainDataLoading) return <Loading />;

  return (
    <View className="flex-1 py-6">
      <Header navigation={navigation} />

      <Text className="text-2xl font-bold p-4">Requested Services</Text>

      <FlatList
        data={requestedServices}
        keyExtractor={(item) => item.id.toString()} // Use item.id as key
        renderItem={({ item }) => (

          <View className="flex-row justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
            <View style={{ flex: 1 }}>
              <Text className="text-xl font-bold text-gray-800">{item.service.name}</Text>
              <Text className="text-gray-600 mb-2 text-lg">Description: {item.description}</Text>
              <Text className="text-gray-600 mb-2 text-lg">Expected Start Date: {item.expected_start_date}</Text>
              <Text className="text-gray-600 mb-2 text-lg">Expected End Date: {item.expected_end_date}</Text>

              <Text className="text-gray-700 mb-2 text-lg">Status:
                <Text
                  className={`text-white ${item.status === 'in-progress' ? 'bg-blue-400'
                    : item.status === 'pending' ? 'bg-yellow-400' : 'bg-emerald-400'}`}>
                  {" " + item.status + " "}
                </Text>
              </Text>
              <Text className="text-gray-600 text-lg">
                Approved By: {item.approved_by ? `${item.approver.firstname} ${item.approver.middlename} ${item.approver.lastname}` : 'Pending'}
              </Text>

              <Text className="text-gray-600 mb-2 text-lg">Date Requested: {new Date(item.created_at).toLocaleDateString()}</Text>

              <View className="">
                <Text className="text-lg">Assigned Equipment</Text>
                <Text className="text-gray-700 pl-2 text-lg">
                  {item.equipment[0]?.name ? `${item?.equipment[0]?.name} ( ${item?.equipment[0]?.model} )` : 'No assigned'}
                </Text>
              </View>

              <View className="">
                <Text className="text-lg">Assigned Worker</Text>
                <View style={{ minHeight: 50 }}>
                  {
                    !item.tasks[0]?.utility_workers ? <Text className="pl-2 text-lg">{'No Assigned'}</Text> :
                      item.tasks[0]?.utility_workers.map((worker, index) => (
                        <Text key={index} className="text-gray-700 pl-2 text-lg">
                          {worker.firstname ? `${worker.firstname} ${worker.lastname} ( ${worker.department} )` : 'N/A'}
                        </Text>
                      ))
                  }
                </View>
              </View>

            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Edit Requested Services', { data: item })}
              className={`flex-row items-center p-2 rounded bg-blue-400`}
            >
              <MaterialIcons name="edit" size={15} color="white" />
              <Text className="text-white font-bold ml-1">Edit</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text className="text-center text-gray-500">No services requested.</Text>
        )}
      />
    </View>
  );
}
