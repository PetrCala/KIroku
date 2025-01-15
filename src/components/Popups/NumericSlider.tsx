import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import Slider from '@react-native-community/slider';
import useThemeStyles from '@hooks/useThemeStyles';
import FullScreenModal from '@components/Modals/FullScreenModal';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import Text from '@components/Text';

type NumericSliderProps = {
  visible: boolean;
  heading: string;
  step: number;
  value: number;
  maxValue: number;
  onRequestClose: () => void;
  onSave: (value: number) => void;
};

function NumericSlider({
  visible,
  heading,
  step,
  value,
  maxValue,
  onRequestClose,
  onSave,
}: NumericSliderProps) {
  const [localValue, setLocalValue] = useState<number>(value);
  const styles = useThemeStyles();
  const theme = useTheme();
  const {translate} = useLocalize();

  // Ensure correct initialization
  useEffect(() => {
    if (!visible) {
      return;
    }
    setLocalValue(value);
  }, [value, visible]);

  const handleSliderChange = (val: number) => {
    const newValue = parseFloat(val.toFixed(1));
    setLocalValue(newValue);
  };

  return (
    <FullScreenModal visible={visible} onClose={onRequestClose} hideCloseButton>
      <View style={styles.fullScreenCenteredContent}>
        <View style={[styles.justifyContentCenter, styles.alignItemsCenter]}>
          <Text style={[styles.textHeadline, styles.mb2]}>{heading}</Text>
          <Text style={styles.textHeadline}>{localValue}</Text>
        </View>
        <View style={styles.m4}>
          <Slider
            value={localValue}
            style={styles.numericSlider}
            minimumValue={0}
            maximumValue={maxValue}
            step={step}
            minimumTrackTintColor={theme.text}
            maximumTrackTintColor={theme.text}
            thumbTintColor={theme.text}
            onValueChange={handleSliderChange}
            tapToSeek
          />
        </View>
        <View style={[styles.flexRow, styles.mt2]}>
          <Button
            text={translate('common.cancel')}
            style={[styles.mnw25, styles.ph2]}
            onPress={onRequestClose}
          />
          <Button
            style={[styles.mnw25, styles.ph2]}
            success
            text={translate('common.save')}
            onPress={() => onSave(localValue)}
          />
        </View>
      </View>
    </FullScreenModal>
  );
}

export default NumericSlider;
export type {NumericSliderProps};
