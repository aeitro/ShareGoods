# Firebase Setup for ShareGoods

This guide will help you set up Firebase Authentication for Google Sign-In in the ShareGoods application.

## Prerequisites

- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "ShareGoods")
4. Follow the setup wizard to create your project

## Step 2: Register Your Web App

1. In the Firebase Console, select your project
2. Click on the web icon (</>) to add a web app
3. Register your app with a nickname (e.g., "ShareGoods Web")
4. Copy the Firebase configuration object

## Step 3: Configure Authentication

1. In the Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started" if you haven't set up authentication yet
3. Go to the "Sign-in method" tab
4. Enable "Google" as a sign-in provider
5. Configure the OAuth consent screen if prompted
6. Save your changes

## Step 4: Update Environment Variables

1. Open the `.env.local` file in the frontend directory
2. Replace the placeholder values with your actual Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 5: Set Up Firebase Admin SDK for Backend

1. In the Firebase Console, go to "Project settings" > "Service accounts"
2. Click "Generate new private key" to download a JSON file with your service account credentials
3. Open the `.env` file in the backend directory
4. Add the following environment variables:

```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=client_email_from_json_file
FIREBASE_PRIVATE_KEY=private_key_from_json_file
```

**Note:** Make sure to keep your service account credentials secure and never commit them to version control.

## Step 6: Test the Integration

1. Start your backend server
2. Start your frontend development server
3. Navigate to the login page
4. Click "Login with Google"
5. Complete the Google authentication flow
6. You should be redirected to the appropriate dashboard based on your user role

## Troubleshooting

- If you encounter CORS issues, make sure your domain is added to the authorized domains in the Firebase Console
- Check browser console for any JavaScript errors
- Verify that all environment variables are correctly set
- Ensure the Firebase Admin SDK is properly initialized in the backend

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)