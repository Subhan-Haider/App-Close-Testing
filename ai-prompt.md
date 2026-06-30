# Prompt to Build a Google Play Closed Testing Portal

**Copy and paste the text below to any AI (ChatGPT, Claude, Gemini) if you want it to build this exact project from scratch for another app:**

***

Act as an expert web developer. I need you to build a "Google Play Closed Testing Onboarding Portal" for my Android app.

**Goal:**
Google requires 20 testers for 14 days to publish an app. I want a completely free, serverless web portal where users can sign up, join my Google Group, and opt-in to my testing track on the Play Store.

**Tech Stack:**
- **Frontend:** Plain HTML, CSS, and Vanilla JavaScript (No React/Next.js/Vite, just plain files).
- **Backend/Hosting:** Firebase Hosting, Firebase Authentication, and Cloud Firestore.
- **Cost:** Must be 100% free. Do NOT use Firebase Cloud Functions or any APIs that require a billing account. All database writing must happen directly from the client side (`app.js`).

**User Flow (State Machine):**
Build a beautiful, modern, single-page UI with a 3-step state machine based on the user's Firestore document.

1. **Step 1 - Authentication:** 
   Show a login/signup screen using Firebase Auth (Google Popup and Email/Password). When a user signs up, create a document for them in the Firestore `testers` collection with `status: 'awaiting_group_join'`.
   
2. **Step 2 - Join Google Group:** 
   Show a button that opens my Google Group link in a new tab. Below it, add a "Yes, I joined the group" confirmation button. When they click the confirmation, update their Firestore document to `status: 'enrolled'` and `groupJoinedSelfReported: true`.

3. **Step 3 - Opt-in to Play Store:** 
   Show a button that opens the Play Store Opt-in link in a new tab. Below it, add a "Done" confirmation button. When they click it, update their Firestore document to `optInClicked: true` and show a final success screen with a link to download the app on the Play Store.

**Required Files:**
1. `index.html` - The main UI with hidden/visible sections for each step.
2. `index.css` - Modern styling (glassmorphism, smooth transitions, nice fonts).
3. `app.js` - Firebase initialization, auth listeners, and Firestore read/writes.
4. `config.js` - A centralized file exporting `GOOGLE_GROUP_JOIN_URL`, `OPTIN_URL`, and `PLAY_STORE_URL` so I don't have to hunt through `app.js` to change my links.
5. `admin.html` - A hidden, simple admin dashboard that reads the `testers` collection and shows a table of all signed-up users and their current status.
6. `firestore.rules` - Security rules allowing users to read/write ONLY their own document (`if request.auth != null && request.auth.uid == userId;`).

Please write all the code for these files and give me the exact Firebase CLI commands to deploy it.
