import { MarineLocation, UserProfile } from '../types/user';
import { OrcaResponse } from '../types/orca';

export const DEFAULT_LOCATIONS: MarineLocation[] = [
  {
    id: 'loc-digha',
    name: 'Digha',
    state: 'West Bengal',
    type: 'marine',
    coordinates: { lat: 21.6266, lng: 87.5074 },
    hasActiveAlert: true,
    alertSeverity: 'danger',
    alertHeadline: 'Rough sea & storm warning today',
    alertAction: 'Strong winds after 3 PM. Avoid going offshore.',
  },
  {
    id: 'loc-kakdwip',
    name: 'Kakdwip',
    state: 'West Bengal',
    type: 'marine',
    coordinates: { lat: 21.8744, lng: 88.1856 },
    hasActiveAlert: true,
    alertSeverity: 'caution',
    alertHeadline: 'Moderate swells expected after noon',
    alertAction: 'Exercise caution near outer estuary.',
  },
  {
    id: 'loc-paradeep',
    name: 'Paradeep',
    state: 'Odisha',
    type: 'marine',
    coordinates: { lat: 20.2644, lng: 86.6715 },
    hasActiveAlert: false,
  },
  {
    id: 'loc-puri',
    name: 'Puri',
    state: 'Odisha',
    type: 'marine',
    coordinates: { lat: 19.8135, lng: 85.8312 },
    hasActiveAlert: false,
  },
  {
    id: 'loc-vizag',
    name: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    type: 'marine',
    coordinates: { lat: 17.6868, lng: 83.2185 },
    hasActiveAlert: false,
  },
  {
    id: 'loc-kakinada',
    name: 'Kakinada',
    state: 'Andhra Pradesh',
    type: 'marine',
    coordinates: { lat: 16.9891, lng: 82.2475 },
    hasActiveAlert: false,
  },
  {
    id: 'loc-chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    type: 'marine',
    coordinates: { lat: 13.0827, lng: 80.2707 },
    hasActiveAlert: false,
  },
  {
    id: 'loc-mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    type: 'marine',
    coordinates: { lat: 18.922, lng: 72.8347 },
    hasActiveAlert: false,
  },
  {
    id: 'loc-mp',
    name: 'Madhya Pradesh',
    state: 'Central India',
    type: 'inland',
    coordinates: { lat: 23.4733, lng: 77.9479 },
    hasActiveAlert: false,
  },
];

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'user-001',
  name: 'Subhash Mondal',
  phone: '+91 98321 45678',
  boatName: 'Maa Ganga 4',
  boatRegistration: 'WB-04-MM-2918',
  engineHp: '120 HP Ashok Leyland',
  vesselType: 'Mechanized Trawler (18m)',
  baseLocation: 'Digha Mohana, West Bengal',
  currentFishingLocation: 'Digha, West Bengal',
  fishingType: 'Trawling / Hilsa & Pomfret',
  preferredLanguage: 'বাংলা (Bengali)',
};

export const QUICK_QUESTIONS = [
  { id: 'q1', text: '🌊 Is the sea safe today?' },
  { id: 'q2', text: '🐟 Where can I find fish?' },
  { id: 'q3', text: '🌦 Will the weather change today?' },
  { id: 'q4', text: '🧭 Which direction should I go?' },
  { id: 'q5', text: '🚨 Are there any marine warnings?' },
  { id: 'q6', text: '🎣 What fish can I expect here?' },
];

// Scenario A Response (Storm / Danger at Digha)
export const SCENARIO_A_RESPONSE: OrcaResponse = {
  id: 'resp-scenario-a',
  timestamp: Date.now(),
  status: 'DANGER',
  context: {
    location: 'Digha',
    time: 'Tomorrow',
  },
  message: 'মাছ ধরতে যাবেন না।',
  explanation: 'খারাপ আবহাওয়া এবং ঝড়ের warning রয়েছে। সমুদ্র অত্যন্ত উত্তাল থাকবে।',
  evidence: [
    { id: 'e1', label: 'Wind', value: '75 km/hr', subValue: 'Squally Gale', severity: 'danger' },
    { id: 'e2', label: 'Waves', value: '2.4 m', subValue: 'High Swells', severity: 'danger' },
    { id: 'e3', label: 'Warning', value: 'Storm Alert', subValue: 'IMD Coastal Warning', severity: 'danger' },
    { id: 'e4', label: 'Current', value: '2.2 knots', subValue: 'Strong Tidal Surge', severity: 'caution' },
  ],
  recommendation: 'Trip বাতিল করুন এবং বন্দরে ফিরে আসুন। উপকূল থেকে দূরে যাবেন না।',
  map: null,
  followUps: [
    'কখন সমুদ্র শান্ত হতে পারে?',
    'আগামীকাল কি যাওয়া যাবে?',
    'কোন বন্দরে shelter পাওয়া যাবে?',
  ],
};

