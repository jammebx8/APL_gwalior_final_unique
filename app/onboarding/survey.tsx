import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Survey() {
  const router = useRouter();
  const [diet, setDiet] = useState('Non-Vegetarian');
  const [activity, setActivity] = useState('Lightly Active');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
            <Feather name="activity" size={24} color="#067A46" style={{marginRight: 8}}/>
            <Text style={styles.headerTitle}>NutriTrack</Text>
        </View>
        <Text style={styles.stepText}>Step 2 of 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.title}>Tailor your nutrition plan</Text>
        <Text style={styles.subtitle}>Tell us about your dietary preferences and daily movement patterns to personalize your targets.</Text>

        <Text style={styles.sectionLabel}>DIETARY PREFERENCE</Text>
        <View style={styles.dietRow}>
          <TouchableOpacity 
            style={[styles.dietCard, diet === 'Vegetarian' && styles.dietCardActive]}
            onPress={() => setDiet('Vegetarian')}
          >
            <View style={styles.iconCircle}>
                <Feather name="wind" size={24} color={diet === 'Vegetarian' ? '#067A46' : '#555'} />
            </View>
            <Text style={styles.dietTitle}>Vegetarian</Text>
            <Text style={styles.dietDesc}>Plant-based focus, dairy/eggs included</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dietCard, diet === 'Non-Vegetarian' && styles.dietCardActive]}
            onPress={() => setDiet('Non-Vegetarian')}
          >
            <View style={[styles.iconCircle, {backgroundColor: diet === 'Non-Vegetarian' ? '#00A355' : '#F0F0F0'}]}>
                <Feather name="coffee" size={24} color={diet === 'Non-Vegetarian' ? '#FFF' : '#555'} />
            </View>
            <Text style={styles.dietTitle}>Non-Vegetarian</Text>
            <Text style={styles.dietDesc}>Includes meat, poultry, and seafood</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>DAILY ACTIVITY LEVEL</Text>
        
        {[
          { id: 'Sedentary', desc: 'Little to no exercise, desk-based work', icon: 'monitor' },
          { id: 'Lightly Active', desc: 'Light exercise or sports 1-3 days/week', icon: 'user' },
          { id: 'Moderately Active', desc: 'Moderate exercise or sports 3-5 days/week', icon: 'activity' },
          { id: 'Very Active', desc: 'Hard exercise or physical job 6-7 days/week', icon: 'zap' }
        ].map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.activityCard, activity === item.id && styles.activityCardActive]}
            onPress={() => setActivity(item.id)}
          >
            <View style={[styles.activityIconCircle, activity === item.id && styles.activityIconCircleActive]}>
                <Feather name={item.icon as any} size={20} color={activity === item.id ? '#FFF' : '#555'} />
            </View>
            <View style={styles.activityTextContainer}>
                <Text style={styles.activityTitle}>{item.id}</Text>
                <Text style={styles.activityDesc}>{item.desc}</Text>
            </View>
            <View style={[styles.radioOuter, activity === item.id && styles.radioOuterActive]}>
                {activity === item.id && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#006D44" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextBtn} onPress={async () => {
            try {
              const userProfileStr = await AsyncStorage.getItem('userProfile');
              let userProfile = userProfileStr ? JSON.parse(userProfileStr) : {};
              userProfile = { ...userProfile, diet, activity };
              await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
              router.push('/onboarding/rhythm');
            } catch (e) {
              console.error(e);
            }
          }}>
            <Text style={styles.nextBtnText}>Next Step</Text>
          </TouchableOpacity>
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
  stepText: { fontSize: 14, color: '#555', fontWeight: '500' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  progressBar: { height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, marginBottom: 20 },
  progressFill: { width: '66%', height: '100%', backgroundColor: '#067A46', borderRadius: 2 },
  title: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 24 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 12, letterSpacing: 0.5, marginTop: 10 },
  dietRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  dietCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 16, alignItems: 'center', marginHorizontal: 4, borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  dietCardActive: { borderColor: '#00A355' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E8F5EB', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  dietTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 4 },
  dietDesc: { fontSize: 12, color: '#666', textAlign: 'center', lineHeight: 18 },
  activityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EAEAEA' },
  activityCardActive: { borderColor: '#00A355', backgroundColor: '#F9FDF9' },
  activityIconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E8F5EB', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  activityIconCircleActive: { backgroundColor: '#006D44' },
  activityTextContainer: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 2 },
  activityDesc: { fontSize: 12, color: '#666' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#CCC', justifyContent: 'center', alignItems: 'center', marginLeft: 16 },
  radioOuterActive: { borderColor: '#00A355' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00A355' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30 },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  backBtnText: { color: '#006D44', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  nextBtn: { backgroundColor: '#006D44', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
