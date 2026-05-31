import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useState,  useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BasicInformation() {
  const router = useRouter();
  const [dob, setDob] = useState('06/15/1995');
  const [height, setHeight] = useState('180');
  const [weight, setWeight] = useState('75.0');





  const handleNext = async () => {
    try {
      const userProfileStr = await AsyncStorage.getItem('userProfile');
      let userProfile = userProfileStr ? JSON.parse(userProfileStr) : {};
      userProfile = { ...userProfile, dob, height, weight };
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      router.push('/onboarding/survey');
    } catch (e) {
      console.error('Failed to save data', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Feather name="arrow-left" size={24} color="#067A46" onPress={() => router.back()} />
        <View style={styles.headerTitleContainer}>
            <Feather name="activity" size={24} color="#067A46" style={{marginRight: 8}}/>
            <Text style={styles.headerTitle}>Nutriaa</Text>
        </View>
        <Feather name="aperture" size={24} color="#067A46" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>Step 1 of 3</Text>
          <Text style={styles.stepTitle}>Personal Metrics</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Basic Information</Text>
          <Text style={styles.subtitle}>We use these details to calculate your daily calorie and nutrient requirements with precision.</Text>

          <Text style={styles.label}>DATE OF BIRTH</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} value={dob} onChangeText={setDob} placeholder="06/15/1995" placeholderTextColor="#888" />
            <Feather name="calendar" size={20} color="#555" />
          </View>

          <View style={styles.rowLabel}>
            <Text style={styles.label}>HEIGHT</Text>
            <View style={styles.toggleGroup}>
                <View style={[styles.toggleBtn, styles.toggleBtnActive]}><Text style={styles.toggleBtnTextActive}>cm</Text></View>
                <View style={styles.toggleBtn}><Text style={styles.toggleBtnText}>inch</Text></View>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} value={height} onChangeText={setHeight} placeholder="180" keyboardType="numeric" placeholderTextColor="#888" />
            <Text style={styles.unitText}>cm</Text>
            <Feather name="bar-chart-2" size={20} color="#555" style={{marginLeft: 8}} />
          </View>

          <View style={styles.rowLabel}>
            <Text style={styles.label}>CURRENT WEIGHT</Text>
            <View style={styles.toggleGroup}>
                <View style={[styles.toggleBtn, styles.toggleBtnActive]}><Text style={styles.toggleBtnTextActive}>kg</Text></View>
                <View style={styles.toggleBtn}><Text style={styles.toggleBtnText}>lbs</Text></View>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder="75.0" keyboardType="numeric" placeholderTextColor="#888" />
            <Text style={styles.unitText}>kg</Text>
            <Feather name="pocket" size={20} color="#555" style={{marginLeft: 8}} />
          </View>

          <View style={styles.infoBox}>
            <Feather name="shield" size={28} color="#067A46" style={{marginBottom: 8}} />
            <Text style={styles.infoText}>Your data is encrypted and used only for nutritional calculations.</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next Step</Text>
            <Feather name="chevron-right" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Text style={styles.loginText}>Log in</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FBF6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#067A46' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  progressContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, marginTop: 10 },
  stepText: { fontSize: 14, color: '#333', fontWeight: '600' },
  stepTitle: { fontSize: 14, color: '#067A46', fontWeight: '600' },
  progressBar: { height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, marginBottom: 20 },
  progressFill: { width: '33%', height: '100%', backgroundColor: '#067A46', borderRadius: 2 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 8, letterSpacing: 0.5 },
  rowLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1E5D5', borderRadius: 12, paddingHorizontal: 16, height: 56, backgroundColor: '#F9FDF9' },
  input: { flex: 1, fontSize: 16, color: '#333' },
  unitText: { fontSize: 16, color: '#333', fontWeight: '500' },
  toggleGroup: { flexDirection: 'row', backgroundColor: '#E8F5EB', borderRadius: 8, padding: 4 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  toggleBtnText: { fontSize: 12, fontWeight: '600', color: '#666' },
  toggleBtnTextActive: { fontSize: 12, fontWeight: '700', color: '#067A46' },
  infoBox: { backgroundColor: '#E8F5EB', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 24, marginBottom: 24 },
  infoText: { textAlign: 'center', fontSize: 14, color: '#333', lineHeight: 20 },
  button: { backgroundColor: '#006D44', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 56, borderRadius: 16 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '700', marginRight: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { fontSize: 16, color: '#555' },
  loginText: { fontSize: 16, color: '#006D44', fontWeight: '700' },
});
