import { ActivityIndicator, Text, View } from 'react-native';

export default function LoadingSpinner() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#0d9488" />
      <Text className="mt-4 text-slate-600 text-lg">Loading...</Text>
    </View>
  );
}