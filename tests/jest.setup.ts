// Provide minimal environment variables so firebase-admin initialization does not fail in tests
process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL || 'test@test.com';
process.env.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

// Provide a lightweight mock for firebase-admin so tests don't try to parse real service account keys
const fakeAdmin: any = {
  apps: [],
  initializeApp: jest.fn(),
  credential: { cert: () => ({}) },
  auth: jest.fn(() => ({})),
  firestore: jest.fn(() => ({ collection: jest.fn() })),
};
(fakeAdmin.firestore as any).FieldValue = { serverTimestamp: jest.fn() };
jest.mock('firebase-admin', () => fakeAdmin);

// Silence console logs in tests unless needed
// jest.spyOn(console, 'log').mockImplementation(() => {});
