/**
 * Vedic Astronomical Calculations
 * Using Jean Meeus "Astronomical Algorithms" + Lahiri ayanamsa
 * All angles in degrees unless noted.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

/** Lahiri (Chitrapaksha) ayanamsa for a given Julian Day */
export function lahiriAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return 23.85 + 0.013600 * T + 0.0000139 * T * T;
}

/** Julian Day from a Date */
export function dateToJD(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d =
    date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;
  if (m <= 2) {
    return julianDay(y - 1, m + 12, d);
  }
  return julianDay(y, m, d);
}

function julianDay(y: number, m: number, d: number): number {
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

export function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

// ─── Sun Position (low-precision, <0.01° error) ──────────────────────────────

export function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = normalizeAngle(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normalizeAngle(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mr = (M * Math.PI) / 180;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);
  return normalizeAngle(L0 + C);
}

// ─── Moon Position ───────────────────────────────────────────────────────────

export function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const D = normalizeAngle(297.85036 + 445267.111480 * T - 0.0019142 * T * T);
  const M = normalizeAngle(357.52772 + 35999.050340 * T - 0.0001603 * T * T);
  const Mp = normalizeAngle(134.96298 + 477198.867398 * T + 0.0086972 * T * T);
  const F = normalizeAngle(93.27191 + 483202.017538 * T - 0.0036825 * T * T);
  const Om = normalizeAngle(125.04452 - 1934.136261 * T + 0.0020708 * T * T);

  const d = (D * Math.PI) / 180;
  const m = (M * Math.PI) / 180;
  const mp = (Mp * Math.PI) / 180;
  const f = (F * Math.PI) / 180;
  const om = (Om * Math.PI) / 180;

  // Main terms (degrees)
  let lon =
    218.3165 +
    481267.8813 * T +
    6.288750 * Math.sin(mp) +
    1.274018 * Math.sin(2 * d - mp) +
    0.658309 * Math.sin(2 * d) +
    0.213616 * Math.sin(2 * mp) -
    0.185596 * Math.sin(m) -
    0.114336 * Math.sin(2 * f) +
    0.058793 * Math.sin(2 * d - 2 * mp) +
    0.057212 * Math.sin(2 * d - m - mp) +
    0.053320 * Math.sin(2 * d + mp) +
    0.045874 * Math.sin(2 * d - m) +
    0.041024 * Math.sin(mp - m) -
    0.034718 * Math.sin(d) -
    0.030465 * Math.sin(m + mp) +
    0.015326 * Math.sin(2 * d - 2 * f) -
    0.012528 * Math.sin(mp + 2 * f) -
    0.010980 * Math.sin(mp - 2 * f) +
    0.010674 * Math.sin(4 * d - mp) +
    0.010034 * Math.sin(3 * mp) +
    -0.008548 * Math.sin(4 * d - 2 * mp) -
    0.007910 * Math.sin(m - mp + 2 * d) -
    0.006783 * Math.sin(2 * d + m) +
    -0.001 * Math.sin(om); // nutation approximation

  return normalizeAngle(lon);
}

// ─── Planetary Longitudes (mean, good to ~1°) ─────────────────────────────

export function planetLongitudes(jd: number): Record<string, number> {
  const T = (jd - 2451545.0) / 36525;
  return {
    Sun: sunLongitude(jd),
    Moon: moonLongitude(jd),
    Mercury: normalizeAngle(252.2509 + 149474.0722 * T),
    Venus: normalizeAngle(181.9798 + 58519.2130 * T),
    Mars: normalizeAngle(355.4330 + 19141.6964 * T),
    Jupiter: normalizeAngle(34.3515 + 3036.3027 * T),
    Saturn: normalizeAngle(50.0775 + 1223.5110 * T),
    Rahu: normalizeAngle(125.04452 - 1934.136 * T), // Mean node
  };
}

// ─── Sidereal (Vedic) longitudes ─────────────────────────────────────────────

export function tropicalToSidereal(trop: number, jd: number): number {
  return normalizeAngle(trop - lahiriAyanamsa(jd));
}

export function siderealPlanetLongitudes(jd: number): Record<string, number> {
  const tropical = planetLongitudes(jd);
  const ayanamsa = lahiriAyanamsa(jd);
  const result: Record<string, number> = {};
  for (const [planet, lon] of Object.entries(tropical)) {
    result[planet] = normalizeAngle(lon - ayanamsa);
  }
  return result;
}

// ─── Rashi (Sign) ─────────────────────────────────────────────────────────────

