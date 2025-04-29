/**
 * Single entry-point Cloud Function (`/api`)
 *  • POST /create-invite  – create a new invite (one number ever)
 *  • POST /verify-invite  – mark an invite as used
 */
const functions = require('firebase-functions/v1');
const admin     = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// ────────────────────────────────────────────────────────────────
exports.api = functions.region('us-central1').https.onRequest(
async (req, res) => {

  /* ───── CORS & pre-flight ───── */
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {           // CORS pre-flight
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  /* strip trailing slashes so “/create-invite/” still matches */
  const path = req.path.replace(/\/+$/, '');

  try {
    /* ───────── /create-invite ───────── */
    if (path === '/create-invite' && req.method === 'POST') {

      const { sharer = '', ref = '' } = req.body || {};

      if (!sharer || !ref)
        return res.status(400).send('Missing fields: sharer / ref');

      /* 1-number-ever rule */
      const dup = await db.collection('invites')
                          .where('ref', '==', ref)
                          .limit(1)
                          .get();

      if (!dup.empty)
        return res.status(409).send('This mobile number has already been used.');

      await db.collection('invites').add({
        sharer,
        ref,
        used:    false,
        created: Date.now()
      });

      return res.sendStatus(200);               // success
    }

    /* ───────── /verify-invite ───────── */
    if (path === '/verify-invite' && req.method === 'POST') {

      const { code = '', phone = '' } = req.body || {};

      const snap = await db.collection('invites')
                           .where('ref',  '==', code)
                           .where('used', '==', false)
                           .limit(1)
                           .get();

      if (snap.empty || phone !== code)
        return res.status(400).send('Invalid or already used invite.');

      await snap.docs[0].ref.update({ used: true });

      /* send user back to the SPA root */
      return res.redirect(302, '/');
    }

    /* ───────── any other route ───────── */
    return res.status(404).send('Not found');

  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal error: ' + err.message);
  }
});
