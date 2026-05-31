import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  });

  const loadData = async () => {
    try {
      const pStr = await AsyncStorage.getItem('userProfile');
      const lStr = await AsyncStorage.getItem('mealLogs');
      
      const p = pStr ? JSON.parse(pStr) : {
        daily_calories_goal: 2000,
        daily_protein_goal_g: 120,
        daily_carbs_goal_g: 250,
        daily_fats_goal_g: 70,
        daily_fiber_goal_g: 30
      };
      setProfile(p);

      const l = lStr ? JSON.parse(lStr) : [];
      // Filter for today
      const today = new Date().toDateString();
      const todayLogs = l.filter((log: any) => new Date(log.date).toDateString() === today);
      setLogs(todayLogs);

      // Calculate totals
      let cal = 0, pro = 0, car = 0, fat = 0, fib = 0;
      todayLogs.forEach((log: any) => {
        const n = log.nutrition || {};
        cal += n.calories || 0;
        pro += n.protein_g || 0;
        car += n.carbs_g || 0;
        fat += n.fat_g || 0;
        fib += n.fiber_g || 0;
      });

      setTotals({
        calories: cal,
        protein: pro,
        carbs: car,
        fat: fat,
        fiber: fib
      });
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const calGoal = profile.daily_calories_goal || 2000;
  const calLeft = Math.max(0, calGoal - totals.calories);
  
  const macros = [
    { label: 'PROTEIN', current: totals.protein, target: profile.daily_protein_goal_g || 120, color: '#3B82F6' },
    { label: 'CARBS', current: totals.carbs, target: profile.daily_carbs_goal_g || 250, color: '#D97706' },
    { label: 'FATS', current: totals.fat, target: profile.daily_fats_goal_g || 70, color: '#10B981' },
    { label: 'FIBER', current: totals.fiber, target: profile.daily_fiber_goal_g || 30, color: '#78350F' },
  ];

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
            <Feather name="activity" size={24} color="#067A46" style={{marginRight: 8}}/>
            <Text style={styles.headerTitle}>Nutriaa</Text>
        </View>
   
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryHeader}>
            <View>
                <Text style={styles.sectionLabel}>NUTRITION OVERVIEW</Text>
                <Text style={styles.title}>Daily Summary</Text>
            </View>
            <Text style={styles.dateText}>{todayStr}, <Text style={{fontWeight: '700'}}>Today</Text></Text>
        </View>

        <View style={styles.mainCard}>
            <View style={styles.circleContainer}>
                <View style={styles.circleOuter}>
                    <View style={styles.circleInner}>
                        <Text style={styles.calorieValue}>{Math.round(calLeft)}</Text>
                        <Text style={styles.calorieLabel}>kcal left</Text>
                    </View>
                </View>
            </View>

            <View style={styles.macrosGrid}>
                {macros.map((macro, idx) => {
                    const progress = Math.min(100, (macro.current / (macro.target || 1)) * 100);
                    return (
                        <View key={idx} style={styles.macroCard}>
                            <Text style={[styles.macroLabel, {color: macro.color}]}>{macro.label}</Text>
                            <Text style={styles.macroValue}>{Math.round(macro.current)}g <Text style={styles.macroTarget}>/ {macro.target}g</Text></Text>
                            <View style={styles.macroBarBg}>
                                <View style={[styles.macroBarFill, { backgroundColor: macro.color, width: `${progress}%` as any }]} />
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>

     

        {logs.length > 0 && (
            <>
                <Text style={styles.sectionTitle}>Today's Meals</Text>
                {logs.map((log, i) => (
                    <View key={i} style={styles.recipeCard}>
                        {log.imageUri && (
                            <Image source={{uri: log.imageUri}} style={{height: 120, borderRadius: 12, marginBottom: 12}} />
                        )}
                        <Text style={styles.recipeTitle}>{log.food_name || 'Logged Meal'}</Text>
                        <Text style={styles.recipeDesc}>Logged at {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                        <View style={styles.recipeFooter}>
                            <View>
                                <Text style={styles.recipeStatLabel}>Kcal</Text>
                                <Text style={styles.recipeStatValue}>{Math.round(log.nutrition?.calories || 0)}</Text>
                            </View>
                            <View style={{marginLeft: 24}}>
                                <Text style={styles.recipeStatLabel}>Protein</Text>
                                <Text style={styles.recipeStatValue}>{Math.round(log.nutrition?.protein_g || 0)}g</Text>
                            </View>
                        </View>
                        
                        {log.warning && (
                            <View style={[styles.adviceCard, {backgroundColor: '#FEF2F2', marginTop: 16, marginBottom: 0}]}>
                                <View style={styles.adviceIcon}><Feather name="alert-triangle" size={20} color="#DC2626" /></View>
                                <View style={styles.adviceContent}>
                                    <Text style={[styles.adviceTitle, {color: '#B91C1C'}]}>Warning</Text>
                                    <Text style={styles.adviceDesc}>{log.warning}</Text>
                                </View>
                            </View>
                        )}
                        
                        {log.advice && (
                            <View style={[styles.adviceCard, {backgroundColor: '#FEFCE8', marginTop: 12, marginBottom: 0}]}>
                                <View style={styles.adviceIcon}><Feather name="info" size={20} color="#D97706" /></View>
                                <View style={styles.adviceContent}>
                                    <Text style={[styles.adviceTitle, {color: '#B45309'}]}>AI Advice</Text>
                                    <Text style={styles.adviceDesc}>{log.advice}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                ))}
            </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, backgroundColor: '#F4FBF6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#067A46' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  insightsText: { fontSize: 14, color: '#555', marginRight: 10 },
  flameIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E8F5EB', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, marginTop: 16 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: '#555', letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', color: '#111' },
  dateText: { fontSize: 14, color: '#067A46' },
  mainCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  circleContainer: { alignItems: 'center', marginVertical: 20 },
  circleOuter: { width: 160, height: 160, borderRadius: 80, borderWidth: 12, borderColor: '#067A46', borderRightColor: '#E8F5EB', justifyContent: 'center', alignItems: 'center', transform: [{rotate: '45deg'}] },
  circleInner: { transform: [{rotate: '-45deg'}], alignItems: 'center' },
  calorieValue: { fontSize: 32, fontWeight: '800', color: '#111' },
  calorieLabel: { fontSize: 14, color: '#555', marginTop: -4 },
  macrosGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  macroCard: { width: '48%', backgroundColor: '#F9FDF9', borderRadius: 12, padding: 12, marginBottom: 12 },
  macroLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  macroValue: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 8 },
  macroTarget: { fontSize: 12, fontWeight: '500', color: '#777' },
  macroBarBg: { height: 4, backgroundColor: '#E0E0E0', borderRadius: 2 },
  macroBarFill: { height: '100%', borderRadius: 2 },
  hydrationCard: { backgroundColor: '#6366F1', borderRadius: 20, padding: 20, marginBottom: 24 },
  hydrationTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginTop: 12 },
  hydrationGoal: { fontSize: 12, color: '#C7D2FE', marginBottom: 16 },
  hydrationValueContainer: { flexDirection: 'row', alignItems: 'baseline' },
  hydrationValue: { fontSize: 32, fontWeight: '800', color: '#FFF' },
  hydrationUnit: { fontSize: 16, color: '#FFF', marginLeft: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 12, marginTop: 10 },
  recipeCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  recipeTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 4 },
  recipeDesc: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 16 },
  recipeFooter: { flexDirection: 'row', alignItems: 'center' },
  recipeStatLabel: { fontSize: 10, color: '#777', fontWeight: '700', marginBottom: 2 },
  recipeStatValue: { fontSize: 16, fontWeight: '800', color: '#111' },
  adviceCard: { flexDirection: 'row', borderRadius: 16, padding: 12 },
  adviceIcon: { width: 36, height: 36, backgroundColor: '#FFF', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  adviceContent: { flex: 1 },
  adviceTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  adviceDesc: { fontSize: 12, color: '#555', lineHeight: 18 },
});