export const RASHIS = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka',
  'Simha', 'Kanya', 'Tula', 'Vrishchika',
  'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

export function getRashi(deg: number): { rashi: string; index: number; degrees: number } {
  const index = Math.floor(deg / 30);
  return { rashi: RASHIS[index], index, degrees: deg % 30 };
}

// ─── Nakshatra ────────────────────────────────────────────────────────────────

export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

export function getNakshatra(moonDeg: number): {
  nakshatra: string;
  index: number;
  pada: number;
  remaining: number;
} {
  const normalized = normalizeAngle(moonDeg);
  const index = Math.floor((normalized / 360) * 27);
  const pada = Math.floor(((normalized % (360 / 27)) / (360 / 27)) * 4) + 1;
  const degPerNak = 360 / 27;
  const start = index * degPerNak;
  const remaining = ((start + degPerNak - normalized + 360) % 360);
  return { nakshatra: NAKSHATRAS[index % 27], index: index % 27, pada, remaining };
}

// ─── Tithi ────────────────────────────────────────────────────────────────────

export const TITHIS = [
  'Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima / Amavasya',
];

export const PAKSHA = ['Shukla', 'Krishna'];

export function getTithi(sunDeg: number, moonDeg: number): {
  tithi: string;
  paksha: string;
  index: number; // 1-30
  remaining: number; // degrees remaining in current tithi
} {
  const diff = normalizeAngle(moonDeg - sunDeg);
  const tithiIndex = Math.floor(diff / 12); // 0-29
  const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';
  const tithiName = TITHIS[tithiIndex % 15];
  const remaining = (Math.ceil((tithiIndex + 1) * 12) - diff);
  return { tithi: tithiName, paksha, index: tithiIndex + 1, remaining };
}

// ─── Yoga ─────────────────────────────────────────────────────────────────────

export const YOGAS = [
  'Vishkamba', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarma', 'Dhriti', 'Shoola', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti',
];

export function getYoga(sunDeg: number, moonDeg: number): { yoga: string; index: number } {
  const sum = normalizeAngle(sunDeg + moonDeg);
  const index = Math.floor(sum / (360 / 27)) % 27;
  return { yoga: YOGAS[index], index };
}

// ─── Karana ───────────────────────────────────────────────────────────────────

export const KARANAS = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja',
  'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna',
];

export function getKarana(sunDeg: number, moonDeg: number): { karana: string; index: number } {
  const diff = normalizeAngle(moonDeg - sunDeg);
  const karanaIndex = Math.floor(diff / 6);
  // Fixed karanas for index 0, 57, 58, 59
  if (karanaIndex === 0) return { karana: 'Kimstughna', index: 0 };
  if (karanaIndex === 57) return { karana: 'Shakuni', index: 57 };
  if (karanaIndex === 58) return { karana: 'Chatushpada', index: 58 };
  if (karanaIndex === 59) return { karana: 'Naga', index: 59 };
  const movableIndex = ((karanaIndex - 1) % 7);
  return { karana: KARANAS[movableIndex], index: karanaIndex };
}

// ─── Vara (Weekday) ───────────────────────────────────────────────────────────

export const VARAS = ['Ravivara', 'Somavara', 'Mangalavara', 'Budhavara', 'Guruvara', 'Shukravara', 'Shanivara'];

export function getVara(date: Date): { vara: string; index: number } {
  const index = date.getDay();
  return { vara: VARAS[index], index };
}

// ─── Sunrise & Sunset ─────────────────────────────────────────────────────────

