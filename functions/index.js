const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// -------------------------------------------------------------------
// FREE METHOD — No Google Workspace or paid APIs needed.
// Uses Firebase Auth + Firestore only.
// Users are guided to manually join a free public Google Group.
// -------------------------------------------------------------------

/**
 * Triggered automatically when a new user signs up with Firebase Auth.
 * Creates their tester record in Firestore.
 */
exports.onUserSignUp = functions.auth.user().onCreate(async (user) => {
    const email = user.email;
    const uid = user.uid;

    if (!email) {
        console.log("No email on user, skipping.");
        return null;
    }

    try {
        await db.collection('testers').doc(uid).set({
            email: email,
            displayName: user.displayName || null,
            signUpDate: admin.firestore.FieldValue.serverTimestamp(),
            // Free method: user needs to manually join the Google Group
            status: 'awaiting_group_join',
            groupJoinedSelfReported: false,
            optInClicked: false
        });

        console.log(`Tester record created for: ${email}`);
    } catch (error) {
        console.error(`Failed to create tester record for ${email}:`, error);
    }

    return null;
});

/**
 * Callable function: user self-reports they have joined the Google Group.
 * Updates their status in Firestore.
 */
exports.reportGroupJoined = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'You must be logged in.'
        );
    }

    const uid = context.auth.uid;
    const docRef = db.collection('testers').doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Tester record not found.');
    }

    await docRef.update({
        groupJoinedSelfReported: true,
        groupJoinedDate: admin.firestore.FieldValue.serverTimestamp(),
        status: 'enrolled'
    });

    return { success: true, message: "You are now enrolled! Follow the opt-in link below." };
});

/**
 * Callable function: user self-reports they clicked the opt-in link.
 */
exports.reportOptInClicked = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'You must be logged in.'
        );
    }

    const uid = context.auth.uid;
    await db.collection('testers').doc(uid).update({
        optInClicked: true,
        optInDate: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
});
