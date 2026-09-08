import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { bulkPreviewFaculty, bulkImportFaculty } from '../../services/facultyApi';
import { UploadCloud, CheckCircle, AlertCircle, FileText, Download, Copy, Users } from 'lucide-react';

const BulkImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Results
  const [file, setFile] = useState(null);
  
  // State for Step 2
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState('');

  // State for Step 3
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [importError, setImportError] = useState('');

  // --- Step 1 Handlers ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadClick = async () => {
    if (!file) return;
    setLoadingPreview(true);
    setPreviewError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await bulkPreviewFaculty(formData);
      if (res.success) {
        setPreviewData(res.data);
        setStep(2);
      }
    } catch (err) {
      setPreviewError(err.response?.data?.message || 'Failed to parse file. Ensure it is a valid Excel or CSV.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Email ID,Designation,Phone Number\nJohn Doe,john@example.com,Assistant Professor,9876543210";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Faculty_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // --- Step 2 Handlers ---
  const handleImport = async () => {
    if (!previewData || previewData.validRows === 0) return;
    setImporting(true);
    setImportError('');
    
    // Only submit valid rows
    const validRows = previewData.rows.filter(r => r.status === 'valid');
    
    try {
      const res = await bulkImportFaculty(validRows);
      if (res.success) {
        setImportResults(res.data);
        setStep(3);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setImportError(err.response?.data?.message || 'Server error occurred during import.');
    } finally {
      setImporting(false);
    }
  };

  // --- Step 3 Handlers ---
  const downloadCredentials = () => {
    if (!importResults || importResults.successful.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,Name,Email,Faculty ID,Temporary Password\n";
    importResults.successful.forEach(fac => {
      csvContent += `"${fac.name}","${fac.email}","${fac.facultyId}","${fac.temporaryPassword}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Faculty_Credentials.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleClose = () => {
    // Clear ALL sensitive state when closing
    setStep(1);
    setFile(null);
    setPreviewData(null);
    setImportResults(null);
    setPreviewError('');
    setImportError('');
    onClose();
  };

  // -----------------------------------------------------
  // STEP 1 RENDER: Upload File
  // -----------------------------------------------------
  if (step === 1) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Import Faculty" maxWidth="500px">
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
            Upload a CSV or Excel file containing faculty information.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Required Columns</div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--text-primary)' }}>
                <li>Name</li>
                <li>Email ID</li>
              </ul>
            </div>
            <div style={{ flex: 1, background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px dashed var(--border)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Optional Columns</div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <li>Designation</li>
                <li>Phone Number</li>
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <button onClick={downloadTemplate} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 500, fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Download size={16} /> Download Template
            </button>
          </div>

          {previewError && (
            <div className="alert alert-error" style={{ marginBottom: '16px', padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '14px' }}>
              {previewError}
            </div>
          )}

          <div style={{ 
            border: '2px dashed var(--border)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '40px 24px', 
            textAlign: 'center',
            background: 'var(--surface)',
            cursor: 'pointer'
          }}>
            <UploadCloud size={40} color="var(--text-tertiary)" style={{ marginBottom: '16px' }} />
            <div style={{ marginBottom: '16px' }}>
              <input 
                type="file" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                {file ? 'Change File' : 'Browse Files'}
              </label>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
              {file ? file.name : 'Select a .csv or .xlsx file'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleUploadClick} disabled={!file || loadingPreview}>
            {loadingPreview ? 'Analyzing...' : 'Upload & Preview'}
          </button>
        </div>
      </Modal>
    );
  }

  // -----------------------------------------------------
  // STEP 2 RENDER: Preview
  // -----------------------------------------------------
  if (step === 2) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Preview Faculty Import" maxWidth="800px">
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          <div style={{ flex: 1, padding: '16px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{previewData.totalRows}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Rows</div>
          </div>
          <div style={{ flex: 1, padding: '16px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669' }}>{previewData.validRows}</div>
            <div style={{ fontSize: '12px', color: '#059669', textTransform: 'uppercase' }}>Valid Rows</div>
          </div>
          <div style={{ flex: 1, padding: '16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>{previewData.invalidRows}</div>
            <div style={{ fontSize: '12px', color: '#dc2626', textTransform: 'uppercase' }}>Needs Attention</div>
          </div>
        </div>

        {importError && (
          <div className="alert alert-error" style={{ marginBottom: '16px', padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '14px' }}>
            {importError}
          </div>
        )}

        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <table className="data-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>Row</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>Faculty ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>System Role</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {previewData.rows.map((row, idx) => (
                <tr key={idx} style={{ background: row.status === 'invalid' ? '#fef2f2' : 'transparent', borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{row.rowNumber}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{row.name || '—'}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{row.email || '—'}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{row.facultyId || '—'}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: row.systemRole === 'HOD' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: row.systemRole === 'HOD' ? 600 : 400 }}>{row.systemRole === 'HOD' ? 'HOD/Admin' : row.systemRole}</td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>
                    {row.status === 'valid' ? (
                      <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14} /> Valid</span>
                    ) : (
                      <div style={{ color: '#dc2626', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}><AlertCircle size={14} /> Error</span>
                        <span style={{ fontSize: '11px' }}>{row.errors.join(', ')}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
          <button className="btn btn-secondary" onClick={() => setStep(1)} disabled={importing}>Back</button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={handleClose} disabled={importing}>Cancel</button>
            <button className="btn btn-primary" onClick={handleImport} disabled={importing || previewData.validRows === 0}>
              {importing ? 'Importing...' : `Import ${previewData.validRows} Valid Faculty`}
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // -----------------------------------------------------
  // STEP 3 RENDER: Results
  // -----------------------------------------------------
  if (step === 3) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Import Complete" maxWidth="600px">
        <div style={{ textAlign: 'center', padding: '16px 0 24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '24px' }}>
            <div style={{ flex: 1, padding: '20px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              <Users size={32} color="#059669" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#059669' }}>{importResults.summary.imported}</div>
              <div style={{ fontSize: '13px', color: '#059669', fontWeight: 500 }}>Successfully Imported</div>
            </div>
            {importResults.summary.failed > 0 && (
              <div style={{ flex: 1, padding: '20px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                <AlertCircle size={32} color="#dc2626" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#dc2626' }}>{importResults.summary.failed}</div>
                <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: 500 }}>Failed Imports</div>
              </div>
            )}
          </div>

          {importResults.successful.length > 0 && (
            <div style={{ 
              background: '#fffbeb', 
              border: '1px solid #fde68a', 
              padding: '16px', 
              borderRadius: '8px',
              textAlign: 'left',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <AlertCircle size={20} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#92400e', fontSize: '14px' }}>Save these credentials now!</h4>
                  <p style={{ margin: 0, color: '#b45309', fontSize: '13px', lineHeight: 1.5 }}>
                    Temporary passwords are ONLY shown once and cannot be recovered. When you close this window, they will be permanently cleared from memory.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button className="btn btn-primary" onClick={downloadCredentials} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} /> Download Credentials CSV
                </button>
              </div>
            </div>
          )}

          {importResults.failed.length > 0 && (
            <div style={{ textAlign: 'left', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: 'var(--surface)', padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '14px' }}>
                Failed Records
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '12px 16px' }}>
                {importResults.failed.map((fail, idx) => (
                  <div key={idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 500, fontSize: '13px' }}>Row {fail.rowNumber}: {fail.name}</div>
                    <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>Error: {fail.error}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={handleClose} style={{ width: '100%' }}>Done</button>
        </div>
      </Modal>
    );
  }

  return null;
};

export default BulkImportModal;
