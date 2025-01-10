import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Alert, View} from 'react-native';
import {useFirebase} from '@context/global/FirebaseContext';
import {getDefaultPreferences} from '@userActions/User';
import type {DrinksToUnits} from '@src/types/onyx';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import Navigation from '@libs/Navigation/Navigation';
import {isEqual} from 'lodash';
import ScreenWrapper from '@components/ScreenWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useLocalize from '@hooks/useLocalize';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ConfirmModal from '@components/ConfirmModal';
import Button from '@components/Button';
import useThemeStyles from '@hooks/useThemeStyles';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import MenuItem from '@components/MenuItem';
import * as Preferences from '@userActions/Preferences';
import type {NumericSliderProps} from '@components/Popups/NumericSlider';
import NumericSlider from '@components/Popups/NumericSlider';
import CONST from '@src/CONST';

type MenuItem = {
  title?: string;
  key: string;
  currentValue: number;
};

type PreferencesSliderConfig = NumericSliderProps & {
  list: string;
  key: string;
};

function DrinksToUnitsScreen() {
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const {preferences} = useDatabaseData();
  const initialValues = useRef(preferences?.drinks_to_units);
  const [saving, setSaving] = useState<boolean>(false);
  const [currentValues, setCurrentValues] = useState<DrinksToUnits>(
    preferences?.drinks_to_units ?? getDefaultPreferences().drinks_to_units,
  );
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

  const [sliderConfig, setSliderConfig] = useState<PreferencesSliderConfig>({
    visible: false,
    heading: '',
    value: 0,
    maxValue: 3,
    step: 0.1,
    onRequestClose: () => {},
    onSave: () => {},
    list: 'drinks_to_units',
    key: '',
  });

  const haveValuesChanged = useCallback(() => {
    return !isEqual(initialValues.current, currentValues);
  }, [currentValues]);

  const handleGoBack = useCallback(() => {
    if (haveValuesChanged()) {
      setShowLeaveConfirmation(true); // Unsaved changes
    } else {
      Navigation.goBack();
    }
  }, [haveValuesChanged]);

  const handleSaveValues = () => {
    (async () => {
      try {
        setSaving(true);
        await Preferences.updatePreferences(db, user, {
          drinks_to_units: currentValues,
        });
        Navigation.goBack();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '';
        Alert.alert(translate('preferencesScreen.error.save'), errorMessage);
      } finally {
        setSaving(false);
      }
    })();
  };

  const drinksToUnitsMenuItems = useMemo(() => {
    const drinksHelperData: MenuItem[] = [
      {
        title: translate('drinks.smallBeer'),
        key: CONST.DRINKS.KEYS.SMALL_BEER,
        currentValue: currentValues.small_beer,
      },
      {
        title: translate('drinks.beer'),
        key: CONST.DRINKS.KEYS.BEER,
        currentValue: currentValues.beer,
      },
      {
        title: translate('drinks.wine'),
        key: CONST.DRINKS.KEYS.WINE,
        currentValue: currentValues.wine,
      },
      {
        title: translate('drinks.weakShot'),
        key: CONST.DRINKS.KEYS.WEAK_SHOT,
        currentValue: currentValues.weak_shot,
      },
      {
        title: translate('drinks.strongShot'),
        key: CONST.DRINKS.KEYS.STRONG_SHOT,
        currentValue: currentValues.strong_shot,
      },
      {
        title: translate('drinks.cocktail'),
        key: CONST.DRINKS.KEYS.COCKTAIL,
        currentValue: currentValues.cocktail,
      },
      {
        title: translate('drinks.other'),
        key: CONST.DRINKS.KEYS.OTHER,
        currentValue: currentValues.other,
      },
    ];

    return drinksHelperData.map((detail, index) => (
      <MenuItem
        // eslint-disable-next-line react/no-array-index-key
        key={`${detail.title}_${index}`}
        title={detail.title}
        titleStyle={styles.plainSectionTitle}
        wrapperStyle={styles.sectionMenuItemTopDescription}
        disabled
        shouldGreyOutWhenDisabled={false}
        shouldUseRowFlexDirection
        shouldShowRightIcon={false}
        shouldShowRightComponent
        rightComponent={
          <Button
            text={detail.currentValue.toString()}
            style={styles.settingValueButton}
            onPress={() => {
              setSliderConfig(prev => ({
                ...prev,
                visible: true,
                heading: detail.title ?? '',
                value: detail.currentValue ?? 0,
                key: detail.key ?? '',
                onSave: (value: number) => {
                  setCurrentValues(prev => ({...prev, [detail.key]: value}));
                },
              }));
            }}
          />
        }
      />
    ));
  }, [
    currentValues.beer,
    currentValues.cocktail,
    currentValues.other,
    currentValues.small_beer,
    currentValues.strong_shot,
    currentValues.weak_shot,
    currentValues.wine,
    sliderConfig,
    styles.plainSectionTitle,
    styles.sectionMenuItemTopDescription,
    styles.settingValueButton,
    translate,
  ]);

  if (saving) {
    return (
      <FullScreenLoadingIndicator
        loadingText={translate('preferencesScreen.saving')}
      />
    );
  }

  return (
    <ScreenWrapper testID={DrinksToUnitsScreen.displayName}>
      <HeaderWithBackButton
        title={translate('drinksToUnitsScreen.title')}
        shouldShowBackButton
        onBackButtonPress={handleGoBack}
        onCloseButtonPress={() => Navigation.dismissModal()}
      />
      <ScrollView style={[styles.flexGrow1, styles.mnw100]}>
        <Section
          title={translate('drinksToUnitsScreen.title')}
          titleStyles={styles.generalSectionTitle}
          subtitle={translate('drinksToUnitsScreen.description')}
          subtitleMuted
          isCentralPane
          childrenStyles={styles.pt3}>
          {drinksToUnitsMenuItems}
        </Section>
      </ScrollView>
      <View style={[styles.bottomTabBarContainer, styles.p5]}>
        <Button
          large
          success
          text={translate('common.save')}
          onPress={handleSaveValues}
          style={styles.bottomTabButton}
        />
      </View>
      <NumericSlider
        visible={sliderConfig.visible}
        value={sliderConfig.value}
        heading={sliderConfig.heading}
        step={sliderConfig.step}
        maxValue={sliderConfig.maxValue}
        onRequestClose={() => {
          setSliderConfig(prev => ({...prev, visible: false}));
        }}
        onSave={newValue => {
          setCurrentValues(prev => ({
            ...prev,
            [sliderConfig.key]: newValue,
          }));
          setSliderConfig(prev => ({...prev, visible: false}));
        }}
      />
      <ConfirmModal
        isVisible={showLeaveConfirmation}
        title={translate('common.areYouSure')}
        prompt={translate('preferencesScreen.unsavedChanges')}
        onConfirm={() => {
          setSliderConfig(prev => ({...prev, visible: false}));
          setShowLeaveConfirmation(false);
          Navigation.goBack();
        }}
        onCancel={() => setShowLeaveConfirmation(false)}
      />
    </ScreenWrapper>
  );
}

DrinksToUnitsScreen.displayName = 'DrinksToUnitsScreen';
export default DrinksToUnitsScreen;
