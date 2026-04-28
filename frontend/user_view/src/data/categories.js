import { 
  FaHospital, 
  FaUniversity, 
  FaLandmark, 
  FaPlaceOfWorship, 
  FaTools,
  FaGraduationCap 
} from 'react-icons/fa';

const categories = [
  {
    id: 'hospital',
    name: 'Hospitals',
    icon: FaHospital,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    description: 'Book appointments, check OPD queues, and skip the wait at hospitals & clinics.',
    serviceCount: 48,
  },
  {
    id: 'bank',
    name: 'Banks',
    icon: FaUniversity,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    description: 'Reserve your spot for banking services — accounts, loans, and more.',
    serviceCount: 35,
  },
  {
    id: 'government',
    name: 'Government Offices',
    icon: FaLandmark,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    description: 'Get tokens for passport, Aadhaar, RTO, and municipal services.',
    serviceCount: 22,
  },
  {
    id: 'temple',
    name: 'Temples & Shrines',
    icon: FaPlaceOfWorship,
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    description: 'Book darshan slots, check crowd levels, and plan your visit.',
    serviceCount: 18,
  },
  {
    id: 'service-center',
    name: 'Service Centers',
    icon: FaTools,
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    description: 'Schedule visits for electronics repair, vehicle service, and more.',
    serviceCount: 30,
  },
  {
    id: 'education',
    name: 'Education',
    icon: FaGraduationCap,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    description: 'Admission counters, exam centers, and university services.',
    serviceCount: 15,
  },
];

export default categories;
