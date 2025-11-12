import Constants from 'expo-constants';

export const getServerUrl = () => {
  let host = 'localhost';

  const uri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (uri) {
    host = uri.split(':')[0];
  }

  return `http://${host}:8080`;
};
