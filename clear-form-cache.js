// Script to clear team form cache and reload data
// Run this in browser console to force fresh data

console.log('🧹 Clearing Team Form Cache...');

// Clear localStorage cache if any
Object.keys(localStorage).forEach(key => {
  if (key.includes('team_form') || key.includes('TeamForm')) {
    localStorage.removeItem(key);
    console.log(`Removed cache key: ${key}`);
  }
});

// Clear sessionStorage cache if any
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('team_form') || key.includes('TeamForm')) {
    sessionStorage.removeItem(key);
    console.log(`Removed session cache key: ${key}`);
  }
});

// If TeamFormService is available, clear its cache
if (window.teamFormService) {
  window.teamFormService.clearAllCache();
  console.log('✅ Cleared TeamFormService cache');
}

console.log('🔄 Reloading page to fetch fresh data...');
setTimeout(() => {
  window.location.reload();
}, 1000);
