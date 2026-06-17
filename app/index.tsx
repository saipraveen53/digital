import { Redirect } from 'expo-router';
import { useAuth } from './context/AuthContext';

export default function Index() {
  const { user } = useAuth();

  if (!user || !user.isLoggedIn) {
    return <Redirect href="/(public)" />;
  }

  if (user.role === 'admin') {
    return <Redirect href="/(admin)/dashboard" />;
  }

  return <Redirect href="/(user)/home" />;
}