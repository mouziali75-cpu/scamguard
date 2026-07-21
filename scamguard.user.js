// ==UserScript==
// @name         ScamGuard Lite
// @namespace    https://viayoo.com/
// @version      1.2
// @description  Basic phishing site detector
// @author       You
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/USERNAME/scamguard/main/scamguard.user.js
// @downloadURL  https://raw.githubusercontent.com/USERNAME/scamguard/main/scamguard.user.js
// ==/UserScript==

(function() {
  const host = location.hostname.toLowerCase();
  const fullUrl = location.href.toLowerCase();

  // ============================================
  //  ADD BLOCKED DOMAINS HERE (one per line)
  // ============================================
  const knownPhishingDomains = [
    'roblox.com.bz',
  ];
  // ============================================

  // ============================================
  //  WARNING SCREEN IMAGE (paste any image URL)
  //  Leave empty '' to use the default shield emoji
  // ============================================
  const warningImageUrl = 'https://i.postimg.cc/BZ84GV46/Photoroom-20260721-203154.png';
  // ============================================

  const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club'];
  const phishKeywords = [
    'free-robux', 'robux-generator', 'nitro-generator', 'discord-gift',
    'free-nitro', 'verify-account', 'steam-gift', 'giveaway-claim',
    'claim-reward', 'roblox-redeem'
  ];
  const knownBrands = ['discord', 'roblox', 'steam', 'google', 'paypal', 'instagram'];

  let flags = [];

  const isBlocked = knownPhishingDomains.some(d => host === d || host.endsWith('.' + d));
  if (isBlocked) flags.push('This domain is on the known phishing list');

  if (host.includes('xn--')) flags.push('Punycode domain (may impersonate a real site)');

  if (suspiciousTLDs.some(tld => host.endsWith(tld))) flags.push('Domain extension commonly used for scams');

  if (phishKeywords.some(k => fullUrl.includes(k))) flags.push('Suspicious keywords in URL (giveaway/generator/verify)');

  knownBrands.forEach(brand => {
    if (host.includes(brand) && !host.endsWith(brand + '.com') && !host.endsWith(brand + '.gg')) {
      flags.push(`Contains "${brand}" but isn't the official domain`);
    }
  });

  if (flags.length > 0) {
    const imageHtml = warningImageUrl
      ? `<img src="${warningImageUrl}" style="width:64px;height:64px;object-fit:contain;margin-bottom:8px;border-radius:12px;">`
      : `<div style="font-size:48px;margin-bottom:8px;">🛡️</div>`;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:linear-gradient(160deg, #0f2137 0%, #1a3a5c 45%, #0d47a1 100%);
      color:white;z-index:999999;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:-apple-system,'Segoe UI',Roboto,sans-serif;text-align:center;padding:24px;
    `;
    overlay.innerHTML = `
      ${imageHtml}
      <h1 style="font-size:22px;margin:0 0 8px;letter-spacing:0.3px;">Suspicious Site Detected</h1>
      <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(100,181,246,0.4);
                  border-radius:12px;padding:16px 20px;max-width:340px;margin:12px 0;">
        <p style="margin:0;font-size:15px;line-height:1.6;color:#cfe4ff;">
          ${flags.join('<br>')}
        </p>
      </div>
      <p style="font-size:13px;color:#7fa8d9;margin:0 0 24px;word-break:break-all;">${host}</p>
      <button id="sg-leave" style="padding:13px 32px;margin-bottom:10px;background:#2196f3;
              color:white;border:none;border-radius:10px;font-weight:600;font-size:15px;
              box-shadow:0 4px 14px rgba(33,150,243,0.5);">Leave this page</button>
      <button id="sg-continue" style="padding:11px 28px;background:transparent;color:#a8c8ea;
              border:1px solid rgba(168,200,234,0.4);border-radius:10px;font-size:14px;">
        Continue anyway
      </button>
    `;
    document.documentElement.appendChild(overlay);
    document.getElementById('sg-leave').onclick = () => history.back();
    document.getElementById('sg-continue').onclick = () => overlay.remove();
  }
})();