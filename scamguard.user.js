// ==UserScript==
// @name         ScamGuard Lite
// @namespace    https://viayoo.com/
// @version      2.1
// @description  Multi-category site detector with reporting flow
// @author       You
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/mouziali75-cpu/scamguard/main/scamguard.user.js
// @downloadURL  https://raw.githubusercontent.com/mouziali75-cpu/scamguard/main/scamguard.user.js
// ==/UserScript==

(function() {
  const host = location.hostname.toLowerCase();
  const fullUrl = location.href.toLowerCase();

  // ============================================
  //  PHISHING / SCAM DOMAINS
  // ============================================
  const phishingDomains = [
    'roblox.com.bz',
    'roblox.com.nf',
    'roblox.com.lv',
  ];

  // ============================================
  //  ADULT CONTENT DOMAINS
  // ============================================
  const adultDomains = [
    // add domains here
  ];

  // ============================================
  //  UNWANTED / LOW-QUALITY CONTENT DOMAINS
  // ============================================
  const unwantedDomains = [
    // add domains here
  ];

  // ============================================
  //  WARNING IMAGE
  // ============================================
  const warningImageUrl = 'https://i.postimg.cc/BZ84GV46/Photoroom-20260721-203154.png';

  // ============================================
  //  DISCORD WEBHOOK URL
  // ============================================
  const webhookUrl = 'https://discord.com/api/webhooks/1529255203595878430/Sfl-UVmfYYbbQZJtwQvR0Tf272gpEAKHJ1Jz4PAXFVUf8aq7UcBXKjVjq2FVURPJUDXv';

  const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club'];
  const phishKeywords = [
    'free-robux', 'robux-generator', 'nitro-generator', 'discord-gift',
    'free-nitro', 'verify-account', 'steam-gift', 'giveaway-claim',
    'claim-reward', 'roblox-redeem'
  ];
  const knownBrands = ['discord', 'roblox', 'steam', 'google', 'paypal', 'instagram'];

  function matches(list) {
    return list.some(d => host === d || host.endsWith('.' + d));
  }

  const categoryStyles = {
    phishing:  { label: 'Phishing / Scam Site',        color: '#0d47a1', accent: '#2196f3', icon: '🛡️' },
    adult:     { label: 'Adult Content',                color: '#4a0d0d', accent: '#e53935', icon: '🔞' },
    unwanted:  { label: 'Unwanted / Low-Quality Site',  color: '#3a3a1a', accent: '#fbc02d', icon: '⚠️' }
  };

  let detectedCategory = null;
  let flags = [];

  if (matches(phishingDomains)) { detectedCategory = 'phishing'; flags.push('This domain is on the known phishing list'); }
  if (host.includes('xn--')) { detectedCategory = detectedCategory || 'phishing'; flags.push('Punycode domain (may impersonate a real site)'); }
  if (suspiciousTLDs.some(tld => host.endsWith(tld))) { detectedCategory = detectedCategory || 'phishing'; flags.push('Domain extension commonly used for scams'); }
  if (phishKeywords.some(k => fullUrl.includes(k))) { detectedCategory = detectedCategory || 'phishing'; flags.push('Suspicious keywords in URL'); }
  knownBrands.forEach(brand => {
    if (host.includes(brand) && !host.endsWith(brand + '.com') && !host.endsWith(brand + '.gg')) {
      detectedCategory = detectedCategory || 'phishing';
      flags.push(`Contains "${brand}" but isn't the official domain`);
    }
  });
  if (!detectedCategory && matches(adultDomains)) { detectedCategory = 'adult'; flags.push('This site is flagged as adult content'); }
  if (!detectedCategory && matches(unwantedDomains)) { detectedCategory = 'unwanted'; flags.push('This site is flagged as unwanted/low-quality content'); }

  // ---- Webhook sender ----
  function sendReport(url, category, note) {
    if (!webhookUrl || webhookUrl.includes('PASTE_YOUR')) {
      alert('Webhook not configured yet.');
      return;
    }
    const colorMap = { phishing: 2201331, adult: 15158332, unwanted: 16098851 };
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '🚩 New Site Report',
          color: colorMap[category] || 15158332,
          fields: [
            { name: 'Category', value: categoryStyles[category].label },
            { name: 'URL / Domain', value: url },
            { name: 'Description', value: note || 'No description provided' }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    }).then(() => alert('Report sent, thank you!'))
      .catch(() => alert('Failed to send report.'));
  }

  // ---- Modal shell helper ----
  function showModal(innerHtml) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.6);z-index:9999999;
      display:flex;align-items:center;justify-content:center;
      font-family:-apple-system,'Segoe UI',Roboto,sans-serif;
    `;
    modal.innerHTML = `
      <div style="background:#16233b;border-radius:16px;padding:24px;width:85%;max-width:340px;
                  border:1px solid rgba(100,181,246,0.3);">
        ${innerHtml}
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  // ---- Step 3: Description ----
  function showStepDescription(category, url) {
    const modal = showModal(`
      <h3 style="color:white;margin:0 0 4px;font-size:17px;">Describe the issue</h3>
      <p style="color:#7fa8d9;font-size:13px;margin:0 0 16px;">${categoryStyles[category].label}</p>
      <textarea id="sg-note" placeholder="e.g. Fake login page asking for password, or a gambling site sent by a scammer..."
        style="width:100%;box-sizing:border-box;min-height:90px;padding:10px;border-radius:8px;
               background:rgba(255,255,255,0.08);border:1px solid rgba(100,181,246,0.3);
               color:white;font-size:13px;resize:vertical;margin-bottom:16px;"></textarea>
      <button id="sg-submit" style="width:100%;padding:12px;background:#4caf50;color:white;
              border:none;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:8px;">
        Submit Report
      </button>
      <button id="sg-back" style="width:100%;padding:10px;background:transparent;color:#a8c8ea;
              border:1px solid rgba(168,200,234,0.4);border-radius:8px;">Back</button>
    `);
    document.getElementById('sg-submit').onclick = () => {
      const note = document.getElementById('sg-note').value;
      modal.remove();
      sendReport(url, category, note);
    };
    document.getElementById('sg-back').onclick = () => {
      modal.remove();
      showStepUrl(category);
    };
  }

  // ---- Step 2: URL / domain ----
  function showStepUrl(category) {
    const modal = showModal(`
      <h3 style="color:white;margin:0 0 4px;font-size:17px;">Enter the link or domain</h3>
      <p style="color:#7fa8d9;font-size:13px;margin:0 0 16px;">${categoryStyles[category].label}</p>
      <input id="sg-url" type="text" placeholder="e.g. roblox.com.nf or full link"
        value="${location.href}"
        style="width:100%;box-sizing:border-box;padding:10px;border-radius:8px;
               background:rgba(255,255,255,0.08);border:1px solid rgba(100,181,246,0.3);
               color:white;font-size:13px;margin-bottom:16px;">
      <button id="sg-next" style="width:100%;padding:12px;background:#2196f3;color:white;
              border:none;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:8px;">
        Next
      </button>
      <button id="sg-back" style="width:100%;padding:10px;background:transparent;color:#a8c8ea;
              border:1px solid rgba(168,200,234,0.4);border-radius:8px;">Back</button>
    `);
    document.getElementById('sg-next').onclick = () => {
      const url = document.getElementById('sg-url').value.trim();
      if (!url) { alert('Please enter a link or domain.'); return; }
      modal.remove();
      showStepDescription(category, url);
    };
    document.getElementById('sg-back').onclick = () => {
      modal.remove();
      openReportModal();
    };
  }

  // ---- Step 1: Category ----
  function openReportModal() {
    const modal = showModal(`
      <h3 style="color:white;margin:0 0 16px;font-size:17px;">What are you reporting?</h3>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
        <button data-cat="phishing" style="padding:12px;background:#2196f3;color:white;border:none;border-radius:8px;font-size:14px;">🛡️ Phishing / Scam</button>
        <button data-cat="adult" style="padding:12px;background:#e53935;color:white;border:none;border-radius:8px;font-size:14px;">🔞 Adult Content</button>
        <button data-cat="unwanted" style="padding:12px;background:#fbc02d;color:#222;border:none;border-radius:8px;font-size:14px;">⚠️ Unwanted / Spam</button>
      </div>
      <button id="sg-cancel" style="width:100%;padding:10px;background:transparent;color:#a8c8ea;
              border:1px solid rgba(168,200,234,0.4);border-radius:8px;">Cancel</button>
    `);
    modal.querySelectorAll('button[data-cat]').forEach(btn => {
      btn.onclick = () => {
        const cat = btn.dataset.cat;
        modal.remove();
        showStepUrl(cat);
      };
    });
    document.getElementById('sg-cancel').onclick = () => modal.remove();
  }

  // ---- Floating button ----
  const fab = document.createElement('div');
  fab.innerHTML = '🚩';
  fab.title = 'Report a site';
  fab.style.cssText = `
    position:fixed;bottom:20px;right:20px;width:48px;height:48px;
    background:#2196f3;border-radius:50%;display:flex;align-items:center;
    justify-content:center;font-size:22px;cursor:pointer;z-index:999998;
    box-shadow:0 4px 12px rgba(0,0,0,0.3);
  `;
  fab.onclick = openReportModal;
  window.addEventListener('DOMContentLoaded', () => document.body.appendChild(fab));

  // ---- Warning overlay for flagged sites ----
  if (detectedCategory) {
    const style = categoryStyles[detectedCategory];
    const imageHtml = detectedCategory === 'phishing' && warningImageUrl
      ? `<img src="${warningImageUrl}" style="width:64px;height:64px;object-fit:contain;margin-bottom:8px;border-radius:12px;">`
      : `<div style="font-size:48px;margin-bottom:8px;">${style.icon}</div>`;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:linear-gradient(160deg, #0f1420 0%, ${style.color} 100%);
      color:white;z-index:999999;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:-apple-system,'Segoe UI',Roboto,sans-serif;text-align:center;padding:24px;
    `;
    overlay.innerHTML = `
      ${imageHtml}
      <h1 style="font-size:22px;margin:0 0 8px;">${style.label} Detected</h1>
      <div style="background:rgba(255,255,255,0.08);border:1px solid ${style.accent}66;
                  border-radius:12px;padding:16px 20px;max-width:340px;margin:12px 0;">
        <p style="margin:0;font-size:15px;line-height:1.6;color:#e8f0fb;">
          ${flags.join('<br>')}
        </p>
      </div>
      <p style="font-size:13px;color:#a8c8ea;margin:0 0 24px;word-break:break-all;">${host}</p>
      <button id="sg-leave" style="padding:13px 32px;margin-bottom:10px;background:${style.accent};
              color:white;border:none;border-radius:10px;font-weight:600;font-size:15px;">Leave this page</button>
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