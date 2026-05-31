import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function Insights() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Insights & Trends</Text>
        <Text style={styles.subtitle}>Your detailed nutrition analytics will appear here after you log more meals.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FBF6' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20 },
});
