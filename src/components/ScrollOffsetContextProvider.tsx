import type {ParamListBase, RouteProp} from '@react-navigation/native';
import React, {createContext, useCallback, useMemo, useRef} from 'react';
import type {NavigationPartialRoute, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

type ScrollOffsetContextValue = {
  /** Save scroll offset of flashlist on given screen */
  saveScrollOffset: (
    route: RouteProp<ParamListBase>,
    scrollOffset: number,
  ) => void;

  /** Get scroll offset value for given screen */
  getScrollOffset: (route: RouteProp<ParamListBase>) => number | undefined;

  /** Clean scroll offsets of screen that aren't anymore in the state */
  cleanStaleScrollOffsets: (state: State) => void;
};

type ScrollOffsetContextProviderProps = {
  /** Actual content wrapped by this component */
  children: React.ReactNode;
};

const defaultValue: ScrollOffsetContextValue = {
  saveScrollOffset: () => {},
  getScrollOffset: () => undefined,
  cleanStaleScrollOffsets: () => {},
};

const ScrollOffsetContext =
  createContext<ScrollOffsetContextValue>(defaultValue);

/** This function is prepared to work with HOME screens. May need modification if we want to handle other types of screens. */
function getKey(
  route: RouteProp<ParamListBase> | NavigationPartialRoute,
): string {
  return `${route.name}-global`;
}

function ScrollOffsetContextProvider({
  children,
}: ScrollOffsetContextProviderProps) {
  const scrollOffsetsRef = useRef<Record<string, number>>({});

  const saveScrollOffset: ScrollOffsetContextValue['saveScrollOffset'] =
    useCallback((route, scrollOffset) => {
      scrollOffsetsRef.current[getKey(route)] = scrollOffset;
    }, []);

  const getScrollOffset: ScrollOffsetContextValue['getScrollOffset'] =
    useCallback(route => {
      if (!scrollOffsetsRef.current) {
        return;
      }
      return scrollOffsetsRef.current[getKey(route)];
    }, []);

  const cleanStaleScrollOffsets: ScrollOffsetContextValue['cleanStaleScrollOffsets'] =
    useCallback(state => {
      const bottomTabNavigator = state.routes.find(
        route => route.name === NAVIGATORS.BOTTOM_TAB_NAVIGATOR,
      );
      if (bottomTabNavigator?.state && 'routes' in bottomTabNavigator.state) {
        const bottomTabNavigatorRoutes = bottomTabNavigator.state.routes;
        const scrollOffsetkeysOfExistingScreens = bottomTabNavigatorRoutes.map(
          route => getKey(route),
        );
        for (const key of Object.keys(scrollOffsetsRef.current)) {
          if (!scrollOffsetkeysOfExistingScreens.includes(key)) {
            delete scrollOffsetsRef.current[key];
          }
        }
      }
    }, []);

  const contextValue = useMemo(
    (): ScrollOffsetContextValue => ({
      saveScrollOffset,
      getScrollOffset,
      cleanStaleScrollOffsets,
    }),
    [saveScrollOffset, getScrollOffset, cleanStaleScrollOffsets],
  );

  return (
    <ScrollOffsetContext.Provider value={contextValue}>
      {children}
    </ScrollOffsetContext.Provider>
  );
}
export default ScrollOffsetContextProvider;

export {ScrollOffsetContext};

export type {ScrollOffsetContextProviderProps, ScrollOffsetContextValue};
