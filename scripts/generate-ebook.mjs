import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 60, bottom: 60, left: 50, right: 50 },
  info: {
    Title: '50 Astuces Deco Petit Budget',
    Author: 'Issam - Maison & Deco',
    Subject: 'Guide de decoration interieur petit budget',
    Keywords: 'deco, maison, budget, astuces, interieur',
  }
});

const outputDir = path.join(process.cwd(), 'public', 'downloads');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, '50-astuces-deco-extrait.pdf');
doc.pipe(fs.createWriteStream(outputPath));

// Colors
const orange = '#D77F35';
const darkGray = '#1A1A2E';
const medGray = '#4A4A5A';
const lightBg = '#FFF8F0';

// ========== COVER PAGE ==========
doc.rect(0, 0, doc.page.width, doc.page.height).fill(darkGray);

doc.fill('white').fontSize(42).font('Helvetica-Bold')
  .text('50 ASTUCES', 50, 180, { align: 'center' });
doc.fill(orange).fontSize(42).font('Helvetica-Bold')
  .text('DECO', { align: 'center' });
doc.fill('white').fontSize(42).font('Helvetica-Bold')
  .text('PETIT BUDGET', { align: 'center' });

doc.moveDown(2);
doc.fill('#AAAAAA').fontSize(14).font('Helvetica')
  .text('Transformez votre interieur', { align: 'center' });
doc.text('sans vous ruiner', { align: 'center' });

doc.moveDown(4);
doc.fill(orange).fontSize(16).font('Helvetica-Bold')
  .text('Par Issam', { align: 'center' });
doc.fill('#888888').fontSize(12).font('Helvetica')
  .text('Maison & Deco by Issam', { align: 'center' });
doc.text('maison-deco-issam.netlify.app', { align: 'center' });

// ========== PAGE 2: TABLE OF CONTENTS ==========
doc.addPage();
doc.rect(0, 0, doc.page.width, 100).fill(orange);
doc.fill('white').fontSize(28).font('Helvetica-Bold')
  .text('TABLE DES MATIERES', 50, 40, { align: 'center' });

const chapters = [
  { num: 1, title: 'Introduction : Pourquoi ce guide ?', page: 3 },
  { num: 2, title: 'Chapitre 1 : Eclairage (Astuces 1-10)', page: 4 },
  { num: 3, title: 'Chapitre 2 : Murs & Decoration (Astuces 11-20)', page: 6 },
  { num: 4, title: 'Chapitre 3 : Textile & Confort (Astuces 21-30)', page: 8 },
  { num: 5, title: 'Chapitre 4 : Rangement Malin (Astuces 31-40)', page: 10 },
  { num: 6, title: 'Chapitre 5 : Touches Finales (Astuces 41-50)', page: 12 },
  { num: 7, title: 'Bonus : Mes 10 produits Amazon preferes', page: 14 },
  { num: 8, title: 'Conclusion & Ressources', page: 15 },
];

let yPos = 140;
chapters.forEach((ch) => {
  doc.fill(darkGray).fontSize(14).font('Helvetica-Bold')
    .text(`${ch.title}`, 60, yPos);
  doc.fill(medGray).fontSize(12).font('Helvetica')
    .text(`Page ${ch.page}`, 440, yPos);
  yPos += 35;
});

// ========== PAGE 3: INTRODUCTION ==========
doc.addPage();
doc.fill(orange).fontSize(24).font('Helvetica-Bold')
  .text('INTRODUCTION', 50, 60);
doc.moveDown(0.5);
doc.fill(orange).rect(50, doc.y, 100, 3).fill(orange);
doc.moveDown(1);

doc.fill(darkGray).fontSize(12).font('Helvetica')
  .text("Bienvenue dans ce guide pratique !", 50, doc.y, { width: 495 })
  .moveDown(0.8)
  .text("Si vous lisez ces lignes, c'est que vous avez envie de transformer votre interieur mais que vous ne voulez pas (ou ne pouvez pas) depenser des milliers d'euros.", { width: 495 })
  .moveDown(0.8)
  .text("Bonne nouvelle : un bel interieur n'est PAS une question de budget. C'est une question de choix intelligents. Et c'est exactement ce que ce guide va vous apprendre.", { width: 495 })
  .moveDown(1.2);

doc.fill(orange).fontSize(16).font('Helvetica-Bold')
  .text("Ce que vous allez apprendre :");
doc.moveDown(0.5);

const learnings = [
  "50 astuces concretes, testees et approuvees",
  "Comment transformer chaque piece pour moins de 50 EUR",
  "Les meilleurs produits Amazon rapport qualite-prix",
  "Les erreurs courantes a eviter absolument",
  "Des idees inspirees des tendances TikTok et Instagram 2025"
];

learnings.forEach((item) => {
  doc.fill(darkGray).fontSize(12).font('Helvetica')
    .text(`   ✅  ${item}`, { width: 480 });
  doc.moveDown(0.4);
});

