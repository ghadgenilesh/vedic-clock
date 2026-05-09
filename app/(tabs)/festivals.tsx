import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { i18n } from '@/lib/i18n';
import { Festival, getUpcomingFestivals } from '@/lib/vedic-calc';

const CACHE_VERSION = 1; // bump this to invalidate old caches

function loadFestivalsForYear(year: number): Festival[] {
  const key = `vedicFestivals_v${CACHE_VERSION}_${year}`;
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed: Array<{ name: string; date: string; description: string }> = JSON.parse(raw);
        return parsed.map((f) => ({ ...f, date: new Date(f.date) }));
      }
    }
  } catch { /* storage unavailable */ }

  const festivals = getUpcomingFestivals(year);

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(festivals));
    }
  } catch { /* quota exceeded — skip caching */ }

  return festivals;
}

export default function FestivalsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const now = new Date();

  const festivals = useMemo(() => {
    const thisYear = loadFestivalsForYear(now.getFullYear());
    const nextYear = loadFestivalsForYear(now.getFullYear() + 1);
    return [...thisYear, ...nextYear]
      .filter((f) => f.date >= now)
      .slice(0, 20);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now.getFullYear()]); // recompute only when year changes

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.gold }]}>{i18n.t('festivals.title')}</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>{i18n.t('festivals.upcoming')}</Text>

        {festivals.map((f, idx) => {
          const daysLeft = Math.ceil((f.date.getTime() - now.getTime()) / 86400000);
          const isToday = daysLeft === 0;
          const isSoon = daysLeft <= 7;
          return (
            <View
              key={idx}
              style={[
                styles.card,
                {
                  backgroundColor: isToday ? colors.surface : colors.card,
                  borderColor: isToday ? colors.gold : colors.border,
                  borderLeftWidth: isToday ? 4 : 1,
                },
              ]}
            >
              <View style={styles.cardLeft}>
                <Text style={[styles.festName, { color: isToday ? colors.gold : colors.text }]}>{f.name}</Text>
                <Text style={[styles.festDesc, { color: colors.subText }]}>{f.description}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={[styles.festDate, { color: colors.text }]}>
                  {f.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
                <Text style={[styles.daysLeft, { color: isSoon ? colors.auspicious : colors.subText }]}>
                  {isToday ? 'Today!' : `${daysLeft}d`}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 26, fontFamily: Fonts.display, letterSpacing: 1, textAlign: 'center' },
  subtitle: { fontSize: 12, textAlign: 'center', marginTop: 4, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: Fonts.sansBold },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  cardLeft: { flex: 1 },
  festName: { fontSize: 16, fontFamily: Fonts.sansBold },
  festDesc: { fontSize: 12, marginTop: 3, fontFamily: Fonts.sans },
  cardRight: { alignItems: 'flex-end', marginLeft: 12 },
  festDate: { fontSize: 14, fontFamily: Fonts.sansSemiBold },
  daysLeft: { fontSize: 12, marginTop: 2, fontFamily: Fonts.sansSemiBold },
});
