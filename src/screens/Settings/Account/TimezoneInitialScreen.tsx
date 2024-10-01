import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SelectedTimezone, Timezone} from '@src/types/onyx/PersonalDetails';
import {StackScreenProps} from '@react-navigation/stack';
import {SettingsNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

type TimezoneInitialScreenProps = StackScreenProps<
  SettingsNavigatorParamList,
  typeof SCREENS.SETTINGS.ACCOUNT.TIMEZONE
>;
// type TimezoneInitialScreenProps = WithCurrentUserPersonalDetailsProps;

function TimezoneInitialScreen({}: TimezoneInitialScreenProps) {
  const styles = useThemeStyles();
  const timezone: Timezone = CONST.DEFAULT_TIME_ZONE;
  // currentUserPersonalDetails?.timezone ?? CONST.DEFAULT_TIME_ZONE;

  const {translate} = useLocalize();

  const currentTimezone = Intl.DateTimeFormat().resolvedOptions()
    .timeZone as SelectedTimezone;

  /**
   * Updates setting for automatic timezone selection.
   * Note: If we are updating automatically, we'll immediately calculate the user's timezone.
   */
  const updateAutomaticTimezone = (isAutomatic: boolean) => {
    // TODO
    console.debug('Updating the automatic timezone...');
    // PersonalDetails.updateAutomaticTimezone({
    //   automatic: isAutomatic,
    //   selected:
    //     isAutomatic && !isEmptyObject(currentTimezone)
    //       ? currentTimezone
    //       : timezone.selected,
    // });
  };

  return (
    <ScreenWrapper testID={TimezoneInitialScreen.displayName}>
      <HeaderWithBackButton
        title={translate('timezoneScreen.timezone')}
        onBackButtonPress={() => Navigation.goBack()}
      />
      <View style={styles.flex1}>
        <View style={[styles.ph5]}>
          <Text style={[styles.mb5]}>
            {translate('timezoneScreen.isShownOnProfile')}
          </Text>
          <View
            style={[
              styles.flexRow,
              styles.mb5,
              styles.mr2,
              styles.alignItemsCenter,
              styles.justifyContentBetween,
            ]}>
            <Text style={[styles.flexShrink1, styles.mr2]}>
              {translate('timezoneScreen.getLocationAutomatically')}
            </Text>
            <Switch
              accessibilityLabel={translate(
                'timezoneScreen.getLocationAutomatically',
              )}
              isOn={!!timezone.automatic}
              onToggle={updateAutomaticTimezone}
            />
          </View>
        </View>
        <MenuItemWithTopDescription
          title={timezone.selected}
          description={translate('timezoneScreen.timezone')}
          shouldShowRightIcon
          disabled={timezone.automatic}
          onPress={() => Navigation.navigate(ROUTES.SETTINGS_TIMEZONE_SELECT)}
        />
      </View>
    </ScreenWrapper>
  );
}

TimezoneInitialScreen.displayName = 'TimezoneInitialScreen';

export default TimezoneInitialScreen;
