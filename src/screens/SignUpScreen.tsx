﻿import React, {useEffect, useReducer} from 'react';
import {
  Dimensions,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import {updateProfile} from 'firebase/auth';
import {auth} from '@src/services/firebaseSetup';
import {signUpUserWithEmailAndPassword} from '@src/auth/auth';
import {useFirebase} from '@context/global/FirebaseContext';
import {SignUpScreenProps} from '@src/types/screens';
import {readDataOnce} from '@database/baseFunctions';
import {useUserConnection} from '@context/global/UserConnectionContext';
import {
  isValidPassword,
  isValidPasswordConfirm,
  validateAppVersion,
  validateSignInInput,
} from '@libs/Validation';
import {deleteUserData, pushNewUserInfo} from '@database/users';
import {handleErrors} from '@libs/ErrorHandling';
import CONST from '@src/CONST';
import WarningMessage from '@components/Info/WarningMessage';
import DismissKeyboard from '@components/Keyboard/DismissKeyboard';
import {Profile} from '@src/types/database';
import DBPATHS from '@database/DBPATHS';
import ValidityIndicatorIcon from '@components/ValidityIndicatorIcon';
import SCREENS from '@src/SCREENS';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

interface State {
  email: string;
  username: string;
  password: string;
  passwordIsValid: boolean;
  passwordConfirm: string;
  passwordsMatch: boolean;
  warning: string;
}

interface Action {
  type: string;
  payload: any;
}

const initialState: State = {
  email: '',
  username: '',
  password: '',
  passwordIsValid: false,
  passwordConfirm: '',
  passwordsMatch: false,
  warning: '',
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'UPDATE_EMAIL':
      return {
        ...state,
        email: action.payload,
      };
    case 'UPDATE_USERNAME':
      return {
        ...state,
        username: action.payload,
      };
    case 'UPDATE_PASSWORD':
      return {
        ...state,
        password: action.payload,
      };
    case 'UPDATE_PASSWORD_VALIDITY':
      return {
        ...state,
        passwordIsValid: action.payload,
      };
    case 'UPDATE_PASSWORD_CONFIRM':
      return {
        ...state,
        passwordConfirm: action.payload,
      };
    case 'UPDATE_PASSWORDS_MATCH':
      return {
        ...state,
        passwordsMatch: action.payload,
      };
    case 'SET_WARNING':
      return {
        ...state,
        warning: action.payload,
      };
    default:
      return state;
  }
};