doc.moveDown(1.5);
doc.rect(50, doc.y, 495, 80).fill('#F0F7FF');
doc.fill('#2563EB').fontSize(11).font('Helvetica-Bold')
  .text('💡 ASTUCE PRO', 65, doc.y - 65);
doc.fill(medGray).fontSize(11).font('Helvetica')
  .text("Chaque astuce inclut un budget estime et des liens vers les produits recommandes sur Amazon. Vous pouvez les retrouver sur mon site : maison-deco-issam.netlify.app", 65, doc.y + 5, { width: 465 });

// ========== PAGE 4-5: CHAPTER 1 - ECLAIRAGE ==========
doc.addPage();
doc.fill(orange).fontSize(24).font('Helvetica-Bold')
  .text('CHAPITRE 1', 50, 60);
doc.fill(darkGray).fontSize(20).font('Helvetica-Bold')
  .text('ECLAIRAGE : ASTUCES 1-10');
doc.moveDown(0.3);
doc.fill(orange).rect(50, doc.y, 100, 3).fill(orange);
doc.moveDown(1);

doc.fill(medGray).fontSize(12).font('Helvetica')
  .text("L'eclairage represente 50% de l'ambiance d'une piece. C'est le premier element a travailler pour transformer votre interieur.", { width: 495 });
doc.moveDown(1);

const eclairageAstuces = [
  { num: 1, title: "Bande LED derriere le lit", desc: "Collez une bande LED de 5m derriere votre tete de lit. Le halo lumineux indirect cree une ambiance cocooning instantanee. Choisissez le blanc chaud (2700K) pour une atmosphère relaxante.", budget: "15-20 EUR" },
  { num: 2, title: "Lampe Sunset au mur", desc: "La lampe sunset projette un cercle de lumiere chaude sur vos murs. Placez-la a 50-80 cm du sol, orientee vers un mur clair. Effet garanti sur TikTok !", budget: "15 EUR" },
  { num: 3, title: "Guirlande dans un vase", desc: "Enroulez une guirlande micro-LED dans un grand vase en verre transparent. Un centre de table original et lumineux. Utilisez des piles pour eviter les fils.", budget: "10 EUR" },
  { num: 4, title: "LED sous les meubles", desc: "Collez des bandes LED sous votre meuble TV, votre bureau ou votre lit. L'eclairage indirect au sol donne un look futuriste et agreable.", budget: "12 EUR" },
  { num: 5, title: "Bougies LED groupees", desc: "Regroupez 5-7 bougies LED de differentes tailles sur un plateau. Ambiance chaleureuse sans risque d'incendie. Parfait pour le salon et la salle de bain.", budget: "12 EUR" },
];

eclairageAstuces.forEach((astuce) => {
  doc.fill(orange).fontSize(14).font('Helvetica-Bold')
    .text(`Astuce #${astuce.num} : ${astuce.title}`);
  doc.moveDown(0.3);
  doc.fill(darkGray).fontSize(11).font('Helvetica')
    .text(astuce.desc, { width: 495 });
  doc.fill('#059669').fontSize(10).font('Helvetica-Bold')
    .text(`💰 Budget : ${astuce.budget}`);
  doc.moveDown(0.8);
});

// Page 5 - suite eclairage
doc.addPage();
const eclairageAstuces2 = [
  { num: 6, title: "Variateur sur prise", desc: "Branchez vos lampes sur un variateur de prise (smart plug). Vous pourrez ajuster l'intensite lumineuse depuis votre telephone. Indispensable pour creer differentes ambiances.", budget: "15 EUR" },
  { num: 7, title: "Ampoules filament vintage", desc: "Remplacez vos ampoules classiques par des ampoules filament LED style Edison. Le look retro est ultra-tendance et la lumiere est chaude et agreable.", budget: "8 EUR/ampoule" },
  { num: 8, title: "Lampe en papier de riz", desc: "Les lampes boules en papier de riz sont un classique scandinave accessible. Elles diffusent une lumiere douce et uniforme. Accrochez-en une au plafond ou posez-la au sol.", budget: "10-15 EUR" },
  { num: 9, title: "Eclairage en couches", desc: "La regle d'or : 3 sources de lumiere par piece minimum. Un eclairage general (plafonnier), un eclairage d'ambiance (LED), et un eclairage fonctionnel (lampe de bureau/lecture).", budget: "Variable" },
  { num: 10, title: "Minuterie automatique", desc: "Programmez vos lumieres d'ambiance avec une prise connectee (smart plug). Elles s'allument au coucher du soleil et s'eteignent a minuit. Zero effort, ambiance automatique.", budget: "12 EUR" },
];

eclairageAstuces2.forEach((astuce) => {
  doc.fill(orange).fontSize(14).font('Helvetica-Bold')
    .text(`Astuce #${astuce.num} : ${astuce.title}`);
  doc.moveDown(0.3);
  doc.fill(darkGray).fontSize(11).font('Helvetica')
    .text(astuce.desc, { width: 495 });
  doc.fill('#059669').fontSize(10).font('Helvetica-Bold')
    .text(`💰 Budget : ${astuce.budget}`);
  doc.moveDown(0.8);
});

