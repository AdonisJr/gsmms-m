import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to insert data (setItem), dynamically handling both JSON and non-JSON values
export const storeData = async (key, value) => {
  try {
    const storeValue = typeof value === 'object' ? JSON.stringify(value) : String(value); // Convert object/array to string, leave others as is
    await AsyncStorage.setItem(key, storeValue);
    console.log(`Data stored under key: ${key}`);
  } catch (error) {
    console.error('Error storing data', error);
  }
};

// Function to get data (getItem), dynamically parsing JSON if possible
export const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      try {
        // Try to parse the value as JSON; if it fails, return the raw value
        return JSON.parse(value);
      } catch (e) {
        // If value is not JSON, return it as a string, number, or boolean
        console.log('localstoregeconsole:' + value)
        return value;
      }
    } else {
      console.log(`No data found for key: ${key}`);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving data', error);
  }
};

// Function to remove data (removeItem)
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`Data removed for key: ${key}`);
  } catch (error) {
    console.error('Error removing data', error);
  }
};
