import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { i18n } from '@/lib/i18n';
import { getUpcomingFestivals } from '@/lib/vedic-calc';

export default function FestivalsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const now = new Date();
  const festivals = [
    ...getUpcomingFestivals(now.getFullYear()),
    ...getUpcomingFestivals(now.getFullYear() + 1),
  ].filter((f) => f.date >= now).slice(0, 20);

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
  title: { fontSize: 26, fontWeight: '700', letterSpacing: 1.5, fontFamily: 'serif', textAlign: 'center' },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 },
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
  festName: { fontSize: 16, fontWeight: '700' },
  festDesc: { fontSize: 12, marginTop: 3 },
  cardRight: { alignItems: 'flex-end', marginLeft: 12 },
  festDate: { fontSize: 14, fontWeight: '600' },
  daysLeft: { fontSize: 12, marginTop: 2, fontWeight: '600' },
});
