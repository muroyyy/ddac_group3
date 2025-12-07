// Debug session helper - paste this in browser console
window.debugSession = function() {
  console.log('=== SESSION DEBUG ===');
  
  // Check localStorage
  const sessionData = localStorage.getItem('bloodline_session');
  const tokenData = localStorage.getItem('bloodline_token');
  
  console.log('Raw session data:', sessionData);
  console.log('Raw token data:', tokenData);
  
  if (sessionData) {
    try {
      const parsed = JSON.parse(sessionData);
      console.log('Parsed session:', parsed);
      console.log('User ID:', parsed.id);
      console.log('User role:', parsed.role);
      console.log('Expires at:', new Date(parsed.expiresAt));
      console.log('Is expired:', Date.now() > parsed.expiresAt);
    } catch (e) {
      console.error('Failed to parse session:', e);
    }
  } else {
    console.log('❌ No session data found');
  }
  
  // Test sessionManager
  try {
    const { sessionManager } = window;
    if (sessionManager) {
      console.log('SessionManager getUser():', sessionManager.getUser());
      console.log('SessionManager isAuthenticated():', sessionManager.isAuthenticated());
    }
  } catch (e) {
    console.log('SessionManager not available in window');
  }
  
  console.log('=== END DEBUG ===');
};

console.log('Debug function loaded. Run debugSession() in console to check session.');