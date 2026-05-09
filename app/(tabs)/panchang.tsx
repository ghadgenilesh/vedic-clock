import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { i18n } from '@/lib/i18n';
import { useLanguage } from '@/lib/language-context';
import { useLocation } from '@/lib/location-context';
import { formatTime, getAbhijitMuhurta, getPanchang, Panchang } from '@/lib/vedic-calc';

function Row({ label, value, sub, colors, highlight }: {
  label: string; value: string; sub?: string;
  colors: typeof Colors.light; highlight?: 'auspicious' | 'inauspicious' | 'neutral';
}) {
  const valueColor = highlight ? colors[highlight] : colors.text;
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.rowLabel, { color: colors.subText }]}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={[styles.rowValue, { color: valueColor }]}>{value}</Text>
        {sub ? <Text style={[styles.rowSub, { color: colors.subText }]}>{sub}</Text> : null}
      </View>
    </View>
  );
}

function Section({ title, colors, children }: { title: string; colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.gold }]}>{title}</Text>
      {children}
    </View>
  );
}

export default function PanchangScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { location, loading } = useLocation();
  const [panchang, setPanchang] = useState<Panchang | null>(null);
  const { locale } = useLanguage();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: i18n.t('tabs.panchang') });
  }, [locale]);

  useEffect(() => {
    if (!location) return;
    const now = new Date();
    setPanchang(getPanchang(now, location.lat, location.lon));
  }, [location]);

  if (loading || !panchang) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.subText }]}>{i18n.t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  const abhijit = getAbhijitMuhurta(panchang.sunrise, panchang.sunset);
  const tithiHighlight = (() => {
    const t = panchang.tithi.index;
    if ([4, 6, 8, 9, 14, 15, 30].includes(t)) return 'inauspicious' as const;
    if ([1, 2, 3, 5, 7, 10, 11, 12, 13].includes(t)) return 'auspicious' as const;
    return 'neutral' as const;
  })();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.gold }]}>{i18n.t('panchang.title')}</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>

        <Section title={i18n.t('panchang.panchaAnga')} colors={colors}>
          <Row label={i18n.t('panchang.vara')} value={panchang.vara.vara} colors={colors} />
          <Row
            label={i18n.t('panchang.tithi')}
            value={`${panchang.tithi.paksha} ${panchang.tithi.tithi}`}
            sub={`${panchang.tithi.index}/30`}
            colors={colors}
            highlight={tithiHighlight}
          />
          <Row
            label={i18n.t('panchang.nakshatra')}
            value={panchang.nakshatra.nakshatra}
            sub={`${i18n.t('panchang.pada')} ${panchang.nakshatra.pada}`}
            colors={colors}
          />
          <Row label={i18n.t('panchang.yoga')} value={panchang.yoga.yoga} colors={colors} />
          <Row label={i18n.t('panchang.karana')} value={panchang.karana.karana} colors={colors} />
        </Section>

        <Section title={i18n.t('panchang.sunriseSunset')} colors={colors}>
          <Row label={i18n.t('clock.sunrise')} value={formatTime(panchang.sunrise)} colors={colors} />
          <Row label={i18n.t('clock.sunset')} value={formatTime(panchang.sunset)} colors={colors} />
        </Section>

        <Section title={i18n.t('panchang.kalam')} colors={colors}>
          <Row
            label={i18n.t('panchang.rahuKalam')}
            value={`${formatTime(panchang.rahuKalam.start)} – ${formatTime(panchang.rahuKalam.end)}`}
            colors={colors}
            highlight="inauspicious"
          />
          <Row
            label={i18n.t('panchang.gulikaKalam')}
            value={`${formatTime(panchang.gulikaKalam.start)} – ${formatTime(panchang.gulikaKalam.end)}`}
            colors={colors}
            highlight="inauspicious"
          />
          <Row
            label={i18n.t('panchang.yamaganda')}
            value={`${formatTime(panchang.yamaganda.start)} – ${formatTime(panchang.yamaganda.end)}`}
            colors={colors}
            highlight="inauspicious"
          />
        </Section>

        <Section title={i18n.t('panchang.muhurta')} colors={colors}>
          <Row
            label={i18n.t('panchang.abhijit')}
            value={`${formatTime(abhijit.start)} – ${formatTime(abhijit.end)}`}
            colors={colors}
            highlight="auspicious"
          />
        </Section>

        <View style={[styles.footer, { borderColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.subText }]}>
            {i18n.t('planets.ayanamsa')}: {panchang.ayanamsa.toFixed(4)}°
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  loading: { marginTop: 100, fontSize: 18, textAlign: 'center', fontFamily: Fonts.sans },
  title: { fontSize: 26, fontFamily: Fonts.display, letterSpacing: 1, textAlign: 'center' },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 20, fontFamily: Fonts.sans },
  section: { borderRadius: 14, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  sectionTitle: {
    fontSize: 12,
    fontFamily: Fonts.sansBold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 14, flex: 1, fontFamily: Fonts.sans },
  rowRight: { alignItems: 'flex-end' },
  rowValue: { fontSize: 15, fontFamily: Fonts.sansSemiBold },
  rowSub: { fontSize: 11, marginTop: 2, fontFamily: Fonts.sans },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, alignItems: 'center' },
  footerText: { fontSize: 11 },
});
