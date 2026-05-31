import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#067A46',
        tabBarInactiveTintColor: '#A0AEC0',
        tabBarStyle: {
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            height: 110,
            paddingBottom: 10,
            paddingTop: 10,
        },
        tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4
        }
    }}>
      <Tabs.Screen 
        name="index" 
        options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <Feather name="grid" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="log" 
        options={{
            title: 'Log',
            tabBarIcon: ({ color }) => <Feather name="aperture" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="insights" 
        options={{
            title: 'Insights',
            tabBarIcon: ({ color }) => <Feather name="activity" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />
        }} 
      />
    </Tabs>
  );
}
