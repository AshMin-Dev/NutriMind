import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

export default function PantryScreen() {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const units = ['kg', 'g', 'L', 'ml', 'pcs'];

  // Fetch items from Supabase
  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Add item to Supabase
  const addItem = async () => {
    if (!itemName || !quantity) return;

    const { error } = await supabase
      .from('pantry_items')
      .insert([{ name: itemName, quantity: parseFloat(quantity), unit }]);

    if (error) console.error(error);
    else {
      setItemName('');
      setQuantity('');
      fetchItems();
    }
  };

  // Delete item from Supabase
  const removeItem = async (id: string) => {
    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('id', id);

    if (error) console.error(error);
    else fetchItems();
  };

  const getLowStockColor = (quantity: number) => {
    if (quantity <= 0.5) return '#ff4444';
    if (quantity <= 1) return '#ff9800';
    return '#2E8B57';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>📦</Text>
        <Text style={styles.title}>Pantry Tracker</Text>
        <Text style={styles.subtitle}>{items.length} items in your pantry</Text>
      </View>

      <View style={styles.addSection}>
        <Text style={styles.sectionTitle}>Add Ingredient</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingredient name (e.g. Rice)"
          value={itemName}
          onChangeText={setItemName}
        />
        <View style={styles.rowInput}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            placeholder="Quantity"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {units.map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitButton, unit === u && styles.unitButtonActive]}
                onPress={() => setUnit(u)}>
                <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Text style={styles.addButtonText}>+ Add to Pantry</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Your Ingredients</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#2E8B57" style={{ marginTop: 20 }} />
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>No items yet — add your first ingredient!</Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemLeft}>
                <View style={[styles.dot, { backgroundColor: getLowStockColor(item.quantity) }]} />
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>{item.quantity} {item.unit} remaining</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteButton}>
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
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
    alignItems: 'center',
  },
  emoji: { fontSize: 50, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#c8f0d8', marginTop: 4 },
  addSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a5c38',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f0faf4',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#d0e8d8',
    marginBottom: 10,
  },
  rowInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  unitButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E8B57',
    marginRight: 6,
  },
  unitButtonActive: { backgroundColor: '#2E8B57' },
  unitText: { color: '#2E8B57', fontWeight: '600', fontSize: 13 },
  unitTextActive: { color: '#fff' },
  addButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  listSection: { paddingHorizontal: 16, paddingBottom: 40 },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#333' },
  itemQuantity: { fontSize: 12, color: '#888', marginTop: 2 },
  deleteButton: {
    backgroundColor: '#ffe0e0',
    borderRadius: 8,
    padding: 8,
  },
  deleteText: { color: '#ff4444', fontWeight: 'bold' },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 14,
  },
});