export const PLEASANT_COLORS = [
  '#A3C9F1',  // Soft blue
  '#BFD8BD',  // Gentle mint
  '#F4B7B2',  // Muted pink
  '#CBD5E0',  // Light steel
  '#D7C9EE',  // Lavender
  '#F8D3A3',  // Subdued orange
  '#C5E6C5',  // Soft green
  '#F7C7B4',  // Pastel salmon
  '#B3D8EE',  // Pale sky blue
  '#E3C4E6',  // Dusty plum
  '#F5CEC3',  // Blush peach
  '#CEDDEE',  // Whisper blue
];

export const CATEGORIES = [
  { name: 'Location', color: '#A3C9F1' },
  { name: 'Education', color: '#BFD8BD' },
  { name: 'Work', color: '#F4B7B2' },
  { name: 'Personal Life', color: '#CBD5E0' },
  { name: 'Tutorial', color: '#F8D3A3' }
];

export const EXAMPLE_EVENTS = [
  // Location events
  {
    id: 1,
    name: 'Vacation Italy',
    category: 'Location',
    start: 2019 * 12 + 3,
    hasDuration: false
  },
  {
    id: 2,
    name: 'Italy',
    category: 'Location',
    start: 2020 * 12 + 1,
    duration: 6,
    hasDuration: true
  },
  {
    id: 3,
    name: 'Vacation Japan',
    category: 'Location',
    start: 2021 * 12 + 11,
    hasDuration: false
  },
  {
    id: 4,
    name: 'Denmark',
    category: 'Location',
    start: 2023 * 12 + 6,
    duration: 18,
    hasDuration: true
  },
  {
    id: 5,
    name: 'Vacation Brasil',
    category: 'Location',
    start: 2023 * 12 + 1,
    hasDuration: false
  },

  // Education events
  {
    id: 6,
    name: 'Bachelors Degree',
    category: 'Education',
    start: 2018 * 12 + 9,
    duration: 48,
    hasDuration: true
  },
  {
    id: 7,
    name: 'Exchange semester',
    category: 'Education',
    start: 2020 * 12 + 1,
    duration: 6,
    hasDuration: true
  },

  // Work events
  {
    id: 8,
    name: 'Freelance work',
    category: 'Work',
    start: 2019 * 12 + 1,
    duration: 24,
    hasDuration: true
  },
  {
    id: 9,
    name: 'Internship',
    category: 'Work',
    start: 2021 * 12 + 5,
    duration: 3,
    hasDuration: true
  },
  {
    id: 10,
    name: 'First Job',
    category: 'Work',
    start: 2023 * 12 + 6,
    duration: 18,
    hasDuration: true
  },
  {
    id: 11,
    name: 'Promotion',
    category: 'Work',
    start: 2024 * 12 + 6,
    hasDuration: false
  },

  // Personal Life events
  {
    id: 12,
    name: 'Got married',
    category: 'Personal Life',
    start: 2020 * 12 + 6,
    hasDuration: false
  },
  {
    id: 13,
    name: 'Adopted cat',
    category: 'Personal Life',
    start: 2021 * 12 + 1,
    hasDuration: false
  },
  {
    id: 14,
    name: 'Actively playing tennis',
    category: 'Personal Life',
    start: 2021 * 12 + 6,
    duration: 24,
    hasDuration: true
  },
  {
    id: 15,
    name: 'First child',
    category: 'Personal Life',
    start: 2021 * 12 + 9,
    hasDuration: false
  },
  {
    id: 16,
    name: 'Cat got hit by tennis racket',
    category: 'Personal Life',
    start: 2023 * 12 + 5,
    hasDuration: false
  },
  {
    id: 17,
    name: 'Second child',
    category: 'Personal Life',
    start: 2024 * 12 + 4,
    hasDuration: false
  },

  // Tutorial events
  {
    id: 'w1',
    name: 'Drag and drop events to changes dates...',
    category: 'Tutorial',
    start: 2020 * 12 + 0,
    duration: 14,
    hasDuration: true
  },
  {
    id: 'w2',
    name: 'You can also adjust the length',
    category: 'Tutorial',
    start: 2021 * 12 + 3,
    duration: 12,
    hasDuration: true
  },
  {
    id: 'w3',
    name: '...and rows',
    category: 'Tutorial',
    start: 2021 * 12 - 1,
    duration: 3,
    hasDuration: true
  },
  {
    id: 'w7',
    name: 'Click "Share Timeline" after you finish your timeline to create a specific URL',
    category: 'Tutorial',
    start: 2022 * 12 + 7,
    duration: 28,
    hasDuration: true
  },
  {
    id: 'w8',
    name: 'Click "Delete All Events" and start filling the categories with your own life :)',
    category: 'Tutorial',
    start: 2022 * 12 + 7,
    duration: 28,
    hasDuration: true
  }
];