import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { i18n, setLocale, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { useLocation } from '@/lib/location-context';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { location, setManualLocation, refreshGPS } = useLocation();

  const [lat, setLat] = useState(location?.lat.toString() ?? '');
  const [lon, setLon] = useState(location?.lon.toString() ?? '');
  const [selectedLang, setSelectedLang] = useState(i18n.locale);

  function applyManual() {
    const la = parseFloat(lat);
    const lo = parseFloat(lon);
    if (isNaN(la) || isNaN(lo) || la < -90 || la > 90 || lo < -180 || lo > 180) {
      Alert.alert('Invalid coordinates', 'Latitude must be –90 to 90, longitude –180 to 180.');
      return;
    }
    setManualLocation(la, lo);
  }

  function changeLanguage(code: string) {
    setSelectedLang(code);
    setLocale(code);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.gold }]}>{i18n.t('settings.title')}</Text>

        {/* Location */}
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>{i18n.t('settings.location')}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {location?.name && (
            <Text style={[styles.locationName, { color: colors.text }]}>📍 {location.name}</Text>
          )}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={refreshGPS}
          >
            <Text style={styles.buttonText}>🔄 {i18n.t('settings.autoDetect')}</Text>
          </TouchableOpacity>

          <Text style={[styles.orText, { color: colors.subText }]}>— or —</Text>

          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            placeholder={i18n.t('settings.latitude')}
            placeholderTextColor={colors.subText}
            value={lat}
            onChangeText={setLat}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            placeholder={i18n.t('settings.longitude')}
            placeholderTextColor={colors.subText}
            value={lon}
            onChangeText={setLon}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={applyManual}
          >
            <Text style={styles.buttonText}>{i18n.t('settings.manual')}</Text>
          </TouchableOpacity>
        </View>

        {/* Language */}
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>{i18n.t('settings.language')}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langRow,
                { borderBottomColor: colors.border },
                selectedLang === lang.code && { backgroundColor: colors.surface },
              ]}
              onPress={() => changeLanguage(lang.code)}
            >
              <Text style={[styles.langLabel, { color: colors.text }]}>{lang.label}</Text>
              {selectedLang === lang.code && (
                <Text style={[styles.checkmark, { color: colors.auspicious }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* About */}
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>About</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.aboutText, { color: colors.text }]}>Vedic Clock</Text>
          <Text style={[styles.aboutSub, { color: colors.subText }]}>
            Astronomical calculations based on Jean Meeus "Astronomical Algorithms" with Lahiri (Chitrapaksha) ayanamsa.
            Sunrise/sunset computed for your exact location.
          </Text>
          <Text style={[styles.aboutSub, { color: colors.subText }]}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: 1.5, fontFamily: 'serif', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, marginTop: 4 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 20 },
  locationName: { fontSize: 14, marginBottom: 12, fontWeight: '600' },
  button: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  orText: { textAlign: 'center', marginVertical: 8, fontSize: 13 },
  input: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 15, marginBottom: 10,
  },
  langRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderRadius: 6,
  },
  langLabel: { fontSize: 16 },
  checkmark: { fontSize: 18, fontWeight: '700' },
  aboutText: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  aboutSub: { fontSize: 13, lineHeight: 20, marginBottom: 6 },
});
