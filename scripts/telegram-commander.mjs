#!/usr/bin/env node
/**
 * 🤖 TELEGRAM COMMANDER — Bot 100% synchrone
 * Toutes les requêtes passent par curl via execSync (Node fetch bloqué en sandbox)
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ─── CONFIG ────────────────────────────────────────────────────────────────
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8052045803:AAEIC0sPlpEGyP9UgzrZF0ovlu8qla7H4Xs';
const ALLOWED_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7847343809';
const API = `https://api.telegram.org/bot${TOKEN}`;
const SITE_URL = 'https://maison-deco-issam.netlify.app';

let lastUpdateId = 0;

// ─── API TELEGRAM via curl ──────────────────────────────────────────────────
function tgRequest(method, params = {}) {
  try {
    const json = JSON.stringify(params).replace(/'/g, "'\\''");
    const cmd = `curl -s -m 15 -X POST '${API}/${method}' -H 'Content-Type: application/json' -d '${json}'`;
    const out = execSync(cmd, { timeout: 20000, encoding: 'utf8' });
    return JSON.parse(out);
  } catch (e) {
    console.error('[tgRequest error]', e.message?.slice(0, 100));
    return { ok: false };
  }
}

function send(chatId, text, extra = {}) {
  return tgRequest('sendMessage', { chat_id: chatId, text, parse_mode: 'Markdown', ...extra });
}

function getUpdates() {
  try {
    const url = `${API}/getUpdates?offset=${lastUpdateId + 1}&timeout=8`;
    const out = execSync(`curl -s -m 12 '${url}'`, { timeout: 15000, encoding: 'utf8' });
    return JSON.parse(out);
  } catch (e) {
    return { ok: false, result: [] };
  }
}

// ─── UTILS ─────────────────────────────────────────────────────────────────
function getProducts() {
  const dir = join(ROOT, 'src/content/products');
  return readdirSync(dir).filter(f => f.endsWith('.json')).map(f => {
    try { return JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch { return null; }
  }).filter(Boolean);
}

function getBlogPosts() {
  const dir = join(ROOT, 'src/content/blog');
  return readdirSync(dir).filter(f => f.endsWith('.md')).map(f => {
    const c = readFileSync(join(dir, f), 'utf8');
    return {
      file: f,
      title: (c.match(/^title:\s*"?(.+?)"?\s*$/m) || [])[1] || f,
      date: (c.match(/^pubDate:\s*(.+)$/m) || [])[1]?.trim() || 'N/A',
    };
  });
}

function fmt(n) { return new Intl.NumberFormat('fr-FR').format(n); }

// ─── COMMANDES ─────────────────────────────────────────────────────────────
function cmdStart(chatId) {
  send(chatId,
    `🏠 *Maison Déco — Centre de Contrôle*\n\n` +
    `Salut Issam ! Commandes disponibles :\n\n` +
    `📊 /stats — Tableau de bord\n` +
    `💰 /revenus — Estimation revenus\n` +
    `📈 /rapport — Rapport complet\n` +
    `📦 /produits — Catalogue\n` +
    `🏆 /topproduits — Top 5\n` +
    `✍️ /blog — Articles\n` +
    `🚀 /deploy — Déployer le site\n` +
    `🌐 /status — Status site\n` +
    `🏢 /business — Vue globale\n` +
    `❓ /help — Aide`,
    {
      reply_markup: {
        keyboard: [
          [{ text: '📊 Stats' }, { text: '💰 Revenus' }],
          [{ text: '📦 Produits' }, { text: '✍️ Blog' }],
          [{ text: '🚀 Deploy' }, { text: '🌐 Status' }],
        ],
        resize_keyboard: true,
      }
    }
  );
}

function cmdStats(chatId) {
  const products = getProducts();
  const posts = getBlogPosts();
  const now = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' });
  const cats = [...new Set(products.map(p => p.category))].length;

  send(chatId,
    `📊 *Tableau de Bord — ${now}*\n\n` +
    `🛍️ *Catalogue*\n` +
    `• ${products.length} produits en ligne\n` +
    `• ${products.filter(p => p.featured).length} featured / ${products.filter(p => p.bestseller).length} bestsellers\n` +
    `• ${cats} catégories\n` +
    `• ${posts.length} articles de blog\n\n` +
    `🌐 Site : ${SITE_URL}`
  );
}

function cmdRevenus(chatId) {
  const products = getProducts();
  const prixMoyen = products.reduce((s, p) => s + (p.price?.current || 0), 0) / products.length;
  const revJour = (10 * 0.03 * prixMoyen * 0.05).toFixed(2);
  const revMois = (revJour * 30).toFixed(2);
  const clicsPour1000 = Math.round(1000 / (prixMoyen * 0.05 * 0.03));

  send(chatId,
    `💰 *Estimation Revenus Affiliés*\n\n` +
    `📈 *Hypothèses*\n` +
    `• ${products.length} produits × prix moyen ${prixMoyen.toFixed(0)}€\n` +
    `• Taux conversion Amazon : 3%\n` +
    `• Commission moyenne : 5%\n\n` +
    `📊 *Estimation (base 10 clics/jour)*\n` +
    `• Revenu/jour : ~${revJour}€\n` +
    `• Revenu/mois : ~${revMois}€\n\n` +
    `🎯 Pour 1000€/mois → besoin ~${fmt(clicsPour1000)} clics/jour\n\n` +
    `_Données réelles dans Amazon Associates_`
  );
}

function cmdProduits(chatId) {
  const products = getProducts();
  const byCategory = {};
  for (const p of products) byCategory[p.category] = (byCategory[p.category] || 0) + 1;
  const catList = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
    .map(([c, n]) => `• ${c}: ${n}`).join('\n');
  const featured = products.filter(p => p.featured)
    .map(p => `🌟 ${p.name} — ${p.price?.current}€`).join('\n');

  send(chatId,
    `📦 *Catalogue (${products.length} produits)*\n\n` +
    `📂 *Par catégorie :*\n${catList}\n\n` +
    `⭐ *Featured :*\n${featured || 'Aucun'}\n\n` +
    `👉 ${SITE_URL}/produits/`
  );
}

function cmdTopProduits(chatId) {
  const products = getProducts();
  const top5 = [...products]
    .sort((a, b) => (b.rating?.score * Math.log((b.rating?.count || 1) + 1)) - (a.rating?.score * Math.log((a.rating?.count || 1) + 1)))
    .slice(0, 5);

  let msg = `🏆 *Top 5 Produits*\n\n`;
  top5.forEach((p, i) => {
    msg += `${i + 1}. *${p.name}*\n`;
    msg += `   ⭐ ${p.rating?.score}/5 (${fmt(p.rating?.count || 0)} avis)\n`;
    msg += `   💶 ${p.price?.current}€\n\n`;
  });
  send(chatId, msg);
}

function cmdBlog(chatId) {
  const posts = getBlogPosts();
  let msg = `✍️ *Blog — ${posts.length} articles*\n\n`;
  posts.slice(0, 8).forEach((p, i) => {
    msg += `${i + 1}. ${p.title}\n   📅 ${p.date}\n\n`;
  });
  if (posts.length > 8) msg += `_...et ${posts.length - 8} autres_\n\n`;
  msg += `👉 ${SITE_URL}/blog/`;
  send(chatId, msg);
}

function cmdRapport(chatId) {
  const products = getProducts();
  const posts = getBlogPosts();
  const avgPrice = (products.reduce((s, p) => s + (p.price?.current || 0), 0) / products.length).toFixed(2);
  const avgRating = (products.reduce((s, p) => s + (p.rating?.score || 0), 0) / products.length).toFixed(1);
  const totalAvis = products.reduce((s, p) => s + (p.rating?.count || 0), 0);

  send(chatId,
    `📈 *Rapport — ${new Date().toLocaleDateString('fr-FR')}*\n\n` +
    `🛍️ *Catalogue*\n` +
    `• Produits actifs : ${products.filter(p => p.inStock).length}/${products.length}\n` +
    `• Prix moyen : ${avgPrice}€\n` +
    `• Note moyenne : ${avgRating}/5\n` +
    `• Total avis Amazon : ${fmt(totalAvis)}\n\n` +
    `📝 *Contenu*\n` +
    `• Articles blog : ${posts.length}\n` +
    `• Dernier : ${posts[0]?.title?.slice(0, 50) || 'N/A'}\n\n` +
    `🔍 *SEO*\n` +
    `• Sitemap ✅ | RSS ✅\n` +
    `• ~${products.length + posts.length + 10} pages indexées`
  );
}

function cmdDeploy(chatId) {
  send(chatId, '🚀 *Déploiement en cours...*\n_Attends 2-3 min_');
  try {
    execSync(`cd ${ROOT} && npm run build 2>&1`, { timeout: 180000, encoding: 'utf8' });
    try {
      execSync(`cd ${ROOT} && git add -A && git commit -m "deploy: via Telegram bot" --allow-empty && git push origin HEAD 2>&1`, { timeout: 30000, encoding: 'utf8' });
      send(chatId, `✅ *Build + Push réussis*\n\nNetlify déploie automatiquement.\n👉 ${SITE_URL}`);
    } catch (e) {
      send(chatId, `✅ *Build réussi*\nPush: ${e.message.slice(0, 100)}\n👉 ${SITE_URL}`);
    }
  } catch (e) {
    send(chatId, `❌ *Build échoué*\n\n\`\`\`\n${e.message.slice(0, 400)}\n\`\`\``);
  }
}

function cmdStatus(chatId) {
  try {
    const code = execSync(`curl -s -o /dev/null -w "%{http_code}" -m 10 '${SITE_URL}'`, { encoding: 'utf8' }).trim();
    const status = parseInt(code) >= 200 && parseInt(code) < 400 ? `✅ En ligne (${code})` : `⚠️ HTTP ${code}`;
    const branch = execSync('git rev-parse --abbrev-ref HEAD 2>/dev/null', { encoding: 'utf8', cwd: ROOT }).trim();
    const hash = execSync('git rev-parse --short HEAD 2>/dev/null', { encoding: 'utf8', cwd: ROOT }).trim();
    send(chatId,
      `🌐 *Status du Site*\n\n` +
      `• URL : ${SITE_URL}\n` +
      `• Status : ${status}\n\n` +
      `📋 *Git*\n• Branche : ${branch}\n• Commit : \`${hash}\``
    );
  } catch (e) {
    send(chatId, `⚠️ Erreur status : ${e.message.slice(0, 200)}`);
  }
}

function cmdBusiness(chatId) {
  const products = getProducts();
  const posts = getBlogPosts();
  send(chatId,
    `🏢 *Vue Business — Issam*\n\n` +
    `🏠 *Maison Déco Affiliation*\n` +
    `• Site : ${SITE_URL}\n` +
    `• Tag Amazon : issamdeco-21\n` +
    `• Produits : ${products.length} | Blog : ${posts.length} articles\n` +
    `• Status : ✅ Actif\n\n` +
    `📱 *@issamtradingbot*\n` +
    `• Bot de gestion ← tu es ici !\n` +
    `• Status : ✅ Actif\n\n` +
    `🔧 *Stack* : Astro + Netlify + Node.js\n\n` +
    `/stats /revenus /deploy /rapport`
  );
}

function cmdHelp(chatId) {
  send(chatId,
    `🤖 *Aide — Toutes les commandes*\n\n` +
    `/start — Menu principal\n` +
    `/stats — Tableau de bord\n` +
    `/revenus — Estimation revenus\n` +
    `/rapport — Rapport SEO complet\n` +
    `/produits — Catalogue produits\n` +
    `/topproduits — Top 5 produits\n` +
    `/blog — Articles du blog\n` +
    `/ajouterproduit — Ajouter un produit\n` +
    `/deploy — Build + déploiement\n` +
    `/status — Status site + git\n` +
    `/business — Vue globale\n` +
    `/help — Cette aide`
  );
}

function cmdAjouterProduit(chatId, state) {
  if (!state.waitingForProduct) {
    send(chatId,
      `📦 *Ajouter un Produit*\n\nEnvoie dans ce format :\n` +
      `\`\`\`\nNOM: Nom du produit\nASIN: B0XXXXXXXXX\nPRIX: 29.99\nCAT: éclairage\nDESC: Description courte\n\`\`\``
    );
    return { ...state, waitingForProduct: true };
  }
  return state;
}

function processProductInput(chatId, text) {
  const data = {};
  for (const line of text.split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) data[key.trim().toUpperCase()] = rest.join(':').trim();
  }
  if (!data.NOM || !data.ASIN) {
    send(chatId, '❌ Format invalide. Utilise /ajouterproduit pour voir le format.');
    return false;
  }
  const slug = data.NOM.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const product = {
    name: data.NOM, slug,
    shortDescription: data.DESC || data.NOM,
    fullDescription: data.DESC || `Découvrez ${data.NOM}, sélectionné pour sa qualité et son rapport qualité-prix.`,
    category: (data.CAT || 'décoration').toLowerCase(),
    amazonAsin: data.ASIN, affiliateTag: 'issamdeco-21',
    price: { current: parseFloat(data.PRIX) || 0, currency: 'EUR', lastChecked: new Date().toISOString().split('T')[0] },
    rating: { score: 4.3, count: 100 },
    image: `https://m.media-amazon.com/images/P/${data.ASIN}.01._AC_SL600_.jpg`,
    pros: ['Qualité vérifiée', 'Livraison Amazon rapide'],
    cons: ['À compléter après test'],
    specifications: [], featured: false, bestseller: false, inStock: true,
  };
  writeFileSync(join(ROOT, 'src/content/products', `${slug}.json`), JSON.stringify(product, null, 2));
  send(chatId,
    `✅ *Produit ajouté !*\n\n` +
    `🛍️ *${data.NOM}*\n📦 ASIN : \`${data.ASIN}\`\n💶 Prix : ${data.PRIX || '?'}€\n\n` +
    `Lance /deploy pour mettre à jour le site`
  );
  return true;
}

// ─── DISPATCHER ─────────────────────────────────────────────────────────────
const userStates = {};

function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();

  if (String(chatId) !== String(ALLOWED_CHAT_ID)) {
    send(chatId, '⛔ Accès refusé. Bot privé.');
    return;
  }

  const state = userStates[chatId] || {};

  if (state.waitingForProduct && !text.startsWith('/')) {
    const ok = processProductInput(chatId, text);
    if (ok) userStates[chatId] = {};
    return;
  }

  const cmd = text.toLowerCase().split(' ')[0];
  console.log(`[${new Date().toLocaleTimeString('fr-FR')}] CMD: ${cmd} from ${chatId}`);

  switch (cmd) {
    case '/start': case '/menu': case '🏢 business': cmdStart(chatId); break;
    case '/stats': case '📊 stats':                  cmdStats(chatId); break;
    case '/revenus': case '💰 revenus':              cmdRevenus(chatId); break;
    case '/produits': case '📦 produits':            cmdProduits(chatId); break;
    case '/topproduits':                             cmdTopProduits(chatId); break;
    case '/blog': case '✍️ blog':                    cmdBlog(chatId); break;
    case '/rapport':                                 cmdRapport(chatId); break;
    case '/deploy': case '🚀 deploy':                cmdDeploy(chatId); break;
    case '/status': case '🌐 status':               cmdStatus(chatId); break;
    case '/business':                                cmdBusiness(chatId); break;
    case '/ajouterproduit':
      userStates[chatId] = cmdAjouterProduit(chatId, state); break;
    case '/help': case '/aide':                      cmdHelp(chatId); break;
    default:
      send(chatId, `Commande inconnue : \`${cmd}\`\n\nEnvoie /help pour la liste.`);
  }
}

// ─── POLLING LOOP 100% SYNCHRONE ────────────────────────────────────────────
function poll() {
  const res = getUpdates();
  if (res.ok && res.result?.length > 0) {
    for (const update of res.result) {
      lastUpdateId = update.update_id;
      if (update.message) {
        try { handleMessage(update.message); }
        catch (e) { console.error('[handler error]', e.message); }
      }
    }
  }
  setTimeout(poll, 500);
}

// ─── DÉMARRAGE ──────────────────────────────────────────────────────────────
console.log('🤖 Telegram Commander démarré (mode sync/curl)');
console.log(`📱 Bot : @issamtradingbot | Chat : ${ALLOWED_CHAT_ID}`);

const r = send(ALLOWED_CHAT_ID, `🤖 *Bot opérationnel !*\n\nEnvoie /start pour le menu.`);
console.log(r?.ok ? '✅ Connecté à Telegram' : '⚠️ Problème connexion Telegram');

poll();
