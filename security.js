/* Original, dependency-free validation for the locally maintained gig snapshot. */
(function (root) {
  'use strict';
  const hosts = new Set(['open.spotify.com','crowbarsyd.oztix.com.au','deadsetdarlo.com.au','events.humanitix.com','moshtix.com.au','premier.ticketek.com.au','tattersallshotel.oztix.com.au','tickets.oztix.com.au','www.factorytheatre.com.au','www.instagram.com','www.metrotheatre.com.au','www.moshtix.com.au','www.oddculture.group','www.stickytickets.com.au']);
  function safeExternalURL(value) {
    if (typeof value !== 'string' || value.length > 2048 || /[\u0000-\u0020\u007f]/.test(value)) return null;
    try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && !u.port && hosts.has(u.hostname) ? u.href : null; } catch { return null; }
  }
  function safeSpotifyURL(value, type) {
    const url = safeExternalURL(value);
    if (!url) return false;
    const u = new URL(url);
    return u.hostname === 'open.spotify.com' && new RegExp('^/' + type + '/[A-Za-z0-9]{22}$').test(u.pathname) && !u.search && !u.hash;
  }
  function validGig(g) {
    if (!g || typeof g !== 'object' || !/^g\d{2}-\d{1,2}$/.test(g.id) || !Number.isInteger(g.rank) || g.rank < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(g.date)) return false;
    if (!['time','venue','suburb','price','availability','fit','source','style'].every(k => typeof g[k] === 'string')) return false;
    if (!Array.isArray(g.lineup) || !g.lineup.length || !g.lineup.every(v => typeof v === 'string') || !safeExternalURL(g.url) || (g.venueUrl && !safeExternalURL(g.venueUrl))) return false;
    return Array.isArray(g.artists) && g.artists.every(a => a && typeof a.name === 'string' && (!a.url || safeSpotifyURL(a.url,'artist')) && (!a.trackUrl || safeSpotifyURL(a.trackUrl,'track')));
  }
  const api = Object.freeze({safeExternalURL, safeSpotifyURL, validGig});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GIG_SECURITY = api;
})(typeof window !== 'undefined' ? window : globalThis);
