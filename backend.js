/**
 * LUFFY POINTS · backend til Tilbudsstudio
 * ------------------------------------------------------------
 * Hentes automatisk af loaderen i Google Apps Script.
 * Ret ikke her manuelt. Admin-koden ligger kun i Apps Script.
 */
/* ADMIN_KODE kommer fra loaderen i Apps Script */

const TZ = 'Europe/Copenhagen';
const ARK = {
  saelgere: 'Sælgere',
  log: 'Point',
  shop: 'Shop',
  koder: 'Indløsninger',
  ordrer: 'Ordrer',
  regler: 'Regler',
  priser: 'Priser',
  el: 'Elpriser'
};

/* ---------- Standardindhold (bruges kun første gang) ---------- */
const STD_SHOP = [
  ['sodavand', 'Sodavand',             'En kold sodavand efter eget valg.', 5,  '🥤', 'ja'],
  ['booster',  'Faxe Kondi Booster',   'Når der skal mere fart på.',        10, '⚡', 'ja']
];
const STD_REGLER = [
  ['min_kontraktvaerdi',  500, 'Mindste kontraktværdi i kr. ekskl. moms, før en ordre giver point'],
  ['point_pr_ordre',      1,   'Point pr. godkendt ordre med mindst minimum i kontraktværdi'],
  ['point_pr_elsalg',     1,   'Point pr. elaftale, uanset kontraktværdi'],
  ['point_pr_100_kr',     0,   'Ekstra point pr. 100 kr. kontraktværdi (0 = slået fra)']
];

/* ---------- HTTP ---------- */
function doGet(e) {
  return svar({ ok: true, besked: 'Luffy points kører.' });
}

const SKRIV = { opret: 1, login: 1, ordre: 1, koeb: 1, indloes: 1, godkend: 1, bonus: 1, billede: 1, gempriser: 1, slet: 1 };
let MEMO = {};

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch (err) { return svar({ ok: false, fejl: 'Ugyldig forespørgsel' }); }
  MEMO = {};
  const lock = SKRIV[body.a] ? LockService.getScriptLock() : null;
  try {
    if (lock) lock.waitLock(20000);
    sikrArk();
    const fn = HANDLINGER[body.a];
    if (!fn) return svar({ ok: false, fejl: 'Ukendt handling' });
    return svar(fn(body));
  } catch (err) {
    return svar({ ok: false, fejl: String(err && err.message || err) });
  } finally {
    if (lock) try { lock.releaseLock(); } catch (e2) {}
  }
}

