/* eslint-disable @typescript-eslint/naming-convention */
import type {LinkingOptions} from '@react-navigation/native';
import type {RootStackParamList} from '@navigation/types';
import config from './config';
import customGetPathFromState from './customGetPathFromState';
import getAdaptedStateFromPath from './getAdaptedStateFromPath';
import subscribe from './subscribe';

const linkingConfig: LinkingOptions<RootStackParamList> = {
  getStateFromPath: (...args) => {
    const {adaptedState} = getAdaptedStateFromPath(...args);

    // ResultState | undefined is the type this function expect.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return adaptedState;
  },
  subscribe,
  getPathFromState: customGetPathFromState,
  prefixes: ['app://-/'],
  config,
};

export default linkingConfig;
