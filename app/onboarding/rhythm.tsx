import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Rhythm() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtnHeader} onPress={() => router.back()}>
            <Feather name="chevron-left" size={24} color="#555" />
            <Text style={styles.backBtnHeaderText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
            <Feather name="activity" size={24} color="#067A46" style={{marginRight: 8}}/>
            <Text style={styles.headerTitle}>NutriTrack</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressContainer}>
          <Text style={styles.stepTitle}>STEP 3 OF 3</Text>
          <Text style={styles.stepText}>FINAL SETUP</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.title}>Daily Rhythm</Text>
        <Text style={styles.subtitle}>Synchronizing your meals and sleep helps NutriTrack personalize your metabolic insights.</Text>

        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconCircle}><Feather name="coffee" size={20} color="#006D44" /></View>
                <Text style={styles.cardTitle}>Meal Schedule</Text>
            </View>

            {[
                { name: 'BREAKFAST', desc: 'Main fueling session', time: '08:00 AM', icon: 'sun', color: '#D97706' },
                { name: 'LUNCH', desc: 'Mid-day balance', time: '01:00 PM', icon: 'sun', color: '#D97706' },
                { name: 'DINNER', desc: 'Evening recovery', time: '07:30 PM', icon: 'moon', color: '#78350F' }
            ].map((meal, idx) => (
                <View key={idx} style={styles.scheduleRow}>
                    <Feather name={meal.icon as any} size={20} color={meal.color} />
                    <View style={styles.scheduleTextContainer}>
                        <Text style={styles.scheduleName}>{meal.name}</Text>
                        <Text style={styles.scheduleDesc}>{meal.desc}</Text>
                    </View>
                    <Text style={styles.scheduleTime}>{meal.time}</Text>
                    <Feather name="clock" size={16} color="#006D44" style={{marginLeft: 8}} />
                </View>
            ))}
        </View>

        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, {backgroundColor: '#EEF2FF'}]}><Feather name="moon" size={20} color="#4F46E5" /></View>
                <Text style={styles.cardTitle}>Sleep Routine</Text>
            </View>

            <View style={styles.sleepRow}>
                <View style={[styles.sleepIconBox, {backgroundColor: '#E2E8F0'}]}><Feather name="moon" size={16} color="#475569" /></View>
                <View style={styles.sleepLine} />
                <View style={styles.sleepTextContainer}>
                    <Text style={styles.scheduleName}>BEDTIME</Text>
                    <View style={styles.timeBox}>
                        <Text style={styles.sleepTimeText}>10:30 PM</Text>
                        <Feather name="clock" size={16} color="#006D44" />
                    </View>
                </View>
            </View>

            <View style={styles.sleepRow}>
                <View style={[styles.sleepIconBox, {backgroundColor: '#D1FAE5'}]}><Feather name="sunrise" size={16} color="#059669" /></View>
                <View style={styles.sleepTextContainer}>
                    <Text style={styles.scheduleName}>WAKE TIME</Text>
                    <View style={styles.timeBox}>
                        <Text style={styles.sleepTimeText}>06:30 AM</Text>
                        <Feather name="clock" size={16} color="#006D44" />
                    </View>
                </View>
            </View>

            <View style={styles.infoBox}>
                <Feather name="info" size={16} color="#4F46E5" />
                <Text style={styles.infoText}>8.0 hours of sleep targeted.</Text>
            </View>
        </View>

        <TouchableOpacity style={styles.completeBtn} onPress={async () => {
            try {
              const userProfileStr = await AsyncStorage.getItem('userProfile');
              let userProfile = userProfileStr ? JSON.parse(userProfileStr) : {};
              
              // Basic calculation mock
              userProfile = { 
                ...userProfile, 
                daily_calories_goal: 2000,
                daily_protein_goal_g: 120,
                daily_carbs_goal_g: 250,
                daily_fats_goal_g: 70,
                daily_fiber_goal_g: 30
              };
              await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
              router.replace('/(tabs)');
            } catch (e) {
              console.error(e);
            }
        }}>
            <Text style={styles.completeBtnText}>Complete Setup</Text>
            <Feather name="check-circle" size={20} color="#FFF" style={{marginLeft: 8}} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.skipBtnText}>SKIP FOR NOW</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FBF6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backBtnHeader: { flexDirection: 'row', alignItems: 'center' },
  backBtnHeaderText: { fontSize: 14, color: '#555' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', marginRight: 40 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#067A46' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  progressContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, marginTop: 10 },
  stepTitle: { fontSize: 12, color: '#067A46', fontWeight: '700', letterSpacing: 0.5 },
  stepText: { fontSize: 12, color: '#333', fontWeight: '700', letterSpacing: 0.5 },
  progressBar: { height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, marginBottom: 20 },
  progressFill: { width: '100%', height: '100%', backgroundColor: '#067A46', borderRadius: 2 },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E8F5EB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FDF9', padding: 12, borderRadius: 12, marginBottom: 12 },
  scheduleTextContainer: { flex: 1, marginLeft: 12 },
  scheduleName: { fontSize: 12, fontWeight: '700', color: '#555', letterSpacing: 0.5, marginBottom: 2 },
  scheduleDesc: { fontSize: 12, color: '#777' },
  scheduleTime: { fontSize: 14, fontWeight: '700', color: '#006D44' },
  sleepRow: { flexDirection: 'row', marginBottom: 16 },
  sleepIconBox: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16, zIndex: 2 },
  sleepLine: { position: 'absolute', left: 16, top: 32, bottom: -16, width: 1, backgroundColor: '#E2E8F0', zIndex: 1, borderStyle: 'dashed' },
  sleepTextContainer: { flex: 1 },
  timeBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FDF9', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginTop: 4 },
  sleepTimeText: { fontSize: 16, fontWeight: '700', color: '#006D44' },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', padding: 12, borderRadius: 8, marginTop: 8 },
  infoText: { fontSize: 12, color: '#4F46E5', marginLeft: 8, fontStyle: 'italic' },
  completeBtn: { backgroundColor: '#006D44', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 56, borderRadius: 16, marginTop: 10 },
  completeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  skipBtn: { alignItems: 'center', marginTop: 20 },
  skipBtnText: { color: '#666', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
});
