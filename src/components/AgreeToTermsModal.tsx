import React, {useMemo, useState} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as User from '@libs/actions/User';
import {useFirebase} from '@context/global/FirebaseContext';
import SafeAreaConsumer from './SafeAreaConsumer';
import Text from './Text';
import Button from './Button';
import CheckboxWithLabel from './CheckboxWithLabel';
import TextLink from './TextLink';
import Modal from './Modal';

function AgreeToTermsModal() {
  const styles = useThemeStyles();
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const {translate} = useLocalize();
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [errorText, setErrorText] = useState('');

  const linkStyles = useMemo<StyleProp<TextStyle>>(
    () => [styles.textNormal, styles.link, styles.pv3],
    [styles],
  );

  const toggleIsChecked = () => {
    const newErrorText = !isChecked ? '' : translate('agreeToTerms.mustAgree');
    setIsChecked(!isChecked);
    setErrorText(newErrorText);
  };

  const onConfirm = () => {
    (async () => {
      if (!isChecked) {
        setErrorText(translate('agreeToTerms.mustAgree'));
        return;
      }

      try {
        await User.updateAgreedToTermsAt(db, user);
        setIsModalVisible(false);
      } catch (error) {
        const appError = ErrorUtils.getAppError(undefined, error);
        setErrorText(appError.message);
      }
    })();
  };

  return (
    <SafeAreaConsumer>
      {({safeAreaPaddingBottomStyle}) => (
        <Modal
          isVisible={isModalVisible}
          type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
          onClose={() => {}}
          onDismiss={() => {}} // Prevent the modal from being dismissed by tapping outside of it.
          innerContainerStyle={{
            boxShadow: 'none',
            borderRadius: 16,
            paddingBottom: 20,
          }}>
          <View style={safeAreaPaddingBottomStyle}>
            <View style={[styles.mt3, styles.mh5]}>
              <View style={styles.mb4}>
                <Text style={[styles.textHeadlineH1]}>
                  {translate('agreeToTerms.title')}
                </Text>
                <Text style={[styles.mv4, styles.textNormal]}>
                  {translate('agreeToTerms.description')}
                </Text>
                <TextLink style={linkStyles} href={CONST.TERMS_URL}>
                  {translate('common.termsOfService')}
                </TextLink>
                <TextLink style={linkStyles} href={CONST.PRIVACY_URL}>
                  {translate('common.privacyPolicy')}
                </TextLink>
              </View>
              <CheckboxWithLabel
                label={translate('agreeToTerms.iHaveRead')}
                accessibilityLabel={translate('agreeToTerms.iHaveRead')}
                errorText={errorText}
                style={errorText ? styles.mb2 : styles.mb4}
                isChecked={isChecked}
                onInputChange={toggleIsChecked}
              />
              <Button
                large
                success
                pressOnEnter
                onPress={onConfirm}
                text={translate('common.confirm')}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaConsumer>
  );
}
export default AgreeToTermsModal;
