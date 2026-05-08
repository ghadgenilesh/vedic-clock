import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, VedicPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { i18n } from '@/lib/i18n';
import { useLocation } from '@/lib/location-context';
import {
    formatGhati,
    formatTime,
    getPanchang,
    getVedicTime,
    Panchang,
} from '@/lib/vedic-calc';

function InfoCard({ label, value, color, colors }: { label: string; value: string; color?: string; colors: typeof Colors.light }) {
  return (
    <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.subText }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: color ?? colors.text }]}>{value}</Text>
    </View>
  );
}

export default function VedicClockScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { location, loading, error } = useLocation();

  const [now, setNow] = useState(new Date());
  const [panchang, setPanchang] = useState<Panchang | null>(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!location) return;
    const p = getPanchang(now, location.lat, location.lon);
    setPanchang(p);
  }, [location, now.getDate(), now.getMonth(), now.getFullYear()]);

  useEffect(() => {
    if (!panchang) return;
    const vt = getVedicTime(now, panchang.sunrise, panchang.sunset);
    Animated.timing(rotateAnim, {
      toValue: vt.fraction,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, [now, panchang]);

  if (loading || !panchang) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.subText }]}>{i18n.t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  const vt = getVedicTime(now, panchang.sunrise, panchang.sunset);
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.gold }]}>{i18n.t('clock.title')}</Text>
        <Text style={[styles.date, { color: colors.subText }]}>
          {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>

        <View style={styles.clockWrapper}>
          <View style={[styles.clockFace, { borderColor: colors.gold, backgroundColor: colors.surface }]}>
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
              const r = 120;
              const x = r * Math.cos(angle);
              const y = r * Math.sin(angle);
              const isGhati = i % 5 === 0;
              return (
                <View
                  key={i}
                  style={[
                    styles.tick,
                    {
                      transform: [{ translateX: x }, { translateY: y }],
                      width: isGhati ? 8 : 4,
                      height: isGhati ? 8 : 4,
                      borderRadius: 4,
                      backgroundColor: isGhati ? colors.gold : colors.border,
                    },
                  ]}
                />
              );
            })}
            <View style={styles.centerDisplay}>
              <Text style={[styles.ghatiText, { color: colors.gold }]}>
                {vt.ghati.toString().padStart(2, '0')}
              </Text>
              <Text style={[styles.ghatiLabel, { color: colors.subText }]}>{i18n.t('clock.ghati')}</Text>
              <Text style={[styles.palaText, { color: colors.accent }]}>
                {vt.pala.toString().padStart(2, '0')} {i18n.t('clock.pala')}
              </Text>
              <Text style={[styles.dayNight, { color: vt.isDay ? VedicPalette.saffron : '#7B68EE' }]}>
                {vt.isDay ? '☀ ' + i18n.t('clock.day') : '🌙 ' + i18n.t('clock.night')}
              </Text>
            </View>
            {/* Zero-size pivot at clock center — hand extends upward from here */}
            <Animated.View style={[styles.handPivot, { transform: [{ rotate }] }]}>
              <View style={[styles.hand, { backgroundColor: colors.accent }]} />
            </Animated.View>
            {/* Center dot */}
            <View style={[styles.centerDot, { backgroundColor: colors.accent }]} />
          </View>
        </View>

        <Text style={[styles.digitalTime, { color: colors.text }]}>
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </Text>
        <Text style={[styles.ghatiFormatted, { color: colors.subText }]}>
          {formatGhati(vt.ghati, vt.pala)}
        </Text>

        <View style={styles.row}>
          <InfoCard label={i18n.t('clock.sunrise')} value={formatTime(panchang.sunrise)} color={VedicPalette.saffron} colors={colors} />
          <InfoCard label={i18n.t('clock.sunset')} value={formatTime(panchang.sunset)} color={'#7B68EE'} colors={colors} />
        </View>

        <View style={[styles.strip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.stripItem}>
            <Text style={[styles.stripLabel, { color: colors.subText }]}>{i18n.t('panchang.tithi')}</Text>
            <Text style={[styles.stripValue, { color: colors.text }]}>{panchang.tithi.tithi}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.stripItem}>
            <Text style={[styles.stripLabel, { color: colors.subText }]}>{i18n.t('panchang.nakshatra')}</Text>
            <Text style={[styles.stripValue, { color: colors.text }]}>{panchang.nakshatra.nakshatra}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.stripItem}>
            <Text style={[styles.stripLabel, { color: colors.subText }]}>{i18n.t('panchang.vara')}</Text>
            <Text style={[styles.stripValue, { color: colors.text }]}>{panchang.vara.vara}</Text>
          </View>
        </View>

        {location?.name && (
          <Text style={[styles.location, { color: location.isManual ? colors.accent : colors.subText }]}>
            📍 {location.name}
          </Text>
        )}
        {error && (
          <Text style={[styles.locationHint, { color: colors.inauspicious }]}>{error}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const CLOCK_SIZE = 280;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
  loading: { marginTop: 100, fontSize: 18 },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: 1.5, fontFamily: 'serif' },
  date: { fontSize: 13, marginTop: 4, marginBottom: 24 },
  clockWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  clockFace: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    borderRadius: CLOCK_SIZE / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  tick: { position: 'absolute' },
  centerDisplay: { alignItems: 'center', justifyContent: 'center' },
  ghatiText: { fontSize: 52, fontWeight: '800', fontFamily: 'serif', lineHeight: 56 },
  ghatiLabel: { fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' },
  palaText: { fontSize: 20, fontWeight: '600', marginTop: 4 },
  dayNight: { fontSize: 13, marginTop: 6, fontWeight: '600' },
  handPivot: {
    position: 'absolute',
    top: CLOCK_SIZE / 2,
    left: CLOCK_SIZE / 2,
    width: 0,
    height: 0,
  },
  hand: {
    position: 'absolute',
    width: 3,
    height: 100,
    borderRadius: 2,
    bottom: 0,
    left: -1.5,
  },
  centerDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    top: CLOCK_SIZE / 2 - 5,
    left: CLOCK_SIZE / 2 - 5,
  },
  digitalTime: { fontSize: 28, fontWeight: '300', letterSpacing: 2, fontFamily: 'serif' },
  ghatiFormatted: { fontSize: 14, marginTop: 4, marginBottom: 20, letterSpacing: 1 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16, width: '100%' },
  infoCard: { flex: 1, borderRadius: 12, padding: 14, borderWidth: 1, alignItems: 'center' },
  infoLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  infoValue: { fontSize: 18, fontWeight: '600' },
  strip: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 12, width: '100%', marginBottom: 12 },
  stripItem: { flex: 1, alignItems: 'center' },
  stripLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  stripValue: { fontSize: 14, fontWeight: '600' },
  divider: { width: 1, marginHorizontal: 4 },
  location: { fontSize: 12, marginTop: 8 },
  locationHint: { fontSize: 11, marginTop: 4, textAlign: 'center', paddingHorizontal: 16 },
});
