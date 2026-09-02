import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useUserLocationStore } from '@/stores/userLocationStore';
import { colors, spacing, typography, radius } from '@/theme';

export default function SplashScreenPage() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const loadLocation = useUserLocationStore((s) => s.loadLocation);

  useEffect(() => {
    loadLocation();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim, loadLocation]);

  async function goCustomer() {
    await loadLocation();
    const loc = useUserLocationStore.getState().location;
    if (loc) {
      router.replace('/(customer)/products');
    } else {
      router.replace('/(customer)/location-setup');
    }
  }

  function goPartner() {
    router.replace('/(auth)/login');
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>M</Text>
        </View>
        <Text style={styles.title}>Me2 Marketplace</Text>
        <Text style={styles.subtitle}>Hyperlocal shops & quick commerce</Text>
      </Animated.View>

      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.primaryBtn} onPress={goCustomer}>
          <Text style={styles.primaryBtnText}>Shop Nearby Products</Text>
          <Text style={styles.primaryBtnSub}>See products from stores delivering to your area</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={goPartner}>
          <Text style={styles.secondaryBtnText}>🏪 Partner / Seller Login</Text>
          <Text style={styles.secondaryBtnSub}>Manage your store & orders</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoWrap: { alignItems: 'center', marginBottom: spacing.huge },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  logoText: { fontSize: 40, fontWeight: '700', color: colors.white },
  title: { ...typography.h1, color: colors.white, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  actions: { width: '100%', gap: spacing.md },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  primaryBtnText: { ...typography.bodyMedium, color: colors.white, fontWeight: '700' },
  primaryBtnSub: { ...typography.caption, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondaryBtnText: { ...typography.bodyMedium, color: colors.white, fontWeight: '600' },
  secondaryBtnSub: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
});
