import React, { useState, useEffect, useContext } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { AuthContext } from '../../context/AuthContext';
import { getStudents, addStudent, updateStudent, deleteStudent, previewBulkUpload, importBulkStudents } from '../../services/studentApi';
import { getSections } from '../../services/academicApi';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import { Users, Plus, X, Edit2, Trash2, Search, Upload, Download, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

const StudentManagement = () => {
  const { user } = useContext(AuthContext);
  
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterSection, setFilterSection] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk Upload State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkStep, setBulkStep] = useState('upload'); // 'upload', 'preview', 'results'
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [overrideYear, setOverrideYear] = useState('');
  const [overrideSemester, setOverrideSemester] = useState('');
  const [overrideSection, setOverrideSection] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    email: '',
    phoneNumber: '',
    year: '',
    semester: '',
    section: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch sections once on mount
  useEffect(() => {
    fetchSections();
  }, []);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch students when filters or debounced search changes
  useEffect(() => {
    fetchStudents();
  }, [debouncedSearch, filterYear, filterSemester, filterSection]);

  const fetchSections = async () => {
    try {
      const data = await getSections();
      setSections(data);
    } catch (err) {
      console.error('Failed to load sections', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (debouncedSearch) filters.search = debouncedSearch;
      if (filterYear) filters.year = filterYear;
      if (filterSemester) filters.semester = filterSemester;
      if (filterSection) filters.section = filterSection;

      const data = await getStudents(filters);
      setStudents(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({
      fullName: '',
      rollNumber: '',
      email: '',
      phoneNumber: '',
      year: '',
      semester: '',
      section: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleEdit = (student) => {
    setEditId(student._id);
    setFormData({
      fullName: student.fullName,
      rollNumber: student.rollNumber,
      // Hide generated placeholder email in the UI
      email: student.email && student.email.endsWith('@student.attendx.local') ? '' : student.email,
      phoneNumber: student.phoneNumber || '',
      year: student.year.toString(),
      semester: student.semester.toString(),
      section: student.section ? student.section._id : ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (student) => {
    setDeleteId(student._id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteStudent(deleteId);
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student');
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    
    try {
      if (editId) {
        await updateStudent(editId, formData);
      } else {
        await addStudent(formData);
      }
      setIsModalOpen(false);
      fetchStudents(); // Refresh the list
    } catch (err) {
      setFormError(err.response?.data?.message || `Failed to ${editId ? 'update' : 'add'} student. Please check your inputs.`);
    } finally {
      setSubmitting(false);
    }
  };

  const openBulkModal = () => {
    setBulkStep('upload');
    setBulkFile(null);
    setPreviewData(null);
    setImportResults(null);
    setShowErrors(false);
    setIsBulkModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBulkFile(e.target.files[0]);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (validTypes.includes(fileExtension) || file.type === 'text/csv' || file.type.includes('excel') || file.type.includes('spreadsheet')) {
        setBulkFile(file);
      } else {
        alert('Invalid file format. Please upload a .csv, .xlsx, or .xls file.');
      }
    }
  };

  const handlePreview = async (useOverrides = false) => {
    if (!bulkFile) return;
    setBulkSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', bulkFile);
      const overrides = useOverrides ? { year: overrideYear, semester: overrideSemester, section: overrideSection } : null;
      const data = await previewBulkUpload(formData, overrides);
      setPreviewData(data);
      if (!useOverrides && data.detectedMetadata) {
        setOverrideYear(data.detectedMetadata.year || '');
        setOverrideSemester(data.detectedMetadata.semester || '');
        setOverrideSection(data.detectedMetadata.section || '');
      }
      setBulkStep('preview');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to preview file');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleImport = async () => {
    if (!previewData || previewData.valid.length === 0) return;
    setBulkSubmitting(true);
    try {
      const data = await importBulkStudents(previewData.valid);
      setImportResults(data);
      setBulkStep('results');
      fetchStudents(); // Refresh the main table immediately
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to import students');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Full Name,Roll Number,Email,Phone Number,Year,Semester,Section\nJohn Doe,A2312655001,john@example.com,9876543210,1,1,A\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "AttendX_Student_Upload_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter available sections based on selected year and semester (for Add Student form)
  const availableSections = sections.filter(
    s => s.year === parseInt(formData.year) && s.semester === parseInt(formData.semester)
  );

  // Filter sections for the filter dropdown
  const filterDropdownSections = sections.filter(s => {
    if (filterYear && s.year !== parseInt(filterYear)) return false;
    if (filterSemester && s.semester !== parseInt(filterSemester)) return false;
    return true;
  });

  const studentColumns = [
    { 
      header: 'Student', 
      cell: (row) => (
        <div className="flex-col">
          <span style={{ fontWeight: 500 }}>{row.fullName}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {row.email && row.email.endsWith('@student.attendx.local') ? 'No Email' : row.email}
          </span>
        </div>
      )
    },
    { header: 'Roll Number', accessor: 'rollNumber' },
    { header: 'Year', accessor: 'year' },
    { header: 'Semester', accessor: 'semester' },
    { 
      header: 'Section', 
      cell: (row) => <span>{row.section?.sectionName || '-'}</span> 
    },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex gap-2">
          <button 
            className="btn" 
            style={{ padding: '6px', color: 'var(--text-secondary)' }} 
            onClick={() => handleEdit(row)}
            title="Edit Student"
          >
            <Edit2 size={16} />
          </button>
          <button 
            className="btn" 
            style={{ padding: '6px', color: 'var(--error)' }} 
            onClick={() => handleDeleteClick(row)}
            title="Delete Student"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      width: '100px'
    }
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Student Management" 
        description="Manage students in your department." 
        actions={
          <>
            <button 
              className="btn btn-secondary flex items-center gap-2"
              onClick={openBulkModal}
            >
              <Upload size={18} /> Bulk Upload
            </button>
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={openAddModal}
            >
              <Plus size={18} /> Add Student
            </button>
          </>
        }
      />

      <div className="card">
        <div className="flex gap-4 mb-6">
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by name, roll number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>
            
            <select className="form-input" style={{ width: '150px' }} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            
            <select className="form-input" style={{ width: '160px' }} value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
              <option value="">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
            
            <select className="form-input" style={{ width: '160px' }} value={filterSection} onChange={e => setFilterSection(e.target.value)}>
              <option value="">All Sections</option>
              {filterDropdownSections.map(s => (
                <option key={s._id} value={s._id}>Section {s.sectionName}</option>
              ))}
            </select>
          </div>

        {loading ? (
          <div className="p-8 text-center text-muted">
            <p>Loading students...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center flex-col" style={{ padding: '40px' }}>
            <p className="body-text text-error mb-4">{error}</p>
            <button className="btn btn-secondary" onClick={fetchStudents}>Retry</button>
          </div>
        ) : students.length === 0 ? (
          <EmptyState 
            icon={Users}
            title="No students yet"
            message="Add your first student to get started."
            action={{
              label: '+ Add Student',
              onClick: openAddModal
            }}
          />
        ) : (
          <div style={{ padding: '0 24px' }}>
            <DataTable 
              columns={studentColumns} 
              data={students} 
              keyField="_id" 
            />
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="modal-content card" style={{
            width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '24px'
          }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="card-title">{editId ? 'Edit Student' : 'Add Student'}</h3>
              <button className="btn" style={{ padding: '4px' }} onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '12px', backgroundColor: 'var(--error)', color: 'white', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  className="form-input" 
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="flex gap-4">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Roll Number</label>
                  <input 
                    type="text" 
                    name="rollNumber"
                    className="form-input" 
                    placeholder="Enter roll number"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    required 
                    disabled={!!editId}
                    style={editId ? { backgroundColor: 'var(--background)' } : {}}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Phone Number <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>(Optional)</span></label>
                  <input 
                    type="tel" 
                    name="phoneNumber"
                    className="form-input" 
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>(Optional)</span></label>
                <input 
                  type="email" 
                  name="email"
                  className="form-input" 
                  placeholder="student@example.edu"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex gap-4">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Year</label>
                  <select 
                    name="year" 
                    className="form-input" 
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Semester</label>
                  <select 
                    name="semester" 
                    className="form-input" 
                    value={formData.semester}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Sem</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Section</label>
                <select 
                  name="section" 
                  className="form-input" 
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.year || !formData.semester}
                >
                  <option value="">Select Section</option>
                  {availableSections.map(s => (
                    <option key={s._id} value={s._id}>Section {s.sectionName}</option>
                  ))}
                </select>
                {(!formData.year || !formData.semester) && (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Select Year and Semester first
                  </p>
                )}
                {(formData.year && formData.semester && availableSections.length === 0) && (
                  <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>
                    No sections available for this Year/Semester
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (editId ? 'Saving...' : 'Adding...') : (editId ? 'Save Changes' : 'Add Student')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="modal-content card" style={{
            width: '100%', maxWidth: '400px', padding: '24px', textAlign: 'center'
          }}>
            <h3 className="card-title mb-4" style={{ fontSize: '20px' }}>Delete Student?</h3>
            <p className="body-text mb-6">
              Are you sure you want to remove this student? This will also permanently delete their linked login account. This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                className="btn btn-secondary" 
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleConfirmDelete}
                disabled={deleting}
                style={{ backgroundColor: 'var(--error)', color: 'white' }}
              >
                {deleting ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isBulkModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="modal-content card" style={{
            width: '100%', maxWidth: bulkStep === 'preview' ? '800px' : '500px', maxHeight: '90vh', overflowY: 'auto', padding: '24px'
          }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="card-title">Bulk Upload Students</h3>
              <button className="btn" style={{ padding: '4px' }} onClick={() => setIsBulkModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {bulkStep === 'upload' && (
              <div>
                <p className="body-text mb-6">Upload an Excel or CSV file containing student information.</p>
                <button className="btn btn-secondary flex items-center gap-2 mb-6" onClick={downloadTemplate}>
                  <Download size={16} /> Download Template
                </button>

                {bulkFile ? (
                  <div 
                    className="flex-col items-center justify-center" 
                    style={{ 
                      border: '2px solid var(--primary)', 
                      borderRadius: '8px', 
                      padding: '32px 20px', 
                      backgroundColor: 'var(--background)',
                      textAlign: 'center',
                      marginBottom: '24px'
                    }}
                  >
                    <FileText size={40} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
                    <p className="body-text" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {bulkFile.name}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      {(bulkFile.size / 1024).toFixed(1)} KB
                    </p>
                    <div className="flex justify-center items-center gap-2 mb-6">
                      <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--success)' }}>File ready to upload</span>
                    </div>
                    <button 
                      className="btn btn-secondary flex items-center justify-center gap-2" 
                      onClick={() => setBulkFile(null)}
                      style={{ padding: '6px 16px', fontSize: '13px', margin: '0 auto' }}
                    >
                      <X size={14} /> Remove File
                    </button>
                  </div>
                ) : (
                  <div 
                    className="flex-col items-center justify-center" 
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{ 
                      border: isDragging ? '2px dashed var(--primary)' : '2px dashed var(--border)', 
                      borderRadius: '8px', 
                      padding: '40px 20px', 
                      backgroundColor: isDragging ? 'var(--background-hover, rgba(0,0,0,0.02))' : 'var(--background)',
                      textAlign: 'center',
                      marginBottom: '24px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Upload size={32} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
                    <p className="body-text mb-2" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      Drag & drop your file here
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      or
                    </p>
                    <label className="btn btn-secondary cursor-pointer" style={{ margin: '0 auto' }}>
                      Browse File
                      <input type="file" accept=".csv, .xlsx, .xls" style={{ display: 'none' }} onChange={handleFileChange} />
                    </label>
                    <p className="mt-4" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Supported formats: .csv, .xlsx, .xls</p>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button className="btn btn-secondary" onClick={() => setIsBulkModalOpen(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handlePreview} disabled={!bulkFile || bulkSubmitting}>
                    {bulkSubmitting ? 'Parsing...' : 'Continue'}
                  </button>
                </div>
              </div>
            )}

            {bulkStep === 'preview' && previewData && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 style={{ fontSize: '16px', fontWeight: 600 }}>Preview Upload</h4>
                  <div className="flex gap-3">
                    <button className="btn btn-secondary" onClick={() => setIsBulkModalOpen(false)}>Cancel</button>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleImport} 
                      disabled={previewData.valid.length === 0 || bulkSubmitting}
                    >
                      {bulkSubmitting ? 'Importing...' : `Import ${previewData.valid.length} Students`}
                    </button>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--background)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Detected Metadata Review</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    If the parser inferred the wrong year, semester, or section, you can correct them here and re-validate.
                  </p>
                  <div className="flex gap-4 items-end">
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Year</label>
                      <select className="form-input" style={{ width: '100%', padding: '6px 12px' }} value={overrideYear} onChange={e => setOverrideYear(e.target.value)}>
                        <option value="">Detect from file</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Semester</label>
                      <select className="form-input" style={{ width: '100%', padding: '6px 12px' }} value={overrideSemester} onChange={e => setOverrideSemester(e.target.value)}>
                        <option value="">Detect from file</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Section</label>
                      <input type="text" className="form-input" style={{ width: '100%', padding: '6px 12px' }} placeholder="Detect from file" value={overrideSection} onChange={e => setOverrideSection(e.target.value)} />
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '6px 16px', height: '36px' }} onClick={() => handlePreview(true)}>
                      Apply & Re-validate
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 mb-6" style={{ backgroundColor: 'var(--background)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Records</p>
                    <p style={{ fontSize: '20px', fontWeight: 600 }}>{previewData.total}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', color: 'var(--success)' }}>✓ Valid</p>
                    <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--success)' }}>{previewData.valid.length}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', color: 'var(--primary)' }}>✨ New Sections</p>
                    <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--primary)' }}>{previewData.newSectionsCount || 0}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', color: 'var(--warning)' }}>⚠ Duplicates</p>
                    <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--warning)' }}>{previewData.duplicates.length}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', color: 'var(--error)' }}>✕ Invalid</p>
                    <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--error)' }}>{previewData.invalid.length}</p>
                  </div>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '24px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'var(--background)', position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Student</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Roll Number</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Section</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...previewData.invalid, ...previewData.duplicates, ...previewData.valid].map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{row.fullName || '—'}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{row.email || '—'}</p>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-primary)' }}>{row.rollNumber || '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-primary)' }}>{row.sectionName || '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {row.status === 'Valid' && (
                              <div className="flex-col">
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: 'var(--success)' }}><CheckCircle size={14} /> Valid</span>
                                {row.isNewSection && <span style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '2px', fontWeight: 500 }}>✨ New Section</span>}
                              </div>
                            )}
                            {row.status === 'Duplicate' && (
                              <div className="flex-col">
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: 'var(--warning)' }}><AlertTriangle size={14} /> Duplicate</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{row.reason}</span>
                              </div>
                            )}
                            {row.status === 'Invalid' && (
                              <div className="flex-col">
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: 'var(--error)' }}><X size={14} /> Invalid</span>
                                <span style={{ fontSize: '11px', color: 'var(--error)', marginTop: '2px' }}>{row.reason}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {bulkStep === 'results' && importResults && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--success-light, #ecfdf5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                  <CheckCircle size={32} style={{ color: 'var(--success)' }} />
                </div>
                <h3 className="card-title mb-2">Upload Complete</h3>
                <p className="body-text mb-6">Successfully imported {importResults.importedCount} students.</p>

                {importResults.errors.length > 0 && (
                  <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 500, cursor: 'pointer', fontSize: '14px', marginBottom: '12px' }}
                      onClick={() => setShowErrors(!showErrors)}
                    >
                      {showErrors ? 'Hide Errors' : `View ${importResults.errors.length} Errors`}
                    </button>
                    
                    {showErrors && (
                      <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: 'var(--background)', padding: '16px', borderRadius: '8px' }}>
                        {importResults.errors.map((err, i) => (
                          <div key={i} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '13px', fontWeight: 500 }}>Row {err.rowNumber} (Roll: {err.rollNumber || '—'})</p>
                            <p style={{ fontSize: '13px', color: 'var(--error)' }}>{err.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button className="btn btn-primary w-full" onClick={() => setIsBulkModalOpen(false)}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentManagement;
