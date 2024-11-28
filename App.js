import { StatusBar } from 'expo-status-bar';
import { View, TouchableOpacity, Text, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Import Stack Navigator
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useRef } from 'react';
import Toast from 'react-native-toast-message'; // Import Toast
import { useNavigation, useRoute } from '@react-navigation/native';
import './global.css';

// components import
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen'; // Import Login Screen
import RegistrationScreen from './src/screens/RegistrationScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import RequestServices from './src/screens/faculty/RequestServices';
// import UsersScreen from './src/screens/UsersScreen';
// import FacultyScreen from './src/screens/FacultyScreen';
// import RequestServices from './src/components/page/faculty/RequestServices';
// import SettingsScreen from './src/screens/SettingsScreen';
// import WorkerSettings from './src/screens/worker/WorkerSettings';
// import AssignTask from './src/screens/AssignTask';
// import TasksScreen from './src/screens/admin/TasksScreen';
// import WorkerScreen from './src/screens/worker/WorkerScreen';
// import PreventiveMaintenance from './src/screens/admin/PreventiveMaintenance';
// import InsertPreventiveMaintenance from './src/screens/admin/SchedulePreventiveMaintenance';
// import InsertUser from './src/screens/admin/InsertUser';
// import PreventiveMaintenanceTask from './src/screens/worker/PreventiveMaintenanceTask';
// import EditScheduledPreventiveMaintenance from './src/screens/admin/EditScheduledPreventiveMaintenance';
// import EditUser from './src/screens/admin/EditUser';
// import InsertInventory from './src/screens/admin/InsertInventory';
// import InventoryScreen from './src/screens/admin/InventoryScreen';
// import EditInventory from './src/screens/admin/EditInventory';
// import EditRequestedServices from './src/components/page/faculty/EditRequestedServices';
// import EditTask from './src/screens/admin/EditTask';
// import { ViewImageScreen } from './src/components/page/ViewImageScreen';
// import NotificationScreen from './src/screens/NotificationScreen';

// data
import { getData } from './src/utils/LocalStorage';
import { useUserStore } from './src/store/userStore';
import { useCurrentNavStore } from './src/store/currentNavStore';


// expo related
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import FacultyScreen from './src/screens/faculty/FacultyScreen';
import EditRequestedServices from './src/screens/faculty/EditRequestedServices';
import NotificationScreen from './src/screens/NotificationScreen';
import PreventiveTask from './src/screens/PreventiveTask';
import ReportPreventive from './src/screens/ReportPreventive';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// expo
function handleRegistrationError(errorMessage) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const { setUser, setAccessToken } = useUserStore();
  const [accessToken, setAccessTokenState] = useState(null);
  const [user, setUserState] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(undefined);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token || ''))
      .catch(error => setExpoPushToken(`${error}`));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const getCredentials = async () => {
    const token = await getData('accessToken');
    const storedUser = await getData('user');
    setAccessTokenState(token);
    setUserState(storedUser);
    setUser(storedUser); // Update Zustand store
    setAccessToken(token);
  };

  useEffect(() => {
    const fetchData = async () => {
      await getCredentials();
      setIsLoading(false); // Mark loading as false when data is fetched
    };
    fetchData();
  }, []);

  // Show loading screen while fetching credentials
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Toast />
      <Stack.Navigator initialRouteName={user?.type === 'general_service' ? 'MainApp' : user?.type === 'faculty' ? 'FacultyApp' : user?.type === 'utility_worker' ? 'MainApp' : 'Login'}>
        <Stack.Screen name="Login" component={LoginScreen} initialParams={{ expoPushToken: expoPushToken }} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegistrationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainApp" component={MainApp} options={{ headerShown: false }} />
        <Stack.Screen name="FacultyApp" component={FacultyApp} options={{ headerShown: false }} />
        {/* <Stack.Screen name="WorkerApp" component={WorkerApp} options={{ headerShown: false }} />
        <Stack.Screen name="Image Screen" component={ViewImageScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} /> */}
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="Request Services" component={RequestServices} />
        <Stack.Screen name="Report Preventive" component={ReportPreventive} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainApp() {
  const navigation = useNavigation(); // Get the navigation object
  const { setCurrentApp } = useCurrentNavStore();
  useEffect(() => {
    setCurrentApp('Worker')
  }, [])
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" options={{ headerShown: false }}>
        {() => (
          <View className="flex-1">
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;

                  if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline';
                  } else if (route.name === 'Settings') {
                    iconName = focused ? 'settings' : 'settings-outline';
                  } else if (route.name === 'PreventiveTask') {
                    iconName = focused ? 'newspaper' : 'newspaper-outline';
                  }

                  return <Ionicons name={iconName} size={size} color={color} />;
                },
                headerShown: false,
                tabBarActiveTintColor: 'teal',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: 'bg-gray-200 h-16 p-3 shadow-lg',
                tabBarLabelStyle: 'text-sm font-semibold',
              })}
            >
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="PreventiveTask" component={PreventiveTask} />
              <Tab.Screen name="Settings" component={SettingsScreen} />
              {/* <Tab.Screen name="PreventiveTask" component={PreventiveMaintenanceTask} />
               */}
            </Tab.Navigator>


          </View>
        )}
      </Stack.Screen>
      {/* <Stack.Screen name="Request Services" title="wew" component={RequestServices} /> */}
    </Stack.Navigator>
  );
}

function FacultyApp({navigation}) {
  const { currentNav, setCurrentApp } = useCurrentNavStore();
  useEffect(() => {
    setCurrentApp('Faculty')
  }, [])
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" options={{ headerShown: false }}>
        {() => (
          <View className="flex-1">
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;

                  if (route.name === 'Services') {
                    iconName = focused ? 'home' : 'home-outline';
                  } else if (route.name === 'Settings') {
                    iconName = focused ? 'settings' : 'settings-outline';
                  }

                  return <Ionicons name={iconName} size={size} color={color} />;
                },
                headerShown: false,
                tabBarActiveTintColor: 'teal',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: 'bg-gray-200 h-16 p-3 shadow-lg',
                tabBarLabelStyle: 'text-sm font-semibold',
              })}
            >
              <Tab.Screen name="Services" component={FacultyScreen} />
              <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>

            {/* Floating Add Button using NativeWind */}
            <TouchableOpacity
              className="absolute bottom-5 self-center bg-white rounded-full z-10"
              onPress={() => navigation.navigate('Request Services')}
              style={{ display: (currentNav === 'Faculty Screen') ? 'flex' : 'none' }} // Multiple conditions for visibility
            >
              <Ionicons name="add-circle" size={60} color="powderblue" />
            </TouchableOpacity>
          </View>
        )}
      </Stack.Screen>
      <Stack.Screen name="Edit Requested Services" component={EditRequestedServices} />
    </Stack.Navigator>
  );
}


