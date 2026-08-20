// ==UserScript==
// @name         ScamGuard Lite
// @namespace    https://viayoo.com/
// @version      9.0
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
  const disclaimerImageUrl = 'https://i.postimg.cc/W4WVbq2L/Photoroom-20260723-124401.png';

  // ============================================
  //  SUPPORT / DONATION LINK
  //  Paste your Linkvertise / LootLabs / Ko-fi link here
  // ============================================
  const SUPPORT_LINK_URL = 'https://sub4unlock.com/S/r4bgr';

  // ============================================
  //  DISCORD WEBHOOK URL
  // ============================================
  const webhookUrl = 'https://discord.com/api/webhooks/1529255203595878430/Sfl-UVmfYYbbQZJtwQvR0Tf272gpEAKHJ1Jz4PAXFVUf8aq7UcBXKjVjq2FVURPJUDXv';

  // ============================================
  //  LAST LINK — the destination page shown after completing your
  //  Linkvertise/LootLabs task. When the user lands on this exact URL,
  //  ScamGuard shows a screen asking for their Discord User ID.
  // ============================================
  const LAST_LINK_URL = 'https://i.postimg.cc/c1TqBnqW/images-(1).jpg';

  // ============================================
  //  USER ID WEBHOOK — separate webhook that only receives submitted
  //  Discord User IDs from the "last link" screen above.
  // ============================================
  const userIdWebhookUrl = 'https://discord.com/api/webhooks/1529810880173314061/BozXvpkS3N0EDW3Sce0JzXjz5mGyrqZZoQ-0t2qZecua1r9xD2P5EU6nGtiga1sg35sZ';

  // ============================================
  //  ADMIN PANEL — now verified by your Discord bot, not this script.
  //  Paste the URL where your scamguard-bot is hosted (Bot-Hosting.net).
  // ============================================
  const ADMIN_API_URL = 'http://fi5.bot-hosting.net:21119';

  // ============================================
  //  ALLOWED DEVICES — only devices whose auto-generated
  //  ID is listed here will ever see the PIN screen.
  //  Everyone else tapping 5x just gets the normal report modal.
  //  To find your own device's ID: temporarily add '*' below, tap 5x,
  //  read the ID(XXXXXX) shown, then replace '*' with that ID.
  // ============================================
  const ALLOWED_DEVICE_IDS = ['689167'];

  // GitHub raw URL used by the "Refresh Lists Now" button
  const RAW_SCRIPT_URL = 'https://raw.githubusercontent.com/mouziali75-cpu/scamguard/main/scamguard.user.js';

  // Webhook that logs every domain you add via the Admin Panel,
  // so you remember to copy it into the GitHub source lists later.
  const adminWebhookUrl = 'https://discord.com/api/webhooks/1530337337735643378/wOVbDO6Pvio4k3_H1PMkoxr1PmPZgzCf1Lo43d8dHdowCsuQ7knrZbZtr03BLVjwyM0f';

  // Optional: sends a usage summary to this webhook roughly every 7 days
  // (based on this device's local activity only — not global stats).
  const statsWebhookUrl = 'https://discord.com/api/webhooks/1530337590488858804/54TfO9qLEKslu-F_TtXeWyxsKvgnYHWbFAvPz509NVywlw9lbqmmtWuxnqG2y5VYx9bL';

  // ============================================
  //  DANGEROUS FILE EXTENSIONS — flags links pointing to risky downloads
  // ============================================
  const dangerousExtensions = ['.exe', '.scr', '.bat', '.cmd', '.msi', '.jar', '.vbs', '.apk', '.ps1', '.com.exe'];

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

  // ---- Levenshtein distance (for typosquat / look-alike domain detection) ----
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[m][n];
  }

  // Well-known names to compare against for look-alike detection
  const wellKnownNames = [
    'discord', 'roblox', 'steam', 'google', 'paypal', 'instagram',
    'facebook', 'youtube', 'netflix', 'microsoft', 'apple', 'amazon',
    'whatsapp', 'telegram', 'twitter', 'tiktok'
  ];

  function checkLookAlike(hostname) {
    // Take the main label of the domain (e.g. "robl0x" from "robl0x.com")
    const parts = hostname.split('.');
    if (parts.length < 2) return null;
    const mainLabel = parts[parts.length - 2];
    if (!mainLabel || mainLabel.length < 3) return null;

    for (const brand of wellKnownNames) {
      if (mainLabel === brand) continue; // exact match handled elsewhere (trusted list)
      const dist = levenshtein(mainLabel, brand);
      if (dist > 0 && dist <= 2 && Math.abs(mainLabel.length - brand.length) <= 2) {
        return brand;
      }
    }
    return null;
  }

  // ---- Admin-added domains (stored locally, merged with hardcoded lists) ----
  function getAdminDomains(category) {
    try {
      const raw = localStorage.getItem('sg_admin_' + category);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function addAdminDomain(category, domain) {
    const list = getAdminDomains(category);
    if (!list.includes(domain)) {
      list.push(domain);
      try { localStorage.setItem('sg_admin_' + category, JSON.stringify(list)); } catch (e) {}
    }
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
      flagLookAlike: 'Domain closely resembles "{brand}" (possible typosquat)',
      flagDangerousFile: 'Link points to a potentially dangerous file type',
      adminPinTitle: 'Admin Access', adminPinPlaceholder: 'Enter PIN',
      adminPinSubmit: 'Unlock', adminPinWrong: 'Incorrect PIN.',
      adminPanelTitle: 'Admin Panel', adminCategoryLabel: 'Category',
      adminDomainPlaceholder: 'e.g. fake-site.com', adminAddBtn: 'Add Domain',
      adminAdded: 'Domain added and logged.',
      adminImportLabel: 'Import from .txt file (one domain per line)',
      adminImportBtn: 'Import File', adminImported: '{count} domains imported.',
      closeBtn: 'Close',
      refreshTooltip: 'Refresh lists now',
      refreshDone: 'Lists updated: {phishing} phishing, {adult} adult, {unwanted} unwanted.',
      refreshFailed: 'Could not refresh lists. Check your connection.',
      adminRemoveBtn: 'Remove Domain', adminRemoved: 'Domain removed.',
      adminRemoveNotFound: 'That domain was not found in the list.',
      langModalTitle: 'Choose your language',
      langOptionEn: 'English', langOptionAr: 'العربية', langOptionFr: 'Français',
      supportIdTitle: 'One last step',
      supportIdSubtitle: 'Enter your Discord User ID to confirm you completed the task.',
      supportIdPlaceholder: 'e.g. 123456789012345678',
      supportIdSubmit: 'Submit',
      supportIdThankYou: 'Thank you! Your ID has been submitted.',
      supportIdInvalid: 'Please enter a valid Discord User ID (numbers only).',
      reportIdTitle: 'Your Discord User ID',
      reportIdSubtitle: 'So we can credit you for this report.',
      reportIdPlaceholder: 'e.g. 123456789012345678',
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
      flagLookAlike: 'الدومين يشبه كتير "{brand}" (احتمال تقليد)',
      flagDangerousFile: 'الرابط يوجه لملف قد يكون خطيراً',
      adminPinTitle: 'دخول الأدمن', adminPinPlaceholder: 'أدخل الرمز السري',
      adminPinSubmit: 'فتح', adminPinWrong: 'الرمز السري خاطئ.',
      adminPanelTitle: 'لوحة الأدمن', adminCategoryLabel: 'الفئة',
      adminDomainPlaceholder: 'مثلاً fake-site.com', adminAddBtn: 'إضافة الدومين',
      adminAdded: 'تمت إضافة الدومين وتسجيله.',
      adminImportLabel: 'استيراد من ملف .txt (دومين بكل سطر)',
      adminImportBtn: 'استيراد الملف', adminImported: 'تم استيراد {count} دومين.',
      closeBtn: 'إغلاق',
      refreshTooltip: 'تحديث القوائم الآن',
      refreshDone: 'تم التحديث: {phishing} نصب، {adult} بالغين، {unwanted} غير مرغوب.',
      refreshFailed: 'تعذر تحديث القوائم. تأكد من الاتصال.',
      adminRemoveBtn: 'حذف الدومين', adminRemoved: 'تم حذف الدومين.',
      adminRemoveNotFound: 'الدومين غير موجود بالقائمة.',
      langModalTitle: 'اختر اللغة',
      langOptionEn: 'English', langOptionAr: 'العربية', langOptionFr: 'Français',
      supportIdTitle: 'خطوة أخيرة',
      supportIdSubtitle: 'أدخل الـ Discord User ID الخاص فيك لتأكيد إتمام المهمة.',
      supportIdPlaceholder: 'مثلاً 123456789012345678',
      supportIdSubmit: 'إرسال',
      supportIdThankYou: 'شكراً! تم إرسال الآيدي تبعك بنجاح.',
      supportIdInvalid: 'الرجاء إدخال Discord User ID صحيح (أرقام فقط).',
      reportIdTitle: 'الـ Discord User ID الخاص فيك',
      reportIdSubtitle: 'حتى نقدر ننسب لك هالبلاغ.',
      reportIdPlaceholder: 'مثلاً 123456789012345678',
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
      flagLookAlike: 'Le domaine ressemble beaucoup à "{brand}" (possible imitation)',
      flagDangerousFile: 'Le lien pointe vers un type de fichier potentiellement dangereux',
      adminPinTitle: 'Accès admin', adminPinPlaceholder: 'Entrez le code',
      adminPinSubmit: 'Déverrouiller', adminPinWrong: 'Code incorrect.',
      adminPanelTitle: 'Panneau admin', adminCategoryLabel: 'Catégorie',
      adminDomainPlaceholder: 'ex. fake-site.com', adminAddBtn: 'Ajouter le domaine',
      adminAdded: 'Domaine ajouté et enregistré.',
      adminImportLabel: 'Importer un fichier .txt (un domaine par ligne)',
      adminImportBtn: 'Importer le fichier', adminImported: '{count} domaines importés.',
      closeBtn: 'Fermer',
      refreshTooltip: 'Actualiser les listes',
      refreshDone: 'Listes mises à jour : {phishing} phishing, {adult} adultes, {unwanted} indésirables.',
      refreshFailed: 'Impossible de mettre à jour les listes. Vérifiez votre connexion.',
      adminRemoveBtn: 'Supprimer le domaine', adminRemoved: 'Domaine supprimé.',
      adminRemoveNotFound: "Ce domaine n'a pas été trouvé dans la liste.",
      langModalTitle: 'Choisissez votre langue',
      langOptionEn: 'English', langOptionAr: 'العربية', langOptionFr: 'Français',
      supportIdTitle: 'Dernière étape',
      supportIdSubtitle: 'Entrez votre Discord User ID pour confirmer que vous avez terminé la tâche.',
      supportIdPlaceholder: 'ex. 123456789012345678',
      supportIdSubmit: 'Envoyer',
      supportIdThankYou: 'Merci ! Votre ID a bien été envoyé.',
      supportIdInvalid: 'Veuillez entrer un Discord User ID valide (chiffres uniquement).',
      reportIdTitle: 'Votre Discord User ID',
      reportIdSubtitle: 'Pour que nous puissions vous créditer ce signalement.',
      reportIdPlaceholder: 'ex. 123456789012345678',
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

  function setLangAndReload(lang) {
    try { localStorage.setItem('sg_lang', lang); } catch (e) {}
    location.reload();
  }

  function openLangModal() {
    const modal = document.createElement('div');
    modal.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    modal.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.65);z-index:2147483647;
      display:flex;align-items:center;justify-content:center;
      font-family:-apple-system,'Segoe UI',Roboto,sans-serif;
      overflow-y:auto;box-sizing:border-box;padding:20px 0;
    `;
    const box = document.createElement('div');
    box.style.cssText = `
      background:#16233b;border-radius:16px;padding:24px;width:85%;max-width:300px;
      border:1px solid rgba(100,181,246,0.3);margin:auto;
    `;
    box.innerHTML = `
      <h3 style="color:white;margin:0 0 16px;font-size:16px;text-align:center;">${t('langModalTitle')}</h3>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:8px;">
        <button data-lang="en" style="padding:12px;background:${currentLang==='en'?'#2196f3':'rgba(255,255,255,0.08)'};color:white;border:1px solid rgba(100,181,246,0.3);border-radius:8px;font-size:14px;">🌐 ${t('langOptionEn')}</button>
        <button data-lang="ar" style="padding:12px;background:${currentLang==='ar'?'#2196f3':'rgba(255,255,255,0.08)'};color:white;border:1px solid rgba(100,181,246,0.3);border-radius:8px;font-size:14px;">🌐 ${t('langOptionAr')}</button>
        <button data-lang="fr" style="padding:12px;background:${currentLang==='fr'?'#2196f3':'rgba(255,255,255,0.08)'};color:white;border:1px solid rgba(100,181,246,0.3);border-radius:8px;font-size:14px;">🌐 ${t('langOptionFr')}</button>
      </div>
    `;
    modal.appendChild(box);
    document.documentElement.appendChild(modal);
    box.querySelectorAll('button[data-lang]').forEach(btn => {
      btn.onclick = () => setLangAndReload(btn.dataset.lang);
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
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
    langBtn.onclick = () => openLangModal();
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

    const allPhishingDomains = phishingDomains.concat(getAdminDomains('phishing'));
    const allAdultDomains = manualAdultDomains.concat(getAdminDomains('adult'));
    const allUnwantedDomains = unwantedDomains.concat(getAdminDomains('unwanted'));

    if (matches(allPhishingDomains)) { detectedCategory = 'phishing'; flags.push({ key: 'flagPhishingList' }); }
    if (host.includes('xn--')) { detectedCategory = detectedCategory || 'phishing'; flags.push({ key: 'flagPunycode' }); }
    if (suspiciousTLDs.some(tld => host.endsWith(tld))) { detectedCategory = detectedCategory || 'phishing'; flags.push({ key: 'flagTLD' }); }
    if (phishKeywords.some(k => fullUrl.includes(k))) { detectedCategory = detectedCategory || 'phishing'; flags.push({ key: 'flagKeyword' }); }
    knownBrands.forEach(brand => {
      if (host.includes(brand) && !host.endsWith(brand + '.com') && !host.endsWith(brand + '.gg')) {
        detectedCategory = detectedCategory || 'phishing';
        flags.push({ key: 'flagBrand', params: { brand } });
      }
    });
    if (!isTrustedGlobal) {
      const lookAlikeBrand = checkLookAlike(host);
      if (lookAlikeBrand) {
        detectedCategory = detectedCategory || 'phishing';
        flags.push({ key: 'flagLookAlike', params: { brand: lookAlikeBrand } });
      }
    }
    if (dangerousExtensions.some(ext => fullUrl.split('?')[0].endsWith(ext))) {
      detectedCategory = detectedCategory || 'phishing';
      flags.push({ key: 'flagDangerousFile' });
    }
    if (!detectedCategory && matches(allAdultDomains)) {
      detectedCategory = 'adult';
      flags.push({ key: 'flagAdultManual' });
    }
    if (!detectedCategory && matches(allUnwantedDomains)) {
      detectedCategory = 'unwanted';
      flags.push({ key: 'flagUnwanted' });
    }

    return { detectedCategory, flags };
  }

  const isTrustedGlobal = matches(trustedDomains);
  const isTrusted = isTrustedGlobal;

  // ---- Local usage stats (per-device only) + weekly summary ----
  function bumpStat(key) {
    try {
      const current = parseInt(localStorage.getItem(key) || '0');
      localStorage.setItem(key, (current + 1).toString());
    } catch (e) {}
  }

  function maybeSendWeeklyStats() {
    if (!statsWebhookUrl || statsWebhookUrl.includes('PASTE_YOUR')) return;
    try {
      const lastPost = parseInt(localStorage.getItem('sg_stats_last_post') || '0');
      const weekMs = 1000 * 60 * 60 * 24 * 7;
      if (Date.now() - lastPost < weekMs) return;

      const detections = parseInt(localStorage.getItem('sg_stats_detections') || '0');
      const reports = parseInt(localStorage.getItem('sg_stats_reports') || '0');

      fetch(statsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '📊 Weekly ScamGuard Stats (this device)',
            color: 3901635,
            fields: [
              { name: 'Sites detected', value: String(detections), inline: true },
              { name: 'Reports submitted', value: String(reports), inline: true }
            ],
            timestamp: new Date().toISOString()
          }]
        })
      }).catch(() => {});

      localStorage.setItem('sg_stats_detections', '0');
      localStorage.setItem('sg_stats_reports', '0');
      localStorage.setItem('sg_stats_last_post', Date.now().toString());
    } catch (e) {}
  }

  // ---- Reporter trust (tracked locally by submitted Discord ID) ----
  function getReportCountForId(discordId) {
    try {
      return parseInt(localStorage.getItem('sg_reporter_' + discordId) || '0');
    } catch (e) { return 0; }
  }

  function bumpReportCountForId(discordId) {
    try {
      const count = getReportCountForId(discordId) + 1;
      localStorage.setItem('sg_reporter_' + discordId, count.toString());
      return count;
    } catch (e) { return 1; }
  }
  let alreadyRendered = false;

  function sendReport(url, category, note, discordId) {
    if (!webhookUrl || webhookUrl.includes('PASTE_YOUR')) {
      alert('Webhook not configured yet.');
      return;
    }
    const colorMap = { phishing: 2201331, adult: 15158332, unwanted: 16098851, safe: 5025616 };
    const catLabelMapEn = {
      phishing: '🛡️ Phishing / Scam',
      adult: '🔞 Adult Content',
      unwanted: '⚠️ Unwanted / Spam',
      safe: '✅ Well-known / Safe Site'
    };
    const fields = [
      { name: 'Category', value: catLabelMapEn[category] },
      { name: 'URL / Domain', value: url },
      { name: 'Description', value: note || 'No description provided' }
    ];
    if (discordId) {
      const reportCount = bumpReportCountForId(discordId);
      let reporterLine = `<@${discordId}>`;
      if (reportCount >= 3) reporterLine += `  🌟 Trusted Reporter (${reportCount} reports)`;
      fields.push({ name: 'Reported by', value: reporterLine });
    }
    bumpStat('sg_stats_reports');
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: category === 'safe' ? '✅ Suggested Trusted Domain' : '🚩 New Site Report',
          color: colorMap[category] || 15158332,
          fields: fields,
          timestamp: new Date().toISOString()
        }]
      })
    }).then(() => alert('Report sent, thank you!'))
      .catch(() => alert('Failed to send report.'));
  }

  function sendUserId(discordId) {
    if (!userIdWebhookUrl || userIdWebhookUrl.includes('PASTE_YOUR')) {
      alert('User ID webhook not configured yet.');
      return Promise.reject();
    }
    return fetch(userIdWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '✅ تم اتمام المهام من قبل',
          description: `<@${discordId}>`,
          color: 5025616,
          footer: { text: `User ID: ${discordId}` },
          timestamp: new Date().toISOString()
        }]
      })
    });
  }

  function showUserIdPrompt() {
    const overlay = document.createElement('div');
    overlay.id = 'sg-userid-overlay';
    overlay.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    overlay.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:linear-gradient(160deg, #0f1420 0%, #1b3a2e 100%);
      color:white;z-index:2147483647;
      display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
      font-family:-apple-system,'Segoe UI',Roboto,sans-serif;text-align:center;
      padding:40px 24px;overflow-y:auto;box-sizing:border-box;
    `;
    overlay.innerHTML = `
      <div id="sg-userid-topbar-slot" style="width:100%;max-width:300px;"></div>
      <div style="font-size:44px;margin-bottom:8px;">🎉</div>
      <h1 style="font-size:20px;margin:0 0 8px;">${t('supportIdTitle')}</h1>
      <p style="font-size:14px;color:#a8e8c8;margin:0 0 20px;max-width:300px;">${t('supportIdSubtitle')}</p>
      <input id="sg-userid-input" type="text" inputmode="numeric" placeholder="${t('supportIdPlaceholder')}"
        style="width:100%;max-width:300px;box-sizing:border-box;padding:12px;border-radius:8px;
               background:rgba(255,255,255,0.08);border:1px solid rgba(100,181,246,0.3);
               color:white;font-size:15px;margin-bottom:14px;text-align:center;">
      <button id="sg-userid-submit" style="width:100%;max-width:300px;padding:13px;background:#4caf50;
              color:white;border:none;border-radius:10px;font-weight:600;font-size:15px;">
        ${t('supportIdSubmit')}
      </button>
    `;
    document.documentElement.appendChild(overlay);
    attachTopBar(document.getElementById('sg-userid-topbar-slot'), false);

    document.getElementById('sg-userid-submit').onclick = () => {
      const idValue = document.getElementById('sg-userid-input').value.trim();
      if (!/^\d{15,25}$/.test(idValue)) {
        alert(t('supportIdInvalid'));
        return;
      }
      sendUserId(idValue).then(() => {
        overlay.innerHTML = `
          <div style="font-size:48px;margin-top:120px;">✅</div>
          <p style="font-size:16px;color:#a8e8c8;margin-top:12px;">${t('supportIdThankYou')}</p>
        `;
      }).catch(() => {
        alert('Failed to send. Please try again.');
      });
    };
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
      showStepReportId(category, url, note);
    };
    document.getElementById('sg-back').onclick = () => {
      modal.remove();
      showStepUrl(category);
    };
  }

  function showStepReportId(category, url, note) {
    const modal = showModal(`
      <h3 style="color:white;margin:0 0 4px;font-size:17px;">${t('reportIdTitle')}</h3>
      <p style="color:#7fa8d9;font-size:13px;margin:0 0 16px;">${t('reportIdSubtitle')}</p>
      <input id="sg-report-id" type="text" inputmode="numeric" placeholder="${t('reportIdPlaceholder')}"
        style="width:100%;box-sizing:border-box;padding:10px;border-radius:8px;
               background:rgba(255,255,255,0.08);border:1px solid rgba(100,181,246,0.3);
               color:white;font-size:13px;margin-bottom:16px;text-align:center;">
      <button id="sg-report-id-submit" style="width:100%;padding:12px;background:#4caf50;color:white;
              border:none;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:8px;">
        ${t('submitBtn')}
      </button>
      <button id="sg-back" style="width:100%;padding:10px;background:transparent;color:#a8c8ea;
              border:1px solid rgba(168,200,234,0.4);border-radius:8px;">${t('backBtn')}</button>
    `, true);
    document.getElementById('sg-report-id-submit').onclick = () => {
      const idValue = document.getElementById('sg-report-id').value.trim();
      if (!/^\d{15,25}$/.test(idValue)) {
        alert(t('supportIdInvalid'));
        return;
      }
      modal.remove();
      sendReport(url, category, note, idValue);
    };
    document.getElementById('sg-back').onclick = () => {
      modal.remove();
      showStepDescription(category, url);
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
    document.getElementById('sg-unk-lang').onclick = () => openLangModal();
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

  function syncDomainToGithub(category, domain) {
    if (!ADMIN_API_URL || ADMIN_API_URL.includes('PASTE_YOUR')) return;
    fetch(`${ADMIN_API_URL}/admin-add-domain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, domain })
    }).catch(() => {});
  }

  function syncBulkToGithub(category, domains) {
    if (!ADMIN_API_URL || ADMIN_API_URL.includes('PASTE_YOUR')) return;
    fetch(`${ADMIN_API_URL}/admin-bulk-add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, domains })
    }).catch(() => {});
  }

  function syncRemoveDomainFromGithub(category, domain) {
    if (!ADMIN_API_URL || ADMIN_API_URL.includes('PASTE_YOUR')) return Promise.resolve({ status: 'skipped' });
    return fetch(`${ADMIN_API_URL}/admin-remove-domain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, domain })
    }).then(r => r.json()).catch(() => ({ status: 'error' }));
  }

  function removeAdminDomainLocal(category, domain) {
    const list = getAdminDomains(category).filter(d => d !== domain);
    try { localStorage.setItem('sg_admin_' + category, JSON.stringify(list)); } catch (e) {}
  }

  function sendAdminLog(category, domain) {
    if (!adminWebhookUrl || adminWebhookUrl.includes('PASTE_YOUR')) return;
    fetch(adminWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '🛠️ Admin Domain Added',
          color: 10181046,
          fields: [
            { name: 'Category', value: category },
            { name: 'Domain', value: domain }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    }).catch(() => {});
  }

  function openAdminPanel() {
    const modal = showModal(`
      <h3 style="color:white;margin:0 0 16px;font-size:17px;">${t('adminPanelTitle')}</h3>

      <p style="color:#7fa8d9;font-size:13px;margin:0 0 6px;">${t('adminCategoryLabel')}</p>
      <select id="sg-admin-cat" style="width:100%;box-sizing:border-box;padding:10px;border-radius:8px;
              background:rgba(255,255,255,0.08);border:1px solid rgba(100,181,246,0.3);
              color:white;font-size:13px;margin-bottom:12px;">
        <option value="phishing" style="color:black;">🛡️ Phishing / Scam</option>
        <option value="adult" style="color:black;">🔞 Adult Content</option>
        <option value="unwanted" style="color:black;">⚠️ Unwanted / Spam</option>
      </select>

      <input id="sg-admin-domain" type="text" placeholder="${t('adminDomainPlaceholder')}"
        style="width:100%;box-sizing:border-box;padding:10px;border-radius:8px;
               background:rgba(255,255,255,0.08);border:1px solid rgba(100,181,246,0.3);
               color:white;font-size:13px;margin-bottom:10px;">
      <button id="sg-admin-add" style="width:100%;padding:12px;background:#4caf50;color:white;
              border:none;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:20px;">
        ${t('adminAddBtn')}
      </button>

      <p style="color:#7fa8d9;font-size:12px;margin:0 0 8px;">${t('adminImportLabel')}</p>
      <input id="sg-admin-file" type="file" accept=".txt"
        style="width:100%;color:#cfe4ff;font-size:12px;margin-bottom:10px;">
      <button id="sg-admin-import" style="width:100%;padding:11px;background:#2196f3;color:white;
              border:none;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:20px;">
        ${t('adminImportBtn')}
      </button>

      <div style="border-top:1px solid rgba(168,200,234,0.2);margin:0 0 16px;"></div>

      <input id="sg-admin-remove-domain" type="text" placeholder="${t('adminDomainPlaceholder')}"
        style="width:100%;box-sizing:border-box;padding:10px;border-radius:8px;
               background:rgba(255,255,255,0.08);border:1px solid rgba(229,57,53,0.4);
               color:white;font-size:13px;margin-bottom:10px;">
      <button id="sg-admin-remove" style="width:100%;padding:11px;background:#e53935;color:white;
              border:none;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:16px;">
        🗑️ ${t('adminRemoveBtn')}
      </button>

      <button id="sg-admin-close" style="width:100%;padding:10px;background:transparent;color:#a8c8ea;
              border:1px solid rgba(168,200,234,0.4);border-radius:8px;">${t('closeBtn')}</button>
    `, true);

    document.getElementById('sg-admin-add').onclick = () => {
      const cat = document.getElementById('sg-admin-cat').value;
      const domain = document.getElementById('sg-admin-domain').value.trim().toLowerCase();
      if (!domain) return;
      addAdminDomain(cat, domain);
      sendAdminLog(cat, domain);
      syncDomainToGithub(cat, domain);
      alert(t('adminAdded'));
      document.getElementById('sg-admin-domain').value = '';
    };

    document.getElementById('sg-admin-import').onclick = () => {
      const cat = document.getElementById('sg-admin-cat').value;
      const fileInput = document.getElementById('sg-admin-file');
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const lines = String(reader.result).split('\n')
          .map(l => l.trim().toLowerCase())
          .filter(Boolean);
        lines.forEach(d => addAdminDomain(cat, d));
        sendAdminLog(cat, `(bulk import: ${lines.length} domains)`);
        syncBulkToGithub(cat, lines);
        alert(t('adminImported', { count: lines.length }));
      };
      reader.readAsText(file);
    };

    document.getElementById('sg-admin-remove').onclick = () => {
      const cat = document.getElementById('sg-admin-cat').value;
      const domain = document.getElementById('sg-admin-remove-domain').value.trim().toLowerCase();
      if (!domain) return;
      removeAdminDomainLocal(cat, domain);
      syncRemoveDomainFromGithub(cat, domain).then(result => {
        if (result.status === 'not_found') {
          alert(t('adminRemoveNotFound'));
        } else {
          alert(t('adminRemoved'));
        }
      });
      document.getElementById('sg-admin-remove-domain').value = '';
    };

    document.getElementById('sg-admin-close').onclick = () => modal.remove();
  }

  function sendAdminAccessLog() { /* now handled entirely by the bot */ }

  function pollAdminStatus(requestId, modal, statusEl) {
    let attempts = 0;
    const maxAttempts = 150; // ~5 minutes at 2s interval
    const interval = setInterval(() => {
      attempts++;
      fetch(`${ADMIN_API_URL}/admin-status/${requestId}`)
        .then(r => r.json())
        .then(data => {
          if (data.status === 'accepted') {
            clearInterval(interval);
            modal.remove();
            openAdminPanel();
          } else if (data.status === 'denied') {
            clearInterval(interval);
            statusEl.textContent = t('adminPinWrong');
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            statusEl.textContent = 'Request timed out. Please try again.';
          }
        })
        .catch(() => {
          if (attempts >= maxAttempts) clearInterval(interval);
        });
    }, 2000);
  }

  function extractArrayFromSource(sourceText, varName) {
    const regex = new RegExp(`const ${varName} = \\[([\\s\\S]*?)\\n\\s*\\];`);
    const m = sourceText.match(regex);
    if (!m) return [];
    const matches = [...m[1].matchAll(/['"\`]([^'"\`]+)['"\`]/g)];
    return matches.map(x => x[1]);
  }

  function refreshListsFromGithub() {
    return fetch(RAW_SCRIPT_URL + '?t=' + Date.now())
      .then(r => r.text())
      .then(text => {
        const remotePhishing = extractArrayFromSource(text, 'phishingDomains');
        const remoteAdult = extractArrayFromSource(text, 'manualAdultDomains');
        const remoteUnwanted = extractArrayFromSource(text, 'unwantedDomains');
        try {
          localStorage.setItem('sg_admin_phishing', JSON.stringify(remotePhishing));
          localStorage.setItem('sg_admin_adult', JSON.stringify(remoteAdult));
          localStorage.setItem('sg_admin_unwanted', JSON.stringify(remoteUnwanted));
        } catch (e) {}
        return {
          phishing: remotePhishing.length,
          adult: remoteAdult.length,
          unwanted: remoteUnwanted.length,
        };
      });
  }

  function getDeviceId() {
    try {
      let id = localStorage.getItem('sg_device_id');
      if (!id) {
        id = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit ID
        localStorage.setItem('sg_device_id', id);
      }
      return id;
    } catch (e) {
      return '000000';
    }
  }

  function openAdminGate() {
    if (!ADMIN_API_URL || ADMIN_API_URL.includes('PASTE_YOUR')) {
      alert('Admin bot not configured yet.');
      return;
    }
    const deviceId = getDeviceId();
    const modal = showModal(`
      <h3 style="color:white;margin:0 0 4px;font-size:17px;">${t('adminPinTitle')}</h3>
      <p style="color:#7fa8d9;font-size:12px;margin:0 0 16px;">ID(${deviceId})</p>
      <input id="sg-admin-pin" type="password" inputmode="numeric" placeholder="${t('adminPinPlaceholder')}"
        style="width:100%;box-sizing:border-box;padding:10px;border-radius:8px;
               background:rgba(255,255,255,0.08);border:1px solid rgba(100,181,246,0.3);
               color:white;font-size:13px;margin-bottom:16px;text-align:center;">
      <button id="sg-admin-unlock" style="width:100%;padding:12px;background:#2196f3;color:white;
              border:none;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:8px;">
        ${t('adminPinSubmit')}
      </button>
      <button id="sg-admin-cancel" style="width:100%;padding:10px;background:transparent;color:#a8c8ea;
              border:1px solid rgba(168,200,234,0.4);border-radius:8px;margin-bottom:8px;">${t('cancelBtn')}</button>
      <p id="sg-admin-status" style="color:#a8c8ea;font-size:12px;text-align:center;margin:0;"></p>
    `, false);

    document.getElementById('sg-admin-unlock').onclick = () => {
      const pin = document.getElementById('sg-admin-pin').value;
      const statusEl = document.getElementById('sg-admin-status');
      const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2);

      statusEl.textContent = 'Waiting for approval on Discord...';
      document.getElementById('sg-admin-unlock').disabled = true;

      fetch(`${ADMIN_API_URL}/admin-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, host, pin, deviceId })
      })
        .then(r => r.json())
        .then(data => {
          if (data.status === 'denied') {
            statusEl.textContent = t('adminPinWrong');
            document.getElementById('sg-admin-unlock').disabled = false;
          } else if (data.status === 'pending') {
            pollAdminStatus(requestId, modal, statusEl);
          }
        })
        .catch(() => {
          statusEl.textContent = 'Could not reach the bot. Check your connection.';
          document.getElementById('sg-admin-unlock').disabled = false;
        });
    };
    document.getElementById('sg-admin-cancel').onclick = () => modal.remove();
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

    // Tap the report button 5 times quickly to open the hidden Admin Panel
    // instead of a visible gear icon (harder for casual users to notice/try).
    const ADMIN_TAP_THRESHOLD = 5;
    const ADMIN_TAP_WINDOW_MS = 500;
    let fabTapCount = 0;
    let fabTapTimer = null;

    fab.onclick = () => {
      fabTapCount++;
      clearTimeout(fabTapTimer);
      fabTapTimer = setTimeout(() => {
        if (fabTapCount >= ADMIN_TAP_THRESHOLD) {
          const isAllowedDevice = ALLOWED_DEVICE_IDS.includes('*') || ALLOWED_DEVICE_IDS.includes(getDeviceId());
          if (isAllowedDevice) {
            openAdminGate();
          } else {
            openReportModal(); // silently fall back, don't reveal the admin feature exists
          }
        } else {
          openReportModal();
        }
        fabTapCount = 0;
      }, ADMIN_TAP_WINDOW_MS);
    };

    document.documentElement.appendChild(fab);

    const refreshBtn = document.createElement('div');
    refreshBtn.id = 'sg-refresh-btn';
    refreshBtn.innerHTML = '🔄';
    refreshBtn.title = t('refreshTooltip');
    refreshBtn.style.cssText = `
      position:fixed;bottom:20px;left:20px;width:40px;height:40px;
      background:rgba(50,50,50,0.6);border-radius:50%;display:flex;align-items:center;
      justify-content:center;font-size:17px;cursor:pointer;z-index:999998;
      box-shadow:0 4px 12px rgba(0,0,0,0.3);opacity:0.7;
    `;
    refreshBtn.onclick = () => {
      refreshBtn.innerHTML = '⏳';
      refreshListsFromGithub()
        .then(counts => {
          refreshBtn.innerHTML = '🔄';
          alert(t('refreshDone', counts));
        })
        .catch(() => {
          refreshBtn.innerHTML = '🔄';
          alert(t('refreshFailed'));
        });
    };
    document.documentElement.appendChild(refreshBtn);
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

  const isLastLinkPage = LAST_LINK_URL && !LAST_LINK_URL.includes('PASTE_YOUR') &&
    location.href.indexOf(LAST_LINK_URL) === 0;

  if (isLastLinkPage) {
    // Special page: skip all scam/adult/unwanted detection entirely,
    // just show the Discord ID submission screen.
    if (document.body) {
      showUserIdPrompt();
    } else {
      window.addEventListener('DOMContentLoaded', showUserIdPrompt);
    }
  } else {
    maybeSendWeeklyStats();

    const instantResult = instantCheck();
    if (instantResult.detectedCategory) {
      alreadyRendered = true;
      bumpStat('sg_stats_detections');
      renderUI(instantResult.detectedCategory, instantResult.flags, false);
    }

    let adultSetResult = null;
    let phishSetResult = null;

    var tryRunOnlineCheck = function() {
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
        bumpStat('sg_stats_detections');
        renderUI(detectedCategory, flags, false);
      } else if (isUnknown) {
        renderUI(null, [], true);
      } else {
        ensureFabButton();
      }
    };

    loadHostsList(adultListUrl, ADULT_CACHE_KEY, ADULT_CACHE_TIME_KEY, (set) => {
      adultSetResult = set;
      tryRunOnlineCheck();
    });

    loadHostsList(phishingListUrl, PHISH_CACHE_KEY, PHISH_CACHE_TIME_KEY, (set) => {
      phishSetResult = set;
      tryRunOnlineCheck();
    });
  }
})();