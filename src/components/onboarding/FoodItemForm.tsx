import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { onboardingService } from '@/services/api';
import type { FoodItem } from '@/types/partner';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  visible: boolean;
  item?: FoodItem | null;
  onClose: () => void;
  onSave: (item: FoodItem) => void;
};

function createEmptyForm() {
  return {
    name: '',
    price: '',
    description: '',
    isVeg: true,
    prepTimeMinutes: '15',
    imageUrl: '',
  };
}

export function FoodItemForm({ visible, item, onClose, onSave }: Props) {
  const [form, setForm] = useState(createEmptyForm());
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (item) {
      setForm({
        name: item.name,
        price: String(item.price),
        description: item.description ?? '',
        isVeg: item.isVeg,
        prepTimeMinutes: String(item.prepTimeMinutes),
        imageUrl: item.imageUrl ?? '',
      });
      return;
    }
    setForm(createEmptyForm());
  }, [visible, item]);

  function update(key: string, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const response = await onboardingService.uploadFoodImage(result.assets[0].uri);
      update('imageUrl', response.url);
    } catch {
      Alert.alert('Upload failed', 'Could not upload food image. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleSave() {
    const name = form.name.trim();
    const price = Number(form.price);
    const prepTimeMinutes = Number(form.prepTimeMinutes);

    if (!name) {
      Alert.alert('Required', 'Please enter item name');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      Alert.alert('Required', 'Please enter a valid price');
      return;
    }
    if (!Number.isFinite(prepTimeMinutes) || prepTimeMinutes < 0) {
      Alert.alert('Required', 'Please enter a valid prep time');
      return;
    }

    onSave({
      id: item?.id ?? `food-${Date.now()}`,
      name,
      price,
      description: form.description.trim() || undefined,
      isVeg: form.isVeg,
      prepTimeMinutes,
      imageUrl: form.imageUrl || undefined,
    });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{item ? 'Edit Menu Item' : 'Add Menu Item'}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Input label="Item Name *" value={form.name} onChangeText={(v) => update('name', v)} />
          <Input
            label="Price (₹) *"
            value={form.price}
            onChangeText={(v) => update('price', v.replace(/[^\d.]/g, ''))}
            keyboardType="decimal-pad"
          />
          <Input
            label="Description"
            value={form.description}
            onChangeText={(v) => update('description', v)}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.fieldLabel}>Food Type *</Text>
          <SegmentedControl
            options={[
              { value: 'veg', label: 'Veg' },
              { value: 'nonveg', label: 'Non-Veg' },
            ]}
            value={form.isVeg ? 'veg' : 'nonveg'}
            onChange={(value) => update('isVeg', value === 'veg')}
          />

          <Input
            label="Prep Time (minutes) *"
            value={form.prepTimeMinutes}
            onChangeText={(v) => update('prepTimeMinutes', v.replace(/\D/g, ''))}
            keyboardType="number-pad"
          />

          <Text style={styles.fieldLabel}>Photo</Text>
          <Pressable style={styles.imagePicker} onPress={handlePickImage} disabled={uploading}>
            {form.imageUrl ? (
              <Image source={{ uri: form.imageUrl }} style={styles.preview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={28} color={colors.primary} />
                <Text style={styles.imagePlaceholderText}>
                  {uploading ? 'Uploading...' : 'Add photo'}
                </Text>
              </View>
            )}
          </Pressable>

          <Button title={item ? 'Save Item' : 'Add Item'} onPress={handleSave} fullWidth />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: { ...typography.h2, color: colors.text },
  fieldLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  preview: {
    width: '100%',
    height: 160,
  },
  imagePlaceholder: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  imagePlaceholderText: { ...typography.bodySmall, color: colors.textSecondary },
});
