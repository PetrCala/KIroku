import {useEffect, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {FeedbackList, NicknameToId} from '@src/types/onyx';
import {useFirebase} from '@context/global/FirebaseContext';
import {removeFeedback} from '@database/feedback';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import DateUtils from '@libs/DateUtils';
import MenuItem from '@components/MenuItem';
import Button from '@components/Button';
import useTheme from '@hooks/useTheme';
import {listenForDataChanges} from '@database/baseFunctions';
import DBPATHS from '@src/DBPATHS';
import {fetchNicknameByUID} from '@libs/actions/User';
import type {Timestamp} from '@src/types/onyx/OnyxCommon';
import CONST from '@src/CONST';

function SeeFeedbackScreen() {
  const {translate} = useLocalize();
  const {db} = useFirebase();
  const styles = useThemeStyles();
  const theme = useTheme();
  const [nicknames, setNicknames] = useState<NicknameToId>({});
  const [feedbackList, setFeedbackList] = useState<FeedbackList>({});

  useEffect(() => {
    const dbRef = DBPATHS.FEEDBACK;
    const stopListening = listenForDataChanges(
      db,
      dbRef,
      (data: FeedbackList | null) => {
        const newData = data ?? {};
        setFeedbackList(newData);
      },
    );

    // Stop listening for changes when the component unmounts
    return () => {
      stopListening();
    };
  }, [db]);

  useEffect(() => {
    const fetchNicknames = async () => {
      if (!feedbackList) {
        setNicknames({});
        return;
      }

      const newNicknames = {...nicknames};

      for (const feedback of Object.values(feedbackList)) {
        try {
          const userId = feedback.user_id;
          const data = await fetchNicknameByUID(db, userId);
          if (data) {
            newNicknames[userId] = data; // Set if not null
          }
        } catch (error: any) {
          console.error('Error fetching nickname:', error);
        }
      }
      setNicknames(newNicknames);
    };

    fetchNicknames();
  }, [feedbackList, db]);

  const deleteFeedback = (feedbackKey: string) => {
    (async () => {
      await removeFeedback(db, feedbackKey);
    })();
  };

  const removeFeedbackButton = (id: string) => {
    return (
      <Button
        icon={KirokuIcons.ThinX}
        iconFill={theme.textError}
        style={styles.bgTransparent}
        onPress={() => deleteFeedback(id)}
      />
    );
  };

  const getVerboseFeedbackHeading = (
    userId: string,
    timeSubmitted: Timestamp,
  ): string => {
    const localizedTime = DateUtils.getLocalizedTime(
      timeSubmitted,
      undefined,
      CONST.DATE.FNS_FORMAT_STRING,
    );
    return `${localizedTime} - ${nicknames[userId]}`;
  };

  return (
    <ScreenWrapper testID={SeeFeedbackScreen.displayName}>
      <HeaderWithBackButton
        title={translate('adminScreen.feedback')}
        onBackButtonPress={() => Navigation.goBack()}
      />
      <ScrollView contentContainerStyle={[styles.w100]}>
        <Section
          title=""
          containerStyles={styles.ph0}
          childrenStyles={styles.pt3}>
          {Object.entries(feedbackList).map(([id, feedback]) => (
            <MenuItem
              // eslint-disable-next-line react/no-array-index-key
              key={`${id}`}
              title={getVerboseFeedbackHeading(
                feedback.user_id,
                feedback.submit_time,
              )}
              description={feedback.text}
              style={styles.borderTopRounded}
              rightComponent={removeFeedbackButton(id)}
              shouldShowRightComponent
              disabled
            />
          ))}
        </Section>
      </ScrollView>
    </ScreenWrapper>
  );
}

SeeFeedbackScreen.displayName = 'SeeFeedbackScreen';
export default SeeFeedbackScreen;
