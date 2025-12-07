// PASTE THIS IN BROWSER CONSOLE TO FIX IMMEDIATELY

// 1. Fix the patient API to work with current session
window.fixPatientAPI = function() {
  console.log('🔧 Applying patient API fix...');
  
  // Override the broken API calls
  if (window.patientAPI) {
    // Fix createBloodRequest
    window.patientAPI.createBloodRequest = async function(data) {
      const session = localStorage.getItem('bloodline_session');
      if (!session) throw new Error('Please log in first');
      
      const parsed = JSON.parse(session);
      const userId = parsed.user?.id || parsed.id;
      if (!userId) throw new Error('User ID not found');
      
      const response = await fetch(`http://18.142.248.14:5000/api/patient/blood-request/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    };
    
    // Fix getMyRequests  
    window.patientAPI.getMyRequests = async function() {
      const session = localStorage.getItem('bloodline_session');
      if (!session) throw new Error('Please log in first');
      
      const parsed = JSON.parse(session);
      const userId = parsed.user?.id || parsed.id;
      if (!userId) throw new Error('User ID not found');
      
      const response = await fetch(`http://18.142.248.14:5000/api/patient/blood-requests/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    };
    
    console.log('✅ Patient API fixed!');
  } else {
    console.log('❌ patientAPI not found in window');
  }
};

// 2. Auto-apply the fix
setTimeout(() => {
  window.fixPatientAPI();
}, 1000);

console.log('🩸 BloodLine Patient Fix Loaded!');
console.log('📋 Instructions:');
console.log('1. Clear storage: localStorage.clear()');
console.log('2. Refresh page');
console.log('3. Log in as patient');
console.log('4. Try blood request - should work now!');
console.log('5. If not working, run: fixPatientAPI()');