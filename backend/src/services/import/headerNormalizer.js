const headerMap = {
  // Full Name
  'fullname': 'fullName',
  'studentname': 'fullName',
  'name': 'fullName',
  'student': 'fullName',

  // Roll Number
  'rollnumber': 'rollNumber',
  'rollno': 'rollNumber',
  'registrationnumber': 'rollNumber',
  'registrationno': 'rollNumber',
  'regno': 'rollNumber',
  'studentid': 'rollNumber',

  // Section
  'section': 'section',
  'classsection': 'section',
  'division': 'section',
  'class': 'section',

  // Year
  'year': 'year',
  'academicyear': 'year',
  'classyear': 'year',

  // Semester
  'semester': 'semester',
  'sem': 'semester',
  'semi': 'semester',
  'sem1': 'semester',
  'semester1': 'semester',

  // Contact
  'email': 'email',
  'emailaddress': 'email',
  'phone': 'phoneNumber',
  'phonenumber': 'phoneNumber',
  'contact': 'phoneNumber',
  'mobile': 'phoneNumber'
};

exports.normalize = (rawHeader) => {
  if (!rawHeader || typeof rawHeader !== 'string') return null;
  // Remove all non-alphanumeric characters (spaces, punctuation)
  const cleanHeader = rawHeader.toLowerCase().replace(/[^a-z0-9]/g, '');
  return headerMap[cleanHeader] || null;
};

exports.mapHeaders = (row) => {
  const mapped = [];
  for (let i = 0; i < row.length; i++) {
    mapped.push(exports.normalize(row[i]));
  }
  return mapped; // Array of canonical keys or null where unknown
};
