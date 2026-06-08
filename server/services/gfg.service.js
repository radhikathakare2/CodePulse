const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Attempt to fetch GFG user stats from the practice profile page.
 * GFG doesn't have an official public API, so we scrape the profile page.
 * Returns mock data with a note if scraping fails.
 *
 * @param {string} username - GFG username
 * @returns {Promise<object>} Structured stats matching PlatformStats.gfg schema
 */
const fetchGFGStats = async (username) => {
  try {
    // Try the unofficial GFG API first
    const apiUrl = `https://geeksforgeeks.org/gfg-assets/_next/data/bPOBN2I_6QxkFDIfXpBY0/user/${username}.json`;

    let data = null;

    // Attempt the JSON endpoint
    try {
      const apiRes = await axios.get(apiUrl, {
        timeout: 8000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      data = apiRes.data?.pageProps?.userInfo;
    } catch {
      // JSON API failed, try scraping
    }

    if (data) {
      return parseGFGApiData(username, data);
    }

    // Fallback: scrape the HTML profile page
    const profileUrl = `https://auth.geeksforgeeks.org/user/${username}/practice`;
    const htmlRes = await axios.get(profileUrl, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    return scrapeGFGProfile(username, htmlRes.data);
  } catch (error) {
    console.error(`GFG fetch error for ${username}:`, error.message);
    return getMockGFGData(username);
  }
};

/**
 * Parse data from GFG's unofficial JSON API.
 */
const parseGFGApiData = (username, data) => {
  const problemsSolved = data?.problemsSolved || {};
  return {
    username,
    totalSolved: data?.totalProblemsSolved || 0,
    codingScore: data?.codingScore || 0,
    institutionRank: data?.instituteRank || '',
    school: problemsSolved?.School || 0,
    basic: problemsSolved?.Basic || 0,
    easy: problemsSolved?.Easy || 0,
    medium: problemsSolved?.Medium || 0,
    hard: problemsSolved?.Hard || 0,
  };
};

/**
 * Scrape GFG profile HTML page using cheerio.
 */
const scrapeGFGProfile = (username, html) => {
  const $ = cheerio.load(html);

  const getText = (selector) =>
    $(selector).first().text().trim().replace(/[^0-9]/g, '') || '0';

  // GFG DOM selectors (may change with site updates)
  const totalSolved = parseInt(getText('.score_card_value'), 10) || 0;
  const codingScore = parseInt(getText('.educationDetails_scoring_text__nbQHT'), 10) || 0;
  const institutionRank = $('[class*="institutionRank"]').first().text().trim() || '';

  // Difficulty counts from various score sections
  const difficultyItems = $('[class*="difficulty_"]');
  let school = 0, basic = 0, easy = 0, medium = 0, hard = 0;

  difficultyItems.each((_, el) => {
    const label = $(el).find('[class*="difficulty_title"]').text().toLowerCase();
    const count = parseInt($(el).find('[class*="difficulty_count"]').text().trim(), 10) || 0;
    if (label.includes('school')) school = count;
    else if (label.includes('basic')) basic = count;
    else if (label.includes('easy')) easy = count;
    else if (label.includes('medium')) medium = count;
    else if (label.includes('hard')) hard = count;
  });

  return {
    username,
    totalSolved,
    codingScore,
    institutionRank,
    school,
    basic,
    easy,
    medium,
    hard,
  };
};

/**
 * Returns mock GFG data when the profile can't be fetched.
 */
const getMockGFGData = (username) => ({
  username,
  totalSolved: 0,
  codingScore: 0,
  institutionRank: '',
  school: 0,
  basic: 0,
  easy: 0,
  medium: 0,
  hard: 0,
  _isMock: true,
  _note: `Could not fetch GFG stats for ${username}. GFG may be blocking automated requests. Please check the username.`,
});

module.exports = { fetchGFGStats };
