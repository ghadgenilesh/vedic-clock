import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { i18n } from '@/lib/i18n';
import { dateToJD, getRashi, lahiriAyanamsa, RASHIS, siderealPlanetLongitudes } from '@/lib/vedic-calc';

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀',
  Mars: '♂', Jupiter: '♃', Saturn: '♄', Rahu: '☊',
};

const RASHI_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export default function PlanetsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [planets, setPlanets] = useState<Record<string, number>>({});
  const [ayanamsa, setAyanamsa] = useState(0);

  useEffect(() => {
    const now = new Date();
    const jd = dateToJD(now);
    setAyanamsa(lahiriAyanamsa(jd));
    setPlanets(siderealPlanetLongitudes(jd));
  }, []);

  const planetEntries = Object.entries(planets);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.gold }]}>{i18n.t('planets.title')}</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
        <Text style={[styles.ayanamsa, { color: colors.subText }]}>
          {i18n.t('planets.ayanamsa')}: {ayanamsa.toFixed(4)}°
        </Text>

        <View style={[styles.tableHeader, { borderBottomColor: colors.gold }]}>
          <Text style={[styles.th, { color: colors.gold, flex: 1.2 }]}>Graha</Text>
          <Text style={[styles.th, { color: colors.gold, flex: 1.5 }]}>{i18n.t('planets.rashi')}</Text>
          <Text style={[styles.th, { color: colors.gold, flex: 1 }]}>{i18n.t('planets.degrees')}</Text>
        </View>

        {planetEntries.map(([planet, deg]) => {
          const rashi = getRashi(deg);
          const d = Math.floor(deg % 30);
          const m = Math.floor(((deg % 30) - d) * 60);
          const s = Math.floor((((deg % 30) - d) * 60 - m) * 60);
          return (
            <View
              key={planet}
              style={[styles.row, { borderBottomColor: colors.border, backgroundColor: colors.card }]}
            >
              <View style={[styles.cell, { flex: 1.2 }]}>
                <Text style={[styles.symbol, { color: colors.accent }]}>{PLANET_SYMBOLS[planet]}</Text>
                <Text style={[styles.planetName, { color: colors.text }]}>{planet}</Text>
              </View>
              <View style={[styles.cell, { flex: 1.5 }]}>
                <Text style={[styles.rashiSymbol, { color: colors.tint }]}>{RASHI_SYMBOLS[rashi.index]}</Text>
                <Text style={[styles.rashiName, { color: colors.text }]}>{rashi.rashi}</Text>
              </View>
              <Text style={[styles.degrees, { color: colors.subText, flex: 1 }]}>
                {d}° {m}' {s}"
              </Text>
            </View>
          );
        })}

        <View style={[styles.rashiGrid, { marginTop: 24 }]}>
          <Text style={[styles.gridTitle, { color: colors.gold }]}>Rashi Chakra</Text>
          <View style={styles.grid}>
            {RASHIS.map((r, i) => (
              <View key={r} style={[styles.rashiCell, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.rashiNum, { color: colors.subText }]}>{i + 1}</Text>
                <Text style={[styles.rashiCellName, { color: colors.text }]}>{r}</Text>
                <Text style={[styles.rashiOccupants, { color: colors.accent }]}>
                  {planetEntries
                    .filter(([, deg]) => Math.floor(deg / 30) === i)
                    .map(([p]) => PLANET_SYMBOLS[p])
                    .join(' ')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 26, fontFamily: Fonts.display, letterSpacing: 1, textAlign: 'center' },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 4, fontFamily: Fonts.sans },
  ayanamsa: { fontSize: 11, textAlign: 'center', marginTop: 4, marginBottom: 16, fontFamily: Fonts.sans },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 8, marginBottom: 4 },
  th: { fontSize: 12, fontFamily: Fonts.sansBold, textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderRadius: 8, marginBottom: 2 },
  cell: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  symbol: { fontSize: 18, width: 24 },
  planetName: { fontSize: 14, fontFamily: Fonts.sansSemiBold },
  rashiSymbol: { fontSize: 16 },
  rashiName: { fontSize: 14, fontFamily: Fonts.sans },
  degrees: { fontSize: 12, textAlign: 'right', fontFamily: Fonts.sans },
  rashiGrid: {},
  gridTitle: { fontSize: 16, fontFamily: Fonts.display, textAlign: 'center', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  rashiCell: { width: '23%', borderRadius: 8, borderWidth: 1, padding: 8, alignItems: 'center' },
  rashiNum: { fontSize: 10, fontFamily: Fonts.sans },
  rashiCellName: { fontSize: 11, fontFamily: Fonts.sansSemiBold, textAlign: 'center' },
  rashiOccupants: { fontSize: 14, marginTop: 2 },
});
