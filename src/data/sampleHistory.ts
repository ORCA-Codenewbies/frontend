import { OrcaResponse } from '../types/orca';
import { SCENARIO_A_RESPONSE, SCENARIO_B_RESPONSE } from './mockData';

export interface HistorySession {
  id: string;
  title: string;
  location: string;
  date: string;
  status: 'SAFE' | 'CAUTION' | 'DANGER' | 'BIPOD';
  summary: string;
  lastResponse: OrcaResponse;
}

export interface SavedItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'PFZ' | 'ALERT' | 'NOTE';
  location: string;
  savedDate: string;
  status?: 'SAFE' | 'CAUTION' | 'DANGER' | 'BIPOD';
  distance?: string;
  direction?: string;
}

export const SAMPLE_HISTORY: HistorySession[] = [
  {
    id: 'hist-1',
    title: 'Digha Fishing Safety Query',
    location: 'Digha',
    date: 'Today, 08:30 AM',
    status: 'DANGER',
    summary: 'মাছ ধরতে যাবেন না - খারাপ আবহাওয়া ও ঝড়ের warning।',
    lastResponse: SCENARIO_A_RESPONSE,
  },
  {
    id: 'hist-2',
    title: 'PFZ Hotspot Discovery',
    location: 'Digha Coast',
    date: 'Yesterday, 04:15 PM',
    status: 'SAFE',
    summary: '১৮ কিমি দূরে ভালো মাছ পাওয়ার সম্ভাবনা (NE 45°)।',
    lastResponse: SCENARIO_B_RESPONSE,
  },
  {
    id: 'hist-3',
    title: 'Paradeep Weather Check',
    location: 'Paradeep',
    date: '04 Sep, 06:10 AM',
    status: 'SAFE',
    summary: 'সমুদ্র শান্ত, স্বাভাবিক মাছ ধরার উপযোগী আবহাওয়া।',
    lastResponse: {
      ...SCENARIO_B_RESPONSE,
      context: { location: 'Paradeep', time: '04 Sep' },
      message: 'সমুদ্র অনুকূল। স্বাভাবিক যাত্রা করা যেতে পারে।',
    },
  },
];

export const SAMPLE_SAVED: SavedItem[] = [
  {
    id: 'save-1',
    title: 'PFZ Spot Alpha (Hilsa Cluster)',
    subtitle: 'High chlorophyll & thermal front convergence',
    type: 'PFZ',
    location: 'Digha Offshore',
    savedDate: 'Yesterday',
    status: 'SAFE',
    distance: '18 km',
    direction: 'NE',
  },
  {
    id: 'save-2',
    title: 'Rough Sea Warning - Bay of Bengal',
    subtitle: 'Squall line passing coastal West Bengal & North Odisha',
    type: 'ALERT',
    location: 'Digha to Sagar Island',
    savedDate: 'Today',
    status: 'DANGER',
  },
  {
    id: 'save-3',
    title: 'Kakdwip Deep Channel Waypoint',
    subtitle: 'Safe return passage during high tide',
    type: 'NOTE',
    location: 'Kakdwip',
    savedDate: '01 Sep',
  },
];
