// ─────────────────────────────────────────────────────
//  Beta Tester Portal — app.js (Free Method)
//  Flow: Sign Up → Join Google Group → Click Opt-in Link
// ─────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { GOOGLE_GROUP_JOIN_URL, OPTIN_URL, PLAY_STORE_URL } from "./config.js";

// ─── Firebase config ────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyDYWf5SjNIbWBeMUl82bV5dDH6_eyvaJB4",
  authDomain:        "autotypingadmin.firebaseapp.com",
  databaseURL:       "https://autotypingadmin-default-rtdb.firebaseio.com",
  projectId:         "autotypingadmin",
  storageBucket:     "autotypingadmin.firebasestorage.app",
  messagingSenderId: "669769320373",
  appId:             "1:669769320373:web:65773e977f62ab8dbf7bfc",
  measurementId:     "G-ERS3YEL9CQ"
};

// ─────────────────────────────────────────────────────────────────────

const app       = initializeApp(firebaseConfig);
const auth      = getAuth(app);
const db        = getFirestore(app);

// ── DOM refs ──────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const views = {
  loading:   $('view-loading'),
  auth:      $('view-auth'),
  dashboard: $('view-dashboard')
};

// Auth form
const authForm       = $('auth-form');
const inpEmail       = $('inp-email');
const inpPassword    = $('inp-password');
const btnAuth        = $('btn-auth');
const btnAuthLabel   = $('btn-auth-label');
const btnAuthSpinner = $('btn-auth-spinner');
const authError      = $('auth-error');
const btnGoogle      = $('btn-google');
const toggleLink     = $('toggle-auth-link');
const toggleText     = $('toggle-auth-text');
const authHeading    = $('auth-heading');
const authSubheading = $('auth-subheading');

// Dashboard
const dashEmail   = $('dash-email');
const dashAvatar  = $('dash-avatar');
const dashLoading = $('dash-loading');
const dashContent = $('dash-content');
const btnLogout   = $('btn-logout');

// Steps & connectors
const step1 = $('step-1'), step2 = $('step-2'), step3 = $('step-3');
const conn1 = $('conn-1'), conn2 = $('conn-2');

// Panels
const panelJoinGroup = $('panel-join-group');
const panelEnrolled  = $('panel-enrolled');
const panelDone      = $('panel-done');

// Panel widgets
const btnJoinGroup      = $('btn-join-group');
const btnConfirmJoined  = $('btn-confirm-joined');
const confirmJoinLabel  = $('confirm-join-label');
const confirmJoinSpinner= $('confirm-join-spinner');
const joinError         = $('join-error');
const btnOptin          = $('btn-optin');
const optinLinkText     = $('optin-link-text');
const copyLinkBox       = $('copy-link-box');
const copyToast         = $('copy-toast');
const btnConfirmOptin   = $('btn-confirm-optin');
const btnPlayStore      = $('btn-play-store');

// ── State ─────────────────────────────────────────────────────────────
let isLoginMode = false;
let unsubStatus = null;

// ── View helpers ──────────────────────────────────────────────────────
function showView(name) {
  Object.values(views).forEach(v => v.classList.add('hidden'));
  views[name].classList.remove('hidden');
}

function showPanel(panel) {
  [panelJoinGroup, panelEnrolled, panelDone].forEach(p => p.classList.add('hidden'));
  panel.classList.remove('hidden');
}

// ── Step indicator ────────────────────────────────────────────────────
function setSteps(currentStep) {
  // Step 1 always done if on dashboard
  step1.className = 'step done';
  step2.className = 'step';
  step3.className = 'step';
  conn1.className = 'step-connector';
  conn2.className = 'step-connector';

  if (currentStep >= 2) { conn1.className = 'step-connector done'; step2.className = 'step active'; }
  if (currentStep >= 3) { step2.className = 'step done'; conn2.className = 'step-connector done'; step3.className = 'step active'; }
  if (currentStep >= 4) { step3.className = 'step done'; }
}

// ── Auth UI ───────────────────────────────────────────────────────────
function setAuthLoading(on) {
  btnAuth.disabled = on;
  btnGoogle.disabled = on;
  btnAuthLabel.classList.toggle('hidden', on);
  btnAuthSpinner.classList.toggle('hidden', !on);
}

function setAuthMode(login) {
  isLoginMode = login;
  authError.textContent = '';
  if (login) {
    authHeading.textContent = 'Welcome Back';
    authSubheading.textContent = 'Log in to check your tester enrollment status.';
    btnAuthLabel.textContent = 'Log In';
    toggleText.textContent = "Don't have an account?";
    toggleLink.textContent = 'Sign Up Free';
  } else {
    authHeading.textContent = 'Create Account';
    authSubheading.textContent = 'Sign up to join our exclusive Play Store closed testing program — completely free.';
    btnAuthLabel.textContent = 'Sign Up Free';
    toggleText.textContent = 'Already have an account?';
    toggleLink.textContent = 'Log In';
  }
}

toggleLink.addEventListener('click', () => setAuthMode(!isLoginMode));

authForm.addEventListener('submit', async e => {
  e.preventDefault();
  authError.textContent = '';
  const email = inpEmail.value.trim();
  const pass  = inpPassword.value;
  if (!email || !pass) return;

  setAuthLoading(true);
  try {
    let userCred;
    if (isLoginMode) {
      userCred = await signInWithEmailAndPassword(auth, email, pass);
    } else {
      userCred = await createUserWithEmailAndPassword(auth, email, pass);
      // Create user document on signup
      await setDoc(doc(db, 'testers', userCred.user.uid), {
        email: userCred.user.email,
        signUpDate: new Date().toISOString(),
        status: 'awaiting_group_join',
        optInClicked: false
      });
    }
  } catch (err) {
    authError.textContent = friendlyError(err.code);
    setAuthLoading(false);
  }
});

