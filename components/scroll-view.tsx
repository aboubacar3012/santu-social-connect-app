import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

type Props = PropsWithChildren<{}>;

export default function SafeScrollView({ children }: Props) {
  return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  inner: {
    gap: 16,
  },
});
