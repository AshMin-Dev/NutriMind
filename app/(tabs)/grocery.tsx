import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

export default function GroceryScreen() {
  const [budget, setBudget] = useState('');
  const [selectedStore, setSelectedStore] = useState('Netto');
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const stores = ['Netto', 'Lidl', 'Both'];

  const fetchItems = async () => {
    const { data } = await supabase
      .from('grocery_items')
      .select('*')
      .order('created_at', { ascending: false });
    setItems(data || []);
  };

  useEffect(() => { fetchItems(); }, []);

  const addItem = async () => {
    if (!newItem) return;
    await supabase.from('grocery_items').insert([{
      name: newItem,
      price: parseFloat(newPrice) || 0,
      store: selectedStore,
      checked: false,
    }]);
    setNewItem('');
    setNewPrice('');
    fetchItems();
  };

  const toggleItem = async (id: string, checked: boolean) => {
    await supabase.from('grocery_items').update({ checked: !checked }).eq('id', id);
    fetchItems();
  };

  const deleteItem = async (id: string) => {
    await supabase.from('grocery_items').delete().eq('id', id);
    fetchItems();
  };

  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const checkedPrice = items.filter(i => i.checked).reduce((sum, item) => sum + (item.price || 0), 0);
  const remaining = budget ? parseFloat(budget) - checkedPrice : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🛒</Text>
        <Text style={styles.title}>Smart Grocery</Text>
        <Text style={styles.subtitle}>Plan your shopping smartly</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Budget</Text>
        <View style={styles.budgetRow}>
          <Text style={styles.currencySymbol}>€</Text>
          <TextInput
            style={styles.budgetInput}
            placeholder="Enter budget (e.g. 30)"
            keyboardType="numeric"
            value={budget}
            onChangeText={setBudget}
          />
        </View>
        {remaining !== null && (
          <Text style={[styles.remainingText, { color: remaining >= 0 ? '#2E8B57' : '#ff4444' }]}>
            {remaining >= 0 ? `✅ €${remaining.toFixed(2)} remaining` : `❌ €${Math.abs(remaining).toFixed(2)} over budget`}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred Store</Text>
        <View style={styles.storeRow}>
          {stores.map((store) => (
            <TouchableOpacity
              key={store}
              style={[styles.storeButton, selectedStore === store && styles.storeButtonActive]}
              onPress={() => setSelectedStore(store)}>
              <Text style={[styles.storeText, selectedStore === store && styles.storeTextActive]}>
                {store}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Item</Text>
        <TextInput
          style={styles.input}
          placeholder="Item name (e.g. Rice)"
          value={newItem}
          onChangeText={setNewItem}
        />
        <TextInput
          style={styles.input}
          placeholder="Price in € (optional)"
          keyboardType="numeric"
          value={newPrice}
          onChangeText={setNewPrice}
        />
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Text style={styles.addButtonText}>+ Add to List</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>€{totalPrice.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Total Est.</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{items.filter(i => i.checked).length}/{items.length}</Text>
          <Text style={styles.summaryLabel}>Checked</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>€{checkedPrice.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>In Cart</Text>
        </View>
      </View>

      <View style={[styles.section, { marginBottom: 40 }]}>
        <Text style={styles.sectionTitle}>Shopping List</Text>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>No items yet — add your first item!</Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <TouchableOpacity
                style={styles.itemLeft}
                onPress={() => toggleItem(item.id, item.checked)}>
                <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                  {item.checked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View>
                  <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemStore}>📍 {item.store}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.itemRight}>
                <Text style={[styles.itemPrice, item.checked && styles.itemNameChecked]}>
                  €{(item.price || 0).toFixed(2)}
                </Text>
                <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteButton}>
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
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
  subtitle: { fontSize: 13, color: '#c8f0d8', marginTop: 4 },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a5c38', marginBottom: 12 },
  budgetRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: 20, fontWeight: 'bold', color: '#2E8B57', marginRight: 8 },
  budgetInput: {
    flex: 1,
    backgroundColor: '#f0faf4',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d0e8d8',
  },
  remainingText: { fontSize: 14, fontWeight: '600', marginTop: 10 },
  storeRow: { flexDirection: 'row', gap: 10 },
  storeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E8B57',
    alignItems: 'center',
  },
  storeButtonActive: { backgroundColor: '#2E8B57' },
  storeText: { color: '#2E8B57', fontWeight: '600' },
  storeTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#f0faf4',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#d0e8d8',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  summaryRow: {
    flexDirection: 'row',
    margin: 16,
    marginBottom: 0,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
  },
  summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#2E8B57' },
  summaryLabel: { fontSize: 11, color: '#888', marginTop: 4 },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2E8B57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#2E8B57' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  itemName: { fontSize: 14, fontWeight: '600', color: '#333' },
  itemNameChecked: { textDecorationLine: 'line-through', color: '#aaa' },
  itemStore: { fontSize: 11, color: '#888', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#2E8B57' },
  deleteButton: { backgroundColor: '#ffe0e0', borderRadius: 8, padding: 8 },
  deleteText: { color: '#ff4444', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20, fontSize: 14 },
});