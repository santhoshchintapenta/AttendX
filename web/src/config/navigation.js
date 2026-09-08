export const getNavigationLinks = (role, workspace = 'attendance') => {
  if (workspace === 'timetable') {
    if (role !== 'HOD') return [];
    return [
      { path: '/timetable/overview', label: 'Overview' },
      { path: '/timetable/teaching-plan', label: 'Teaching Plan' },
      { path: '/timetable/availability', label: 'Availability' },
      { path: '/timetable/generate', label: 'Generate Timetable' },
      { path: '/timetable/timetables', label: 'Published Timetables' },
    ];
  }

  switch (role) {
    case 'HOD':
      return [
        { path: '/attendance/dashboard', label: 'Dashboard' },
        { path: '/attendance/academics', label: 'Academic Structure' },
        { path: '/attendance/students', label: 'Student Management' },
        { path: '/attendance/faculty', label: 'Faculty Management' },
        { path: '/attendance/my-schedule', label: 'Class Schedule' },
        { path: '/attendance/monitor', label: 'Attendance Monitoring' },
        { path: '/attendance/reports', label: 'Reports' },
      ];
    case 'Faculty':
      return [
        { path: '/attendance/dashboard', label: 'Dashboard' },
        { path: '/attendance/my-schedule', label: 'Class Schedule' },
        { path: '/attendance/monitor', label: 'Attendance Monitoring' },
        { path: '/attendance/reports', label: 'Reports' },
      ];
    case 'Student':
      return [
        { path: '/attendance/dashboard', label: 'Dashboard' },
        { path: '/attendance/schedule', label: 'Class Schedule' },
        { path: '/attendance/my-attendance', label: 'My Attendance' },
      ];
    default:
      return [];
  }
};
