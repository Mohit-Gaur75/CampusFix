import { CATEGORIES } from '../../utils/constants.js';

export const departmentsData = [
  {
    name: 'Electrical Maintenance',
    code: 'ELEC',
    categories: [CATEGORIES.ELECTRICAL],
    staff: [{ name: 'Ramesh Kumar' }, { name: 'Biren Saikia' }]
  },
  {
    name: 'Plumbing & Water',
    code: 'PLUMB',
    categories: [CATEGORIES.PLUMBING],
    staff: [{ name: 'Dilip Das' }]
  },
  {
    name: 'IT & Network',
    code: 'IT',
    categories: [CATEGORIES.NETWORK, CATEGORIES.EQUIPMENT],
    staff: [{ name: 'Nitin Rao' }, { name: 'Pooja Hazarika' }]
  },
  {
    name: 'Housekeeping & Sanitation',
    code: 'HK',
    categories: [CATEGORIES.SANITATION],
    staff: [{ name: 'Lakshmi Devi' }]
  },
  {
    name: 'Civil & Furniture',
    code: 'CIVIL',
    categories: [CATEGORIES.STRUCTURAL, CATEGORIES.FURNITURE],
    staff: [{ name: 'Mohan Lal' }]
  },
  {
    name: 'Estate Office',
    code: 'ESTATE',
    categories: [CATEGORIES.OTHER],
    staff: []
  }
];