export function getSunriseSunset(
  date: Date,
  lat: number,
  lon: number
): { sunrise: Date; sunset: Date } {
  const jd = dateToJD(date);
  const T = (jd - 2451545.0) / 36525;

  // Sun's mean longitude and anomaly
  const L0 = normalizeAngle(280.46646 + 36000.76983 * T);
  const M = normalizeAngle(357.52911 + 35999.05029 * T);
  const Mr = (M * Math.PI) / 180;

  const C =
    (1.914602 - 0.004817 * T) * Math.sin(Mr) +
    0.019993 * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);
  const sunLon = L0 + C;
  const sunLonR = (sunLon * Math.PI) / 180;

  const obliquity = (23.439 - 0.0000004 * T) * (Math.PI / 180);
  const dec = Math.asin(Math.sin(obliquity) * Math.sin(sunLonR));

  const cosH =
    (Math.sin(-0.8333 * (Math.PI / 180)) - Math.sin(lat * (Math.PI / 180)) * Math.sin(dec)) /
    (Math.cos(lat * (Math.PI / 180)) * Math.cos(dec));

  if (cosH < -1 || cosH > 1) {
    // Polar day or night fallback
    const noon = new Date(date);
    noon.setUTCHours(6, 0, 0, 0);
    const sunset = new Date(date);
    sunset.setUTCHours(18, 0, 0, 0);
    return { sunrise: noon, sunset };
  }

  const H = (Math.acos(cosH) * 180) / Math.PI;

  // Equation of time (minutes)
  const y = Math.tan(obliquity / 2) ** 2;
  const e = 0.016708634 - 0.000042037 * T;
  const l0r = (L0 * Math.PI) / 180;
  const eqTime =
    4 *
    (180 / Math.PI) *
    (y * Math.sin(2 * l0r) -
      2 * e * Math.sin(Mr) +
      4 * e * y * Math.sin(Mr) * Math.cos(2 * l0r) -
      0.5 * y * y * Math.sin(4 * l0r) -
      1.25 * e * e * Math.sin(2 * Mr));

  const solarNoonMinutes = 720 - 4 * lon - eqTime;
  const sunriseMinutes = solarNoonMinutes - H * 4;
  const sunsetMinutes = solarNoonMinutes + H * 4;

  const srDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  srDate.setUTCMinutes(srDate.getUTCMinutes() + sunriseMinutes);

  const ssDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  ssDate.setUTCMinutes(ssDate.getUTCMinutes() + sunsetMinutes);

  return { sunrise: srDate, sunset: ssDate };
}

// ─── Vedic Clock (Ghati / Vipala) ─────────────────────────────────────────────
// Day is divided into 60 Ghatis from sunrise to next sunrise
// 1 day = 60 Ghatis = 3600 Vipala

export function getVedicTime(
  now: Date,
  sunrise: Date,
  sunset: Date
): { ghati: number; vipala: number; pala: number; isDay: boolean; fraction: number } {
  const nextSunrise = new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);
  const totalMs = nextSunrise.getTime() - sunrise.getTime();
  const elapsedMs = now.getTime() - sunrise.getTime();

  const fraction = ((elapsedMs % totalMs) + totalMs) % totalMs / totalMs;
  const totalVipala = fraction * 3600;

  const ghati = Math.floor(totalVipala / 60);
  const pala = Math.floor(totalVipala % 60);
  const vipala = Math.floor((totalVipala % 1) * 60);

  const isDay = now >= sunrise && now < sunset;

  return { ghati, pala, vipala, isDay, fraction };
}

// ─── Rahu Kalam / Gulika / Yamaganda ─────────────────────────────────────────
// Based on the day of the week and sunrise/sunset

const RAHU_ORDER = [7, 1, 6, 4, 5, 3, 2]; // Sunday=0 index
const GULIKA_ORDER = [5, 6, 4, 2, 3, 1, 7];
const YAMA_ORDER = [4, 2, 3, 1, 5, 6, 7];

function getKalamPeriod(
  sunrise: Date,
  sunset: Date,
  orderIndex: number
): { start: Date; end: Date } {
  const totalMs = sunset.getTime() - sunrise.getTime();
  const part = totalMs / 8;
  const start = new Date(sunrise.getTime() + (orderIndex - 1) * part);
  const end = new Date(start.getTime() + part);
  return { start, end };
}

export function getRahuKalam(date: Date, sunrise: Date, sunset: Date) {
  const day = date.getDay(); // 0=Sun
  return getKalamPeriod(sunrise, sunset, RAHU_ORDER[day]);
}

export function getGulikaKalam(date: Date, sunrise: Date, sunset: Date) {
  const day = date.getDay();
  return getKalamPeriod(sunrise, sunset, GULIKA_ORDER[day]);
}

export function getYamaganda(date: Date, sunrise: Date, sunset: Date) {
  const day = date.getDay();
  return getKalamPeriod(sunrise, sunset, YAMA_ORDER[day]);
}

// ─── Full Panchang ────────────────────────────────────────────────────────────

export interface Panchang {
  vara: ReturnType<typeof getVara>;
  tithi: ReturnType<typeof getTithi>;
  nakshatra: ReturnType<typeof getNakshatra>;
  yoga: ReturnType<typeof getYoga>;
  karana: ReturnType<typeof getKarana>;
  sunrise: Date;
  sunset: Date;
  rahuKalam: { start: Date; end: Date };
  gulikaKalam: { start: Date; end: Date };
  yamaganda: { start: Date; end: Date };
  ayanamsa: number;
  jd: number;
}