// ========== PAGE 6: BONUS - TOP PRODUITS AMAZON ==========
doc.addPage();
doc.fill(orange).fontSize(24).font('Helvetica-Bold')
  .text('BONUS', 50, 60);
doc.fill(darkGray).fontSize(20).font('Helvetica-Bold')
  .text('MES 10 PRODUITS AMAZON PREFERES');
doc.moveDown(0.3);
doc.fill(orange).rect(50, doc.y, 100, 3).fill(orange);
doc.moveDown(1);

doc.fill(medGray).fontSize(12).font('Helvetica')
  .text("Voici les 10 produits que je recommande le plus souvent. Ils sont tous disponibles sur Amazon France avec livraison rapide.", { width: 495 });
doc.moveDown(1);

const topProducts = [
  { name: "Govee Bande LED WiFi 5m", price: "16 EUR", note: "4.4/5", why: "Le meilleur rapport qualite-prix en bande LED" },
  { name: "Lampe Sunset Rotation 180°", price: "15 EUR", note: "4.3/5", why: "Le phenomene TikTok incontournable" },
  { name: "Guirlande Boules Coton GuirLED", price: "30 EUR", note: "4.5/5", why: "La plus belle guirlande du marche" },
  { name: "Philips Hue Pack 2 E27", price: "85 EUR", note: "4.6/5", why: "La reference en eclairage connecte" },
  { name: "Govee Lampadaire LED RGB", price: "80 EUR", note: "4.4/5", why: "Le lampadaire gaming/deco parfait" },
  { name: "Housse coussin lot de 4", price: "13 EUR", note: "4.4/5", why: "Change l'ambiance du canape instantanement" },
  { name: "Panier tresse lot de 3", price: "16 EUR", note: "4.4/5", why: "Rangement + deco en un seul produit" },
  { name: "Miroir rotin boheme", price: "18 EUR", note: "4.5/5", why: "La touche naturelle parfaite" },
  { name: "Bougie LED lot de 12", price: "12 EUR", note: "4.4/5", why: "Ambiance sans risque" },
  { name: "Plaid grosse maille", price: "19 EUR", note: "4.3/5", why: "Le plaid Instagram par excellence" },
];

topProducts.forEach((p, i) => {
  doc.fill(orange).fontSize(12).font('Helvetica-Bold')
    .text(`${i + 1}. ${p.name}`, 50, doc.y, { continued: true });
  doc.fill(medGray).font('Helvetica')
    .text(` — ${p.price} (${p.note})`);
  doc.fill(darkGray).fontSize(10).font('Helvetica')
    .text(`   ${p.why}`);
  doc.moveDown(0.5);
});

doc.moveDown(1);
doc.rect(50, doc.y, 495, 60).fill(orange);
doc.fill('white').fontSize(12).font('Helvetica-Bold')
  .text('🔗 Retrouvez tous les liens sur :', 65, doc.y - 45, { width: 465 });
doc.fill('white').fontSize(14).font('Helvetica-Bold')
  .text('maison-deco-issam.netlify.app/produits', 65, doc.y + 5, { width: 465 });

// ========== LAST PAGE: CONCLUSION ==========
doc.addPage();
doc.rect(0, 0, doc.page.width, doc.page.height).fill(darkGray);

doc.fill('white').fontSize(28).font('Helvetica-Bold')
  .text('MERCI !', 50, 150, { align: 'center' });
doc.moveDown(1);
doc.fill('#AAAAAA').fontSize(14).font('Helvetica')
  .text("Merci d'avoir lu cet extrait de", { align: 'center' });
doc.fill(orange).fontSize(18).font('Helvetica-Bold')
  .text('"50 Astuces Deco Petit Budget"', { align: 'center' });
doc.moveDown(2);

doc.fill('white').fontSize(14).font('Helvetica')
  .text("Cet extrait gratuit contient les 10 premieres astuces.", { align: 'center' });
doc.moveDown(0.5);
doc.fill(orange).fontSize(16).font('Helvetica-Bold')
  .text("Pour obtenir les 50 astuces completes :", { align: 'center' });
doc.moveDown(1);

doc.fill('white').fontSize(12).font('Helvetica')
  .text("👉  Visitez : maison-deco-issam.netlify.app/ebooks", { align: 'center' });
doc.moveDown(2);

doc.fill('#666666').fontSize(10).font('Helvetica')
  .text("Suivez-moi pour plus de contenu deco :", { align: 'center' });
doc.moveDown(0.3);
doc.fill('#888888').fontSize(10).font('Helvetica')
  .text("TikTok : @issam_deco", { align: 'center' });
doc.text("YouTube : @issam_deco", { align: 'center' });
doc.text("Site : maison-deco-issam.netlify.app", { align: 'center' });

doc.moveDown(3);
doc.fill('#444444').fontSize(8).font('Helvetica')
  .text("© 2025 Maison & Deco by Issam. Tous droits reserves.", { align: 'center' });

doc.end();
console.log(`✅ Ebook PDF genere : ${outputPath}`);
