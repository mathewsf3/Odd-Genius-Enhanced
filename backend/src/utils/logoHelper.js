const LOGO_CDN_URL = 'https://cdn.odd-genius.com/logos';

/**
 * Get team logo URL using team name
 * @param {string} teamName - The name of the team
 * @param {string} defaultLogo - Optional default logo URL
 * @returns {string} Logo URL
 */
const getTeamLogo = (teamName, defaultLogo) => {
  // If we already have a valid logo URL from API, use it
  if (defaultLogo && defaultLogo.startsWith('http')) {
    return defaultLogo;
  }
  
  if (!teamName) return null;
  
  // Return default logo using UI avatars
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName.substring(0, 2))}&background=252535&color=6366F1&bold=true&size=128`;
};

/**
 * Get league logo URL using league name
 * @param {string} leagueName - The name of the league
 * @param {string} defaultLogo - Optional default logo URL
 * @returns {string} Logo URL
 */
const getLeagueLogo = (leagueName, defaultLogo) => {
  // If we already have a valid logo URL from API, use it
  if (defaultLogo && defaultLogo.startsWith('http')) {
    return defaultLogo;
  }
  
  if (!leagueName) return null;
  
  // Return default logo using UI avatars
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(leagueName.substring(0, 2))}&background=252535&color=6366F1&bold=true&size=128`;
};

module.exports = {
  getTeamLogo,
  getLeagueLogo
};