const SignUpScreen = ({route, navigation}: SignUpScreenProps) => {
  const {db} = useFirebase();
  const {isOnline} = useUserConnection();
  const [state, dispatch] = useReducer(reducer, initialState);
  if (!db) return null; // Should never be null

  async function rollbackChanges(
    newUserId: string,
    userNickname: string,
  ): Promise<void> {
    // Delete the user data from the Realtime Database
    await deleteUserData(db, newUserId, userNickname, undefined, undefined);

    // Delete the user from Firebase authentication
    if (auth.currentUser) {
      await auth.currentUser.delete();
    }
  }

  const handleSignUp = async () => {
    if (!isOnline || !auth) return;

    const inputValidation = validateSignInInput(
      state.email,
      state.username,
      state.password,
      state.passwordConfirm,
    );
    if (!inputValidation.success) {
      dispatch({type: 'SET_WARNING', payload: inputValidation.message});
      return;
    }

    const currentUser = auth.currentUser;

    if (currentUser) {
      dispatch({
        type: 'SET_WARNING',
        payload:
          'You are already authenticated. This is a system bug, please reset the application data.',
      });
      return;
    }

    let newUserId: string | undefined;
    let minSupportedVersion: string | null;
    let minUserCreationPath =
      DBPATHS.CONFIG_APP_SETTINGS_MIN_USER_CREATION_POSSIBLE_VERSION;

    try {
      minSupportedVersion = await readDataOnce(db, minUserCreationPath);
    } catch (error: any) {
      Alert.alert(
        'Data fetch failed',
        'Could not fetch the sign-up source data: ' + error.message,
      );
      return;
    }

    if (!minSupportedVersion) {
      dispatch({
        type: 'SET_WARNING',
        payload:
          'Failed to fetch the minimum supported version. Please try again later.',
      });
      return;
    }
    if (!validateAppVersion(minSupportedVersion)) {
      dispatch({
        type: 'SET_WARNING',
        payload:
          'This version of the application is outdated. Please upgrade to the newest version.',
      });
      return;
    }

    // Pushing initial user data to Realtime Database
    const newProfileData: Profile = {
      display_name: state.username,
      photo_url: '',
    };

    // Create the user in the Firebase authentication
    try {
      await signUpUserWithEmailAndPassword(auth, state.email, state.password);
    } catch (error: any) {
      console.log(
        'Sign-up failed when creating a user in firebase authentification: ',
        error,
      );
      Alert.alert(
        'Sign-up failed',
        'There was an error during sign-up: ' + error.message,
      );
      return;
    }

    if (!auth.currentUser) {
      throw new Error('User creation failed');
    }
    newUserId = auth.currentUser.uid;

    try {
      // Realtime Database updates
      await pushNewUserInfo(db, newUserId, newProfileData);
    } catch (error: any) {
      const errorHeading = 'Sign-up failed';
      const errorMessage = 'There was an error during sign-up: ';
      handleErrors(error, errorHeading, errorMessage, dispatch);

      // Attempt to rollback any changes made
      try {
        await rollbackChanges(newUserId, newProfileData.display_name);
      } catch (rollbackError: any) {
        const errorHeading = 'Rollback error';
        const errorMessage = 'Error during sign-up rollback:';
        handleErrors(rollbackError, errorHeading, errorMessage, dispatch);
      }
      return;
    }
    // Update Firebase authentication
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {displayName: state.username});
      } catch (error: any) {
        const errorHeading = 'User profile update failed';
        const errorMessage = 'There was an error during sign-up: ';
        handleErrors(error, errorHeading, errorMessage, dispatch);
        return;
      }
    }
    // Navigate to the main screen with a success message
    navigation.replace('App', {screen: 'Main Screen'});
    return;
  };

  // Track password validity
  useEffect(() => {
    if (isValidPassword(state.password)) {
      dispatch({type: 'UPDATE_PASSWORD_VALIDITY', payload: true});
    } else {
      dispatch({type: 'UPDATE_PASSWORD_VALIDITY', payload: false});
    }
  }, [state.password]);

  // Track password matching
  useEffect(() => {
    if (isValidPasswordConfirm(state.password, state.passwordConfirm)) {
      dispatch({type: 'UPDATE_PASSWORDS_MATCH', payload: true});
    } else {
      dispatch({type: 'UPDATE_PASSWORDS_MATCH', payload: false});
    }
  }, [state.password, state.passwordConfirm]);

  if (!route || !navigation) return null; // Should never be null

  return (
    <DismissKeyboard>
      <View style={styles.mainContainer}>
        <WarningMessage warningText={state.warning} dispatch={dispatch} />
        <View style={styles.logoContainer}>
          <Image source={CONST.IMAGES.LOGO} style={styles.logo} />
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputItemContainer}>
            <TextInput
              placeholder="Email"
              placeholderTextColor={'#a8a8a8'}
              keyboardType="email-address"
              textContentType="emailAddress"
              value={state.email}
              onChangeText={text =>
                dispatch({type: 'UPDATE_EMAIL', payload: text})
              }
              style={styles.inputItemText}
            />
          </View>
          <View style={styles.inputItemContainer}>
            <TextInput
              placeholder="Username"
              placeholderTextColor={'#a8a8a8'}
              textContentType="username"
              value={state.username}
              onChangeText={text =>
                dispatch({type: 'UPDATE_USERNAME', payload: text})
              }
              style={styles.inputItemText}
            />
          </View>
          <View style={styles.inputItemContainer}>
            <TextInput
              placeholder="Password"
              placeholderTextColor={'#a8a8a8'}
              textContentType="password"
              value={state.password}
              onChangeText={text =>
                dispatch({type: 'UPDATE_PASSWORD', payload: text})
              }
              style={styles.inputItemText}
              secureTextEntry
            />
            {state.password ? (
              <ValidityIndicatorIcon isValid={state.passwordIsValid} />
            ) : null}
          </View>
          <View style={styles.inputItemContainer}>
            <TextInput
              placeholder="Confirm your password"
              placeholderTextColor={'#a8a8a8'}
              textContentType="password"
              value={state.passwordConfirm}
              onChangeText={text =>
                dispatch({type: 'UPDATE_PASSWORD_CONFIRM', payload: text})
              }
              style={styles.inputItemText}
              secureTextEntry
            />
            {state.passwordConfirm && state.password ? (
              <ValidityIndicatorIcon isValid={state.passwordsMatch} />
            ) : null}
          </View>
          <TouchableOpacity onPress={handleSignUp} style={styles.signUpButton}>
            <Text style={styles.signUpButtonText}>Create account</Text>
          </TouchableOpacity>
          <View style={styles.loginContainer}>
            <TouchableOpacity
              style={styles.loginButtonContainer}
              // onPress={() => navigation.navigate(SCREENS.LOGIN)}>
              onPress={() => Navigation.navigate(ROUTES.FORCE_UPDATE)}>
              <Text style={styles.loginInfoText}>Already a user?</Text>
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </DismissKeyboard>
  );
};

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: '#FFFF99',
  },
  logoContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    height: screenHeight * 0.2,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  warningContainer: {
    width: '80%',
    position: 'absolute', // Temp
    top: '10%', // Temp
    borderRadius: 5,
    backgroundColor: '#fce3e1',
    borderColor: 'red',
    borderWidth: 2,
    alignItems: 'center',
    alignSelf: 'center',
  },
  warningButton: {
    flexGrow: 1,
    width: '90%',
  },
  warning: {
    padding: 5,
    textAlign: 'center',
    color: 'red',
    fontWeight: 'bold',
  },
  inputContainer: {
    paddingTop: screenHeight * 0.1,
    width: '80%',
    height: screenHeight * 0.85,
  },
  inputItemContainer: {
    backgroundColor: 'white',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    paddingLeft: 10,
    paddingRight: 5,
    borderRadius: 10,
    borderColor: '#000',
    borderWidth: 2,
    marginTop: 5,
    marginBottom: 5,
  },
  inputItemText: {
    fontSize: 14,
    width: '90%',
  },
  passwordCheckContainer: {
    backgroundColor: 'purple',
    marginRight: 10,
  },
  passwordCheckIcon: {
    width: 20,
    height: 20,
  },
  passwordsMatch: {
    backgroundColor: 'green',
  },
  passwordsMismatch: {
    backgroundColor: 'red',
  },
  signUpButton: {
    backgroundColor: '#fcf50f',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    marginTop: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },
  signUpButtonText: {
    color: 'black',
    fontWeight: '700',
    fontSize: 16,
  },
  loginContainer: {
    marginTop: 3,
    width: '100%',
  },
  loginInfoText: {
    color: '#000',
  },
  loginButtonContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#02a109',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
    paddingTop: 10,
    paddingBottom: 10,
  },
});

export default SignUpScreen;
