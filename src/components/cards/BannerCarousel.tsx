import { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import type { Banner } from '@/types/index';
import { colors, radius, spacing } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDE = spacing.lg;
const GAP = spacing.md;
const BANNER_WIDTH = SCREEN_WIDTH - SIDE * 2;
const SNAP = BANNER_WIDTH + GAP;

type Props = {
  banners: Banner[];
  onPress?: (banner: Banner) => void;
};

export function BannerCarousel({ banners, onPress }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * SNAP, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SNAP);
    setActiveIndex(Math.min(Math.max(index, 0), banners.length - 1));
  };

  if (!banners.length) return null;

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={SNAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: SIDE }}
      >
        {banners.map((banner, index) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.9}
            onPress={() => onPress?.(banner)}
            style={[
              styles.banner,
              { width: BANNER_WIDTH, marginRight: index === banners.length - 1 ? 0 : GAP },
            ]}
          >
            <Image source={{ uri: banner.imageUrl }} style={styles.image} contentFit="cover" />
          </TouchableOpacity>
        ))}
      </ScrollView>
      {banners.length > 1 && (
        <View style={styles.dots}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === activeIndex ? colors.primary : colors.border,
                  width: index === activeIndex ? 18 : 6,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  banner: {
    height: 160,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: spacing.sm,
  },
  dot: { height: 6, borderRadius: 3 },
});
