import React, {useEffect, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text} from 'react-native';
import {Animated} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import textRef from '@src/types/utils/textRef';
import type TextInputLabelProps from './types';

function TextInputLabel({
  for: inputId = '',
  label,
  labelTranslateY,
  labelScale,
}: TextInputLabelProps) {
  const styles = useThemeStyles();
  const labelRef = useRef<Text | HTMLDivElement>(null);

  useEffect(() => {
    if (
      !inputId ||
      !labelRef.current ||
      !('setAttribute' in labelRef.current)
    ) {
      return;
    }
    labelRef.current.setAttribute('for', inputId);
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.Text
      ref={textRef(labelRef)}
      role={CONST.ROLE.PRESENTATION}
      style={[
        styles.textInputLabel,
        styles.textInputLabelDesktop,
        styles.textInputLabelTransformation(labelTranslateY, 0, labelScale),
        styles.pointerEventsNone,
      ]}>
      {label}
    </Animated.Text>
  );
}

TextInputLabel.displayName = 'TextInputLabel';

export default React.memo(TextInputLabel);
