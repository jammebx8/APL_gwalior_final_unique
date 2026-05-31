import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE = 'https://rookie-backend.vercel.app/api/analyze-food';

export default function LogMeal() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualPrompt, setManualPrompt] = useState('');
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Web-only hidden file input ref
  const webFileInputRef = useRef<any>(null);

  // ─── Image picking ────────────────────────────────────────────────────────

  const pickImage = () => {
    if (Platform.OS === 'web') {
      // On web, trigger the hidden <input type="file">
      webFileInputRef.current?.click();
      return;
    }

    // Native: show camera / library alert
    Alert.alert('Select Image', 'Choose an option', [
      {
        text: 'Camera',
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (permission.granted) {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 0.5,
              base64: true,
            });
            handleImageResult(result);
          }
        },
      },
      {
        text: 'Library',
        onPress: async () => {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (permission.granted) {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.5,
              base64: true,
            });
            handleImageResult(result);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleImageResult = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      if (asset.base64) {
        setImageBase64(asset.base64);
        analyzeFood(asset.base64);
      }
    }
  };

  // ─── Web file input handler ───────────────────────────────────────────────

  const handleWebFileChange = (e: any) => {
    const file: File = e.target.files?.[0];
    if (!file) return;
    processWebFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const processWebFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      setImageUri(dataUrl);
      setImageBase64(base64);
      setNutritionData(null);
      analyzeFood(base64, manualPrompt);
    };
    reader.readAsDataURL(file);
  };

  // ─── Drag-and-drop (web only) ─────────────────────────────────────────────

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDragging(false);
    const file: File = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processWebFile(file);
    }
  };

  // ─── API call ─────────────────────────────────────────────────────────────

  const analyzeFood = async (base64: string, promptText: string = '') => {
    setLoading(true);
    try {
      let userProfile: Record<string, any> = {};
      if (Platform.OS !== 'web') {
        const userProfileStr = await AsyncStorage.getItem('userProfile');
        userProfile = userProfileStr ? JSON.parse(userProfileStr) : {};
      } else {
        const raw = localStorage.getItem('userProfile');
        userProfile = raw ? JSON.parse(raw) : {};
      }

      const payload = {
        imageBase64: base64,
        manualPrompt: promptText,
        userContext: {
          diet_type: userProfile.diet || 'non_vegetarian',
          weight_kg: parseFloat(userProfile.weight) || 70,
          daily_protein_goal_g: userProfile.daily_protein_goal_g || 120,
          daily_calories_goal: userProfile.daily_calories_goal || 2000,
          time_of_day: new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: 'numeric',
            minute: 'numeric',
          }),
          meal_type: 'unknown',
        },
      };

      const response = await axios.post(API_BASE, payload);
      if (response.data?.success) {
        setNutritionData(response.data.data);
      } else {
        showAlert('Error', 'Could not analyze the food.');
      }
    } catch (error: any) {
      console.error(error?.response?.data || error.message);
      showAlert('Analysis Failed', 'Make sure the backend is reachable.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Re-analyze with updated context ─────────────────────────────────────

  const handleReanalyze = () => {
    if (!imageBase64) {
      showAlert('No Image', 'Please select an image first.');
      return;
    }
    setNutritionData(null);
    analyzeFood(imageBase64, manualPrompt);
  };

  // ─── Save log ─────────────────────────────────────────────────────────────

  const confirmAndLog = async () => {
    if (!nutritionData) {
      showAlert('No Data', 'Please scan a meal first.');
      return;
    }

    try {
      const newLog = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        imageUri,
        nutrition: nutritionData.nutrition,
        food_name: nutritionData.food_name,
        warning: nutritionData.warning,
        advice: nutritionData.advice,
      };

      if (Platform.OS !== 'web') {
        const logsStr = await AsyncStorage.getItem('mealLogs');
        const logs = logsStr ? JSON.parse(logsStr) : [];
        logs.push(newLog);
        await AsyncStorage.setItem('mealLogs', JSON.stringify(logs));
      } else {
        const raw = localStorage.getItem('mealLogs');
        const logs = raw ? JSON.parse(raw) : [];
        logs.push(newLog);
        localStorage.setItem('mealLogs', JSON.stringify(logs));
      }

      router.replace('/(tabs)');
    } catch (e) {
      console.error('Failed to save log', e);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtnHeader}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#067A46" />
          <Text style={styles.headerTitle}>NutriTrack</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Feather
            name="aperture"
            size={24}
            color="#067A46"
            style={{ marginRight: 16 }}
          />
          <Feather name="settings" size={24} color="#067A46" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Image zone ── */}
        <TouchableOpacity
          style={[
            styles.imagePlaceholder,
            isDragging && styles.imagePlaceholderDragging,
          ]}
          onPress={pickImage}
          // Web drag-and-drop props (ignored on native)
          {...(Platform.OS === 'web'
            ? {
                onDragOver: handleDragOver,
                onDragLeave: handleDragLeave,
                onDrop: handleDrop,
              }
            : {})}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={StyleSheet.absoluteFillObject as any}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderTextContainer}>
              <Feather name="camera" size={32} color="#067A46" />
              <Text style={styles.placeholderText}>
                {Platform.OS === 'web'
                  ? 'Tap or drag a photo here'
                  : 'Tap to pick photo'}
              </Text>
              {Platform.OS === 'web' && (
                <Text style={styles.placeholderSub}>JPG, PNG, WEBP</Text>
              )}
            </View>
          )}

          {nutritionData && (
            <View style={styles.aiBadge}>
              <Feather name="check-circle" size={14} color="#067A46" />
              <Text style={styles.aiBadgeText}>AI ANALYZED</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Hidden web file input */}
        {Platform.OS === 'web' && (
          <input
            ref={webFileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleWebFileChange}
          />
        )}

        {/* ── Status area ── */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#067A46" />
            <Text style={styles.loadingText}>Analyzing your meal...</Text>
          </View>
        ) : nutritionData ? (
          <>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  {nutritionData.food_name || 'Confirm Your Meal'}
                </Text>
                <Text style={styles.subtitle}>
                  {nutritionData.description ||
                    'Adjust the estimated values if needed.'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.estTimeLabel}>ESTIMATED</Text>
                <Text style={styles.estTimeLabel}>TIME</Text>
                <Text style={styles.estTimeValue}>
                  {new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.macroGrid}>
              {[
                {
                  label: 'CALORIES',
                  value: nutritionData.nutrition?.calories || 0,
                  unit: 'kcal',
                  color: '#111',
                },
                {
                  label: 'PROTEIN',
                  value: nutritionData.nutrition?.protein_g || 0,
                  unit: 'g',
                  color: '#3B82F6',
                },
                {
                  label: 'CARBS',
                  value: nutritionData.nutrition?.carbs_g || 0,
                  unit: 'g',
                  color: '#D97706',
                },
                {
                  label: 'FAT',
                  value: nutritionData.nutrition?.fat_g || 0,
                  unit: 'g',
                  color: '#78350F',
                },
              ].map((macro, idx) => (
                <View key={idx} style={styles.macroCard}>
                  <Text style={[styles.macroLabel, { color: macro.color }]}>
                    {macro.label}
                  </Text>
                  <View style={styles.macroValueRow}>
                    <Text style={styles.macroValue}>{macro.value}</Text>
                    <Text style={styles.macroUnit}>{macro.unit}</Text>
                  </View>
                </View>
              ))}
            </View>

            {nutritionData.warning && (
              <View style={styles.warningBox}>
                <Feather name="alert-triangle" size={16} color="#DC2626" />
                <Text style={styles.warningText}>{nutritionData.warning}</Text>
              </View>
            )}

            {nutritionData.advice && (
              <View style={styles.adviceBox}>
                <Feather name="info" size={16} color="#065F46" />
                <Text style={styles.adviceText}>{nutritionData.advice}</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Take a photo of your food to see its nutritional values!
            </Text>
          </View>
        )}

        {/* ── Context / re-analyze ── */}
        <View style={styles.contextBox}>
          <Text style={styles.contextLabel}>ADD CUSTOM CONTEXT / PROMPT</Text>
          <TextInput
            style={styles.contextInput}
            multiline
            value={manualPrompt}
            onChangeText={setManualPrompt}
            placeholder="e.g. 'I used olive oil instead of butter'"
            placeholderTextColor="#A0AEC0"
          />
          <TouchableOpacity
            style={[
              styles.reanalyzeBtn,
              !imageBase64 && styles.reanalyzeBtnDisabled,
            ]}
            onPress={handleReanalyze}
            disabled={!imageBase64 || loading}
          >
            <Feather name="edit-2" size={14} color="#067A46" />
            <Text style={styles.reanalyzeBtnText}>RE-ANALYZE WITH CONTEXT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footerBar}>
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            (!nutritionData || loading) && styles.confirmBtnDisabled,
          ]}
          onPress={confirmAndLog}
          disabled={!nutritionData || loading}
        >
          <Text style={styles.confirmBtnText}>Confirm &amp; Log Meal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, backgroundColor: '#F4FBF6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backBtnHeader: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#067A46',
    marginLeft: 16,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  // Image zone
  imagePlaceholder: {
    height: 240,
    backgroundColor: '#D1E5D5',
    borderRadius: 24,
    marginBottom: 20,
    justifyContent: 'flex-end',
    padding: 16,
    overflow: 'hidden',
    // @ts-ignore — web only
    borderWidth: 2,
    borderColor: 'transparent',
  },
  imagePlaceholderDragging: {
    // @ts-ignore — web only
    borderColor: '#067A46',
    backgroundColor: '#C3DFC9',
  },
  placeholderTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { marginTop: 8, color: '#067A46', fontWeight: '600' },
  placeholderSub: { marginTop: 4, color: '#067A46', fontSize: 12, opacity: 0.7 },

  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#067A46',
    marginLeft: 6,
  },

  // Loading
  loadingBox: { alignItems: 'center', marginVertical: 30 },
  loadingText: { marginTop: 12, color: '#067A46', fontWeight: '600' },

  // Results
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#555', lineHeight: 20 },
  estTimeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#067A46',
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  estTimeValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginTop: 4,
  },

  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  macroCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  macroValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  macroValue: { fontSize: 24, fontWeight: '800', color: '#111' },
  macroUnit: { fontSize: 12, fontWeight: '600', color: '#777', marginLeft: 4 },

  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  warningText: { color: '#B91C1C', marginLeft: 8, flex: 1, fontSize: 14, lineHeight: 20 },

  adviceBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  adviceText: { color: '#065F46', marginLeft: 8, flex: 1, fontSize: 14, lineHeight: 20 },

  emptyState: { alignItems: 'center', marginBottom: 24, paddingHorizontal: 20 },
  emptyStateText: { textAlign: 'center', color: '#666', fontSize: 14 },

  // Context box
  contextBox: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contextLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#777',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  contextInput: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    padding: 16,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  reanalyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  reanalyzeBtnDisabled: { opacity: 0.4 },
  reanalyzeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#067A46',
    marginLeft: 6,
  },

  // Footer
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  confirmBtn: {
    backgroundColor: '#006D44',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});