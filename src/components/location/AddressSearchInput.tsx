import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { photonSearchAddresses } from '@/services/geocoding';
import type { AddressResult } from '@/utils/address';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  onSelect: (result: AddressResult) => void;
  placeholder?: string;
  label?: string;
};

const DEBOUNCE_MS = 350;

export function AddressSearchInput({
  onSelect,
  placeholder = 'Search address in India...',
  label = 'Search Address',
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const matches = await photonSearchAddresses(trimmed);
        setResults(matches);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  function handleSelect(result: AddressResult) {
    setQuery(result.addressLine);
    setResults([]);
    onSelect(result);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCorrect={false}
      />
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Searching OpenStreetMap...</Text>
        </View>
      )}
      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
          keyboardShouldPersistTaps="handled"
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)}>
              <Text style={styles.rowTitle} numberOfLines={2}>
                {item.addressLine || [item.area, item.city].filter(Boolean).join(', ')}
              </Text>
              {(item.city || item.pincode) && (
                <Text style={styles.rowMeta}>
                  {[item.city, item.pincode].filter(Boolean).join(' • ')}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
      <Text style={styles.attribution}>Address search powered by OpenStreetMap</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg, zIndex: 10 },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
    minHeight: 50,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  loadingText: { ...typography.caption, color: colors.textMuted },
  list: {
    maxHeight: 220,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowTitle: { ...typography.bodySmall, color: colors.text },
  rowMeta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  attribution: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
