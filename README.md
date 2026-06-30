# Google Play Closed Testing Portal

This is a **100% free**, serverless web portal that automates the onboarding process for your Google Play Closed Testing (20 testers for 14 days) requirement.

## 🚀 Live Demo
Your portal is live at: **[https://autotypingadmin.web.app](https://autotypingadmin.web.app)**

---

## 🎯 What Problem This Solves

Google Play now requires all new developers to have **20 people test their app for 14 continuous days** before they are allowed to publish it to the public Play Store.

Managing this manually is a nightmare. You would normally have to message 20 people, get their emails, manually type them into the Play Console, and pray they actually opt in and download the app.

### The Solution: Full Automation
Instead of doing manual work, you just share one single link. When a tester visits this portal, it forces them through the exact funnel Google requires:

1. **Captures Email:** They sign in, and their email is instantly saved to your database.
2. **Whitelists Automatically:** It forces them to join your Google Group. By joining this group, Google Play automatically whitelists their email address without you typing a single thing in the Play Console.
3. **Delivers the App:** It provides them the exact Google Play Opt-in link to become a tester and download the app.

---

## 🏗 How It Works (The Architecture)

We designed this to be completely free by removing the need for paid APIs or Cloud Functions (which require a credit card). It relies on a "self-reporting" flow driven entirely by the frontend (`app.js`) communicating directly with Firebase services.

### The 3-Step User Flow
When a user visits your portal, they go through 3 steps:

1. **Sign Up (Firebase Auth):** 
   - The user signs in using Google or Email/Password.
   - *Behind the scenes:* A document is created in the Firestore database (`testers/{userId}`) to track their progress.

2. **Join Google Group:** 
   - The user clicks a button that opens your free Google Group in a new tab so they can join it.
   - After joining, they click a "Yes, I joined" button on your portal.
   - *Behind the scenes:* The portal updates their Firestore document status to `enrolled`.

3. **Opt-in on Play Store:** 
   - The user clicks a button that takes them to the Play Store Testing Opt-in page.
   - After opting in, they click a "Done" button on your portal.
   - *Behind the scenes:* The portal updates their Firestore document status to indicate they have fully completed the onboarding. They are then shown the final link to download your app.

---

## 🛠 Tech Stack (100% Free Tier)

*   **Frontend:** Plain HTML, CSS, and Vanilla JavaScript. (No heavy frameworks).
*   **Hosting:** Firebase Hosting (Free Spark Plan).
*   **Database:** Cloud Firestore (Free Spark Plan).
*   **Authentication:** Firebase Auth (Free Spark Plan).

---

## ⚙️ Configuration (`config.js`)

If you ever need to change your links (for example, if you make a new app), you **only** need to edit `config.js` in the root folder:

```javascript
// 1. Your Google Group Join Link
export const GOOGLE_GROUP_JOIN_URL = "https://groups.google.com/g/close-testing";

// 2. Your Play Store Opt-in Link
export const OPTIN_URL = "https://play.google.com/apps/testing/tech.subhan.humanizer";

// 3. Your Play Store App Link
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=tech.subhan.humanizer";
```

---

## 👨‍💻 Admin Panel

You have a secret admin panel to track how many testers have signed up and completed the process.

**To view the admin panel:**
Go to `https://autotypingadmin.web.app/admin.html`

*Note: Since it's client-side, the admin panel simply reads the Firestore `testers` collection. Only you (or anyone you share the link with) knows this URL.*

---

## 💻 Local Development

If you want to edit the code and test it on your computer before deploying:

1. Open a terminal in the project folder.
2. Run the local server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

---

## ☁️ How to Deploy Updates

If you change the text, colors, or code, you can push the updates to your live website with one command.

1. Open your terminal in the project folder.
2. Run:
   ```bash
   firebase deploy
   ```
3. Within seconds, your changes will be live at `https://autotypingadmin.web.app`.

*(Alternatively, because this is a static site, you can host it on Vercel, Netlify, or GitHub Pages by just uploading the files!)*
