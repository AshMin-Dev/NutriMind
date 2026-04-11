import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

export default function MealPlanScreen() {
  const [selectedCuisine, setSelectedCuisine] = useState('Pakistani');
  const [selectedGoal, setSelectedGoal] = useState('Maintain');
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [pantryItems, setPantryItems] = useState<string[]>([]);

  const cuisines = ['Pakistani', 'Italian', 'Chinese', 'Arabic', 'Indian', 'Continental'];
  const goals = ['Lose Weight', 'Maintain', 'Gain Weight'];
  const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_KEY;

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const { data: pantry } = await supabase
          .from('pantry_items')
          .select('name');
        if (pantry) setPantryItems(pantry.map((i: any) => i.name));

        const { data: profile } = await supabase
          .from('health_profile')
          .select('goal')
          .limit(1)
          .single();
        if (profile?.goal) setSelectedGoal(profile.goal);
      };
      fetchData();
    }, [])
  );

  const generateMealPlan = async () => {
    setLoading(true);
    setMealPlan(null);

    const pantryText = pantryItems.length > 0
      ? `Available ingredients: ${pantryItems.join(', ')}.`
      : 'No specific ingredients available.';

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer GROQ_API_KEY"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{
            role: "user",
            content: `Create a 7-day ${selectedCuisine} meal plan for someone who wants to ${selectedGoal}. ${pantryText}

Format EXACTLY like this for each day:
DAY 1:
Breakfast: [meal name] - [calories]kcal
Lunch: [meal name] - [calories]kcal
Dinner: [meal name] - [calories]kcal
Daily Total: [total]kcal

DAY 2:
Breakfast: [meal name] - [calories]kcal
Lunch: [meal name] - [calories]kcal
Dinner: [meal name] - [calories]kcal
Daily Total: [total]kcal

Continue for all 7 days. Keep it realistic and practical.`
          }],
          temperature: 0.7,
          max_tokens: 2000,
        })
      });

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || "Could not generate meal plan.";
      setMealPlan(parseMealPlan(text));
    } catch (error) {
      setMealPlan({ error: 'Something went wrong. Please try again.' });
    }

    setLoading(false);
  };

  const parseMealPlan = (text: string) => {
    const days = text.split(/DAY \d+:/g).filter(d => d.trim());
    return days.map((day, index) => {
      const lines = day.trim().split('\n').filter(l => l.trim());
      return {
        day: `Day ${index + 1}`,
        meals: lines,
      };
    });
  };

  const getDayEmoji = (index: number) => {
    const emojis = ['🌅', '🌤️', '☀️', '🌈', '⭐', '🌙', '🎉'];
    return emojis[index] || '📅';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🤖</Text>
        <Text style={styles.title}>Meal Plan Generator</Text>
        <Text style={styles.subtitle}>AI-powered 7-day meal plan just for you</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Cuisine Style</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {cuisines.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, selectedCuisine === c && styles.chipActive]}
                onPress={() => setSelectedCuisine(c)}>
                <Text style={[styles.chipText, selectedCuisine === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={styles.label}>Your Goal</Text>
        <View style={styles.goalRow}>
          {goals.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.goalButton, selectedGoal === g && styles.goalButtonActive]}
              onPress={() => setSelectedGoal(g)}>
              <Text style={[styles.goalText, selectedGoal === g && styles.goalTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {pantryItems.length > 0 && (
          <View style={styles.pantryInfo}>
            <Text style={styles.pantryInfoText}>
              📦 Using {pantryItems.length} items from your pantry
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.generateButton, loading && { opacity: 0.7 }]}
          onPress={generateMealPlan}
          disabled={loading}>
          <Text style={styles.generateButtonText}>
            {loading ? '⏳ Generating 7-Day Plan...' : '✨ Generate Meal Plan'}
          </Text>
        </TouchableOpacity>
      </View>

      {mealPlan && !mealPlan.error && mealPlan.map((day: any, index: number) => (
        <View key={index} style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayEmoji}>{getDayEmoji(index)}</Text>
            <Text style={styles.dayTitle}>{day.day}</Text>
          </View>
          {day.meals.map((meal: string, i: number) => {
            const isTotal = meal.toLowerCase().includes('total');
            return (
              <Text key={i} style={[styles.mealItem, isTotal && styles.mealTotal]}>
                {meal}
              </Text>
            );
          })}
        </View>
      ))}

      {mealPlan?.error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{mealPlan.error}</Text>
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
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#1a5c38', marginBottom: 10, marginTop: 14 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2E8B57' },
  chipActive: { backgroundColor: '#2E8B57' },
  chipText: { color: '#2E8B57', fontWeight: '600', fontSize: 12 },
  chipTextActive: { color: '#fff' },
  goalRow: { flexDirection: 'row', gap: 8 },
  goalButton: { flex: 1, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#2E8B57', alignItems: 'center' },
  goalButtonActive: { backgroundColor: '#2E8B57' },
  goalText: { color: '#2E8B57', fontWeight: '600', fontSize: 12 },
  goalTextActive: { color: '#fff' },
  pantryInfo: {
    backgroundColor: '#f0faf4',
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#d0e8d8',
  },
  pantryInfoText: { color: '#2E8B57', fontSize: 13, fontWeight: '500' },
  generateButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  generateButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  dayCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dayEmoji: { fontSize: 24, marginRight: 10 },
  dayTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a5c38' },
  mealItem: { fontSize: 13, color: '#444', lineHeight: 24, paddingVertical: 2 },
  mealTotal: { fontWeight: 'bold', color: '#2E8B57', marginTop: 4, borderTopWidth: 1, borderTopColor: '#e0f0e8', paddingTop: 6 },
  errorCard: { backgroundColor: '#ffe0e0', margin: 16, borderRadius: 14, padding: 16 },
  errorText: { color: '#cc0000', fontSize: 14 },
});