export function getPanchang(date: Date, lat: number, lon: number): Panchang {
  const jd = dateToJD(date);
  const ayanamsa = lahiriAyanamsa(jd);
  const { sunrise, sunset } = getSunriseSunset(date, lat, lon);

  // Use sunrise JD for panchang calculations (traditional)
  const srJD = dateToJD(sunrise);
  const sidereal = siderealPlanetLongitudes(srJD);
  const sunDeg = sidereal['Sun'];
  const moonDeg = sidereal['Moon'];

  return {
    vara: getVara(date),
    tithi: getTithi(sunDeg, moonDeg),
    nakshatra: getNakshatra(moonDeg),
    yoga: getYoga(sunDeg, moonDeg),
    karana: getKarana(sunDeg, moonDeg),
    sunrise,
    sunset,
    rahuKalam: getRahuKalam(date, sunrise, sunset),
    gulikaKalam: getGulikaKalam(date, sunrise, sunset),
    yamaganda: getYamaganda(date, sunrise, sunset),
    ayanamsa,
    jd,
  };
}

// ─── Muhurta quality ──────────────────────────────────────────────────────────

export type MuhurtaQuality = 'Auspicious' | 'Inauspicious' | 'Neutral';

export interface MuhurtaWindow {
  start: Date;
  end: Date;
  name: string;
  quality: MuhurtaQuality;
}

const AUSPICIOUS_TITHIS = [1, 2, 3, 5, 7, 10, 11, 12, 13];
const INAUSPICIOUS_TITHIS = [4, 6, 8, 9, 14, 15, 30];

export function getMuhurtaQuality(tithi: number, yoga: number, vara: number): MuhurtaQuality {
  if (INAUSPICIOUS_TITHIS.includes(tithi)) return 'Inauspicious';
  if (AUSPICIOUS_TITHIS.includes(tithi)) return 'Auspicious';
  return 'Neutral';
}

// ─── Abhijit Muhurta (midday auspicious period) ───────────────────────────────

export function getAbhijitMuhurta(sunrise: Date, sunset: Date): { start: Date; end: Date } {
  const totalMs = sunset.getTime() - sunrise.getTime();
  const midday = new Date(sunrise.getTime() + totalMs / 2);
  const halfMuhurta = totalMs / 30; // 1 muhurta = 1/15 of daylight
  return {
    start: new Date(midday.getTime() - halfMuhurta / 2),
    end: new Date(midday.getTime() + halfMuhurta / 2),
  };
}

// ─── Hindu Festivals (fixed Gregorian approximations) ─────────────────────────

export interface Festival {
  name: string;
  date: Date;
  description: string;
}

export function getUpcomingFestivals(year: number): Festival[] {
  return [
    { name: 'Makar Sankranti', date: new Date(year, 0, 14), description: 'Sun enters Capricorn' },
    { name: 'Vasant Panchami', date: new Date(year, 1, 2), description: 'Goddess Saraswati' },
    { name: 'Maha Shivaratri', date: new Date(year, 1, 26), description: 'Night of Shiva' },
    { name: 'Holi', date: new Date(year, 2, 14), description: 'Festival of Colors' },
    { name: 'Ugadi / Gudi Padwa', date: new Date(year, 3, 6), description: 'Vedic New Year' },
    { name: 'Ram Navami', date: new Date(year, 3, 14), description: 'Birth of Lord Rama' },
    { name: 'Akshaya Tritiya', date: new Date(year, 4, 9), description: 'Auspicious day for new beginnings' },
    { name: 'Guru Purnima', date: new Date(year, 6, 10), description: 'Honour to teachers' },
    { name: 'Janmashtami', date: new Date(year, 7, 16), description: 'Birth of Lord Krishna' },
    { name: 'Ganesh Chaturthi', date: new Date(year, 8, 2), description: 'Birthday of Ganesha' },
    { name: 'Navratri', date: new Date(year, 9, 3), description: '9 nights of Durga' },
    { name: 'Dussehra', date: new Date(year, 9, 12), description: 'Victory of Rama over Ravana' },
    { name: 'Diwali', date: new Date(year, 9, 28), description: 'Festival of Lights' },
    { name: 'Kartik Purnima', date: new Date(year, 10, 5), description: 'Full moon of Kartik' },
  ];
}

// ─── Formatter helpers ────────────────────────────────────────────────────────

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatGhati(ghati: number, pala: number): string {
  return `${ghati.toString().padStart(2, '0')} Gh ${pala.toString().padStart(2, '0')} Pa`;
}
