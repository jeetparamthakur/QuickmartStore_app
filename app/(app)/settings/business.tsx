import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { InfoSection } from '@/components/profile/InfoSection';
import { InfoRow } from '@/components/profile/InfoRow';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePartnerProfile } from '@/hooks/usePartnerProfile';
import { colors, gradients, radius, shadows, spacing, typography } from '@/theme';

function displayValue(value?: string | null) {
  return value?.trim() ? value.trim() : '—';
}

export default function BusinessInfoScreen() {
  const { profile, isLoading } = usePartnerProfile();
  const isStore = profile?.partnerType === 'STORE';
  const business = profile?.businessDetails;
  const store = profile?.storeDetails;
  const seller = profile?.sellerSetup;

  const businessName = isStore
    ? (business?.storeName ?? store?.name)
    : (business?.businessName ?? seller?.shopName ?? seller?.sellerName);

  const address = store
    ? [store.address, store.area, store.city, store.pincode].filter(Boolean).join(', ')
    : seller
      ? [seller.pickupAddress, seller.area, seller.city, seller.pincode].filter(Boolean).join(', ')
      : '';

  const hours = store
    ? store.is24Hours
      ? 'Open 24 hours'
      : `${store.openingTime} – ${store.closingTime}`
    : '';

  if (isLoading && !business && !store && !seller) {
    return (
      <>
        <Stack.Screen options={{ title: 'Business Information' }} />
        <ScreenWrapper>
          <Skeleton height={160} style={{ borderRadius: radius.lg, marginBottom: spacing.xl }} />
          <Skeleton height={260} style={{ borderRadius: radius.lg, marginBottom: spacing.lg }} />
          <Skeleton height={120} style={{ borderRadius: radius.lg }} />
        </ScreenWrapper>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: isStore ? 'Store Information' : 'Business Information' }} />
      <ScreenWrapper>
        <LinearGradient colors={[...gradients.promo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name={isStore ? 'storefront' : 'business'} size={28} color={colors.white} />
          </View>
          <Text style={styles.heroName}>{displayValue(businessName)}</Text>
          <Text style={styles.heroSub}>
            {isStore ? 'Registered Store' : displayValue(business?.businessType)}
          </Text>
        </LinearGradient>

        <InfoSection title={isStore ? 'Store Details' : 'Business Details'}>
          {isStore ? (
            <>
              <InfoRow icon="storefront-outline" label="Store Name" value={displayValue(businessName)} iconBg="#E8F5E9" iconColor="#2E7D32" />
              <InfoRow icon="document-text-outline" label="Description" value={displayValue(business?.description ?? store?.description)} isLast={!store} />
              {store && <InfoRow icon="time-outline" label="Operating Hours" value={displayValue(hours)} isLast />}
            </>
          ) : (
            <>
              <InfoRow icon="business-outline" label="Business Name" value={displayValue(business?.businessName ?? seller?.shopName)} iconBg="#F1F8E9" iconColor="#689F38" />
              <InfoRow icon="briefcase-outline" label="Business Type" value={displayValue(business?.businessType)} iconBg="#E8F0E8" iconColor="#1B5E20" />
              <InfoRow icon="person-outline" label="Seller Name" value={displayValue(seller?.sellerName)} />
              <InfoRow icon="document-text-outline" label="Description" value={displayValue(business?.description)} isLast />
            </>
          )}
        </InfoSection>

        {(store || seller) && (
          <InfoSection title="Location & Delivery">
            <InfoRow icon="location-outline" label="Address" value={displayValue(address)} iconBg="#FFEBEE" iconColor="#C62828" />
            {store && (
              <>
                <InfoRow icon="navigate-outline" label="Delivery Radius" value={`${store.deliveryRadius} km`} />
                <InfoRow icon="call-outline" label="Contact Number" value={displayValue(store.contactNumber)} isLast />
              </>
            )}
            {seller && !store && (
              <>
                <InfoRow icon="navigate-outline" label="Pickup Radius" value={`${seller.deliveryRadius} km`} />
                <InfoRow icon="car-outline" label="Delivery Preference" value={displayValue(seller.deliveryPreference)} isLast />
              </>
            )}
          </InfoSection>
        )}

        <InfoSection title="Tax & Compliance">
          <InfoRow icon="receipt-outline" label="GST Number" value={displayValue(business?.gstNumber) || 'Not provided'} iconBg="#F1F8E9" iconColor="#689F38" />
          <InfoRow icon="card-outline" label="PAN Number" value={displayValue(business?.panNumber) || 'Not provided'} iconBg="#E8F5E9" iconColor="#2E7D32" isLast />
        </InfoSection>

        <View style={styles.note}>
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={styles.noteText}>
            Business details are saved during onboarding and synced from your partner account.
          </Text>
        </View>
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroName: { ...typography.h2, color: colors.white, textAlign: 'center' },
  heroSub: { ...typography.body, color: 'rgba(255,255,255,0.85)', marginTop: 4, textTransform: 'capitalize' },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noteText: { ...typography.caption, color: colors.primary, flex: 1, lineHeight: 18 },
});
