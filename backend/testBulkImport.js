const fs = require('fs');
const xlsx = require('xlsx');

const API_URL = 'http://localhost:5001/api';
let token = '';

async function login() {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@attendx.edu', password: 'admin123' })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    token = data.data.token;
    return true;
  } catch (err) {
    console.error("Login failed:", err.message);
    return false;
  }
}

function createExcelFile(filename, data) {
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
  xlsx.writeFile(wb, filename);
}

async function runTests() {
  console.log("=== STARTING VERIFICATION TESTS ===\n");
  const loggedIn = await login();
  if (!loggedIn) return;

  const authHeaders = { 'Authorization': `Bearer ${token}` };

  // Test 1: Single faculty creation (Name + Email only)
  console.log("Test 1: Single faculty creation (Name + Email only)");
  try {
    const res = await fetch(`${API_URL}/faculty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        name: 'Test Optional Single',
        email: `optional_${Date.now()}@attendx.edu`
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log("✅ Passed! Faculty created with ID:", data.data.facultyId);
  } catch (err) {
    console.log("❌ Failed:", err.message);
  }

  // Create Test 2 & 3 data
  const validData = [
    { Name: 'Bulk Valid 1', 'Email ID': `bulk1_${Date.now()}@attendx.edu`, Designation: 'Prof', 'Phone Number': 1234567890 },
    { Name: 'Bulk Valid 2', 'Email ID': `bulk2_${Date.now()}@attendx.edu`, Designation: '', 'Phone Number': '' }
  ];
  
  const duplicateEmail = `dupe_${Date.now()}@attendx.edu`;
  const mixedData = [
    { Name: 'Bulk Mixed 1', 'Email ID': `mix1_${Date.now()}@attendx.edu` }, // Valid
    { Name: 'Bulk Mixed 2', 'Email ID': duplicateEmail }, // Will be dupe in file
    { Name: 'Bulk Mixed 3', 'Email ID': duplicateEmail }, // Duplicate within file
    { Name: 'Bulk Mixed 4', 'Email ID': 'admin@attendx.edu' }, // Exists in DB
    { Name: '', 'Email ID': `mix5_${Date.now()}@attendx.edu` }, // Missing Name
    { Name: 'Missing Email', 'Email ID': '' } // Missing Email
  ];

  createExcelFile('valid.xlsx', validData);
  createExcelFile('mixed.xlsx', mixedData);

  // Helper to send multipart
  async function uploadPreview(filename) {
    const fileData = fs.readFileSync(filename);
    const blob = new Blob([fileData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const formData = new FormData();
    formData.append('file', blob, filename);
    const res = await fetch(`${API_URL}/faculty/bulk-import/preview`, {
      method: 'POST',
      headers: { ...authHeaders },
      body: formData
    });
    return res.json();
  }

  // Test 2 & 3: Bulk Upload Previews
  console.log("\nTest 2 & 3: Bulk upload preview logic");
  let validPreviewRows = [];
  try {
    const data = await uploadPreview('valid.xlsx');
    if (!data.success) throw new Error(data.message);
    console.log(`✅ Valid File Preview: ${data.data.validRows} valid rows`);
  } catch (err) {
    console.log("❌ Valid Preview Failed:", err.message);
  }

  try {
    const data = await uploadPreview('mixed.xlsx');
    if (!data.success) throw new Error(data.message);
    console.log(`✅ Mixed File Preview Results:`);
    console.log(`   Total: ${data.data.totalRows}`);
    console.log(`   Valid: ${data.data.validRows}`);
    console.log(`   Invalid: ${data.data.invalidRows}`);
    data.data.rows.filter(r => r.status === 'invalid').forEach(r => {
      console.log(`   - Row ${r.rowNumber}: ${r.errors.join(', ')}`);
    });
    validPreviewRows = data.data.rows.filter(r => r.status === 'valid');
  } catch (err) {
    console.log("❌ Mixed Preview Failed:", err.message);
  }

  // Test 4: Import valid rows while invalid exist
  console.log("\nTest 4: Import partial valid/invalid data");
  try {
    const rowsToImport = [
      validPreviewRows[0], 
      { ...validPreviewRows[0], email: 'admin@attendx.edu', rowNumber: 99 } // Invalid backend failure
    ];
    const res = await fetch(`${API_URL}/faculty/bulk-import/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ rows: rowsToImport })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✅ Import Array processed.`);
    console.log(`   Successfully imported: ${data.data.summary.imported}`);
    console.log(`   Failed: ${data.data.summary.failed}`);
    if (data.data.failed.length > 0) {
      console.log(`   Failed Reason: ${data.data.failed[0].error}`);
    }
    
    // Test 5 checks
    console.log("\nTest 5: Verify credentials response");
    if (data.data.successful.length > 0) {
      const fac = data.data.successful[0];
      if (fac.temporaryPassword) {
        console.log(`✅ Success! Temporary Password returned for ${fac.email}: ${fac.temporaryPassword}`);
      } else {
        console.log("❌ Failed: Temporary password missing from response!");
      }
    }
  } catch (err) {
    console.log("❌ Import Array Failed:", err.message);
  }

  console.log("\n=== TESTS COMPLETE ===");
  process.exit(0);
}

runTests();
