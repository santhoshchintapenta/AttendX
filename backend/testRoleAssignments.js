const fs = require('fs');
const xlsx = require('xlsx');

const API_URL = 'http://localhost:5001/api';
let token = '';
let adminEmail = 'admin@attendx.edu'; // This is HOD
let adminPassword = 'admin123';

async function login(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data.token;
  } catch (err) {
    console.error("Login failed for", email, ":", err.message);
    return null;
  }
}

function createExcelFile(filename, data) {
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
  xlsx.writeFile(wb, filename);
}

async function runTests() {
  console.log("=== STARTING ROLE ASSIGNMENT TESTS ===\n");
  token = await login(adminEmail, adminPassword);
  if (!token) return;
  const authHeaders = { 'Authorization': `Bearer ${token}` };

  let fac1Id = '';
  let fac1Email = `fac1_${Date.now()}@attendx.edu`;
  let fac2Id = '';
  let fac2Email = `fac2_${Date.now()}@attendx.edu`;

  // TEST 1
  console.log("TEST 1: Create normal faculty (Assistant Professor)");
  try {
    const res = await fetch(`${API_URL}/faculty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ name: 'Ravi', email: fac1Email, designation: 'Assistant Professor' })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    fac1Id = data.data._id;
    if (data.data.role === 'Faculty') {
      console.log("✅ Passed! User.role =", data.data.role);
    } else {
      console.log("❌ Failed! Role is", data.data.role);
    }
  } catch (err) {
    console.log("❌ Error:", err.message);
  }

  // TEST 2
  console.log("\nTEST 2: Create faculty with designation HOD");
  let fac2Password = '';
  try {
    const res = await fetch(`${API_URL}/faculty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ name: 'Anitha', email: fac2Email, designation: 'HOD' })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    fac2Id = data.data._id;
    fac2Password = data.temporaryPassword;
    if (data.data.role === 'HOD') {
      console.log("✅ Passed! User.role =", data.data.role);
    } else {
      console.log("❌ Failed! Role is", data.data.role);
    }
  } catch (err) {
    console.log("❌ Error:", err.message);
  }

  // TEST 3 & 4
  console.log("\nTEST 3 & 4: Bulk upload roles");
  const bulkData = [
    { Name: 'Bulk Fac 1', 'Email ID': `bulkfac1_${Date.now()}@attendx.edu`, Designation: 'Associate Professor' },
    { Name: 'Bulk Fac 2', 'Email ID': `bulkfac2_${Date.now()}@attendx.edu`, Designation: 'Head of Department' }
  ];
  createExcelFile('bulk_roles.xlsx', bulkData);

  let bulkFac2Email = bulkData[1]['Email ID'];
  let bulkFac2Password = '';

  try {
    const fileData = fs.readFileSync('bulk_roles.xlsx');
    const blob = new Blob([fileData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const formData = new FormData();
    formData.append('file', blob, 'bulk_roles.xlsx');
    const previewRes = await fetch(`${API_URL}/faculty/bulk-import/preview`, {
      method: 'POST', headers: { ...authHeaders }, body: formData
    });
    const previewData = await previewRes.json();
    
    // Check preview
    const r1 = previewData.data.rows[0];
    const r2 = previewData.data.rows[1];
    if (r1.systemRole === 'Faculty' && r2.systemRole === 'HOD') {
      console.log("✅ Preview API correctly identifies systemRole:", r1.systemRole, "and", r2.systemRole);
    } else {
      console.log("❌ Preview API systemRole mismatch:", r1.systemRole, r2.systemRole);
    }

    // Import
    const importRes = await fetch(`${API_URL}/faculty/bulk-import/import`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ rows: previewData.data.rows })
    });
    const importData = await importRes.json();
    if (importData.success && importData.data.summary.imported === 2) {
      console.log("✅ Import successful");
      // Find the HOD temporary password
      const hodCreds = importData.data.successful.find(f => f.email === bulkFac2Email);
      if (hodCreds) bulkFac2Password = hodCreds.temporaryPassword;
    } else {
      console.log("❌ Import failed", importData.message);
    }
  } catch(err) {
    console.log("❌ Error:", err.message);
  }

  // TEST 5 & 6
  console.log("\nTEST 5: Edit designation Faculty -> HOD");
  try {
    const res = await fetch(`${API_URL}/faculty/${fac1Id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ designation: 'Head Of Department' })
    });
    const data = await res.json();
    if (data.data.user.role === 'HOD') {
      console.log("✅ Passed! User.role updated to", data.data.user.role);
    } else {
      console.log("❌ Failed! Role is", data.data.user.role);
    }
  } catch (err) {}

  console.log("\nTEST 6: Edit designation HOD -> Professor");
  try {
    const res = await fetch(`${API_URL}/faculty/${fac1Id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ designation: 'Professor' })
    });
    const data = await res.json();
    if (data.data.user.role === 'Faculty') {
      console.log("✅ Passed! User.role reverted to", data.data.user.role);
    } else {
      console.log("❌ Failed! Role is", data.data.user.role);
    }
  } catch (err) {}

  // TEST 7
  console.log("\nTEST 7: Verify HOD can authenticate (both from Single and Bulk)");
  try {
    let t1 = await login(fac2Email, fac2Password);
    let t2 = await login(bulkFac2Email, bulkFac2Password);
    if (t1 && t2) {
      console.log("✅ Passed! Newly created HODs can authenticate and receive tokens.");
    } else {
      console.log("❌ Failed to authenticate newly created HODs.");
    }
  } catch (err) {}

  console.log("\n=== TESTS COMPLETE ===");
  process.exit(0);
}

runTests();
