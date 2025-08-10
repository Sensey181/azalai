// This file provides a single source of truth for session information.
export const getSessionInfo = (session: number) => {
  switch (session) {
    case 1:
      return { text: 'Strength & Power', shortText: 'S1', icon: 'barbell', color: '#3b82f6' };
    case 2:
      return { text: 'Cardio & HIIT', shortText: 'S2', icon: 'heart', color: '#22c55e' };
    case 3:
      return { text: 'Technique & Skills', shortText: 'S3', icon: 'school', color: '#f97316' };
    case 4:
      return { text: 'Rest Day', shortText: 'R', icon: 'moon', color: '#6b7280' };
    default:
      return { text: 'Unknown Session', shortText: '?', icon: 'help', color: '#6b7280' };
  }
};
