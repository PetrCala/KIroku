import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import * as DeleteAccount from '@userActions/DeleteAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/DeleteAccountForm';

type DeleteAccountScreenOnyxProps = {};

type DeleteAccountScreenProps = DeleteAccountScreenOnyxProps &
  StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELETE>;

function DeleteAccountScreen({}: DeleteAccountScreenProps) {
  const styles = useThemeStyles();
  const {translate} = useLocalize();

  const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);
  const [reasonForLeaving, setReasonForLeaving] = useState('');

  // If you are new to hooks this might look weird but basically it is something that only runs when the component unmounts
  // nothing runs on mount and we pass empty dependencies to prevent this from running on every re-render.
  // TODO: We should refactor this so that the data in instead passed directly as a prop instead of "side loading" the data
  // here, we left this as is during refactor to limit the breaking changes.
  useEffect(() => () => DeleteAccount.clearError(), []);

  const hideConfirmModal = () => {
    setConfirmModalVisibility(false);
  };

  const onConfirm = async () => {
    await DeleteAccount.deleteAccount(reasonForLeaving);
    hideConfirmModal();
  };

  const showConfirmModal = (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.DELETE_ACCOUNT_FORM>,
  ) => {
    setConfirmModalVisibility(true);
    setReasonForLeaving(values.reasonForLeaving);
  };

  const validate = (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.DELETE_ACCOUNT_FORM>,
  ): FormInputErrors<typeof ONYXKEYS.FORMS.DELETE_ACCOUNT_FORM> => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, []);
    return errors;
  };

  return (
    <ScreenWrapper
      includeSafeAreaPaddingBottom={false}
      testID={DeleteAccountScreen.displayName}>
      <HeaderWithBackButton
        title={translate('deleteAccountScreen.deleteAccount')}
        onBackButtonPress={() => Navigation.goBack()}
      />
      <FormProvider
        formID={ONYXKEYS.FORMS.DELETE_ACCOUNT_FORM}
        validate={validate}
        onSubmit={showConfirmModal}
        submitButtonText={translate('deleteAccountScreen.deleteAccount')}
        style={[styles.flexGrow1, styles.mh5]}
        isSubmitActionDangerous>
        <View style={[styles.flexGrow1]}>
          <Text>{translate('deleteAccountScreen.reasonForLeavingPrompt')}</Text>
          <InputWrapper
            InputComponent={TextInput}
            inputID={INPUT_IDS.REASON_FOR_LEAVING}
            autoGrowHeight
            maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
            label={translate('deleteAccountScreen.enterMessageHere')}
            aria-label={translate('deleteAccountScreen.enterMessageHere')}
            role={CONST.ROLE.PRESENTATION}
            containerStyles={[styles.mt5]}
          />
          <ConfirmModal
            danger
            title={translate('deleteAccountScreen.deleteAccountWarning')}
            onConfirm={onConfirm}
            onCancel={hideConfirmModal}
            isVisible={isConfirmModalVisible}
            prompt={translate(
              'deleteAccountScreen.deleteAccountPermanentlyDeleteData',
            )}
            confirmText={translate('common.yesContinue')}
            cancelText={translate('common.cancel')}
            shouldDisableConfirmButtonWhenOffline
            shouldShowCancelButton
          />
        </View>
      </FormProvider>
    </ScreenWrapper>
  );
}

DeleteAccountScreen.displayName = 'DeleteAccountScreen';

export default DeleteAccountScreen;
