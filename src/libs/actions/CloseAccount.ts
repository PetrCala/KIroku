import Onyx from 'react-native-onyx';
import type {Auth, UserCredential} from 'firebase/auth';
import {deleteUser, signOut} from 'firebase/auth';
import type {Database} from 'firebase/database';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {UserData} from '@src/types/onyx';
import * as Localize from '@libs/Localize';
import * as ErrorUtils from '@libs/ErrorUtils';
import {deleteUserData, reauthentificateUser} from './User';

/**
 * Clear CloseAccount error message to hide modal
 */
function clearError() {
  Onyx.merge(ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM, {errors: null});
}

/**
 * Set default Onyx data
 */
function setDefaultData() {
  Onyx.set(ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM, {
    ...CONST.DEFAULT_CLOSE_ACCOUNT_DATA,
  });
}

function setSuccessMessage(message: string) {
  Onyx.merge(ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM, {
    success: message,
  });
}

async function closeAccount(
  db: Database | null,
  auth: Auth | null,
  userData: UserData | undefined,
  reasonForLeaving: string,
  password: string,
) {
  try {
    const user = auth?.currentUser;

    if (!db || !userData || !user) {
      throw new Error('Missing data. Try reloading the page');
    }

    // Reauthentificate the user
    let authentificationResult: void | UserCredential;
    authentificationResult = await reauthentificateUser(user, password);

    if (!authentificationResult) {
      throw new Error(
        Localize.translateLocal('common.error.reauthenticationFailed'),
      );
    }

    const userNickname = userData.profile.display_name;
    await deleteUserData(
      db,
      user.uid,
      userNickname,
      userData.friends,
      userData.friend_requests,
      reasonForLeaving,
    );
    await deleteUser(user);

    // Updating the loading state here might cause some issues
    await signOut(auth);

    setSuccessMessage(Localize.translateLocal('closeAccount.successMessage'));

    // Add an alert here informing about the user deletion
    // Navigation.resetToHome(); // This is has been disabled as the redirect happens automatically upon Auth state change
  } catch (error) {
    ErrorUtils.raiseAlert(error, 'Error deleting your account');
  }
}

export {
  // eslint-disable-next-line import/prefer-default-export
  clearError,
  setDefaultData,
  setSuccessMessage,
  closeAccount,
};
