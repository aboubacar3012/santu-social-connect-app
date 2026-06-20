import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

type TabChromeContextValue = {
  chromeVisible: boolean;
  scrollY: number;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  setChromeVisible: (visible: boolean) => void;
};

const TabChromeContext = createContext<TabChromeContextValue | null>(null);

const SCROLL_THRESHOLD = 6;
const TOP_THRESHOLD = 8;

export function TabChromeProvider({ children }: { children: React.ReactNode }) {
  const [chromeVisible, setChromeVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const lastScrollY = useRef(0);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const diff = y - lastScrollY.current;

    setScrollY(y);

    if (y <= TOP_THRESHOLD) {
      setChromeVisible(true);
    } else if (diff > SCROLL_THRESHOLD) {
      setChromeVisible(false);
    } else if (diff < -SCROLL_THRESHOLD) {
      setChromeVisible(true);
    }

    lastScrollY.current = y;
  }, []);

  const value = useMemo(
    () => ({ chromeVisible, scrollY, onScroll, setChromeVisible }),
    [chromeVisible, scrollY, onScroll],
  );

  return <TabChromeContext.Provider value={value}>{children}</TabChromeContext.Provider>;
}

export function useTabChrome() {
  const ctx = useContext(TabChromeContext);
  if (!ctx) {
    throw new Error('useTabChrome must be used within TabChromeProvider');
  }
  return ctx;
}
