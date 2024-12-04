// TODO - remaining an error where 'getReactNativePersistence' is not a function
// Use .env variables in this file - CONFIG does not work here
import type {Auth} from 'firebase/auth';
import type {FirebaseApp} from 'firebase/app';
import {isConnectedToAuthEmulator} from '@src/libs/Firebase/FirebaseUtils';
import {describeWithEmulator} from '../../emulators/utils';
import AuthEmulator from '../../emulators/auth';

jest.mock('@react-native-async-storage/async-storage', () => ({}));

require('dotenv').config();

describeWithEmulator('Connect to the storage emulator', () => {
  let testApp: FirebaseApp;
  let auth: Auth;

  beforeAll(async () => {
    ({testApp, auth} = AuthEmulator.setup());
  });

  beforeEach(async () => {
    await AuthEmulator.createMockUsers(auth);
  });

  afterEach(async () => {
    // do something
  });

  afterAll(async () => {
    await AuthEmulator.teardown(testApp);
  });

  it('should connect to the auth emulator', async () => {
    expect(auth).not.toBeNull();
    expect(isConnectedToAuthEmulator(auth)).toBe(true);
  });
});
