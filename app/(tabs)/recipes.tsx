import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

export default function RecipesScreen() {
  const [ingredients, setIngredients] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('Pakistani');
  const [servings, setServings] = useState('2');
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPantry, setSelectedPantry] = useState<string[]>([]);
  const [mode, setMode] = useState<'manual' | 'pantry'>('manual');
  const [pantryItems, setPantryItems] = useState<string[]>([]);

  const cuisines = ['Pakistani', 'Italian', 'Chinese', 'Arabic', 'Indian', 'Continental'];
  const servingOptions = ['1', '2', '3', '4', '5+'];

  const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_KEY;
useFocusEffect(
    useCallback(() => {
      const fetchPantry = async () => {
        const { data } = await supabase
          .from('pantry_items')
          .select('name')
          .order('created_at', { ascending: false });
        if (data) setPantryItems(data.map((item: any) => item.name));
      };
      fetchPantry();
    }, [])
  );

  const togglePantryItem = (item: string) => {
    setSelectedPantry(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const parseRecipe = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    const result: any = { raw: text, sections: [] };
    let currentSection: any = null;

    for (const line of lines) {
      if (line.startsWith('**') && line.endsWith('**')) {
        if (currentSection) result.sections.push(currentSection);
        currentSection = { title: line.replace(/\*/g, ''), items: [] };
      } else if (line.startsWith('##') || line.startsWith('#')) {
        if (currentSection) result.sections.push(currentSection);
        currentSection = { title: line.replace(/#/g, '').trim(), items: [] };
      } else if (currentSection) {
        currentSection.items.push(line.replace(/^[-*•]\s*/, '').trim());
      } else {
        result.sections.push({ title: '', items: [line] });
      }
    }
    if (currentSection) result.sections.push(currentSection);
    return result;
  };

  const generateRecipe = async () => {
    const finalIngredients = mode === 'pantry'
      ? selectedPantry.join(', ')
      : ingredients;

    if (!finalIngredients) return;
    setLoading(true);
    setRecipe(null);

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
            content: `Create a ${selectedCuisine} recipe for ${servings} person(s) using: ${finalIngredients}.

Format EXACTLY like this:
## Dish Name
[name here]

## Cooking Time
[time here]

## Ingredients
- [ingredient name]: [amount] [unit]
- [ingredient name]: [amount] [unit]

## Steps
1. step one
2. step two

## Nutrition (per serving)
- Calories: 
- Protein: 
- Carbs: 
- Fats: `
          }],
          temperature: 0.7
        })
      });

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || "No recipe generated.";
      setRecipe(parseRecipe(text));
    } catch (error) {
      setRecipe({ raw: 'Error: ' + JSON.stringify(error), sections: [] });
    }

    setLoading(false);
  };
  const handleCookedThis = async () => {
    if (!recipe) return;

    const ingredientSection = recipe.sections.find(
      (s: any) => s.title?.toLowerCase().includes('ingredient')
    );
    if (!ingredientSection) {
      alert('Could not find ingredients to deduct.');
      return;
    }

    const { data: pantry } = await supabase
      .from('pantry_items')
      .select('*');

    if (!pantry) return;

    let deductedCount = 0;

    for (const line of ingredientSection.items) {
      const parts = line.split(':');
      if (parts.length < 2) continue;
      const ingredientName = parts[0].trim().toLowerCase();
      const amountPart = parts[1].trim();
      const amount = parseFloat(amountPart);

      const pantryItem = pantry.find((p: any) =>
        p.name.toLowerCase().includes(ingredientName) ||
        ingredientName.includes(p.name.toLowerCase())
      );

      if (pantryItem && !isNaN(amount)) {
        const newQuantity = Math.max(0, pantryItem.quantity - amount);
        await supabase
          .from('pantry_items')
          .update({ quantity: newQuantity })
          .eq('id', pantryItem.id);
        deductedCount++;
      }
    }

    alert(`✅ Done! ${deductedCount} pantry item${deductedCount !== 1 ? 's' : ''} updated.`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🧑‍🍳</Text>
        <Text style={styles.title}>Recipe Generator</Text>
        <Text style={styles.subtitle}>Tell us what you have, we'll cook it up!</Text>
      </View>

      <View style={styles.section}>

        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'manual' && styles.modeButtonActive]}
            onPress={() => setMode('manual')}>
            <Text style={[styles.modeText, mode === 'manual' && styles.modeTextActive]}>✏️ Manual</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'pantry' && styles.modeButtonActive]}
            onPress={() => setMode('pantry')}>
            <Text style={[styles.modeText, mode === 'pantry' && styles.modeTextActive]}>📦 From Pantry</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Cuisine</Text>
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

        <Text style={styles.label}>Servings</Text>
        <View style={styles.chipRow}>
          {servingOptions.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, servings === s && styles.chipActive]}
              onPress={() => setServings(s)}>
              <Text style={[styles.chipText, servings === s && styles.chipTextActive]}>{s} 👤</Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === 'manual' ? (
          <>
            <Text style={styles.label}>Your Ingredients</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. rice, chicken, onion, tomato"
              value={ingredients}
              onChangeText={setIngredients}
              multiline
              numberOfLines={3}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Select from Pantry</Text>
            {pantryItems.length === 0 ? (
              <Text style={styles.emptyText}>No items in pantry yet — add some in the Pantry tab first!</Text>
            ) : (
              <View style={styles.pantryGrid}>
                {pantryItems.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.pantryChip, selectedPantry.includes(item) && styles.pantryChipActive]}
                    onPress={() => togglePantryItem(item)}>
                    <Text style={[styles.pantryChipText, selectedPantry.includes(item) && styles.pantryChipTextActive]}>
                      {selectedPantry.includes(item) ? '✓ ' : ''}{item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        <TouchableOpacity
          style={[styles.generateButton, loading && { opacity: 0.7 }]}
          onPress={generateRecipe}
          disabled={loading}>
          <Text style={styles.generateButtonText}>
            {loading ? '⏳ Generating...' : '✨ Generate Recipe'}
          </Text>
        </TouchableOpacity>
      </View>

      {recipe && (
        <View style={styles.recipeCard}>
          <Text style={styles.recipeTitle}>🍽️ Your Recipe</Text>
          {recipe.sections.map((section: any, index: number) => (
            <View key={index} style={styles.recipeSection}>
              {section.title ? (
                <Text style={styles.sectionHeader}>{section.title}</Text>
              ) : null}
              {section.items.map((item: string, i: number) => (
                <Text key={i} style={styles.sectionItem}>
                  {section.title === 'Steps' ? `${i + 1}. ${item}` : `• ${item}`}
                </Text>
              ))}
            </View>
          ))}

          <TouchableOpacity
            style={styles.cookedButton}
            onPress={handleCookedThis}>
            <Text style={styles.cookedButtonText}>👨‍🍳 I Cooked This!</Text>
          </TouchableOpacity>
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
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0faf4',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  modeButton: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center' },
  modeButtonActive: { backgroundColor: '#2E8B57' },
  modeText: { color: '#2E8B57', fontWeight: '600', fontSize: 13 },
  modeTextActive: { color: '#fff' },
  label: { fontSize: 14, fontWeight: '600', color: '#1a5c38', marginBottom: 10, marginTop: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2E8B57' },
  chipActive: { backgroundColor: '#2E8B57' },
  chipText: { color: '#2E8B57', fontWeight: '600', fontSize: 12 },
  chipTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#f0faf4',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#d0e8d8',
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  pantryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  pantryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2E8B57',
    backgroundColor: '#f0faf4',
  },
  pantryChipActive: { backgroundColor: '#2E8B57' },
  pantryChipText: { color: '#2E8B57', fontSize: 13, fontWeight: '500' },
  pantryChipTextActive: { color: '#fff' },
  emptyText: { color: '#888', fontSize: 13, textAlign: 'center', marginVertical: 10 },
  generateButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  generateButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  recipeCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    marginBottom: 40,
  },
  recipeTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a5c38', marginBottom: 16 },
  recipeSection: { marginBottom: 14 },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e0f0e8',
    paddingBottom: 4,
  },
  sectionItem: { fontSize: 13, color: '#444', lineHeight: 22, marginBottom: 2 },
  cookedButton: {
    backgroundColor: '#1a5c38',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  cookedButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});