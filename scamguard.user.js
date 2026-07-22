// ==UserScript==
// @name         ScamGuard Lite
// @namespace    https://viayoo.com/
// @version      5.0
// @description  Multi-category site detector (manual + online lists) with multilingual UI
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
  //  PHISHING / SCAM DOMAINS — manual list
  // ============================================
  const phishingDomains = [
    'roblox.com.bz',
    'roblox.com.nf',
    'roblox.com.lv',
  ];

  // ============================================
  //  ADULT CONTENT — manual list (combined with online list)
  // ============================================
  const manualAdultDomains = [
    'pornhub.com',
    'xhamster.com',
    'stripchat.com',
    'xvideos.com',
  ];

  // ============================================
  //  UNWANTED / LOW-QUALITY CONTENT — manual only
  // ============================================
  const unwantedDomains = [
    // add domains here
  ];

  // ============================================
  //  TRUSTED / WELL-KNOWN DOMAINS
  // ============================================
  const trustedDomains = [
    'google.com', 'bing.com', 'duckduckgo.com', 'yahoo.com', 'microsoft.com',
    'apple.com', 'icloud.com', 'amazon.com', 'cloudflare.com', 'samsung.com',
    'brave.com', 'chatgpt.com', 'claude.ai', 'gemini.google.com',
    'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'tiktok.com',
    'snapchat.com', 'pinterest.com', 'linkedin.com', 'reddit.com', 'tumblr.com',
    'threads.net', 'vk.com',
    'whatsapp.com', 'telegram.org', 'telegram.me', 't.me', 'discord.com',
    'discordapp.com', 'signal.org', 'messenger.com',
    'youtube.com', 'twitch.tv', 'netflix.com', 'spotify.com', 'soundcloud.com',
    'vimeo.com', 'dailymotion.com', 'primevideo.com', 'disneyplus.com',
    'hulu.com', 'bilibili.com',
    'roblox.com', 'steampowered.com', 'steamcommunity.com', 'epicgames.com',
    'minecraft.net', 'ea.com', 'ubisoft.com', 'blizzard.com', 'battle.net',
    'riotgames.com', 'nintendo.com', 'playstation.com', 'xbox.com',
    'itch.io', 'gog.com',
    'github.com', 'githubusercontent.com', 'gitlab.com', 'stackoverflow.com',
    'npmjs.com', 'vercel.com', 'netlify.com', 'render.com', 'heroku.com',
    'mongodb.com', 'firebase.google.com', 'expo.dev', 'bot-hosting.net',
    'viayoo.com', 'digitalocean.com', 'aws.amazon.com',
    'paypal.com', 'stripe.com', 'wise.com', 'visa.com', 'mastercard.com',
    'bet.br',
    'ebay.com', 'aliexpress.com', 'walmart.com', 'etsy.com', 'shopify.com',
    'temu.com', 'booking.com',
    'wikipedia.org', 'wikimedia.org', 'quora.com', 'medium.com', 'fandom.com',
    'imgur.com', 'postimg.cc', 'catbox.moe', 'ibb.co', 'dropbox.com',
    'drive.google.com', 'mega.nz', 'mediafire.com',
    'gmail.com', 'outlook.com', 'live.com', 'protonmail.com', 'yandex.com',
    'yandex.ru', 'mail.ru',
    'cloud.microsoft',
    'baidu.com', 'naver.com', 'dzen.ru', 'yahoo.co.jp',
    'bbc.com', 'bbc.co.uk', 'cnn.com', 'nytimes.com', 'reuters.com',
    'apnews.com', 'globo.com', 'weather.com',
    'canva.com',
  ];

  // ============================================
  //  ONLINE LISTS (auto-fetched + cached)
  // ============================================
  const adultListUrl = 'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn-only/hosts';
  const phishingListUrl = 'https://urlhaus.abuse.ch/downloads/hostfile/';

  const ADULT_CACHE_KEY = 'sg_adult_domains_cache';
  const ADULT_CACHE_TIME_KEY = 'sg_adult_domains_cache_time';
  const PHISH_CACHE_KEY = 'sg_phishing_domains_cache';
  const PHISH_CACHE_TIME_KEY = 'sg_phishing_domains_cache_time';
  const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 3;
  const FETCH_TIMEOUT = 4000;

  // ============================================
  //  IMAGES
  // ============================================
  const warningImageUrl = 'https://i.postimg.cc/BZ84GV46/Photoroom-20260721-203154.png';

  // ============================================
  //  DISCLAIMER SCREEN IMAGE (shown when user taps "Continue anyway")
  //  Leave empty '' to use the warning emoji instead
  // ============================================
  const disclaimerImageUrl = 'https://i.postimg.cc/zGp4MXng/IMG-20260722-202347.jpg';

  // ============================================
  //  SUPPORT / DONATION LINK
  //  Paste your Linkvertise / LootLabs / Ko-fi link here
  // ============================================
  const SUPPORT_LINK_URL = 'https://loot-link.com/s?3rIpOXoe';

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

  function matchesSet(set) {
    if (!set || set.size === 0) return false;
    if (set.has(host)) return true;
    const parts = host.split('.');
    for (let i = 1; i < parts.length - 1; i++) {
      if (set.has(parts.slice(i).join('.'))) return true;
    }
    return false;
  }

  // ============================================
  //  TRANSLATIONS
  // ============================================
  const translations = {
    en: {
      langBtn: '🌐 EN', supportBtn: '❤️ Support me',
      leaveBtn: 'Leave this page', continueBtn: 'Continue anyway',
      reportBtn: '🚩 Report a different issue',
      titlePhishing: 'Phishing / Scam Site Detected',
      titleAdult: 'Adult Content Detected',
      titleUnwanted: 'Unwanted / Low-Quality Site Detected',
      disclaimerTitle: 'Before you continue',
      disclaimerPhishing: "We are not responsible for anything that may happen to you on this site.",
      disclaimerAdult: "We are not responsible for any content you may see on this site.",
      disclaimerUnwanted: "We are not responsible for anything that may happen to you on this site.",
      disclaimerLeaveBtn: 'Leave the site', disclaimerOkBtn: 'OK, continue',
      unknownBannerText: "This site isn't in our known list yet. Be cautious.",
      unknownReportBtn: 'Report', unknownSafeBtn: "It's legit",
      reportTitle: 'What are you reporting?',
      catPhishing: '🛡️ Phishing / Scam', catAdult: '🔞 Adult Content',
      catUnwanted: '⚠️ Unwanted / Spam', catSafe: '✅ Well-known / Safe Site',
      cancelBtn: 'Cancel',
      enterLinkTitle: 'Enter the link or domain',
      urlPlaceholder: 'e.g. roblox.com.nf or https://...',
      nextBtn: 'Next', backBtn: 'Back',
      describeTitle: 'Describe the issue',
      notePlaceholder: 'e.g. Fake login page asking for password...',
      submitBtn: 'Submit Report',
      flagPhishingList: 'This domain is on the known phishing list',
      flagPunycode: 'Punycode domain (may impersonate a real site)',
      flagTLD: 'Domain extension commonly used for scams',
      flagKeyword: 'Suspicious keywords in URL',
      flagBrand: 'Contains "{brand}" but isn\'t the official domain',
      flagAdultManual: 'This domain is flagged as adult content',
      flagAdultOnline: 'This domain is flagged as adult content (online list)',
      flagUnwanted: 'This site is flagged as unwanted/low-quality content',
      flagURLhaus: 'This domain is on the URLhaus threat list',
    },
    ar: {
      langBtn: '🌐 عربي', supportBtn: '❤️ ادعمني',
      leaveBtn: 'غادر الصفحة', continueBtn: 'تابع على مسؤوليتي',
      reportBtn: '🚩 أبلغ عن مشكلة أخرى',
      titlePhishing: 'تم اكتشاف موقع تصيّد / نصب',
      titleAdult: 'تم اكتشاف محتوى للبالغين',
      titleUnwanted: 'تم اكتشاف موقع غير مرغوب فيه',
      disclaimerTitle: 'قبل أن تكمل',
      disclaimerPhishing: 'نحن لا نتحمل أي مسؤولية عما قد يحدث لك في هذا الموقع.',
      disclaimerAdult: 'نحن لا نتحمل أي مسؤولية عن أي محتوى قد تراه في هذا الموقع.',
      disclaimerUnwanted: 'نحن لا نتحمل أي مسؤولية عما قد يحدث لك في هذا الموقع.',
      disclaimerLeaveBtn: 'غادر الموقع', disclaimerOkBtn: 'موافق، تابع',
      unknownBannerText: 'هذا الموقع غير موجود بقائمتنا المعروفة بعد. كن حذراً.',
      unknownReportBtn: 'إبلاغ', unknownSafeBtn: 'موقع موثوق',
      reportTitle: 'عن ماذا تبلغ؟',
      catPhishing: '🛡️ تصيّد / نصب', catAdult: '🔞 محتوى للبالغين',
      catUnwanted: '⚠️ غير مرغوب / سبام', catSafe: '✅ موقع معروف / آمن',
      cancelBtn: 'إلغاء',
      enterLinkTitle: 'أدخل الرابط أو الدومين',
      urlPlaceholder: 'مثلاً roblox.com.nf أو https://...',
      nextBtn: 'التالي', backBtn: 'رجوع',
      describeTitle: 'صف المشكلة',
      notePlaceholder: 'مثلاً صفحة تسجيل دخول مزيفة تطلب كلمة المرور...',
      submitBtn: 'إرسال البلاغ',
      flagPhishingList: 'هذا الدومين موجود بقائمة مواقع النصب المعروفة',
      flagPunycode: 'دومين Punycode (قد يقلد موقعاً حقيقياً)',
      flagTLD: 'نطاق (TLD) شائع الاستخدام بمواقع النصب',
      flagKeyword: 'كلمات مشبوهة موجودة بالرابط',
      flagBrand: 'يحتوي على "{brand}" لكنه ليس الدومين الرسمي',
      flagAdultManual: 'هذا الدومين مصنّف كمحتوى للبالغين',
      flagAdultOnline: 'هذا الدومين مصنّف كمحتوى للبالغين (قائمة أونلاين)',
      flagUnwanted: 'هذا الموقع مصنّف كمحتوى غير مرغوب فيه / منخفض الجودة',
      flagURLhaus: 'هذا الدومين موجود بقائمة تهديدات URLhaus',
    },
    fr: {
      langBtn: '🌐 FR', supportBtn: '❤️ Soutenez-moi',
      leaveBtn: 'Quitter cette page', continueBtn: 'Continuer quand même',
      reportBtn: '🚩 Signaler un autre problème',
      titlePhishing: 'Site de phishing / arnaque détecté',
      titleAdult: 'Contenu pour adultes détecté',
      titleUnwanted: 'Site indésirable détecté',
      disclaimerTitle: 'Avant de continuer',
      disclaimerPhishing: "Nous ne sommes pas responsables de ce qui pourrait vous arriver sur ce site.",
      disclaimerAdult: "Nous ne sommes pas responsables du contenu que vous pourriez voir sur ce site.",
      disclaimerUnwanted: "Nous ne sommes pas responsables de ce qui pourrait vous arriver sur ce site.",
      disclaimerLeaveBtn: 'Quitter le site', disclaimerOkBtn: "D'accord, continuer",
      unknownBannerText: "Ce site n'est pas encore dans notre liste connue. Soyez prudent.",
      unknownReportBtn: 'Signaler', unknownSafeBtn: 'Site fiable',
      reportTitle: 'Que signalez-vous ?',
      catPhishing: '🛡️ Phishing / Arnaque', catAdult: '🔞 Contenu pour adultes',
      catUnwanted: '⚠️ Indésirable / Spam', catSafe: '✅ Site connu / sûr',
      cancelBtn: 'Annuler',
      enterLinkTitle: 'Entrez le lien ou le domaine',
      urlPlaceholder: 'ex. roblox.com.nf ou https://...',
      nextBtn: 'Suivant', backBtn: 'Retour',
      describeTitle: 'Décrivez le problème',
      notePlaceholder: 'ex. Fausse page de connexion demandant un mot de passe...',
      submitBtn: 'Envoyer le signalement',
      flagPhishingList: 'Ce domaine figure sur la liste de phishing connue',
      flagPunycode: 'Domaine Punycode (peut imiter un vrai site)',
      flagTLD: 'Extension de domaine souvent utilisée pour les arnaques',
      flagKeyword: "Mots-clés suspects dans l'URL",
      flagBrand: 'Contient "{brand}" mais n\'est pas le domaine officiel',
      flagAdultManual: 'Ce domaine est signalé comme contenu pour adultes',
      flagAdultOnline: 'Ce domaine est signalé comme contenu pour adultes (liste en ligne)',
      flagUnwanted: 'Ce site est signalé comme indésirable / de faible qualité',
      flagURLhaus: 'Ce domaine figure sur la liste de menaces URLhaus',
    }
  };

  let currentLang = (function() {
    try { return localStorage.getItem('sg_lang') || 'en'; } catch (e) { return 'en'; }
  })();

  function t(key, params) {
    let str = (translations[currentLang] && translations[currentLang][key]) || translations.en[key] || key;
    if (params) {
      Object.keys(params).forEach(p => { str = str.split('{' + p + '}').join(params[p]); });
    }
    return str;
  }

  function cycleLang() {
    const order = ['en', 'ar', 'fr'];
    const idx = order.indexOf(currentLang);
    const next = order[(idx + 1) % order.length];
    try { localStorage.setItem('sg_lang', next); } catch (e) {}
    location.reload();
  }

  const titleKeyMap = { phishing: 'titlePhishing', adult: 'titleAdult', unwanted: 'titleUnwanted' };
  const disclaimerKeyMap = { phishing: 'disclaimerPhishing', adult: 'disclaimerAdult', unwanted: 'disclaimerUnwanted' };
  const categoryColors = {
    phishing: { color: '#0d47a1', accent: '#2196f3', icon: '🛡️' },
    adult:    { color: '#4a0d0d', accent: '#e53935', icon: '🔞' },
    unwanted: { color: '#3a3a1a', accent: '#fbc02d', icon: '⚠️' },
  };

  // ---- Top bar (support + language buttons) ----
  function attachTopBar(container, includeSupport) {
    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px;';

    if (includeSupport) {
      const supportBtn = document.createElement('button');
      supportBtn.textContent = t('supportBtn');
      supportBtn.style.cssText = 'padding:6px 10px;background:transparent;color:#ff6b81;border:1px solid rgba(255,107,129,0.5);border-radius:8px;font-size:12px;';
      supportBtn.onclick = () => {
        if (!SUPPORT_LINK_URL || SUPPORT_LINK_URL.includes('PASTE_YOUR')) {
          alert('Support link not configured yet.');
          return;
        }
        window.open(SUPPORT_LINK_URL, '_blank');
      };
      bar.appendChild(supportBtn);
    } else {
      const spacer = document.createElement('span');
      bar.appendChild(spacer);
    }

    const langBtn = document.createElement('button');
    langBtn.textContent = t('langBtn');
    langBtn.style.cssText = 'padding:6px 10px;background:transparent;color:#a8c8ea;border:1px solid rgba(168,200,234,0.4);border-radius:8px;font-size:12px;';
    langBtn.onclick = () => cycleLang();
    bar.appendChild(langBtn);

    container.insertBefore(bar, container.firstChild);
  }

  // ---- Generic loader for a hosts-file style list, with cache + timeout ----
  function loadHostsList(url, cacheKey, cacheTimeKey, callback) {
    let cachedList = [];
    try {
      const cachedTime = parseInt(localStorage.getItem(cacheTimeKey) || '0');
      const cached = localStorage.getItem(cacheKey);
      if (cached) cachedList = JSON.parse(cached);
      if (cached && (Date.now() - cachedTime) < CACHE_MAX_AGE) {
        callback(new Set(cachedList));
        return;
      }
    } catch (e) {}

    let done = false;
    const timeoutId = setTimeout(() => {
      if (!done) { done = true; callback(new Set(cachedList)); }
    }, FETCH_TIMEOUT);

    fetch(url)
      .then(r => r.text())
      .then(text => {
        if (done) return;
        done = true;
        clearTimeout(timeoutId);
        const domains = text.split('\n')
          .filter(line => line.startsWith('0.0.0.0 '))
          .map(line => line.replace('0.0.0.0 ', '').trim())
          .filter(Boolean);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(domains));
          localStorage.setItem(cacheTimeKey, Date.now().toString());
        } catch (e) {}
        callback(new Set(domains));
      })
      .catch(() => {
        if (done) return;
        done = true;
        clearTimeout(timeoutId);
        callback(new Set(cachedList));
      });
  }

  function instantCheck() {
    let detectedCategory = null;
    let flags = [];

    if (matches(phishingDomains)) { detectedCategory = 'phishing'; flags.push({ key: 'flagPhishingList' }); }
    if (host.includes('xn--')) { detectedCategory = detectedCategory || 'phishing'; flags.push({ key: 'flagPunycode' }); }
    if (suspiciousTLDs.some(tld => host.endsWith(tld))) { detectedCategory = detectedCategory || 'phishing'; flags.push({ key: 'flagTLD' }); }
    if (phishKeywords.some(k => fullUrl.includes(k))) { detectedCategory = detectedCategory || 'phishing'; flags.push({ key: 'flagKeyword' }); }
    knownBrands.forEach(brand => {
      if (host.includes(brand) && !host.endsWith(brand + '.com') && !host.endsWith(brand + '.gg')) {
        detectedCategory = detectedCategory || 'phishing';
        flags.push({ key: 'flagBrand', params: { brand } });
      }
    });
    if (!detectedCategory && matches(manualAdultDomains)) {
      detectedCategory = 'adult';
      flags.push({ key: 'flagAdultManual' });
    }
    if (!detectedCategory && matches(unwantedDomains)) {
      detectedCategory = 'unwanted';
      flags.push({ key: 'flagUnwanted' });
    }

    return { detectedCategory, flags };
  }

  const isTrusted = matches(trustedDomains);
  let alreadyRendered = false;

  function sendReport(url, category, note) {
    if (!webhookUrl || webhookUrl.includes('PASTE_YOUR')) {
      alert('Webhook not configured yet.');
      return;
    }
    const colorMap = { phishing: 2201331, adult: 15158332, unwanted: 16098851, safe: 5025616 };
    const catLabelMap = { phishing: t('catPhishing'), adult: t('catAdult'), unwanted: t('catUnwanted'), safe: t('catSafe') };
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: category === 'safe' ? '✅ Suggested Trusted Domain' : '🚩 New Site Report',
          color: colorMap[category] || 15158332,
          fields: [
            { name: 'Category', value: catLabelMap[category] },
            { name: 'URL / Domain', value: url },
            { name: 'Description', value: note || 'No description provided' }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    }).then(() => alert('Report sent, thank you!'))
      .catch(() => alert('Failed to send report.'));
  }

  function showModal(innerHtml, withLangBar) {
    const modal = document.createElement('div');
    modal.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    modal.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.6);z-index:2147483647;
      display:flex;align-items:center;justify-content:center;
      font-family:-apple-system,'Segoe UI',Roboto,sans-serif;
      overflow-y:auto;box-sizing:border-box;padding:20px 0;
    `;
    const box = document.createElement('div');
    box.style.cssText = `
      background:#16233b;border-radius:16px;padding:24px;width:85%;max-width:340px;
      border:1px solid rgba(100,181,246,0.3);margin:auto;
    `;
    box.innerHTML = innerHtml;
    modal.appendChild(box);
    document.documentElement.appendChild(modal);
    if (withLangBar) attachTopBar(box, false);
    return modal;
  }

  function showStepDescription(category, url) {
    const modal = showModal(`
      <h3 style="color:white;margin:0 0 4px;font-size:17px;">${t('describeTitle')}</h3>
      <p style="color:#7fa8d9;font-size:13px;margin:0 0 16px;">${t('cat' + category.charAt(0).toUpperCase() + category.slice(1))}</p>
      <textarea id="sg-note" placeholder="${t('notePlaceholder')}"
        style="width:100%;box-sizing:border-box;min-height:90px;padding:10px;border-radius:8px;
               background:rgba(255,255,255,0.08);border:1px solid rgba(100,181,246,0.3);
               color:white;font-size:13px;resize:vertical;margin-bottom:16px;"></textarea>
      <button id="sg-submit" style="width:100%;padding:12px;background:#4caf50;color:white;
              border:none;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:8px;">
        ${t('submitBtn')}
      </button>
      <button id="sg-back" style="width:100%;padding:10px;background:transparent;color:#a8c8ea;
              border:1px solid rgba(168,200,234,0.4);border-radius:8px;">${t('backBtn')}</button>
    `, true);
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

  function showStepUrl(category, prefill) {
    const modal = showModal(`
      <h3 style="color:white;margin:0 0 4px;font-size:17px;">${t('enterLinkTitle')}</h3>
      <p style="color:#7fa8d9;font-size:13px;margin:0 0 16px;">${t('cat' + category.charAt(0).toUpperCase() + category.slice(1))}</p>
      <input id="sg-url" type="text" placeholder="${t('urlPlaceholder')}" value="${prefill || ''}"
        style="width:100%;box-sizing:border-box;padding:10px;border-radius:8px;
               background:rgba(255,255,255,0.08);border:1px solid rgba(100,181,246,0.3);
               color:white;font-size:13px;margin-bottom:16px;">
      <button id="sg-next" style="width:100%;padding:12px;background:#2196f3;color:white;
              border:none;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:8px;">
        ${t('nextBtn')}
      </button>
      <button id="sg-back" style="width:100%;padding:10px;background:transparent;color:#a8c8ea;
              border:1px solid rgba(168,200,234,0.4);border-radius:8px;">${t('backBtn')}</button>
    `, true);
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

  function openReportModal() {
    const modal = showModal(`
      <h3 style="color:white;margin:0 0 16px;font-size:17px;">${t('reportTitle')}</h3>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
        <button data-cat="phishing" style="padding:12px;background:#2196f3;color:white;border:none;border-radius:8px;font-size:14px;">${t('catPhishing')}</button>
        <button data-cat="adult" style="padding:12px;background:#e53935;color:white;border:none;border-radius:8px;font-size:14px;">${t('catAdult')}</button>
        <button data-cat="unwanted" style="padding:12px;background:#fbc02d;color:#222;border:none;border-radius:8px;font-size:14px;">${t('catUnwanted')}</button>
        <button data-cat="safe" style="padding:12px;background:#4caf50;color:white;border:none;border-radius:8px;font-size:14px;">${t('catSafe')}</button>
      </div>
      <button id="sg-cancel" style="width:100%;padding:10px;background:transparent;color:#a8c8ea;
              border:1px solid rgba(168,200,234,0.4);border-radius:8px;">${t('cancelBtn')}</button>
    `, true);
    modal.querySelectorAll('button[data-cat]').forEach(btn => {
      btn.onclick = () => {
        const cat = btn.dataset.cat;
        modal.remove();
        showStepUrl(cat);
      };
    });
    document.getElementById('sg-cancel').onclick = () => modal.remove();
  }

  function showUnknownBanner() {
    const banner = document.createElement('div');
    banner.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    banner.style.cssText = `
      position:fixed;top:0;left:0;width:100%;z-index:999997;
      background:#1a2a3d;color:#cfe4ff;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;
      font-size:13px;padding:10px 14px;box-sizing:border-box;
      display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    `;
    banner.innerHTML = `
      <span style="flex:1;line-height:1.4;min-width:150px;">⚠️ ${t('unknownBannerText')}</span>
      <button id="sg-unk-lang" style="flex-shrink:0;padding:6px 8px;background:transparent;color:#a8c8ea;
              border:1px solid rgba(168,200,234,0.4);border-radius:6px;font-size:11px;">🌐</button>
      <button id="sg-unk-report" style="flex-shrink:0;padding:6px 10px;background:#e53935;color:white;
              border:none;border-radius:6px;font-size:12px;">${t('unknownReportBtn')}</button>
      <button id="sg-unk-safe" style="flex-shrink:0;padding:6px 10px;background:#4caf50;color:white;
              border:none;border-radius:6px;font-size:12px;">${t('unknownSafeBtn')}</button>
      <button id="sg-unk-dismiss" style="flex-shrink:0;padding:6px 8px;background:transparent;color:#a8c8ea;
              border:none;font-size:16px;">✕</button>
    `;
    document.documentElement.appendChild(banner);
    document.getElementById('sg-unk-lang').onclick = () => cycleLang();
    document.getElementById('sg-unk-report').onclick = () => {
      banner.remove();
      showStepUrl('phishing', location.href);
    };
    document.getElementById('sg-unk-safe').onclick = () => {
      banner.remove();
      showStepDescription('safe', location.href);
    };
    document.getElementById('sg-unk-dismiss').onclick = () => banner.remove();
  }

  function ensureFabButton() {
    if (document.getElementById('sg-fab-btn')) return;
    const fab = document.createElement('div');
    fab.id = 'sg-fab-btn';
    fab.innerHTML = '🚩';
    fab.title = 'Report a site';
    fab.style.cssText = `
      position:fixed;bottom:20px;right:20px;width:48px;height:48px;
      background:#2196f3;border-radius:50%;display:flex;align-items:center;
      justify-content:center;font-size:22px;cursor:pointer;z-index:999998;
      box-shadow:0 4px 12px rgba(0,0,0,0.3);
    `;
    fab.onclick = openReportModal;
    document.documentElement.appendChild(fab);
  }

  // ---- Disclaimer screen shown when user taps "Continue anyway" ----
  function showDisclaimer(category, onConfirm) {
    const msgKey = disclaimerKeyMap[category] || 'disclaimerPhishing';
    const imageHtml = disclaimerImageUrl
      ? `<img src="${disclaimerImageUrl}" onerror="this.outerHTML='<div style=\\'font-size:48px;margin-bottom:8px;\\'>⚠️</div>'" style="width:64px;height:64px;object-fit:contain;margin-bottom:8px;border-radius:12px;">`
      : `<div style="font-size:48px;margin-bottom:8px;">⚠️</div>`;

    const overlay = document.createElement('div');
    overlay.id = 'sg-disclaimer';
    overlay.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    overlay.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:linear-gradient(160deg, #1a1a1a 0%, #3a1a1a 100%);
      color:white;z-index:2147483647;
      display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
      font-family:-apple-system,'Segoe UI',Roboto,sans-serif;text-align:center;
      padding:40px 24px;overflow-y:auto;box-sizing:border-box;
    `;
    overlay.innerHTML = `
      <div id="sg-disclaimer-topbar-slot" style="width:100%;max-width:280px;"></div>
      ${imageHtml}
      <h1 style="font-size:20px;margin:0 0 12px;">${t('disclaimerTitle')}</h1>
      <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);
                  border-radius:12px;padding:16px 20px;max-width:340px;margin:12px 0 24px;">
        <p style="margin:0;font-size:15px;line-height:1.6;color:#f0e8e8;">
          ${t(msgKey)}
        </p>
      </div>
      <button id="sg-disc-leave" style="width:100%;max-width:280px;padding:13px;margin-bottom:10px;background:#e53935;
              color:white;border:none;border-radius:10px;font-weight:600;font-size:15px;">${t('disclaimerLeaveBtn')}</button>
      <button id="sg-disc-ok" style="width:100%;max-width:280px;padding:11px;margin-bottom:20px;background:transparent;color:#f0e8e8;
              border:1px solid rgba(255,255,255,0.3);border-radius:10px;font-size:14px;">${t('disclaimerOkBtn')}</button>
    `;
    document.documentElement.appendChild(overlay);
    attachTopBar(document.getElementById('sg-disclaimer-topbar-slot'), true);

    document.getElementById('sg-disc-leave').onclick = () => {
      window.location.href = 'https://www.google.com';
    };
    document.getElementById('sg-disc-ok').onclick = () => {
      overlay.remove();
      onConfirm();
    };
  }

  function renderUI(detectedCategory, flags, isUnknown) {
    ensureFabButton();

    if (isUnknown) showUnknownBanner();

    if (detectedCategory) {
      const style = categoryColors[detectedCategory];
      const flagTexts = flags.map(f => t(f.key, f.params));
      const imageHtml = warningImageUrl
        ? `<img src="${warningImageUrl}" onerror="this.outerHTML='<div style=\\'font-size:48px;margin-bottom:8px;\\'>${style.icon}</div>'" style="width:64px;height:64px;object-fit:contain;margin-bottom:8px;border-radius:12px;">`
        : `<div style="font-size:48px;margin-bottom:8px;">${style.icon}</div>`;

      let userDismissed = false;

      function buildOverlay() {
        if (userDismissed) return;
        if (document.getElementById('sg-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'sg-overlay';
        overlay.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        overlay.style.cssText = `
          position:fixed;top:0;left:0;width:100%;height:100%;
          background:linear-gradient(160deg, #0f1420 0%, ${style.color} 100%);
          color:white;z-index:2147483647;
          display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
          font-family:-apple-system,'Segoe UI',Roboto,sans-serif;text-align:center;
          padding:40px 24px;overflow-y:auto;box-sizing:border-box;
        `;
        overlay.innerHTML = `
          <div id="sg-overlay-topbar-slot" style="width:100%;max-width:280px;"></div>
          ${imageHtml}
          <h1 style="font-size:22px;margin:0 0 8px;">${t(titleKeyMap[detectedCategory])}</h1>
          <div style="background:rgba(255,255,255,0.08);border:1px solid ${style.accent}66;
                      border-radius:12px;padding:16px 20px;max-width:340px;margin:12px 0;">
            <p style="margin:0;font-size:15px;line-height:1.6;color:#e8f0fb;">
              ${flagTexts.join('<br>')}
            </p>
          </div>
          <p style="font-size:13px;color:#a8c8ea;margin:0 0 20px;word-break:break-all;">${host}</p>
          <button id="sg-leave" style="width:100%;max-width:280px;padding:13px;margin-bottom:10px;background:${style.accent};
                  color:white;border:none;border-radius:10px;font-weight:600;font-size:15px;">${t('leaveBtn')}</button>
          <button id="sg-continue" style="width:100%;max-width:280px;padding:11px;margin-bottom:10px;background:transparent;color:#a8c8ea;
                  border:1px solid rgba(168,200,234,0.4);border-radius:10px;font-size:14px;">
            ${t('continueBtn')}
          </button>
          <button id="sg-report-btn" style="width:100%;max-width:280px;padding:11px;margin-bottom:20px;background:transparent;
                  color:#a8c8ea;border:1px solid rgba(168,200,234,0.4);border-radius:10px;font-size:14px;">
            ${t('reportBtn')}
          </button>
        `;
        document.documentElement.appendChild(overlay);
        attachTopBar(document.getElementById('sg-overlay-topbar-slot'), true);

        document.getElementById('sg-leave').onclick = () => { window.location.href = 'https://www.google.com'; };
        document.getElementById('sg-continue').onclick = () => {
          showDisclaimer(detectedCategory, () => {
            userDismissed = true;
            overlay.remove();
          });
        };
        document.getElementById('sg-report-btn').onclick = () => openReportModal();
      }

      buildOverlay();

      const watchdog = new MutationObserver(() => {
        if (!userDismissed && !document.getElementById('sg-overlay')) {
          buildOverlay();
        }
      });
      watchdog.observe(document.documentElement, { childList: true, subtree: false });

      const watchdogInterval = setInterval(() => {
        if (userDismissed) { clearInterval(watchdogInterval); return; }
        if (!document.getElementById('sg-overlay')) buildOverlay();
      }, 800);
    }
  }

  const instantResult = instantCheck();
  if (instantResult.detectedCategory) {
    alreadyRendered = true;
    renderUI(instantResult.detectedCategory, instantResult.flags, false);
  }

  let adultSetResult = null;
  let phishSetResult = null;

  function tryRunOnlineCheck() {
    if (adultSetResult === null || phishSetResult === null) return;
    if (alreadyRendered) return;

    let detectedCategory = null;
    let flags = [];

    if (matchesSet(phishSetResult)) {
      detectedCategory = 'phishing';
      flags.push({ key: 'flagURLhaus' });
    }
    if (!detectedCategory && matchesSet(adultSetResult)) {
      detectedCategory = 'adult';
      flags.push({ key: 'flagAdultOnline' });
    }

    const isUnknown = !detectedCategory && !isTrusted;

    if (detectedCategory) {
      alreadyRendered = true;
      renderUI(detectedCategory, flags, false);
    } else if (isUnknown) {
      renderUI(null, [], true);
    } else {
      ensureFabButton();
    }
  }

  loadHostsList(adultListUrl, ADULT_CACHE_KEY, ADULT_CACHE_TIME_KEY, (set) => {
    adultSetResult = set;
    tryRunOnlineCheck();
  });

  loadHostsList(phishingListUrl, PHISH_CACHE_KEY, PHISH_CACHE_TIME_KEY, (set) => {
    phishSetResult = set;
    tryRunOnlineCheck();
  });
})();