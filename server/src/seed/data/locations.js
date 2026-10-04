import { ZONE_TYPES } from '../../utils/constants.js';

export const locationsData = [
  { building: 'CS Block', floor: 'Floor 2', area: 'Room 204', zoneType: ZONE_TYPES.CLASSROOM, criticality: 3 },
  { building: 'CS Block', floor: 'Floor 2', area: 'Room 207', zoneType: ZONE_TYPES.CLASSROOM, criticality: 3 },
  { building: 'CS Block', floor: 'Floor 1', area: 'Computer Lab 1', zoneType: ZONE_TYPES.LAB, criticality: 4 },
  { building: 'Civil Block', floor: 'Floor 1', area: 'Room 101', zoneType: ZONE_TYPES.CLASSROOM, criticality: 3 },
  { building: 'Main Library', floor: 'Floor 1', area: 'Reading Hall', zoneType: ZONE_TYPES.LIBRARY, criticality: 4 },
  { building: 'Main Library', floor: 'Ground', area: 'Entrance Lobby', zoneType: ZONE_TYPES.COMMON, criticality: 2 },
  { building: 'Boys Hostel A', floor: 'Floor 1', area: 'Room 112', zoneType: ZONE_TYPES.HOSTEL, criticality: 4 },
  { building: 'Boys Hostel A', floor: 'Floor 2', area: 'Washroom', zoneType: ZONE_TYPES.HOSTEL, criticality: 4 },
  { building: 'Girls Hostel', floor: 'Floor 1', area: 'Common Room', zoneType: ZONE_TYPES.HOSTEL, criticality: 4 },
  { building: 'Girls Hostel', floor: 'Ground', area: 'Mess Hall', zoneType: ZONE_TYPES.MESS, criticality: 5 },
  { building: 'Admin Block', floor: 'Ground', area: 'Seminar Hall', zoneType: ZONE_TYPES.COMMON, criticality: 3 },
  { building: 'Sports Complex', floor: 'Ground', area: 'Gym', zoneType: ZONE_TYPES.SPORTS, criticality: 2 },
  { building: 'Central Canteen', floor: 'Ground', area: 'Dining Area', zoneType: ZONE_TYPES.COMMON, criticality: 3 },
  { building: 'Academic Area', floor: 'Campus-wide', area: 'Wi-Fi Zone A', zoneType: ZONE_TYPES.COMMON, criticality: 3 }
];
