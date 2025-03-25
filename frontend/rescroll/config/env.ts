import Constants from 'expo-constants';
import { Platform } from 'react-native';

const ENV = {
  dev: {
    apiUrl: Platform.select({
      ios: 'http://localhost:8000/api/v1',
      android: 'http://localhost:8000/api/v1',
      default: 'http://localhost:8000/api/v1',
    }),
  },
  prod: {
    apiUrl: 'http://localhost:8000/api/v1', // Change this to your production API URL
  },
};

export default function getEnvVars() {
  const env = __DEV__ ? ENV.dev : ENV.prod;
  return {
    ...env,
  };
}

export const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';  // Android emulator uses 10.0.2.2 to access host machine
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:8000/api/v1';  // iOS simulator uses localhost
  } else {
    return 'http://localhost:8000/api/v1';  // Web/default
  }
}; 