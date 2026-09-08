import React, { useState, useEffect, useContext } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { AuthContext } from '../../context/AuthContext';
import { getDepartments, getSections, createSection, deleteSection, getSubjects, createSubject, deleteSubject } from '../../services/academicApi';
import Tabs from '../../components/ui/Tabs';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import FormInput from '../../components/ui/FormInput';
import Select from '../../components/ui/Select';
import { BookOpen, Trash2, Layers, Book } from 'lucide-react';

const AcademicStructure = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('sections');
  
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [secForm, setSecForm] = useState({ year: 4, semester: 1, sectionName: '' });
  const [subForm, setSubForm] = useState({ year: 4, semester: 1, subjectName: '', subjectCode: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const depts = await getDepartments();
      setDepartments(depts);
      const secs = await getSections();
      setSections(secs);
      const subs = await getSubjects();
      setSubjects(subs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    try {
      await createSection(secForm);
      setSecForm({ ...secForm, sectionName: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteSection = async (id) => {
    if (window.confirm('Delete this section?')) {
      try {
        await deleteSection(id);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || err.message);
      }
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      await createSubject(subForm);
      setSubForm({ ...subForm, subjectName: '', subjectCode: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (window.confirm('Delete this subject?')) {
      try {
        await deleteSubject(id);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || err.message);
      }
    }
  };

  const myDept = departments.find(d => d._id === user?.department);

  const tabs = [
    { id: 'department', label: 'My Department' },
    { id: 'sections', label: 'Sections' },
    { id: 'subjects', label: 'Subjects' },
  ];

  const sectionColumns = [
    { header: 'Year', accessor: 'year' },
    { header: 'Semester', accessor: 'semester' },
    { header: 'Section', accessor: 'sectionName' },
    { 
      header: 'Actions', 
      cell: (row) => (
        <button 
          className="btn btn-danger" 
          style={{ padding: '6px 10px' }}
          onClick={() => handleDeleteSection(row._id)}
        >
          <Trash2 size={16} />
        </button>
      ),
      width: '100px'
    }
  ];

  const subjectColumns = [
    { header: 'Year', accessor: 'year' },
    { header: 'Semester', accessor: 'semester' },
    { header: 'Code', accessor: 'subjectCode' },
    { header: 'Name', accessor: 'subjectName' },
    { 
      header: 'Actions', 
      cell: (row) => (
        <button 
          className="btn btn-danger" 
          style={{ padding: '6px 10px' }}
          onClick={() => handleDeleteSubject(row._id)}
        >
          <Trash2 size={16} />
        </button>
      ),
      width: '100px'
    }
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Academic Structure" 
        description="Manage your department's sections and subjects." 
      />

      <div className="card">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="tab-content mt-6">
          {activeTab === 'department' && (
            <div>
              <h3 className="section-title">Department Details</h3>
              {myDept ? (
                <div className="flex gap-4">
                  <div className="stat-icon-wrapper" style={{ width: 64, height: 64, borderRadius: 12 }}>
                    <BookOpen size={32} className="text-primary" />
                  </div>
                  <div className="flex-col justify-center">
                    <p className="stat-value" style={{ fontSize: 24, marginBottom: 4 }}>{myDept.name}</p>
                    <p className="badge badge-blue" style={{ alignSelf: 'flex-start' }}>Code: {myDept.code}</p>
                  </div>
                </div>
              ) : (
                <p className="body-text">Loading department details...</p>
              )}
            </div>
          )}

          {activeTab === 'sections' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="card-title">Manage Sections</h3>
              </div>
              
              <form className="flex items-end gap-4 mb-6 p-4 rounded-md bg-gray-50 border border-gray-100" onSubmit={handleAddSection}>
                <Select 
                  value={secForm.year} 
                  onChange={e => setSecForm({...secForm, year: e.target.value})}
                  options={[
                    { value: 1, label: '1st Year' },
                    { value: 2, label: '2nd Year' },
                    { value: 3, label: '3rd Year' },
                    { value: 4, label: '4th Year' }
                  ]}
                />
                <Select 
                  value={secForm.semester} 
                  onChange={e => setSecForm({...secForm, semester: e.target.value})}
                  options={[
                    { value: 1, label: 'Semester 1' },
                    { value: 2, label: 'Semester 2' }
                  ]}
                />
                <div style={{ flex: 1 }}>
                  <FormInput 
                    type="text" 
                    placeholder="Section Name (e.g. A)" 
                    value={secForm.sectionName} 
                    onChange={e => setSecForm({...secForm, sectionName: e.target.value})} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginBottom: '20px' }}>Add Section</button>
              </form>

              <DataTable 
                columns={sectionColumns} 
                data={sections} 
                keyField="_id" 
                emptyMessage="No sections found in your department."
                emptyIcon={Layers}
              />
            </div>
          )}

          {activeTab === 'subjects' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="card-title">Manage Subjects</h3>
              </div>
              
              <form className="flex items-end gap-4 mb-6 p-4 rounded-md bg-gray-50 border border-gray-100" onSubmit={handleAddSubject}>
                <Select 
                  value={subForm.year} 
                  onChange={e => setSubForm({...subForm, year: e.target.value})}
                  options={[
                    { value: 1, label: '1st Year' },
                    { value: 2, label: '2nd Year' },
                    { value: 3, label: '3rd Year' },
                    { value: 4, label: '4th Year' }
                  ]}
                />
                <Select 
                  value={subForm.semester} 
                  onChange={e => setSubForm({...subForm, semester: e.target.value})}
                  options={[
                    { value: 1, label: 'Semester 1' },
                    { value: 2, label: 'Semester 2' }
                  ]}
                />
                <div style={{ width: '150px' }}>
                  <FormInput 
                    type="text" 
                    placeholder="Subject Code" 
                    value={subForm.subjectCode} 
                    onChange={e => setSubForm({...subForm, subjectCode: e.target.value})} 
                    required 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <FormInput 
                    type="text" 
                    placeholder="Subject Name" 
                    value={subForm.subjectName} 
                    onChange={e => setSubForm({...subForm, subjectName: e.target.value})} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginBottom: '20px' }}>Add Subject</button>
              </form>

              <DataTable 
                columns={subjectColumns} 
                data={subjects} 
                keyField="_id" 
                emptyMessage="No subjects found in your department."
                emptyIcon={Book}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AcademicStructure;
