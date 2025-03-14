import type {ViewStyle} from 'react-native';

/**
 * Sizing utility styles with Bootstrap inspired naming.
 *
 * https://getbootstrap.com/docs/5.0/utilities/sizing/
 */
export default {
  h100: {
    height: '100%',
  },

  h68: {
    height: 272,
  },

  w15: {
    width: '15%',
  },

  w20: {
    width: '20%',
  },

  w25: {
    width: '25%',
  },

  mnh60: {
    minHeight: '60%',
  },

  mnh75: {
    minHeight: '75%',
  },

  mnh100: {
    minHeight: '100%',
  },

  mnw2: {
    minWidth: 8,
  },

  mnw25: {
    minWidth: '25%',
  },

  mnw60: {
    minWidth: '60%',
  },

  mnw100: {
    minWidth: '100%',
  },

  mnw120: {
    minWidth: 120,
  },

  w40: {
    width: '40%',
  },

  w50: {
    width: '50%',
  },

  w70: {
    width: '70%',
  },

  w80: {
    width: '80%',
  },

  w100: {
    width: '100%',
  },

  mwn: {
    maxWidth: 'auto',
  },

  mw75: {
    maxWidth: '75%',
  },

  mw80: {
    maxWidth: '80%',
  },

  mw100: {
    maxWidth: '100%',
  },
  wAuto: {
    width: 'auto',
  },
} satisfies Record<string, ViewStyle>;
