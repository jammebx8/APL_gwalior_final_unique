import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const userProfileStr = await AsyncStorage.getItem('userProfile');
        if (userProfileStr) {
          const userProfile = JSON.parse(userProfileStr);
          // If daily_calories_goal exists, they completed the rhythm setup
          if (userProfile.daily_calories_goal) {
            setHasOnboarded(true);
          }
        }
      } catch (e) {
        console.error('Failed to check onboarding status', e);
      } finally {
        setIsReady(true);
      }
    }
    checkOnboarding();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#067A46" />
      </View>
    );
  }

  if (hasOnboarded) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/onboarding" />;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4FBF6' },
});
