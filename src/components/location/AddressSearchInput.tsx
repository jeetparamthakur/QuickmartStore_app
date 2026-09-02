import { View, Text, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_API_KEY, hasGoogleMapsKey, parseAddressComponents } from '@/utils/address';
import type { AddressResult } from '@/utils/address';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  onSelect: (result: AddressResult) => void;
  placeholder?: string;
  label?: string;
};

export function AddressSearchInput({
  onSelect,
  placeholder = 'Search address on Google Maps...',
  label = 'Search Address',
}: Props) {
  if (!hasGoogleMapsKey()) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackLabel}>{label}</Text>
        <Text style={styles.fallbackHint}>
          Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to enable Google Places search. You can still enter address manually below.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        fetchDetails
        onPress={(_data, details) => {
          if (!details?.geometry?.location) return;
          const lat = details.geometry.location.lat;
          const lng = details.geometry.location.lng;
          const result = parseAddressComponents(
            details.address_components ?? [],
            details.formatted_address ?? _data.description,
            lat,
            lng
          );
          onSelect(result);
        }}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'en',
          components: 'country:in',
        }}
        enablePoweredByContainer={false}
        styles={{
          container: styles.autocompleteContainer,
          textInput: styles.textInput,
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
        }}
        textInputProps={{
          placeholderTextColor: colors.textMuted,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg, zIndex: 10 },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  autocompleteContainer: { flex: 0 },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
    height: 50,
  },
  listView: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  row: { padding: spacing.md },
  description: { ...typography.bodySmall, color: colors.text },
  fallback: { marginBottom: spacing.lg },
  fallbackLabel: { ...typography.label, color: colors.text, marginBottom: spacing.xs },
  fallbackHint: { ...typography.caption, color: colors.textMuted },
});
