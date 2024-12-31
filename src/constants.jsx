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
  { name: 'Location', color: '#F8D3A3' },
  { name: 'Education', color: '#C5E6C5' },
  { name: 'Work', color: '#B3D8EE' },
  { name: 'Personal Life', color: '#F4B7B2' }
];

export const EXAMPLE_EVENTS = [
  // Location events
  {
    id: 1,
    name: 'Lived in Italy',
    category: 'Location',
    start: 2020 * 12 + 8, // August 2017
    duration: 6, // 4 years
    hasDuration: true
  },
  {
    id: 2,
    name: 'Vacationed in Italy',
    category: 'Location',
    start: 2018 * 12 + 5, // May 2018
    hasDuration: false
  },
  {
    id: 3,
    name: 'Vacationed in Australia',
    category: 'Location',
    start: 2021 * 12 + 11, // November 2021
    hasDuration: false
  },
  {
    id: 4,
    name: 'Vacationed in Canada',
    category: 'Location',
    start: 2023 * 12 + 2, // February 2023
    hasDuration: false
  },

  // Education events
  {
    id: 5,
    name: 'College',
    category: 'Education',
    start: 2017 * 12 + 8, // August 2017
    duration: 12*4, // 4 years
    hasDuration: true
  },
  {
    id: 6,
    name: 'Exchange Semester',
    category: 'Education',
    start: 2020 * 12 + 8, // August 2017
    duration: 6, // 4 years
    hasDuration: true
  },
  {
    id: 7,
    name: 'Online Course in Data Science',
    category: 'Education',
    start: 2022 * 12 + 1, // January 2022
    duration: 3, // 6 months
    hasDuration: true
  },
  {
    id: 8,
    name: 'Attended Leadership Workshop',
    category: 'Education',
    start: 2022 * 12 + 11, // March 2023
    hasDuration: false
  },

  // Work events
  {
    id: 10,
    name: 'First Job',
    category: 'Work',
    start: 2021 * 12 + 10, // June 2020
    duration: 21, // 1.5 years
    hasDuration: true
  },
  {
    id: 11,
    name: 'Promoted',
    category: 'Work',
    start: 2022 * 12 + 7, // January 2022
    hasDuration: false
  },
  {
    id: 12,
    name: 'Freelancing',
    category: 'Work',
    start: 2023 * 12 + 7,
    duration: 12,
    hasDuration: true
  },
  {
    id: 12,
    name: 'Summer Internship',
    category: 'Work',
    start: 2020 * 12 + 5,
    duration: 3,
    hasDuration: true
  },

  // Personal Life events
  {
    id: 14,
    name: 'Got Married',
    category: 'Personal Life',
    start: 2020 * 12 + 6, // June 2020
    hasDuration: false
  },
  {
    id: 15,
    name: 'Volunteering at Animal Shelter',
    category: 'Personal Life',
    start: 2021 * 12 + 2, // February 2021
    duration: 18, // 1.5 years
    hasDuration: true
  },
  {
    id: 16,
    name: 'Started Gardening Hobby',
    category: 'Personal Life',
    start: 2019 * 12 + 5, // May 2019
    duration: 60, // 5 years
    hasDuration: true
  },
  {
    id: 17,
    name: 'Adopted a Pet',
    category: 'Personal Life',
    start: 2022 * 12 + 11, // November 2022
    hasDuration: false
  },
  {
    id: 18,
    name: 'Completed Marathon',
    category: 'Personal Life',
    start: 2023 * 12 + 9, // September 2023
    hasDuration: false
  }
];