function svar(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Handlinger ---------- */
const HANDLINGER = {
  opret: function (b) {
    const navn = String(b.navn || '').trim().replace(/\s+/g, ' ');
    const pin = String(b.pin || '');
    if (navn.length < 2) throw new Error('Skriv dit navn');
    if (!/^\d{4,8}$/.test(pin)) throw new Error('PIN skal være 4-8 cifre');
    const rows = data(ARK.saelgere);
    if (rows.some(r => String(r[1]).toLowerCase() === navn.toLowerCase())) throw new Error('Navnet findes allerede. Log ind i stedet.');
    const id = 'S' + Utilities.getUuid().slice(0, 8);
    const token = Utilities.getUuid();
    ark(ARK.saelgere).appendRow([id, navn, hash(pin, id), token, nu(), 'ja']); MEMO = {};
    return { ok: true, token: token, mig: profil(id) };
  },

  login: function (b) {
    const navn = String(b.navn || '').trim().toLowerCase();
    const rows = data(ARK.saelgere);
    const i = rows.findIndex(r => String(r[1]).toLowerCase() === navn);
    if (i < 0) throw new Error('Ingen profil med det navn');
    const r = rows[i];
    if (r[5] === 'nej') throw new Error('Profilen er deaktiveret');
    if (hash(String(b.pin || ''), r[0]) !== r[2]) throw new Error('Forkert PIN');
    const token = Utilities.getUuid();
    ark(ARK.saelgere).getRange(i + 2, 4).setValue(token); MEMO = {};
    return { ok: true, token: token, mig: profil(r[0]) };
  },

  mig: function (b) {
    const s = saelger(b.token);
    return { ok: true, mig: profil(s[0]), koder: mineKoder(s[0]), ordrer: mineOrdrer(s[0]) };
  },

  ordre: function (b) {
    const s = saelger(b.token);
    const nr = String(b.ordrenr || '').trim().slice(0, 40);
    if (nr.length < 3) throw new Error('Skriv ordrenummeret');
    const kv = Math.max(0, Math.round(Number(String(b.vaerdi || 0).replace(/\./g, '').replace(',', '.')) || 0));
    const el = Math.max(0, Math.min(50, Math.floor(Number(b.el) || 0)));
    if (data(ARK.ordrer).some(r => String(r[4]).toLowerCase() === nr.toLowerCase() && r[9] !== 'Afvist')) throw new Error('Ordre ' + nr + ' er allerede registreret');
    const p = beregn(kv, el);
    const id = 'O' + Utilities.getUuid().slice(0, 8);
    ark(ARK.ordrer).appendRow([id, nu(), s[0], s[1], nr, String(b.kunde || '').slice(0, 80), kv, el, p, 'Afventer', '']); MEMO = {};
    return { ok: true, point: p, mig: profil(s[0]), ordrer: mineOrdrer(s[0]) };
  },

  alt: function (b) {
    const r = { ok: true, varer: HANDLINGER.shop().varer, regler: regler(), top: HANDLINGER.top(), priser: priser(), mig: null };
    const s = b.token ? data(ARK.saelgere).find(x => x[3] === b.token && x[5] !== 'nej') : null;
    if (s) { r.mig = profil(s[0]); r.koder = mineKoder(s[0]); r.ordrer = mineOrdrer(s[0]); }
    return r;
  },

  shop: function () {
    const varer = data(ARK.shop)
      .filter(r => r[0] && String(r[5]).toLowerCase() !== 'nej')
      .map(r => ({ id: String(r[0]), navn: String(r[1]), tekst: String(r[2]), pris: Number(r[3]) || 0, ikon: String(r[4] || '✦') }));
    return { ok: true, varer: varer, regler: regler() };
  },

  koeb: function (b) {
    const s = saelger(b.token);
    const katalog = {};
    data(ARK.shop).forEach(r => { if (r[0] && String(r[5]).toLowerCase() !== 'nej') katalog[String(r[0])] = r; });
    const kurv = (b.kurv || []).filter(x => katalog[x.id] && x.antal > 0);
    if (!kurv.length) throw new Error('Kurven er tom');
    let pris = 0;
    const tekst = kurv.map(x => {
      const a = Math.min(20, Math.floor(x.antal));
      pris += a * Number(katalog[x.id][3]);
      return a + ' × ' + katalog[x.id][1];
    }).join(', ');
    const mig = profil(s[0]);
    if (pris > mig.saldo) throw new Error('Du mangler ' + (pris - mig.saldo) + ' point');
    const kode = nyKode();
    ark(ARK.koder).appendRow([kode, nu(), s[0], s[1], tekst, pris, 'Afventer', '']); MEMO = {};
    return { ok: true, kode: kode, pris: pris, varer: tekst, mig: profil(s[0]), koder: mineKoder(s[0]) };
  },

  top: function () {
    const md = Utilities.formatDate(new Date(), TZ, 'yyyy-MM');
    const m = {};
    data(ARK.saelgere).forEach(r => { if (r[0] && r[5] !== 'nej') m[r[0]] = { navn: String(r[1]), alt: 0, md: 0, ordrer: 0, v: Number(r[7]) || 0 }; });
    data(ARK.log).forEach(r => {
      const x = m[r[1]]; if (!x) return;
      const p = Number(r[3]) || 0;
      x.alt += p;
      if (Utilities.formatDate(new Date(r[0]), TZ, 'yyyy-MM') === md) {
        x.md += p;
        if (r[4] === 'ordre') x.ordrer++;
      }
    });
    return { ok: true, maaned: md, liste: Object.keys(m).map(k => Object.assign({ id: k }, m[k])) };
  },

  billeder: function (b) {
    const ids = {}; (b.ids || []).forEach(i => ids[i] = 1);
    const ud = {};
    data(ARK.saelgere).forEach(r => { if (ids[r[0]] && r[6]) ud[r[0]] = String(r[6]); });
    return { ok: true, billeder: ud };
  },

  /* ---------- Admin ---------- */
  billede: function (b) {
    admin(b);
    const d = String(b.data || '');
    if (d && (!/^data:image\/(jpeg|png|webp);base64,/.test(d) || d.length > 48000)) throw new Error('Billedet er for stort eller i et forkert format');
    const rows = data(ARK.saelgere);
    const i = rows.findIndex(r => r[0] === b.id);
    if (i < 0) throw new Error('Sælger ikke fundet');
    const sh = ark(ARK.saelgere);
    if (!sh.getRange(1, 7).getValue()) sh.getRange(1, 7, 1, 2).setValues([['Billede', 'Billede-version']]).setFontWeight('bold').setBackground('#ED0812').setFontColor('#ffffff');
    sh.getRange(i + 2, 7, 1, 2).setValues([[d, d ? Date.now() : 0]]);
    MEMO = {};
    return adminData();
  },

  priser: function () { return Object.assign({ ok: true }, priser()); },

  gempriser: function (b) {
    admin(b);
    const skriv = (navn, rows) => {
      if (!rows || rows.length < 2) return;
      const sh = ark(navn);
      const w = rows[0].length;
      const ren = rows.map(r => { const x = r.slice(0, w); while (x.length < w) x.push(''); return x.map(c => String(c == null ? '' : c)); });
      sh.clearContents();
      sh.getRange(1, 1, ren.length, w).setNumberFormat('@').setValues(ren);
      sh.getRange(1, 1, 1, w).setFontWeight('bold').setBackground('#ED0812').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    };
    skriv(ARK.priser, b.plan);
    skriv(ARK.el, b.el);
    MEMO = {};
    return Object.assign({ ok: true }, priser());
  },

  admin: function (b) {
    admin(b);
    return adminData();
  },

  indloes: function (b) {
    admin(b);
    const kode = String(b.kode || '').trim().toUpperCase();
    const rows = data(ARK.koder);
    const i = rows.findIndex(r => String(r[0]).toUpperCase() === kode);
    if (i < 0) throw new Error('Koden findes ikke');
    if (rows[i][6] !== 'Afventer') throw new Error('Koden er allerede ' + String(rows[i][6]).toLowerCase());
    const status = b.afvis ? 'Afvist' : 'Indløst';
    ark(ARK.koder).getRange(i + 2, 7, 1, 2).setValues([[status, nu()]]);
    rows[i][6] = status;
    MEMO = {};
    return Object.assign(adminData(), { kode: rk(rows[i]) });
  },

  godkend: function (b) {
    admin(b);
    const rows = data(ARK.ordrer);
    const i = rows.findIndex(r => r[0] === b.id);
    if (i < 0) throw new Error('Ordren findes ikke');
    const r = rows[i];
    if (r[9] !== 'Afventer') throw new Error('Ordren er allerede ' + String(r[9]).toLowerCase());
    const status = b.afvis ? 'Afvist' : 'Godkendt';
    ark(ARK.ordrer).getRange(i + 2, 10, 1, 2).setValues([[status, nu()]]);
    if (!b.afvis) ark(ARK.log).appendRow([nu(), r[2], r[3], Number(r[8]) || 0, 'ordre', 'Ordre ' + r[4] + (r[5] ? ' · ' + r[5] : ''), r[0]]);
    r[9] = status;
    MEMO = {};
    return Object.assign(adminData(), { ordre: ro(r) });
  },

  slet: function (b) {
    admin(b);
    const rows = data(ARK.saelgere);
    const i = rows.findIndex(r => r[0] === b.id);
    if (i < 0) throw new Error('Sælger ikke fundet');
    ark(ARK.saelgere).deleteRow(i + 2);
    MEMO = {};
    return Object.assign(adminData(), { slettet: String(rows[i][1]) });
  },

  bonus: function (b) {
    admin(b);
    const p = Math.round(Number(b.point) || 0);
    if (!p) throw new Error('Skriv et antal point');
    const r = data(ARK.saelgere).find(x => x[0] === b.id);
    if (!r) throw new Error('Sælger ikke fundet');
    ark(ARK.log).appendRow([nu(), r[0], r[1], p, 'bonus', String(b.note || 'Bonus fra admin').slice(0, 200), '']);
    MEMO = {};
    return Object.assign(adminData(), { mig: profil(r[0]) });
  }
};

/* ---------- Hjælpere ---------- */
function ark(n) { return SpreadsheetApp.getActive().getSheetByName(n); }
function data(n) {
  if (MEMO[n]) return MEMO[n];
  const v = ark(n).getDataRange().getValues().slice(1);
  return MEMO[n] = v;
}
function adminData() {
  return { ok: true, koder: data(ARK.koder).map(rk).reverse(), ordrer: data(ARK.ordrer).map(ro).reverse(), saelgere: data(ARK.saelgere).filter(r => r[0]).map(r => profil(r[0])), regler: regler() };
}
function nu() { return new Date(); }
function celle(c) {
  if (c instanceof Date) return Utilities.formatDate(c, TZ, 'yyyy-MM');
  if (typeof c === 'number') return String(c).replace('.', ',');
  return String(c == null ? '' : c).trim();
}
function priser() {
  const tag = n => { const v = ark(n).getDataRange().getValues().map(r => r.map(celle)); return v.filter(r => r.some(c => c !== '')); };
  return { plan: tag(ARK.priser), el: tag(ARK.el) };
}
function hash(pin, salt) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ':' + pin + ':luffy'));
}
function admin(b) {
  if (!ADMIN_KODE || ADMIN_KODE === 'skift-mig-123') throw new Error('Skift ADMIN_KODE øverst i scriptet først');
  if (String(b.admin || '') !== ADMIN_KODE) throw new Error('Forkert admin-kode');
}
function saelger(token) {
  const r = data(ARK.saelgere).find(x => token && x[3] === token);
  if (!r) throw new Error('LOGIN');
  if (r[5] === 'nej') throw new Error('Profilen er deaktiveret');
  return r;
}
function profil(id) {
  const s = data(ARK.saelgere).find(r => r[0] === id) || [];
  let optjent = 0, brugt = 0;
  data(ARK.log).forEach(r => { if (r[1] === id) optjent += Number(r[3]) || 0; });
  data(ARK.koder).forEach(r => { if (r[2] === id && r[6] !== 'Afvist') brugt += Number(r[5]) || 0; });
  let afventer = 0;
  data(ARK.ordrer).forEach(r => { if (r[2] === id && r[9] === 'Afventer') afventer += Number(r[8]) || 0; });
  return { id: id, navn: String(s[1] || ''), optjent: optjent, brugt: brugt, saldo: optjent - brugt, afventer: afventer, v: Number(s[7]) || 0 };
}
function mineOrdrer(id) { return data(ARK.ordrer).filter(r => r[2] === id).map(ro).reverse().slice(0, 20); }
function ro(r) {
  return { id: r[0], tid: r[1] ? new Date(r[1]).toISOString() : '', saelger: r[2], navn: String(r[3]), ordrenr: String(r[4]), kunde: String(r[5]), vaerdi: Number(r[6]) || 0, el: Number(r[7]) || 0, point: Number(r[8]) || 0, status: String(r[9]) };
}
function beregn(kv, el) {
  const R = regler();
  return (kv >= R.min_kontraktvaerdi ? R.point_pr_ordre + Math.floor(kv / 100 * R.point_pr_100_kr) : 0) + el * R.point_pr_elsalg;
}
function mineKoder(id) { return data(ARK.koder).filter(r => r[2] === id).map(rk).reverse().slice(0, 20); }
function rk(r) {
  return { kode: String(r[0]), tid: r[1] ? new Date(r[1]).toISOString() : '', id: r[2], navn: String(r[3]), varer: String(r[4]), point: Number(r[5]) || 0, status: String(r[6]), indloest: r[7] ? new Date(r[7]).toISOString() : '' };
}
function regler() {
  const R = {};
  STD_REGLER.forEach(x => R[x[0]] = x[1]);
  data(ARK.regler).forEach(r => { if (r[0] !== '' && r[1] !== '' && !isNaN(Number(r[1]))) R[String(r[0])] = Number(r[1]); });
  return R;
}
function nyKode() {
  const tegn = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const brugt = {}; data(ARK.koder).forEach(r => brugt[r[0]] = 1);
  let k;
  do { k = 'LUF-'; for (let i = 0; i < 5; i++) k += tegn[Math.floor(Math.random() * tegn.length)]; } while (brugt[k]);
  return k;
}

