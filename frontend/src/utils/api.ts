import Constants from 'expo-constants';

// AWS Backend URL (for database and user management)
const AWS_BACKEND_URL = 'http://meal-tracker-prod-v2.eba-hgqbbpyc.us-east-1.elasticbeanstalk.com';

// Local ML Server URL (for ML model - ingredient detection)
// Uses the local backend on port 8080 which has the real ML models
export const getMLServerUrl = () => {
  let host = 'localhost';

  const uri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (uri) {
    host = uri.split(':')[0];
  }

  return `http://${host}:8080`;
};

// Local Backend URL (for development)
export const getLocalServerUrl = () => {
  let host = 'localhost';

  const uri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (uri) {
    host = uri.split(':')[0];
  }

  return `http://${host}:5000`;
};

// Main server URL - use AWS for production
export const getServerUrl = () => {
  // Use AWS backend for all operations except ML image processing
  return AWS_BACKEND_URL;
};
