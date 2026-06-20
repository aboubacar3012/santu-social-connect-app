import { BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTabChrome } from '@/contexts/tab-chrome-context';

export function AnimatedTabBar(props: BottomTabBarProps) {
  const { chromeVisible } = useTabChrome();
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(chromeVisible ? 0 : 120, { duration: 220 });
  }, [chromeVisible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle} pointerEvents={chromeVisible ? 'auto' : 'none'}>
      <BottomTabBar {...props} />
    </Animated.View>
  );
}
