import {StyleSheet, Text, View} from 'react-native';

interface StatItemProps {
  header: string;
  content: string;
}

// StatItem component with types
const StatItem: React.FC<StatItemProps> = ({header, content}) => (
  <View style={styles.overviewStatsContentsContainer}>
    <Text style={styles.overviewStatsContents}>{content}</Text>
    <Text
      style={styles.overviewStatsHeader}
      numberOfLines={2}
      ellipsizeMode="tail">
      {header}
    </Text>
  </View>
);

export default StatItem;

const styles = StyleSheet.create({
  overviewStatsContainer: {
    flexDirection: 'row',
  },
  overviewStatsContentsContainer: {
    width: 100,
    justifyContent: 'center',
  },
  overviewStatsContents: {
    textAlign: 'center',
    fontSize: 23,
    color: 'black',
  },
  overviewStatsHeader: {
    textAlign: 'center',
    fontSize: 15,
    paddingRight: 3,
    paddingLeft: 3,
    color: 'black',
  },
});
