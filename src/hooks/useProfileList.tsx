import {useEffect, useCallback, useState} from 'react';
import {useFirebase} from '@src/context/global/FirebaseContext';
import type {ProfileList} from '@src/types/onyx';
import type {UserArray} from '@src/types/onyx/OnyxCommon';
import * as Profile from '@userActions/Profile';
import {Alert} from 'react-native';
import {isNonEmptyArray} from '@libs/Validation';

/**
 * Custom hook for fetching and managing list of profiles based on a list of users.
 *
 * This hook encapsulates the logic for loading profile data from a Firebase database,
 * managing loading states, and updating the component state with the fetched data.
 * It uses the `useFirebase` hook to access the Firebase database and a reducer for state management.
 *
 * @param userArray - An array or undefined, where the elements represent the unique user IDs to fetch the data for
 * @returns An object containing the display data
 * @example:
 * const userArray = ['userid1', 'userid2', 'userid3'];
 * const { loadingDisplayData, profileList } = useProfileList(userArray);
 */
const useProfileList = (userArray: UserArray) => {
  const {db} = useFirebase();
  const [profileList, setProfileList] = useState<ProfileList>({});
  const [loadingDisplayData, setLoadingDisplayData] = useState<boolean>(true);

  const updateDisplayData = useCallback(async (): Promise<void> => {
    // console.log('userArray', userArray);
    if (!isNonEmptyArray(userArray)) {
      setProfileList({});
      setLoadingDisplayData(false);
      return;
    }
    setLoadingDisplayData(true);
    try {
      // Filter out the users that are already in the profile list
      const newUsers = userArray.filter(userID => !profileList[userID]);
      if (isNonEmptyArray(newUsers)) {
        const newProfileList: ProfileList = await Profile.fetchUserProfiles(
          db,
          newUsers,
        );
        setProfileList({...profileList, ...newProfileList});
      }
    } catch (error: unknown) {
      Alert.alert(
        'Database fetch failed',
        `Could not fetch user display data: ${error.message}`,
      );
    } finally {
      setLoadingDisplayData(false);
    }
  }, [userArray]);

  useEffect(() => {
    updateDisplayData();
  }, [updateDisplayData]);

  return {profileList, loadingDisplayData};
};

export default useProfileList;
