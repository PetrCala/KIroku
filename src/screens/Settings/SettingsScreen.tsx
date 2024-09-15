﻿import {useRoute} from '@react-navigation/native';
import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {
  GestureResponderEvent,
  ScrollView as RNScrollView,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ConfirmModal from '@components/ConfirmModal';
import Icon from '@components/Icon';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import MenuItem from '@components/MenuItem';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useActiveCentralPaneRoute from '@hooks/useActiveCentralPaneRoute';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSingleExecution from '@hooks/useSingleExecution';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {Icon as TIcon} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';

type SettingsScreenOnyxProps = {};

type SettingsScreenProps = SettingsScreenOnyxProps &
  WithCurrentUserPersonalDetailsProps;

type MenuData = {
  translationKey: TranslationPaths;
  icon: IconAsset;
  routeName?: Route;
  brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
  action?: () => void;
  link?: string | (() => Promise<string>);
  iconType?: typeof CONST.ICON_TYPE_ICON | typeof CONST.ICON_TYPE_AVATAR;
  iconStyles?: StyleProp<ViewStyle>;
  fallbackIcon?: IconAsset;
  shouldStackHorizontally?: boolean;
  avatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;
  floatRightAvatars?: TIcon[];
  title?: string;
  shouldShowRightIcon?: boolean;
  iconRight?: IconAsset;
  badgeText?: string;
  badgeStyle?: ViewStyle;
};

type Menu = {
  sectionStyle: StyleProp<ViewStyle>;
  sectionTranslationKey: TranslationPaths;
  items: MenuData[];
};

function SettingsScreen({}: SettingsScreenProps) {
  const network = useNetwork();
  const theme = useTheme();
  const styles = useThemeStyles();
  const {isExecuting, singleExecution} = useSingleExecution();
  const waitForNavigate = useWaitForNavigation();
  const popoverAnchor = useRef(null);
  const {translate} = useLocalize();
  const activeCentralPaneRoute = useActiveCentralPaneRoute();

  const [shouldShowSignoutConfirmModal, setShouldShowSignoutConfirmModal] =
    useState(false);

  const toggleSignoutConfirmModal = (value: boolean) => {
    setShouldShowSignoutConfirmModal(value);
  };

  const signOut = useCallback(
    (shouldForceSignout = false) => {
      // if (!network.isOffline || shouldForceSignout) {
      //     Session.signOutAndRedirectToSignIn();
      //     return;
      // }

      // When offline, warn the user that any actions they took while offline will be lost if they sign out
      toggleSignoutConfirmModal(true);
    },
    // [network.isOffline],
    [],
  );

  /**
   * Retuns a list of menu items data for account section
   * @returns object with translationKey, style and items for the account section
   */
  const accountMenuItemsData: Menu = useMemo(() => {
    // TODO enable this
    // const profileBrickRoadIndicator =
    // UserUtils.getLoginListBrickRoadIndicator(loginList);
    const defaultMenu: Menu = {
      sectionStyle: styles.accountSettingsSectionContainer,
      sectionTranslationKey: 'settingsScreen.account',
      items: [
        // {
        //   translationKey: 'exitSurvey.goToExpensifyClassic',
        //   icon: Expensicons.ExpensifyLogoNew,
        //   ...(NativeModules.HybridAppModule
        //     ? {
        //         action: () => {
        //           NativeModules.HybridAppModule.closeReactNativeApp(
        //             false,
        //             true,
        //           );
        //         },
        //       }
        //     : {
        //         routeName: ROUTES.SETTINGS_EXIT_SURVEY_REASON,
        //       }),
        // },
        // {
        //   translationKey: 'common.profile',
        //   icon: Expensicons.Profile,
        //   routeName: ROUTES.SETTINGS_PROFILE,
        //   brickRoadIndicator: profileBrickRoadIndicator,
        // },
        // {
        //   translationKey: 'common.wallet',
        //   icon: Expensicons.Wallet,
        //   routeName: ROUTES.SETTINGS_WALLET,
        //   brickRoadIndicator:
        //     PaymentMethods.hasPaymentMethodError(
        //       bankAccountList,
        //       paymentCardList,
        //     ) ||
        //     !isEmptyObject(userWallet?.errors) ||
        //     !isEmptyObject(walletTerms?.errors)
        //       ? 'error'
        //       : undefined,
        // },
        // {
        //   translationKey: 'common.preferences',
        //   icon: Expensicons.Gear,
        //   routeName: ROUTES.SETTINGS_PREFERENCES,
        // },
        // {
        //   translationKey: 'initialSettingsPage.security',
        //   icon: Expensicons.Lock,
        //   routeName: ROUTES.SETTINGS_SECURITY,
        // },
      ],
    };

    return defaultMenu;
  }, [styles.accountSettingsSectionContainer]);

  /**
   * Retuns a list of menu items data for workspace section
   * @returns object with translationKey, style and items for the workspace section
   */
  // const otherItemsData: Menu = useMemo(() => {
  //   const items: MenuData[] = [];
  // }, [styles.badgeSuccess, translate]);

  /**
   * Retuns a list of menu items data for general section
   * @returns object with translationKey, style and items for the general section
   */
  // const generalMenuItemsData: Menu = useMemo(() => {
  //   return {
  //     sectionStyle: {
  //       ...styles.pt4,
  //     },
  //     sectionTranslationKey: 'initialSettingsPage.general',
  //     items: [],
  //     // {
  //     //   translationKey: 'settingsScreen.account',
  //     //   icon: KirokuIcons.AddImage,
  //     //   routeName: ROUTES.HOME,
  //     // },
  //     // {
  //     //   translationKey: 'initialSettingsPage.about',
  //     //   icon: Expensicons.Info,
  //     //   routeName: ROUTES.SETTINGS_ABOUT,
  //     // },
  //     // {
  //     //   translationKey: signOutTranslationKey,
  //     //   icon: Expensicons.Exit,
  //     //   action: () => {
  //     //     signOut(false);
  //     //   },
  //     // },
  //     // ],
  //   };
  // }, [styles.pt4, signOut]);

  /**
   * Retuns JSX.Element with menu items
   * @param menuItemsData list with menu items data
   * @returns the menu items for passed data
   */
  const getMenuItemsSection = useCallback(
    (menuItemsData: Menu) => {
      return (
        <View style={[menuItemsData.sectionStyle, styles.pb4, styles.mh3]}>
          <Text style={styles.sectionTitle}>
            {translate(menuItemsData.sectionTranslationKey)}
          </Text>
          {menuItemsData.items.map(item => {
            const keyTitle = item.translationKey
              ? translate(item.translationKey)
              : item.title;
            const isPaymentItem = item.translationKey === 'common.wallet';

            return (
              <MenuItem
                key={keyTitle}
                wrapperStyle={styles.sectionMenuItem}
                title={keyTitle}
                icon={item.icon}
                iconType={item.iconType}
                disabled={isExecuting}
                onPress={singleExecution(() => {
                  if (item.action) {
                    item.action();
                  } else {
                    waitForNavigate(() => {
                      Navigation.navigate(item.routeName);
                    })();
                  }
                })}
                iconStyles={item.iconStyles}
                badgeText={item.badgeText ?? ''}
                badgeStyle={item.badgeStyle}
                fallbackIcon={item.fallbackIcon}
                brickRoadIndicator={item.brickRoadIndicator}
                floatRightAvatars={item.floatRightAvatars}
                shouldStackHorizontally={item.shouldStackHorizontally}
                floatRightAvatarSize={item.avatarSize}
                ref={popoverAnchor}
                hoverAndPressStyle={styles.hoveredComponentBG}
                shouldBlockSelection={!!item.link}
                // onSecondaryInteraction={}
                focused={
                  !!activeCentralPaneRoute &&
                  !!item.routeName &&
                  !!(
                    activeCentralPaneRoute.name
                      .toLowerCase()
                      .replaceAll('_', '') ===
                    item.routeName.toLowerCase().replaceAll('/', '')
                  )
                }
                isPaneMenu
                iconRight={item.iconRight}
                shouldShowRightIcon={item.shouldShowRightIcon}
              />
            );
          })}
        </View>
      );
    },
    [
      styles.pb4,
      styles.mh3,
      styles.sectionTitle,
      styles.sectionMenuItem,
      styles.hoveredComponentBG,
      translate,
      isExecuting,
      singleExecution,
      activeCentralPaneRoute,
      waitForNavigate,
    ],
  );

  const accountMenuItems = useMemo(
    () => getMenuItemsSection(accountMenuItemsData),
    [accountMenuItemsData, getMenuItemsSection],
  );
  // const generalMenuItems = useMemo(
  //   () => getMenuItemsSection(generalMenuItemsData),
  //   [generalMenuItemsData, getMenuItemsSection],
  // );

  const {saveScrollOffset, getScrollOffset} = useContext(ScrollOffsetContext);
  const route = useRoute();
  const scrollViewRef = useRef<RNScrollView>(null);

  const onScroll = useCallback<NonNullable<ScrollViewProps['onScroll']>>(
    e => {
      // If the layout measurement is 0, it means the flashlist is not displayed but the onScroll may be triggered with offset value 0.
      // We should ignore this case.
      if (e.nativeEvent.layoutMeasurement.height === 0) {
        return;
      }
      saveScrollOffset(route, e.nativeEvent.contentOffset.y);
    },
    [route, saveScrollOffset],
  );

  useLayoutEffect(() => {
    const scrollOffset = getScrollOffset(route);
    if (!scrollOffset || !scrollViewRef.current) {
      return;
    }
    scrollViewRef.current.scrollTo({y: scrollOffset, animated: false});
  }, [getScrollOffset, route]);

  return (
    <ScreenWrapper
      style={[styles.w100, styles.pb0]}
      includePaddingTop={false}
      includeSafeAreaPaddingBottom={false}
      testID={SettingsScreen.displayName}>
      <ScrollView
        ref={scrollViewRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.w100, styles.pt4]}>
        {/* {headerContent} // Currently unnecessary */}
        {accountMenuItems}
        {/* {generalMenuItems} */}
        <ConfirmModal
          danger
          title={translate('common.areYouSure')}
          prompt={translate('settingsScreen.signOutConfirmationText')}
          confirmText={translate('settingsScreen.signOut')}
          cancelText={translate('common.cancel')}
          isVisible={shouldShowSignoutConfirmModal}
          onConfirm={() => signOut(true)}
          onCancel={() => toggleSignoutConfirmModal(false)}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

SettingsScreen.displayName = 'SettingsScreen';

export default withCurrentUserPersonalDetails(
  withOnyx<SettingsScreenProps, SettingsScreenOnyxProps>({})(SettingsScreen),
);

// #################

// import React, {useEffect, useState} from 'react';
// import type {ImageSourcePropType} from 'react-native';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Image,
//   Alert,
//   Keyboard,
// } from 'react-native';
// import * as KirokuIcons from '@components/Icon/KirokuIcons';
// import YesNoPopup from '@components/Popups/YesNoPopup';
// import type {UserCredential} from 'firebase/auth';
// import {deleteUser, signOut} from 'firebase/auth';
// import {version as _version} from '../../../package.json';
// import {deleteUserData, reauthentificateUser} from '@database/users';
// import FeedbackPopup from '@components/Popups/FeedbackPopup';
// import {submitFeedback} from '@database/feedback';
// import AdminFeedbackPopup from '@components/Popups/AdminFeedbackPopup';
// import {listenForDataChanges} from '@database/baseFunctions';
// import InputTextPopup from '@components/Popups/InputTextPopup';
// import UserOffline from '@components/UserOffline';
// import {useUserConnection} from '@context/global/UserConnectionContext';
// import ItemListPopup from '@components/Popups/ItemListPopup';
// import {useFirebase} from '@context/global/FirebaseContext';
// import MainHeader from '@components/Header/MainHeader';
// import GrayHeader from '@components/Header/GrayHeader';
// import type {FeedbackList} from '@src/types/onyx';
// import type {StackScreenProps} from '@react-navigation/stack';
// import type {SettingsNavigatorParamList} from '@navigation/types';
// import type SCREENS from '@src/SCREENS';
// import Navigation from '@navigation/Navigation';
// import ROUTES from '@src/ROUTES';
// import {useDatabaseData} from '@context/global/DatabaseDataContext';
// import ScreenWrapper from '@components/ScreenWrapper';
// import LoadingData from '@components/LoadingData';
// import useLocalize from '@hooks/useLocalize';
// import ONYXKEYS from '@src/ONYXKEYS';
// import type {OnyxEntry} from 'react-native-onyx';
// import {useOnyx} from 'react-native-onyx';

// type SettingsButtonData = {
//   label: string;
//   icon: ImageSourcePropType;
//   action: () => void;
// };

// type SettingsItemProps = {
//   heading: string;
//   data: SettingsButtonData[];
//   index: number;
// };

// const MenuItem: React.FC<SettingsItemProps> = ({heading, data, index}) => (
//   <View key={index} style={{backgroundColor: '#FFFF99'}}>
//     <GrayHeader headerText={heading} />
//     {data.map((button, bIndex) => (
//       <TouchableOpacity
//         accessibilityRole="button"
//         key={bIndex}
//         style={styles.button}
//         onPress={button.action}>
//         <Image source={button.icon} style={styles.icon} />
//         <Text style={styles.buttonText}>{button.label}</Text>
//       </TouchableOpacity>
//     ))}
//   </View>
// );

// type SettingsScreenOnyxProps = {
//   pushNotificationsEnabled: OnyxEntry<boolean>;
// };

// type SettingsScreenProps = SettingsScreenOnyxProps &
//   StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.ROOT>;

// function SettingsScreen({route}: SettingsScreenProps) {
//   const {userData, preferences} = useDatabaseData();
//   // Context, database, and authentification
//   const [pushNotificationsEnabled] = useOnyx(
//     ONYXKEYS.PUSH_NOTIFICATIONS_ENABLED,
//   );
//   const {auth, db} = useFirebase();
//   const user = auth.currentUser;
//   const {isOnline} = useUserConnection();
//   const {translate} = useLocalize();

//   // Hooks
//   const [FeedbackList, setFeedbackList] = useState<FeedbackList>({});
//   // Modals
//   const [policiesModalVisible, setPoliciesModalVisible] =
//     useState<boolean>(false);
//   const [reportBugModalVisible, setReportBugModalVisible] =
//     useState<boolean>(false);
//   const [feedbackModalVisible, setFeedbackModalVisible] =
//     useState<boolean>(false);
//   const [signoutModalVisible, setSignoutModalVisible] =
//     useState<boolean>(false);
//   const [deleteUserModalVisible, setDeleteUserModalVisible] =
//     useState<boolean>(false);
//   const [reauthentificateModalVisible, setReauthentificateModalVisible] =
//     useState<boolean>(false);
//   const [adminFeedbackModalVisible, setAdminFeedbackModalVisible] =
//     useState<boolean>(false);
//   const [deletingUser, setDeletingUser] = useState<boolean>(false);

//   const handleSignOut = async () => {
//     try {
//       await signOut(auth);
//     } catch (error: any) {
//       Alert.alert(
//         'User sign out error',
//         'There was an error signing out: ' + error.message,
//       );
//     }
//   };

//   const handleDeleteUser = async (password: string) => {
//     if (!db || !userData || !user) {
//       return;
//     }

//     // Reauthentificate the user
//     let authentificationResult: void | UserCredential;
//     try {
//       authentificationResult = await reauthentificateUser(user, password);
//     } catch (error: any) {
//       Alert.alert(
//         'Reauthentification failed',
//         'Failed to reauthentificate this user',
//       );
//       return null;
//     }
//     if (!authentificationResult) {
//       return null; // Cancel user deletion
//     }
//     // Delete the user's information from the realtime database
//     try {
//       setDeletingUser(true);
//       const userNickname = userData.profile.display_name;
//       await deleteUserData(
//         db,
//         user.uid,
//         userNickname,
//         userData.friends,
//         userData.friend_requests,
//       );
//     } catch (error: any) {
//       handleInvalidDeleteUser(error);
//       setDeletingUser(false);
//       return;
//     }
//     // Delete user from authentification database
//     try {
//       await deleteUser(user);
//     } catch (error: any) {
//       handleInvalidDeleteUser(error);
//       return;
//     } finally {
//       setDeletingUser(false);
//     }
//     // Updating the loading state here might cause some issues
//     handleSignOut();
//     // Add an alert here informing about the user deletion
//     Navigation.navigate(ROUTES.SIGNUP);
//   };

//   /** Handle cases when deleting a user fails */
//   const handleInvalidDeleteUser = (error: any) => {
//     if (!user) {
//       return null;
//     }
//     const err = error.message;
//     if (err.includes('auth/requires-recent-login')) {
//       // Should never happen
//       Alert.alert(
//         'User deletion failed',
//         'Recent user authentification was not done, yet the application attempted to delete the user:' +
//           error.message,
//       );
//     } else {
//       Alert.alert(
//         'Error deleting user',
//         'Could not delete user ' + user.uid + error.message,
//       );
//     }
//     return null;
//   };

//   const handleSubmitReportBug = () => {
//     // Popup an information button at the top (your feedback has been submitted)
//     setReportBugModalVisible(false);
//   };

//   const handleSubmitFeedback = (feedback: string) => {
//     if (!db || !user) {
//       return;
//     }
//     if (feedback !== '') {
//       submitFeedback(db, user.uid, feedback);
//       // Popup an information button at the top (your feedback has been submitted)
//       setFeedbackModalVisible(false);
//     } // Perhaps alert the user that they must fill out the feedback first
//   };

//   const handleConfirmSignout = () => {
//     handleSignOut(); // Automatically sets the navigation to public screens
//     setSignoutModalVisible(false);
//   };

//   const handleConfirmDeleteUser = () => {
//     setDeleteUserModalVisible(false);
//     setReauthentificateModalVisible(true);
//   };

//   // Monitor feedback data
//   if (userData?.role == 'admin') {
//     useEffect(() => {
//       if (!db) {
//         return;
//       }
//       // Start listening for changes when the component mounts
//       const dbRef = `feedback/`;
//       const stopListening = listenForDataChanges(
//         db,
//         dbRef,
//         (data: FeedbackList) => {
//           if (data != null) {
//             setFeedbackList(data);
//           }
//         },
//       );

//       // Stop listening for changes when the component unmounts
//       return () => {
//         stopListening();
//       };
//     }, [db, user]);
//   }

//   // TODO change this to a section with icons
//   let modalData = [
//     {
//       heading: 'Your account',
//       data: [
//         {
//           label: 'Account',
//           icon: KirokuIcons.UserIcon,
//           action: () => Navigation.navigate(ROUTES.SETTINGS_ACCOUNT),
//         },
//         {
//           label: 'Preferences',
//           icon: KirokuIcons.Settings,
//           action: () => Navigation.navigate(ROUTES.SETTINGS_PREFERENCES),
//         },
//       ],
//     },
//     {
//       heading: 'General',
//       data: [
//         {
//           label: 'Legal and Policies',
//           icon: KirokuIcons.Book,
//           action: () => setPoliciesModalVisible(true),
//         },
//         //   label: 'Report a bug',
//         //   icon: KirokuIcons.Bug,
//         //   action: () => console.log('Bug reporting'),
//         // },
//         {
//           label: 'Give us a feedback',
//           icon: KirokuIcons.Idea,
//           action: () => setFeedbackModalVisible(true),
//         },
//         {
//           label: 'Share the app',
//           icon: KirokuIcons.Share,
//           action: () => Navigation.navigate(ROUTES.SETTINGS_APP_SHARE),
//         },
//       ],
//     },
//     {
//       heading: 'Authentification',
//       data: [
//         {
//           label: 'Sign out',
//           icon: KirokuIcons.Exit,
//           action: () => setSignoutModalVisible(true),
//         },
//         {
//           label: 'Delete user',
//           icon: KirokuIcons.Delete,
//           action: () => setDeleteUserModalVisible(true),
//         },
//       ],
//     },
//   ];

//   const adminData = [
//     {
//       heading: 'Admin settings',
//       data: [
//         {
//           label: 'See feedback',
//           icon: KirokuIcons.Book,
//           action: () => {
//             setAdminFeedbackModalVisible(true);
//           },
//         },
//       ],
//     },
//   ];

//   const policiesData = [
//     {
//       label: 'Terms of service',
//       icon: KirokuIcons.Book,
//       action: () => {
//         Navigation.navigate(ROUTES.SETTINGS_POLICIES_TERMS_OF_SERVICE);
//         setPoliciesModalVisible(false);
//       },
//     },
//     {
//       label: 'Privacy Policy',
//       icon: KirokuIcons.Book,
//       action: () => {
//         Navigation.navigate(ROUTES.SETTINGS_POLICIES_PRIVACY_POLICY);
//         setPoliciesModalVisible(false);
//       },
//     },
//   ];

//   if (userData?.role == 'admin') {
//     modalData = [...modalData, ...adminData]; // Add admin settings
//   }

//   if (!isOnline) {
//     return <UserOffline />;
//   }
//   if (deletingUser) {
//     return <LoadingData loadingText="Deleting your account..." />;
//   }
//   if (!preferences || !userData || !user) {
//     return null;
//   }

//   return (
//     <ScreenWrapper testID={SettingsScreen.displayName}>
//       <View style={styles.mainContainer}>
//         <MainHeader
//           headerText="Settings"
//           onGoBack={() => Navigation.goBack()}
//         />
//         <ScrollView
//           keyboardShouldPersistTaps="handled"
//           onScrollBeginDrag={Keyboard.dismiss}
//           style={styles.scrollView}>
//           {modalData.map((group, index) => (
//             <MenuItem
//               key={index}
//               heading={group.heading}
//               data={group.data}
//               index={index}
//             />
//           ))}
//           <ItemListPopup
//             visible={policiesModalVisible}
//             transparent={true}
//             heading={'Our Policies'}
//             actions={policiesData}
//             onRequestClose={() => setPoliciesModalVisible(false)}
//           />
//           <FeedbackPopup
//             visible={feedbackModalVisible}
//             transparent={true}
//             message={translate('settingsScreen.improvementThoughts')}
//             onRequestClose={() => setFeedbackModalVisible(false)}
//             onSubmit={feedback => handleSubmitFeedback(feedback)}
//           />
//           <YesNoPopup
//             visible={signoutModalVisible}
//             transparent={true}
//             message={'Do you really want to\nsign out?'}
//             onRequestClose={() => setSignoutModalVisible(false)}
//             onYes={handleConfirmSignout}
//           />
//           <YesNoPopup
//             visible={deleteUserModalVisible}
//             transparent={true}
//             message={
//               'WARNING: Destructive action\n\nDo you really want to\ndelete this user?'
//             }
//             onRequestClose={() => setDeleteUserModalVisible(false)}
//             onYes={handleConfirmDeleteUser}
//           />
//           <InputTextPopup
//             visible={reauthentificateModalVisible}
//             transparent={true}
//             message={'Please retype your password\nin order to proceed'}
//             confirmationMessage={translate('settingsScreen.deleteConfirmation')}
//             placeholder={translate('common.password')}
//             onRequestClose={() => setReauthentificateModalVisible(false)}
//             onSubmit={password => handleDeleteUser(password)}
//             textContentType="password"
//             secureTextEntry
//           />
//           <AdminFeedbackPopup
//             visible={adminFeedbackModalVisible}
//             transparent={true}
//             onRequestClose={() => setAdminFeedbackModalVisible(false)}
//             FeedbackList={FeedbackList}
//           />
//         </ScrollView>
//       </View>
//       <View style={styles.versionContainer}>
//         <Text style={styles.versionText}>{_version}</Text>
//       </View>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   mainContainer: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   scrollView: {
//     width: '100%',
//     flexGrow: 1,
//     flexShrink: 1,
//     backgroundColor: '#FFFF99',
//   },
//   modalText: {
//     marginBottom: 15,
//     textAlign: 'center',
//     fontSize: 16,
//     color: 'black',
//   },
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 2,
//     borderColor: 'black',
//     margin: 2,
//   },
//   icon: {
//     width: 20,
//     height: 20,
//   },
//   buttonText: {
//     marginLeft: 10,
//     color: 'black',
//     fontSize: 15,
//     fontWeight: '500',
//   },
//   versionContainer: {
//     position: 'absolute',
//     bottom: 10,
//     right: 10,
//     width: 'auto',
//     height: 'auto',
//   },
//   versionText: {
//     color: 'gray',
//     fontSize: 13,
//   },
// });

// SettingsScreen.displayName = 'Settings Screen';

// export default SettingsScreen;
