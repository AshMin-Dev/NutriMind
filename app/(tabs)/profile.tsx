import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'profile' | 'nutrition'>('profile');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  const nutritionData = {
    calories: { consumed: 1450, target: 2000 },
    protein: { consumed: 65, target: 120 },
    carbs: { consumed: 180, target: 250 },
    fats: { consumed: 45, target: 65 },
  };

  const meals = [
    { name: 'Breakfast', time: '8:00 AM', calories: 350, items: 'Eggs, Toast, Tea' },
    { name: 'Lunch', time: '1:00 PM', calories: 650, items: 'Chicken Rice, Salad' },
    { name: 'Snack', time: '4:00 PM', calories: 150, items: 'Fruits, Nuts' },
    { name: 'Dinner', time: '8:00 PM', calories: 300, items: 'Dal, Roti' },
  ];

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('health_profile')
      .select('*')
      .limit(1)
      .single();

    if (data) {
      setProfileId(data.id);
      setName(data.name || '');
      setAge(data.age?.toString() || '');
      setHeight(data.height?.toString() || '');
      setWeight(data.weight?.toString() || '');
      setGoal(data.goal || '');
      setHeightUnit(data.height_unit || 'cm');
      setWeightUnit(data.weight_unit || 'kg');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    setLoading(true);
    const profileData = {
      name,
      age: parseInt(age),
      height: parseFloat(height),
      height_unit: heightUnit,
      weight: parseFloat(weight),
      weight_unit: weightUnit,
      goal,
    };

    if (profileId) {
      await supabase.from('health_profile').update(profileData).eq('id', profileId);
    } else {
      await supabase.from('health_profile').insert([profileData]);
    }

    setLoading(false);
    fetchProfile();
    alert('Profile saved! ✅');
  };

  const ProgressBar = ({ consumed, target, color }: any) => {
    const width = Math.min((consumed / target) * 100, 100);
    return (
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${width}%`, backgroundColor: color }]} />
      </View>
    );
  };

  const getProgressColor = (consumed: number, target: number) => {
    const percent = consumed / target;
    if (percent >= 1) return '#ff4444';
    if (percent >= 0.8) return '#ff9800';
    return '#2E8B57';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>👤</Text>
        <Text style={styles.title}>{name || 'My Profile'}</Text>
        <Text style={styles.subtitle}>{goal ? `Goal: ${goal}` : 'Set your health goals'}</Text>
      </View>

      <View style={styles.tabToggle}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
          onPress={() => setActiveTab('profile')}>
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
            💪 Health Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'nutrition' && styles.tabButtonActive]}
          onPress={() => setActiveTab('nutrition')}>
          <Text style={[styles.tabText, activeTab === 'nutrition' && styles.tabTextActive]}>
            📊 Nutrition
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'profile' ? (
        <View style={styles.section}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Awais"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 24"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />

          <Text style={styles.label}>Height</Text>
          <View style={styles.unitRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder={heightUnit === 'cm' ? 'e.g. 175' : 'e.g. 5.9'}
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />
            <View style={styles.unitToggle}>
              {['cm', 'ft'].map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitButton, heightUnit === u && styles.unitButtonActive]}
                  onPress={() => setHeightUnit(u as 'cm' | 'ft')}>
                  <Text style={[styles.unitText, heightUnit === u && styles.unitTextActive]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.label}>Weight</Text>
          <View style={styles.unitRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
            <View style={styles.unitToggle}>
              {['kg', 'lbs'].map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitButton, weightUnit === u && styles.unitButtonActive]}
                  onPress={() => setWeightUnit(u as 'kg' | 'lbs')}>
                  <Text style={[styles.unitText, weightUnit === u && styles.unitTextActive]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.label}>Your Goal</Text>
          <View style={styles.goalRow}>
            {['Lose Weight', 'Maintain', 'Gain Weight'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.goalButton, goal === option && styles.goalButtonActive]}
                onPress={() => setGoal(option)}>
                <Text style={[styles.goalText, goal === option && styles.goalTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <View style={styles.calorieCard}>
            <Text style={styles.calorieNumber}>{nutritionData.calories.consumed}</Text>
            <Text style={styles.calorieLabel}>of {nutritionData.calories.target} kcal</Text>
            <Text style={styles.calorieRemaining}>
              {nutritionData.calories.target - nutritionData.calories.consumed} kcal remaining
            </Text>
            <View style={styles.macroRow}>
              {[
                { label: 'Protein', value: nutritionData.protein.consumed },
                { label: 'Carbs', value: nutritionData.carbs.consumed },
                { label: 'Fats', value: nutritionData.fats.consumed },
              ].map((m) => (
                <View key={m.label} style={styles.macroItem}>
                  <Text style={styles.macroValue}>{m.value}g</Text>
                  <Text style={styles.macroLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Targets</Text>
            {Object.entries(nutritionData).map(([key, val]) => {
              const color = getProgressColor(val.consumed, val.target);
              return (
                <View key={key} style={styles.progressRow}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                    <Text style={styles.progressValue}>
                      {val.consumed} / {val.target}{key === 'calories' ? ' kcal' : 'g'}
                    </Text>
                  </View>
                  <ProgressBar consumed={val.consumed} target={val.target} color={color} />
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meals Today</Text>
            {meals.map((meal, index) => (
              <View key={index} style={styles.mealCard}>
                <View>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealItems}>{meal.items}</Text>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                </View>
                <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0faf4' },
  header: {
    backgroundColor: '#2E8B57',
    paddingTop: 80,
    paddingBottom: 30,
    alignItems: 'center',
  },
  emoji: { fontSize: 50, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 13, color: '#c8f0d8', marginTop: 4 },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 14,
    padding: 4,
    elevation: 2,
  },
  tabButton: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  tabButtonActive: { backgroundColor: '#2E8B57' },
  tabText: { color: '#2E8B57', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a5c38', marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: '#1a5c38', marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: '#f0faf4',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#d0e8d8',
  },
  unitRow: { flexDirection: 'row', alignItems: 'center' },
  unitToggle: { flexDirection: 'row', gap: 6 },
  unitButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E8B57',
  },
  unitButtonActive: { backgroundColor: '#2E8B57' },
  unitText: { color: '#2E8B57', fontWeight: '600', fontSize: 13 },
  unitTextActive: { color: '#fff' },
  goalRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  goalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E8B57',
    alignItems: 'center',
  },
  goalButtonActive: { backgroundColor: '#2E8B57' },
  goalText: { color: '#2E8B57', fontWeight: '600', fontSize: 12 },
  goalTextActive: { color: '#fff' },
  saveButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  calorieCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    alignItems: 'center',
  },
  calorieNumber: { fontSize: 48, fontWeight: 'bold', color: '#2E8B57' },
  calorieLabel: { fontSize: 14, color: '#888', marginTop: 4 },
  calorieRemaining: { fontSize: 13, color: '#2E8B57', fontWeight: '600', marginTop: 4 },
  macroRow: { flexDirection: 'row', gap: 32, marginTop: 16 },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  macroLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  progressRow: { marginBottom: 14 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 13, fontWeight: '600', color: '#333' },
  progressValue: { fontSize: 12, color: '#888' },
  progressBg: { height: 8, backgroundColor: '#e0f0e8', borderRadius: 4 },
  progressFill: { height: 8, borderRadius: 4 },
  mealCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mealName: { fontSize: 14, fontWeight: '600', color: '#333' },
  mealItems: { fontSize: 12, color: '#888', marginTop: 2 },
  mealTime: { fontSize: 11, color: '#aaa', marginTop: 2 },
  mealCalories: { fontSize: 14, fontWeight: 'bold', color: '#2E8B57' },
});