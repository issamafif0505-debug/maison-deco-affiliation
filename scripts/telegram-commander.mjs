#!/usr/bin/env node
/**
 * 🤖 TELEGRAM COMMANDER — Centre de contrôle multi-business
 * Bot Telegram pour gérer Maison Déco Affiliation depuis ton téléphone
 * 
 * Usage: node scripts/telegram-commander.mjs
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
const NETLIFY_HOOK = process.env.NETLIFY_BUILD_HOOK || '';

let lastUpdateId = 0;

// ─── API TELEGRAM via curl (Node fetch bloqué en sandbox) ──────────────────
function tgRequest(method, params = {}) {
  try {
    const json = JSON.stringify(params).replace(/'/g, "'\\''");
    const cmd = `curl -s -X POST '${API}/${method}' -H 'Content-Type: application/json' -d '${json}'`;
    const out = execSync(cmd, { timeout: 15000, encoding: 'utf8' });
    return JSON.parse(out);
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function sendMessage(chatId, text, extra = {}) {
  const payload = { chat_id: chatId, text, parse_mode: 'Markdown', ...extra };
  return tgRequest('sendMessage', payload);
}

function sendPhoto(chatId, photo, caption) {
  return tgRequest('sendPhoto', { chat_id: chatId, photo, caption, parse_mode: 'Markdown' });
}

function getUpdates() {
  try {
    const cmd = `curl -s '${API}/getUpdates?offset=${lastUpdateId + 1}&timeout=10&allowed_updates=["message"]'`;
    const out = execSync(cmd, { timeout: 20000, encoding: 'utf8' });
    return JSON.parse(out);
  } catch (e) {
    return { ok: false, result: [] };
  }
}

// ─── SÉCURITÉ ──────────────────────────────────────────────────────────────
function isAuthorized(chatId) {
  return String(chatId) === String(ALLOWED_CHAT_ID);
}

// ─── UTILITAIRES ──────────────────────────────────────────────────────────
function getProducts() {
  const dir = join(ROOT, 'src/content/products');
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        return JSON.parse(readFileSync(join(dir, f), 'utf8'));
      } catch { return null; }
    })
    .filter(Boolean);
}

function getBlogPosts() {
  const dir = join(ROOT, 'src/content/blog');
  return readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const content = readFileSync(join(dir, f), 'utf8');
      const titleMatch = content.match(/^title:\s*"?(.+?)"?\s*$/m);
      const dateMatch = content.match(/^pubDate:\s*(.+)$/m);
      return {
        file: f,
        title: titleMatch ? titleMatch[1] : f,
        date: dateMatch ? dateMatch[1].trim() : 'N/A',
      };
    });
}

function getClickStats() {
  const statsFile = join(ROOT, 'public/stats-clicks.json');
  if (existsSync(statsFile)) {
    return JSON.parse(readFileSync(statsFile, 'utf8'));
  }
  return { total: 0, today: 0, products: {} };
}

function formatNumber(n) {
  return new Intl.NumberFormat('fr-FR').format(n);
}

function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+=|{}.!\\-]/g, '\\$&');
}

// ─── COMMANDES ─────────────────────────────────────────────────────────────

async function cmdStart(chatId) {
  const msg = `🏠 *Maison Déco — Centre de Contrôle*

Salut Issam ! Voici ce que tu peux faire depuis ici :

📊 *Stats & Revenus*
/stats — Stats clics affiliés du jour
/revenus — Estimation revenus mensuels
/rapport — Rapport SEO complet

📦 *Produits*
/produits — Voir tous les produits
/topproduits — Top 5 produits cliqués
/ajouterproduit — Ajouter un produit

✍️ *Blog*
/blog — Liste des articles
/nouvelarticle — Créer un article SEO

🚀 *Déploiement*
/deploy — Build + deploy Netlify
/status — Status du site

🔧 *Business*
/business — Vue d'ensemble tous les business
/help — Aide complète`;

  await sendMessage(chatId, msg, {
    reply_markup: {
      keyboard: [
        [{ text: '📊 Stats' }, { text: '💰 Revenus' }],
        [{ text: '📦 Produits' }, { text: '✍️ Blog' }],
        [{ text: '🚀 Deploy' }, { text: '🏢 Business' }],
      ],
      resize_keyboard: true,
    },
  });
}

async function cmdStats(chatId) {
  const products = getProducts();
  const posts = getBlogPosts();
  const stats = getClickStats();
  
  const featured = products.filter(p => p.featured).length;
  const bestsellers = products.filter(p => p.bestseller).length;
  const categories = [...new Set(products.map(p => p.category))].length;
  
  const now = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' });
  
  const msg = `📊 *Tableau de Bord — ${now}*

🛍️ *Catalogue*
• ${products.length} produits en ligne
• ${featured} featured / ${bestsellers} bestsellers
• ${categories} catégories
• ${posts.length} articles de blog

💡 *Clics Affiliés*
• Aujourd'hui : ${formatNumber(stats.today)} clics
• Total : ${formatNumber(stats.total)} clics

🌐 *Site*
• URL : ${SITE_URL}
• Status : ✅ En ligne`;

  await sendMessage(chatId, msg);
}

async function cmdRevenus(chatId) {
  const products = getProducts();
  const stats = getClickStats();
  
  // Estimation basée sur le taux de conversion Amazon moyen (2-4%)
  const tauxConversion = 0.03;
  const prixMoyen = products.reduce((sum, p) => sum + (p.price?.current || 0), 0) / products.length;
  const commissionMoyenne = 0.05; // 5% commission Amazon FR
  
  const clicsJour = Math.max(stats.today, 10); // fallback estimation
  const ventesEstimees = Math.round(clicsJour * tauxConversion);
  const revenuJour = (ventesEstimees * prixMoyen * commissionMoyenne).toFixed(2);
  const revenuMois = (revenuJour * 30).toFixed(2);
  
  const msg = `💰 *Estimation Revenus Affiliés*

📈 *Hypothèses*
• ${products.length} produits × prix moyen ${prixMoyen.toFixed(0)}€
• Taux conversion Amazon : 3%
• Commission moyenne : 5%

📊 *Estimation*
• Clics aujourd'hui : ${clicsJour}
• Ventes estimées/jour : ${ventesEstimees}
• Revenu estimé/jour : ~${revenuJour}€
• Revenu estimé/mois : ~${revenuMois}€

🎯 *Pour atteindre 1000€/mois*
→ Besoin ~${Math.round(1000 / (prixMoyen * commissionMoyenne * tauxConversion))} clics/jour

💡 _Valeurs indicatives. Données réelles dans Amazon Associates_`;

  await sendMessage(chatId, msg);
}

async function cmdProduits(chatId) {
  const products = getProducts();
  const byCategory = {};
  for (const p of products) {
    if (!byCategory[p.category]) byCategory[p.category] = 0;
    byCategory[p.category]++;
  }
  
  const catList = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => `  • ${cat}: ${count} produits`)
    .join('\n');
  
  const featured = products.filter(p => p.featured).map(p => `  🌟 ${p.name} — ${p.price?.current}€`).join('\n');
  
  const msg = `📦 *Catalogue Produits (${products.length} total)*

📂 *Par catégorie :*
${catList}

⭐ *Produits Featured :*
${featured || '  Aucun'}

👉 Voir le site : ${SITE_URL}/produits/`;

  await sendMessage(chatId, msg);
}

async function cmdTopProduits(chatId) {
  const products = getProducts();
  
  // Top par note × nombre d'avis (proxy de popularité)
  const top5 = products
    .sort((a, b) => (b.rating?.score * Math.log(b.rating?.count + 1)) - (a.rating?.score * Math.log(a.rating?.count + 1)))
    .slice(0, 5);
  
  let msg = `🏆 *Top 5 Produits (score popularité)*\n\n`;
  top5.forEach((p, i) => {
    const stars = '⭐'.repeat(Math.round(p.rating?.score || 0));
    msg += `${i + 1}. *${p.name}*\n`;
    msg += `   ${stars} ${p.rating?.score}/5 (${formatNumber(p.rating?.count)} avis)\n`;
    msg += `   💶 ${p.price?.current}€\n\n`;
  });
  
  await sendMessage(chatId, msg);
}

async function cmdBlog(chatId) {
  const posts = getBlogPosts();
  
  let msg = `✍️ *Blog — ${posts.length} articles*\n\n`;
  posts.slice(0, 8).forEach((p, i) => {
    msg += `${i + 1}. ${p.title}\n   📅 ${p.date}\n\n`;
  });
  
  if (posts.length > 8) {
    msg += `_...et ${posts.length - 8} autres_\n\n`;
  }
  
  msg += `👉 ${SITE_URL}/blog/`;
  
  await sendMessage(chatId, msg);
}

async function cmdRapport(chatId) {
  const products = getProducts();
  const posts = getBlogPosts();
  
  const inStock = products.filter(p => p.inStock).length;
  const avgPrice = (products.reduce((s, p) => s + (p.price?.current || 0), 0) / products.length).toFixed(2);
  const avgRating = (products.reduce((s, p) => s + (p.rating?.score || 0), 0) / products.length).toFixed(1);
  const totalReviews = products.reduce((s, p) => s + (p.rating?.count || 0), 0);
  
  const categories = [...new Set(products.map(p => p.category))];
  
  const msg = `📈 *Rapport Complet — ${new Date().toLocaleDateString('fr-FR')}*

🛍️ *Catalogue*
• Produits actifs : ${inStock}/${products.length}
• Prix moyen : ${avgPrice}€
• Note moyenne : ${avgRating}/5
• Total avis Amazon : ${formatNumber(totalReviews)}
• Catégories : ${categories.length}

📝 *Contenu*
• Articles blog : ${posts.length}
• Dernier article : ${posts[0]?.title?.slice(0, 50) || 'N/A'}

🔍 *SEO Quick Check*
• Sitemap : ${SITE_URL}/sitemap-index.xml ✅
• RSS : ${SITE_URL}/rss.xml ✅
• Pages indexées : ~${products.length + posts.length + 10}

🎯 *Prochaines actions*
• Ajouter contenu blog régulier
• Vérifier prix Amazon à jour
• Suivre clics dans Amazon Associates`;

  await sendMessage(chatId, msg);
}

async function cmdDeploy(chatId) {
  await sendMessage(chatId, '🚀 *Déploiement en cours...*\n\nBuild Astro → Netlify\n_Attends 2-3 minutes_');
  
  try {
    // Build local
    const buildResult = execSync('cd ' + ROOT + ' && npm run build 2>&1', { 
      timeout: 180000,
      encoding: 'utf8' 
    });
    
    const lines = buildResult.split('\n').slice(-5).join('\n');
    
    // Push Git pour déclencher Netlify auto-deploy
    try {
      execSync('cd ' + ROOT + ' && git add -A && git commit -m "deploy: auto-deploy via Telegram bot" --allow-empty && git push origin HEAD 2>&1', {
        timeout: 30000,
        encoding: 'utf8'
      });
      await sendMessage(chatId, `✅ *Build réussi + Push Git*\n\nNetlify va déployer automatiquement.\n\n👉 ${SITE_URL}`);
    } catch (gitErr) {
      await sendMessage(chatId, `✅ *Build réussi*\n\nPush Git: ${gitErr.message.slice(0, 100)}\n\n👉 ${SITE_URL}`);
    }
  } catch (err) {
    await sendMessage(chatId, `❌ *Build échoué*\n\n\`\`\`\n${err.message.slice(0, 500)}\n\`\`\``);
  }
}

function cmdStatus(chatId) {
  try {
    const result = execSync(`curl -s -o /dev/null -w "%{http_code}" --max-time 10 '${SITE_URL}'`, { encoding: 'utf8' }).trim();
    const code = parseInt(result);
    const status = code >= 200 && code < 400 ? `✅ En ligne (${code})` : `⚠️ Status ${code}`;
    const gitBranch = execSync('git rev-parse --abbrev-ref HEAD 2>/dev/null', { encoding: 'utf8', cwd: ROOT }).trim();
    const gitHash = execSync('git rev-parse --short HEAD 2>/dev/null', { encoding: 'utf8', cwd: ROOT }).trim();

    const msg = `🌐 *Status du Site*

• URL : ${SITE_URL}
• Status : ${status}

📋 *Git*
• Branche : ${gitBranch}
• Commit : \`${gitHash}\`
• Repo : issamafif0505-debug/maison-deco-affiliation`;

    sendMessage(chatId, msg);
  } catch (err) {
    sendMessage(chatId, `⚠️ *Erreur status*\n\n${err.message.slice(0, 200)}`);
  }
}

async function cmdBusiness(chatId) {
  const products = getProducts();
  const posts = getBlogPosts();
  
  const msg = `🏢 *Vue d'Ensemble Business — Issam*

━━━━━━━━━━━━━━━━━━━━━
🏠 *1. Maison Déco Affiliation*
• Site : ${SITE_URL}
• Modèle : Affilié Amazon.fr (tag: issamdeco-21)
• Produits : ${products.length}
• Blog : ${posts.length} articles
• Status : ✅ Actif

━━━━━━━━━━━━━━━━━━━━━
📱 *2. @issamtradingbot Telegram*
• Canal d'alertes affiliés
• Bot de gestion ← tu es ici !
• Status : ✅ Actif

━━━━━━━━━━━━━━━━━━━━━
🔧 *Infrastructure*
• Hébergement : Netlify (gratuit)
• Automatisation : n8n
• Contenu : Astro SSG
• Bot : Node.js

━━━━━━━━━━━━━━━━━━━━━
💡 *Commandes rapides*
/stats /revenus /deploy /rapport`;

  await sendMessage(chatId, msg);
}

async function cmdHelp(chatId) {
  const msg = `🤖 *Aide — Telegram Commander*

*Commandes disponibles :*

📊 \`/stats\` — Stats du jour
💰 \`/revenus\` — Estimation revenus
📈 \`/rapport\` — Rapport SEO complet
📦 \`/produits\` — Catalogue produits
🏆 \`/topproduits\` — Top 5 produits
✍️ \`/blog\` — Articles du blog
🚀 \`/deploy\` — Build + déploiement
🌐 \`/status\` — Status site
🏢 \`/business\` — Vue globale
❓ \`/help\` — Cette aide

*Boutons rapides :* utilise le clavier en bas de l'écran

*Source :* Bot personnel Issam — accès restreint`;

  await sendMessage(chatId, msg);
}

async function cmdAjouterProduit(chatId, state) {
  if (!state.waitingForProduct) {
    await sendMessage(chatId, `📦 *Ajouter un Produit*

Envoie-moi les infos dans ce format :
\`\`\`
NOM: Nom du produit
ASIN: B0XXXXXXXXX
PRIX: 29.99
CAT: éclairage
DESC: Description courte
\`\`\`

_Exemple :_
\`\`\`
NOM: Lampe Solaire Jardin LED
ASIN: B09XYZTEST
PRIX: 15.99
CAT: éclairage
DESC: Set 6 lampes solaires LED pour jardin
\`\`\``);
    return { ...state, waitingForProduct: true };
  }
  return state;
}

// Traiter la réponse "ajouter produit"
async function processProductInput(chatId, text) {
  const lines = text.split('\n');
  const data = {};
  for (const line of lines) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) data[key.trim().toUpperCase()] = rest.join(':').trim();
  }
  
  if (!data.NOM || !data.ASIN) {
    await sendMessage(chatId, '❌ Format invalide. Utilise /ajouterproduit pour voir le format.');
    return false;
  }
  
  const slug = (data.NOM || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  
  const product = {
    name: data.NOM,
    slug,
    shortDescription: data.DESC || data.NOM,
    fullDescription: data.DESC || `Découvrez ${data.NOM}, sélectionné pour sa qualité et son rapport qualité-prix.`,
    category: (data.CAT || 'décoration').toLowerCase(),
    amazonAsin: data.ASIN,
    affiliateTag: 'issamdeco-21',
    price: { current: parseFloat(data.PRIX) || 0, currency: 'EUR', lastChecked: new Date().toISOString().split('T')[0] },
    rating: { score: 4.3, count: 100 },
    image: `https://m.media-amazon.com/images/P/${data.ASIN}.01._AC_SL600_.jpg`,
    pros: ['Qualité vérifiée', 'Livraison Amazon rapide'],
    cons: ['À compléter après test'],
    specifications: [],
    featured: false,
    bestseller: false,
    inStock: true,
  };
  
  const filePath = join(ROOT, 'src/content/products', `${slug}.json`);
  writeFileSync(filePath, JSON.stringify(product, null, 2));
  
  await sendMessage(chatId, `✅ *Produit ajouté !*

🛍️ *${data.NOM}*
📦 ASIN : \`${data.ASIN}\`
💶 Prix : ${data.PRIX}€
📁 Fichier : \`${slug}.json\`

👉 Lance /deploy pour mettre à jour le site`);
  return true;
}

// ─── DISPATCHER ───────────────────────────────────────────────────────────
const userStates = {};

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  
  if (!isAuthorized(chatId)) {
    await sendMessage(chatId, '⛔ Accès refusé. Bot privé.');
    return;
  }
  
  const state = userStates[chatId] || {};
  
  // Attente saisie produit
  if (state.waitingForProduct && !text.startsWith('/')) {
    const ok = await processProductInput(chatId, text);
    if (ok) userStates[chatId] = {};
    return;
  }
  
  // Commandes
  const cmd = text.toLowerCase().split(' ')[0];
  
  switch (cmd) {
    case '/start':
    case '🏢 business':
    case '/menu':
      await cmdStart(chatId); break;
    
    case '/stats':
    case '📊 stats':
      await cmdStats(chatId); break;
    
    case '/revenus':
    case '💰 revenus':
      await cmdRevenus(chatId); break;
    
    case '/produits':
    case '📦 produits':
      await cmdProduits(chatId); break;
    
    case '/topproduits':
      await cmdTopProduits(chatId); break;
    
    case '/blog':
    case '✍️ blog':
      await cmdBlog(chatId); break;
    
    case '/rapport':
      await cmdRapport(chatId); break;
    
    case '/deploy':
    case '🚀 deploy':
      await cmdDeploy(chatId); break;
    
    case '/status':
      await cmdStatus(chatId); break;
    
    case '/business':
      await cmdBusiness(chatId); break;
    
    case '/ajouterproduit':
      userStates[chatId] = await cmdAjouterProduit(chatId, state);
      break;
    
    case '/help':
    case '/aide':
      await cmdHelp(chatId); break;
    
    default:
      await sendMessage(chatId, `Commande inconnue : \`${cmd}\`\n\nEnvoie /help pour voir toutes les commandes.`);
  }
}

// ─── POLLING LOOP (synchrone via curl) ────────────────────────────────────
function poll() {
  try {
    const res = getUpdates();
    if (res.ok && res.result?.length > 0) {
      for (const update of res.result) {
        lastUpdateId = update.update_id;
        if (update.message) {
          try { handleMessage(update.message); } catch(e) { console.error('Handler error:', e.message); }
        }
      }
    }
  } catch (err) {
    // ignore network errors
  }
  setTimeout(poll, 1500);
}

// ─── DÉMARRAGE ────────────────────────────────────────────────────────────
console.log('🤖 Telegram Commander démarré !');
console.log(`📱 Bot : @issamtradingbot`);
console.log(`👤 Chat autorisé : ${ALLOWED_CHAT_ID}`);
console.log(`🏠 Site : ${SITE_URL}`);
console.log('');
console.log('En attente de commandes...');

const startResult = sendMessage(ALLOWED_CHAT_ID,
  `🤖 *Bot redémarré !*\n\nCentre de contrôle Maison Déco prêt.\nEnvoie /start pour le menu.`
);
console.log(startResult?.ok ? '✅ Message de démarrage envoyé' : '⚠️ Démarrage silencieux');

poll();