btnGoogle.addEventListener('click', async () => {
  authError.textContent = '';
  setAuthLoading(true);
  try {
    const userCred = await signInWithPopup(auth, new GoogleAuthProvider());
    // Create user doc if it doesn't exist (works for both login and signup)
    await setDoc(doc(db, 'testers', userCred.user.uid), {
      email: userCred.user.email,
      signUpDate: new Date().toISOString(),
      status: 'awaiting_group_join',
      optInClicked: false
    }, { merge: true });
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      authError.textContent = friendlyError(err.code);
    }
    setAuthLoading(false);
  }
});

btnLogout.addEventListener('click', () => {
  if (unsubStatus) { unsubStatus(); unsubStatus = null; }
  signOut(auth);
});

// ── Auth state ────────────────────────────────────────────────────────
onAuthStateChanged(auth, user => {
  if (user) {
    loadDashboard(user);
  } else {
    if (unsubStatus) { unsubStatus(); unsubStatus = null; }
    showView('auth');
    setAuthMode(false);
    setAuthLoading(false);
  }
});

// ── Dashboard ─────────────────────────────────────────────────────────
function loadDashboard(user) {
  showView('dashboard');
  dashEmail.textContent = user.email || '';
  dashAvatar.textContent = (user.email || '?')[0].toUpperCase();
  dashLoading.classList.remove('hidden');
  dashContent.classList.add('hidden');

  // Set static URLs
  btnJoinGroup.href = GOOGLE_GROUP_JOIN_URL;
  if (btnOptin) btnOptin.href = OPTIN_URL;
  if (optinLinkText) optinLinkText.textContent = OPTIN_URL;
  if (btnPlayStore) btnPlayStore.href = PLAY_STORE_URL;

  // Listen to Firestore tester doc
  const docRef = doc(db, 'testers', user.uid);
  if (unsubStatus) unsubStatus();

  unsubStatus = onSnapshot(docRef, snap => {
    dashLoading.classList.add('hidden');
    dashContent.classList.remove('hidden');

    if (!snap.exists()) {
      // Doc not yet created by Cloud Function — show step 2 as pending
      setSteps(2);
      showPanel(panelJoinGroup);
      return;
    }

    const data = snap.data();
    renderStatus(data);
  }, err => {
    console.error('Firestore error:', err);
    dashLoading.classList.add('hidden');
    dashContent.classList.remove('hidden');
    // Fallback: show join group step
    setSteps(2);
    showPanel(panelJoinGroup);
  });
}

function renderStatus(data) {
  const status = data.status || 'awaiting_group_join';
  const optInDone = data.optInClicked === true;

  if (status === 'awaiting_group_join') {
    setSteps(2);
    showPanel(panelJoinGroup);
  } else if (status === 'enrolled' && !optInDone) {
    setSteps(3);
    showPanel(panelEnrolled);
  } else if (status === 'enrolled' && optInDone) {
    setSteps(4);
    showPanel(panelDone);
  }
}

// ── Step 2 → confirm joined ───────────────────────────────────────────
btnConfirmJoined.addEventListener('click', async () => {
  joinError.textContent = '';
  confirmJoinLabel.classList.add('hidden');
  confirmJoinSpinner.classList.remove('hidden');
  btnConfirmJoined.disabled = true;

  try {
    await updateDoc(doc(db, 'testers', auth.currentUser.uid), {
      groupJoinedSelfReported: true,
      status: 'enrolled'
    });
    // Firestore listener will automatically update the UI
  } catch (err) {
    joinError.textContent = err.message || 'Something went wrong. Please try again.';
    confirmJoinLabel.classList.remove('hidden');
    confirmJoinSpinner.classList.add('hidden');
    btnConfirmJoined.disabled = false;
  }
});

// ── Step 3 → copy link ────────────────────────────────────────────────
copyLinkBox.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(OPTIN_URL);
    copyToast.textContent = '✓ Copied!';
    setTimeout(() => { copyToast.textContent = ''; }, 2500);
  } catch (_) { /* silently fail */ }
});

// ── Step 3 → confirm opt-in clicked ──────────────────────────────────
btnConfirmOptin.addEventListener('click', async () => {
  btnConfirmOptin.disabled = true;
  btnConfirmOptin.textContent = 'Saving…';
  try {
    await updateDoc(doc(db, 'testers', auth.currentUser.uid), {
      optInClicked: true
    });
    // Firestore listener updates UI
  } catch (err) {
    btnConfirmOptin.disabled = false;
    btnConfirmOptin.textContent = '✅ I\'ve clicked the opt-in link';
  }
});

// ── Error messages ────────────────────────────────────────────────────
function friendlyError(code) {
  const map = {
    'auth/email-already-in-use':   'That email is already registered. Try logging in.',
    'auth/invalid-email':          'Please enter a valid email address.',
    'auth/weak-password':          'Password must be at least 6 characters.',
    'auth/user-not-found':         'No account found with that email.',
    'auth/wrong-password':         'Incorrect password.',
    'auth/invalid-credential':     'Invalid email or password.',
    'auth/too-many-requests':      'Too many attempts. Please wait a moment.',
    'auth/network-request-failed': 'Network error. Check your connection.'
  };
  return map[code] || 'Something went wrong. Please try again.';
}
