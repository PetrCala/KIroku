import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Utils from '@libs/Utils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/DisplayNameForm';
import type {StackScreenProps} from '@react-navigation/stack';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import {useFirebase} from '@context/global/FirebaseContext';
import {changeDisplayName} from '@userActions/User';

type DisplayNameScreenProps = StackScreenProps<
  SettingsNavigatorParamList,
  typeof SCREENS.SETTINGS.ACCOUNT.DISPLAY_NAME
>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DisplayNameScreen({route}: DisplayNameScreenProps) {
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const {db, auth} = useFirebase();
  const [loadingText] = useOnyx(ONYXKEYS.APP_LOADING_TEXT);
  const {userData} = useDatabaseData();
  const profileData = userData?.profile;
  const [isLoadingName, setIsLoadingName] = React.useState(false);

  const currentUserDetails = {
    displayName: profileData?.display_name,
  };

  /**
   * Submit form to update user's display
   */
  const updateDisplayName = (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.DISPLAY_NAME_FORM>,
  ) => {
    (async () => {
      const newDisplayName = values.displayName.trim();
      try {
        setIsLoadingName(true);
        await Utils.setLoadingText(
          translate('displayNameScreen.updatingDisplayName'),
        );
        await changeDisplayName(
          db,
          auth.currentUser,
          profileData?.display_name,
          newDisplayName,
        );
      } catch (error) {
        ErrorUtils.raiseAlert(
          error,
          translate('displayNameScreen.error.generic'),
        );
      } finally {
        Navigation.goBack();
        Utils.setLoadingText(null);
        setIsLoadingName(false);
      }
    })();
  };

  const validate = (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.DISPLAY_NAME_FORM>,
  ) => {
    const errors: FormInputErrors<typeof ONYXKEYS.FORMS.DISPLAY_NAME_FORM> = {};

    const errorKey = ValidationUtils.validateUsername(
      values.displayName,
      auth.currentUser?.displayName,
    );

    if (errorKey) {
      ErrorUtils.addErrorMessage(errors, 'displayName', translate(errorKey));
    }

    return errors;
  };

  return (
    <ScreenWrapper
      includeSafeAreaPaddingBottom={false}
      shouldEnableMaxHeight
      testID={DisplayNameScreen.displayName}>
      <HeaderWithBackButton
        title={translate('displayNameScreen.headerTitle')}
        onBackButtonPress={() => Navigation.goBack()}
      />
      {!!loadingText || isLoadingName ? (
        <FullScreenLoadingIndicator
          style={[styles.flex1]}
          loadingText={loadingText}
        />
      ) : (
        <FormProvider
          style={[styles.flexGrow1, styles.ph5]}
          formID={ONYXKEYS.FORMS.DISPLAY_NAME_FORM}
          validate={validate}
          onSubmit={updateDisplayName}
          submitButtonText={translate('common.save')}
          enabledWhenOffline
          shouldValidateOnBlur
          shouldValidateOnChange>
          <Text style={[styles.mb6]}>
            {translate('displayNameScreen.isShownOnProfile')}
          </Text>
          <View style={styles.mb4}>
            <InputWrapper
              InputComponent={TextInput}
              inputID={INPUT_IDS.DISPLAY_NAME}
              name="displayName"
              label={translate('common.displayName')}
              aria-label={translate('common.displayName')}
              role={CONST.ROLE.PRESENTATION}
              defaultValue={currentUserDetails.displayName ?? ''}
              spellCheck={false}
            />
          </View>
        </FormProvider>
      )}
    </ScreenWrapper>
  );
}

DisplayNameScreen.displayName = 'DisplayNameScreen';
export default DisplayNameScreen;