// Scenario B Response (PFZ Fishing Location at Digha)
export const SCENARIO_B_RESPONSE: OrcaResponse = {
  id: 'resp-scenario-b',
  timestamp: Date.now(),
  status: 'SAFE',
  context: {
    location: 'Digha Coast',
    time: 'Today',
  },
  message: 'উত্তর-পূর্বে ১৮ কিমি দূরে ভালো মাছ পাওয়ার সম্ভাবনা আছে।',
  explanation: 'INCOIS স্যাটেলাইট ডেটা অনুসারে অনুকূল ক্লোরোফিল ও জলের তাপমাত্রা পরিমাপ করা হয়েছে।',
  evidence: [
    { id: 'e1', label: 'SST', value: '28.2°C', subValue: 'Optimal Thermal Front', severity: 'normal' },
    { id: 'e2', label: 'Chlorophyll', value: '1.4 mg/m³', subValue: 'High Planktivorous Concentration', severity: 'normal' },
    { id: 'e3', label: 'Current', value: '0.8 knots', subValue: 'Mild NE Drift', severity: 'normal' },
    { id: 'e4', label: 'PFZ Depth', value: '24–32 m', subValue: 'Potential Fishing Zone A', severity: 'normal' },
  ],
  recommendation: 'গভীর জলে যাওয়ার আগে জিপিএস নেভিগেশন ও পর্যাপ্ত জ্বালানি পরীক্ষা করুন। বিকেল ৪টার মধ্যে জাল তোলা সুবিধাজনক হবে।',
  map: {
    title: 'Recommended Fishing Area (PFZ)',
    userLocation: {
      name: 'Digha Harbor',
      lat: 21.6266,
      lng: 87.5074,
    },
    targetZone: {
      name: 'PFZ Spot Alpha (Hilsa/Pomfret)',
      lat: 21.482,
      lng: 87.721,
      type: 'PFZ',
    },
    distanceKm: 18,
    direction: 'NE',
    bearingDegrees: 45,
  },
  followUps: [
    'এই জায়গায় কোন মাছ পাওয়া যায়?',
    'আরও কাছে কোনো spot আছে?',
    'কোন দিকে গেলে ভালো হবে?',
  ],
};

// Scenario C Response (Inland / Non-Marine e.g. Madhya Pradesh)
export const SCENARIO_C_RESPONSE: OrcaResponse = {
  id: 'resp-scenario-c',
  timestamp: Date.now(),
  status: 'CAUTION',
  isInland: true,
  context: {
    location: 'Madhya Pradesh',
    time: 'Current',
  },
  message: 'Inland fishing area',
  explanation:
    'Madhya Pradesh সমুদ্র উপকূলীয় এলাকা নয়। তাই ORCA-এর marine fishing intelligence এখানে প্রযোজ্য নয়। আমি কাছাকাছি freshwater fishing spots খুঁজে দেওয়ার মতো নির্ভরযোগ্য data পাচ্ছি না।',
  evidence: [],
  recommendation:
    'সামুদ্রিক তথ্যের জন্য দয়া করে কোনো উপকূলবর্তী এলাকা যেমন দিঘা, পারাদ্বীপ বা পুরী নির্বাচন করুন।',
  map: null,
  followUps: [
    'উপকূলীয় বন্দর নির্বাচন করুন',
    'দিঘার সামুদ্রিক আবহাওয়া কেমন?',
    'পারাদ্বীপের তথ্য দেখুন',
  ],
};

// Calm / Safe weather response for other locations
export const SAFE_DEFAULT_RESPONSE: OrcaResponse = {
  id: 'resp-safe-general',
  timestamp: Date.now(),
  status: 'SAFE',
  context: {
    location: 'Coastal Harbor',
    time: 'Next 24 Hours',
  },
  message: 'সমুদ্র শান্ত এবং মাছ ধরার জন্য অনুকূল।',
  explanation: 'হালকা বাতাস এবং স্বাভাবিক ঢেউ। সাগরে কোনো সতর্কতা জারি করা হয়নি।',
  evidence: [
    { id: 'e1', label: 'Wind', value: '14 km/hr', subValue: 'Gentle Breeze', severity: 'normal' },
    { id: 'e2', label: 'Waves', value: '0.8 m', subValue: 'Slight Sea', severity: 'normal' },
    { id: 'e3', label: 'Visibility', value: '10 km', subValue: 'Clear Horizon', severity: 'normal' },
    { id: 'e4', label: 'Warning', value: 'None', subValue: 'Normal Operations', severity: 'normal' },
  ],
  recommendation: 'Fishing is possible. Check local tide table before setting sail.',
  map: null,
  followUps: [
    'কাছাকাছি কোথায় ভালো মাছ পাওয়া যাবে?',
    'জোয়ার-ভাটার সময় কখন?',
    'আগামীকাল আবহাওয়া কেমন থাকবে?',
  ],
};