/* ---------- Opret ark første gang ---------- */
function sikrArk() {
  const c = CacheService.getScriptCache();
  if (c.get('ark_ok2')) return;
  const ss = SpreadsheetApp.getActive();
  const lav = (navn, hoved, raekker) => {
    let sh = ss.getSheetByName(navn);
    if (sh) return;
    sh = ss.insertSheet(navn);
    sh.getRange(1, 1, 1, hoved.length).setValues([hoved]).setFontWeight('bold').setBackground('#ED0812').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    if (raekker && raekker.length) sh.getRange(2, 1, raekker.length, hoved.length).setValues(raekker);
  };
  lav(ARK.saelgere, ['ID', 'Navn', 'PIN (krypteret)', 'Token', 'Oprettet', 'Aktiv (ja/nej)', 'Billede', 'Billede-version']);
  lav(ARK.log, ['Tid', 'Sælger-ID', 'Navn', 'Point', 'Type', 'Note', 'Reference']);
  lav(ARK.shop, ['ID', 'Navn', 'Beskrivelse', 'Pris (point)', 'Ikon', 'Aktiv (ja/nej)'], STD_SHOP);
  lav(ARK.ordrer, ['ID', 'Tid', 'Sælger-ID', 'Navn', 'Ordrenr.', 'Kunde', 'Kontraktværdi (kr. ekskl. moms)', 'Elaftaler', 'Point', 'Status', 'Behandlet']);
  lav(ARK.koder, ['Kode', 'Tid', 'Sælger-ID', 'Navn', 'Varer', 'Point', 'Status', 'Indløst']);
  lav(ARK.regler, ['Regel', 'Point', 'Forklaring'], STD_REGLER);
  lav(ARK.priser, ['Kategori', 'Abonnement', 'Listepris/md.', 'Binding', 'Kampagnepris/md.', 'Kampagne udløber', 'Maks. rabat/md.', 'Telefonrabat nyt', 'Telefonrabat forl.']);
  lav(ARK.el, ['Produkt', 'Elpris øre/kWh', 'Transport og afgifter øre/kWh', 'Tillæg øre/kWh', 'Abonnement kr./md.', 'Gælder for (måned)']);
  c.put('ark_ok2', '1', 21600);
}

/** Kør denne én gang fra editoren, hvis du vil se arkene med det samme. */
function opsaet() { sikrArk(); }
