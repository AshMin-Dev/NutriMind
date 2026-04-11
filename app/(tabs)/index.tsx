import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [userGoal, setUserGoal] = useState('');
  const [pantryCount, setPantryCount] = useState(0);
  const [groceryCount, setGroceryCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        // Fetch profile
        const { data: profile } = await supabase
          .from('health_profile')
          .select('name, goal')
          .limit(1)
          .single();
        if (profile) {
          setUserName(profile.name || '');
          setUserGoal(profile.goal || '');
        }

        // Fetch pantry stats
        const { data: pantry } = await supabase
          .from('pantry_items')
          .select('*');
        if (pantry) {
          setPantryCount(pantry.length);
          setLowStockCount(pantry.filter((i: any) => i.quantity <= 1).length);
        }

        // Fetch grocery stats
        const { data: grocery } = await supabase
          .from('grocery_items')
          .select('*')
          .eq('checked', false);
        if (grocery) setGroceryCount(grocery.length);
      };
      fetchData();
    }, [])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getGoalEmoji = () => {
    if (userGoal === 'Lose Weight') return '🔥';
    if (userGoal === 'Gain Weight') return '💪';
    return '⚖️';
  };

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.title}>{userName ? `${userName}! 👋` : 'Welcome to NutriMind!'}</Text>
        <Text style={styles.subtitle}>Your Personal AI Kitchen Assistant</Text>
        {userGoal ? (
          <View style={styles.goalBadge}>
            <Text style={styles.goalText}>{getGoalEmoji()} Goal: {userGoal}</Text>
          </View>
        ) : null}
      </View>

      {/* Live Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📦</Text>
          <Text style={styles.statValue}>{pantryCount}</Text>
          <Text style={styles.statLabel}>Pantry Items</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🛒</Text>
          <Text style={styles.statValue}>{groceryCount}</Text>
          <Text style={styles.statLabel}>To Buy</Text>
        </View>
        <View style={[styles.statCard, lowStockCount > 0 && styles.statCardWarning]}>
          <Text style={styles.statEmoji}>⚠️</Text>
          <Text style={[styles.statValue, lowStockCount > 0 && styles.statValueWarning]}>{lowStockCount}</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
      <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/recipes')}>
        <Text style={styles.actionEmoji}>🧑‍🍳</Text>
        <Text style={styles.actionText}>Generate Recipe</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/pantry')}>
        <Text style={styles.actionEmoji}>📦</Text>
        <Text style={styles.actionText}>Add to Pantry</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/grocery')}>
        <Text style={styles.actionEmoji}>🛒</Text>
        <Text style={styles.actionText}>Grocery List</Text>
      </TouchableOpacity>
      </View>

      {/* Low Stock Warning */}
      {lowStockCount > 0 && (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Low Stock Alert</Text>
          <Text style={styles.warningText}>
            You have {lowStockCount} ingredient{lowStockCount > 1 ? 's' : ''} running low. Check your Pantry tab!
          </Text>
        </View>
      )}

      {/* Feature Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>

        {[
          { emoji: '🧑‍🍳', title: 'Recipe Generator', text: 'AI recipes from your ingredients', color: '#e8f5e9' },
          { emoji: '📦', title: 'Pantry Tracker', text: 'Track quantities and get alerts', color: '#e3f2fd' },
          { emoji: '🛒', title: 'Smart Grocery', text: 'Budget-based shopping lists', color: '#fff8e1' },
          { emoji: '💪', title: 'Health Profile', text: 'Personalized nutrition goals', color: '#fce4ec' },
          { emoji: '📊', title: 'Nutrition Dashboard', text: 'Track calories and macros', color: '#f3e5f5' },
          { emoji: '🤖', title: 'Meal Plan Generator', text: 'AI-powered weekly meal plans', color: '#e0f7fa' },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={[styles.featureCard, { backgroundColor: item.color }]}
            onPress={() => {
              if (index === 0) router.push('/(tabs)/recipes');
              else if (index === 1) router.push('/(tabs)/pantry');
              else if (index === 2) router.push('/(tabs)/grocery');
              else if (index === 3) router.push('/(tabs)/profile');
              else if (index === 4) router.push('/(tabs)/profile');
              else if (index === 5) router.push('/(tabs)/mealplan');
            }}>
            <Text style={styles.featureEmoji}>{item.emoji}</Text>
            <View>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0faf4' },
  header: {
    backgroundColor: '#2E8B57',
    paddingTop: 80,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  greeting: { fontSize: 14, color: '#c8f0d8' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  subtitle: { fontSize: 13, color: '#c8f0d8', marginTop: 4 },
  goalBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  goalText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    margin: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
  },
  statCardWarning: { backgroundColor: '#fff8e1', borderWidth: 1, borderColor: '#ff9800' },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#2E8B57' },
  statValueWarning: { color: '#ff9800' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },
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
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    backgroundColor: '#f0faf4',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0e8d8',
  },
  actionEmoji: { fontSize: 28, marginBottom: 6 },
  actionText: { fontSize: 11, color: '#1a5c38', fontWeight: '600', textAlign: 'center' },
  warningCard: {
    backgroundColor: '#fff8e1',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  warningTitle: { fontSize: 15, fontWeight: 'bold', color: '#e65100', marginBottom: 4 },
  warningText: { fontSize: 13, color: '#bf360c' },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  featureEmoji: { fontSize: 32, marginRight: 14 },
  featureTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a5c38' },
  featureText: { fontSize: 12, color: '#666', marginTop: 2 },
});