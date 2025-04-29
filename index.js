<script>
/* Firebase init (unchanged) */
firebase.initializeApp({
  apiKey:"AIzaSyD4MRqr2ZtobJRjmiyFDjEX_rQC0uq5kXE",
  authDomain:"whatsapp-sender-1745259132.firebaseapp.com",
  projectId:"whatsapp-sender-1745259132",
  storageBucket:"whatsapp-sender-1745259132.appspot.com",
  messagingSenderId:"416889662149",
  appId:"1:416889662149:web:62ac6ac4b12a4779b61eac"
});
const auth=firebase.auth(), db=firebase.firestore(), storage=firebase.storage();
const BASE="https://whatsapp-sender-1745259132.web.app";

/* Regex (+234703… OR 0703…) */
const NG_CORE_MOBILE =
  /^(?:\+234|0)(?:703|704|706|803|806|810|813|814|816|819|903|906|913|916|701|708|802|808|812|901|902|904|907|912|705|805|807|811|815|905|915|809|817|818|908|909)\d{7}$/;

/* ───────── Contact-picker handler (fixed) ───────── */
pickContact.onclick = async () => {
  if (!('contacts' in navigator) || !('select' in navigator.contacts)) {
    alert('Your browser can’t open contacts — please type the number.');
    return;
  }
  try {
    const [c] = await navigator.contacts.select(['name', 'tel'], { multiple: false });
    if (!c || !c.tel?.length) return;

    let n = c.tel[0].replace(/[\s\-()]/g, '');
    if (n.startsWith('+234')) n = '0' + n.slice(4);

    recipientInput.value = n;
    recipientInput.focus();
  } catch (e) {
    console.error(e);
  }
};

/* ----- the rest of your JS is unchanged  ------------------------------ */
/* Auth … Counters … Social share … Invite flow … Firestore grid … Viewer
   Quick-message … Admin upload                                            */
</script>
