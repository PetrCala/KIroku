import React, {useState} from 'react';
import {Dimensions, StyleSheet, TouchableOpacity, View} from 'react-native';
import {TabView} from 'react-native-tab-view';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {getReceivedRequestsCount} from '@libs/FriendUtils';
import type {UserData} from '@src/types/onyx';
import type {StackScreenProps} from '@react-navigation/stack';
import type SCREENS from '@src/SCREENS';
import type {SocialNavigatorParamList} from '@libs/Navigation/types';
import Navigation from '@libs/Navigation/Navigation';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import ScreenWrapper from '@components/ScreenWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import Text from '@components/Text';
import Icon from '@components/Icon';
import useThemeStyles from '@hooks/useThemeStyles';
import FriendRequestScreen from './FriendRequestScreen';
import FriendListScreen from './FriendListScreen';

type SocialFooterButtonProps = {
  index: number;
  currentIndex: number;
  setImageIndex: (index: number) => void;
  source: any;
  label: string;
  infoNumberValue?: number;
};

function SocialFooterButton({
  index,
  currentIndex,
  setImageIndex,
  source,
  label,
  infoNumberValue,
}: SocialFooterButtonProps) {
  const theme = useTheme();
  const styles = useThemeStyles();
  return (
    <View>
      <TouchableOpacity
        accessibilityRole="button"
        style={localStyles.footerButton}
        onPress={() => setImageIndex(index)}>
        <View
          style={
            infoNumberValue && infoNumberValue > 0
              ? [localStyles.imageContainer, localStyles.extraSpacing]
              : localStyles.imageContainer
          }>
          <Icon
            src={source}
            height={25}
            width={25}
            fill={
              currentIndex === index ? theme.appColor : theme.textSupporting
            }
          />
          {!!infoNumberValue && infoNumberValue > 0 && (
            <View style={localStyles.friendRequestCounter}>
              <Text style={styles.textWhite}>{infoNumberValue}</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.mutedTextLabel,
            currentIndex === index && {color: theme.appColor},
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

type SocialScreenProps = StackScreenProps<
  SocialNavigatorParamList,
  typeof SCREENS.SOCIAL.ROOT
>;

type RouteType = {
  key: string;
  title: string;
  userData: UserData | undefined;
};

function SocialScreen({route}: SocialScreenProps) {
  const {userData} = useDatabaseData();
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const [routes] = useState([
    {key: 'friendList', title: 'Friend List', userData},
    // {key: 'friendSearch', title: 'Friend Search', userData: userData},
    {key: 'friendRequests', title: 'Friend Requests', userData},
  ]);

  const [index, setIndex] = useState<number>(0);

  const renderScene = ({route}: {route: RouteType}) => {
    if (!userData) {
      return null;
    }
    switch (route.key) {
      case 'friendList':
        return <FriendListScreen />;
      // case 'friendSearch':
      //   return <FriendSearchScreen />;
      case 'friendRequests':
        return <FriendRequestScreen />;
      default:
        return null;
    }
  };

  const footerButtons = [
    {
      index: 0,
      source: KirokuIcons.FriendList,
      label: 'Friend List',
    },
    // {
    //   index: 1,
    //   source: KirokuIcons.Search,
    //   label: 'Find New Friends',
    // },
    {
      index: 1,
      source: KirokuIcons.AddUser,
      label: 'Friend Requests',
      infoNumberValue: getReceivedRequestsCount(userData?.friend_requests),
    },
  ];

  return (
    <ScreenWrapper testID={SocialScreen.displayName}>
      <HeaderWithBackButton
        title={translate('socialScreen.title')}
        onBackButtonPress={Navigation.goBack}
      />
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width: Dimensions.get('window').width}}
        swipeEnabled
        tabBarPosition="bottom"
        renderTabBar={() => null} // Do not render the default tab bar
      />
      <View style={styles.bottomTabBarContainer}>
        {footerButtons.map(button => (
          <SocialFooterButton
            key={button.index}
            index={button.index}
            currentIndex={index}
            setImageIndex={setIndex}
            source={button.source}
            label={button.label}
            infoNumberValue={button.infoNumberValue}
          />
        ))}
      </View>
    </ScreenWrapper>
  );
}

const screenWidth = Dimensions.get('window').width;

// eslint-disable-next-line @typescript-eslint/no-use-before-define
const localStyles = StyleSheet.create({
  footerButton: {
    width: screenWidth / 2,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerImageWrapper: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    backgroundColor: '#ebeb02',
  },
  imageContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraSpacing: {
    marginLeft: 30, // 20 + 10
  },
  friendRequestCounter: {
    width: 20,
    height: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    marginLeft: 10,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

SocialScreen.displayName = 'SocialScreen';
export default SocialScreen;
