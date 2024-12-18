import {Alert, View} from 'react-native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {
  FriendRequestList,
  FriendRequestStatus,
  ProfileList,
} from '@src/types/onyx';
import Text from '@components/Text';
import type {UserList} from '@src/types/onyx/OnyxCommon';
import {useFirebase} from '@src/context/global/FirebaseContext';
import {isNonEmptyArray} from '@libs/Validation';
import type {Database} from 'firebase/database';
import {searchDatabaseForUsers} from '@libs/Search';
import * as Profile from '@userActions/Profile';
import SearchResult from '@components/Social/SearchResult';
import SearchWindow from '@components/Social/SearchWindow';
import type {
  SearchWindowRef,
  UserSearchResults,
} from '@src/types/various/Search';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import Navigation from '@libs/Navigation/Navigation';
import ScreenWrapper from '@components/ScreenWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useLocalize from '@hooks/useLocalize';
import FlexibleLoadingIndicator from '@components/FlexibleLoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import ScrollView from '@components/ScrollView';

function FriendSearchScreen() {
  const {auth, db, storage} = useFirebase();
  const styles = useThemeStyles();
  const {userData} = useDatabaseData();
  const searchInputRef = useRef<SearchWindowRef>(null);
  const user = auth.currentUser;
  const {translate} = useLocalize();
  const [searchResultData, setSearchResultData] = useState<UserSearchResults>(
    [],
  );
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState<UserList | undefined>(undefined);
  const [friendRequests, setFriendRequests] = useState<
    FriendRequestList | undefined
  >(undefined);
  const [requestStatuses, setRequestStatuses] = useState<
    Record<string, FriendRequestStatus | undefined>
  >({});
  const [noUsersFound, setNoUsersFound] = useState(false);
  const [displayData, setDisplayData] = useState<ProfileList>({});

  const dbSearch = useCallback(
    async (searchText: string, database?: Database): Promise<void> => {
      try {
        setSearching(true);
        const newData: UserSearchResults = await searchDatabaseForUsers(
          database,
          searchText,
        );
        await updateHooksBasedOnSearchResults(newData);
        setSearchResultData(newData);
      } catch (error: Error | unknown) {
        const errorMessage = error instanceof Error ? error.message : '';
        Alert.alert(
          'Database serach failed',
          `Could not search the database: ${errorMessage}`,
        );
      } finally {
        setSearching(false);
      }
    },
    [],
  );

  const updateDisplayData = async (
    newData: UserSearchResults,
  ): Promise<void> => {
    const newDisplayData: ProfileList = await Profile.fetchUserProfiles(
      db,
      newData,
    );
    setDisplayData(newDisplayData);
  };

  /** Having a list of users returned by the search,
   * determine the request status for each and update
   * the RequestStatuses hook.
   */
  const updateRequestStatuses = (
    data: UserSearchResults = searchResultData,
  ): void => {
    const newRequestStatuses: Record<string, FriendRequestStatus> = {};
    data.forEach(userID => {
      if (friendRequests?.[userID]) {
        newRequestStatuses[userID] = friendRequests[userID];
      }
    });
    setRequestStatuses(newRequestStatuses);
  };

  const updateHooksBasedOnSearchResults = async (
    searchResults: UserSearchResults,
  ): Promise<void> => {
    updateRequestStatuses(searchResults); // Perhaps redundant
    await updateDisplayData(searchResults); // Assuming this returns a Promise
    const newNoUsersFound = !isNonEmptyArray(searchResults);
    setNoUsersFound(newNoUsersFound);
  };

  const resetSearch = (): void => {
    // Reset all values displayed on screen
    setSearching(false);
    setSearchResultData([]);
    setRequestStatuses({});
    setDisplayData({});
    setNoUsersFound(false);
  };

  useMemo(() => {
    if (userData) {
      setFriends(userData.friends);
      setFriendRequests(userData.friend_requests);
    }
  }, [userData]);

  useMemo(() => {
    updateRequestStatuses();
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
  }, [friendRequests]); // When updated in the database, not locally

  if (!user) {
    return;
  }

  return (
    <ScreenWrapper testID={FriendSearchScreen.displayName}>
      <HeaderWithBackButton
        title={translate('friendSearchScreen.title')}
        onBackButtonPress={Navigation.goBack}
      />
      <SearchWindow
        ref={searchInputRef}
        windowText="Search for new friends"
        onSearch={dbSearch}
        onResetSearch={resetSearch}
      />
      <ScrollView style={[styles.w100, styles.flex1]}>
        {searching ? (
          <FlexibleLoadingIndicator style={styles.pt4} />
        ) : (
          <View>
            {noUsersFound ? (
              <Text style={styles.noResultsText}>
                {translate('friendSearchScreen.noUsersFound')}
              </Text>
            ) : (
              searchResultData.map(userID => (
                <SearchResult
                  key={`${userID}-container`}
                  userID={userID}
                  userDisplayData={displayData[userID]}
                  db={db}
                  storage={storage}
                  userFrom={user.uid}
                  requestStatus={requestStatuses[userID]}
                  alreadyAFriend={friends ? friends[userID] : false}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

FriendSearchScreen.displayName = 'Friend Search Screen';
export default FriendSearchScreen;
