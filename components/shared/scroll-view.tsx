import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = PropsWithChildren<{
  centerContent?: boolean;
  /** Fond de l’écran (SafeArea + zone scroll) */
  screenBackgroundColor?: string;
  /** Remonte le contenu quand le clavier est ouvert (champs texte) */
  keyboardAvoiding?: boolean;
}>;

export default function SafeScrollView({
  children,
  centerContent,
  screenBackgroundColor,
  keyboardAvoiding,
}: Props) {
  const scroll = (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={[
        styles.content,
        centerContent && styles.contentCentered,
        screenBackgroundColor && { flexGrow: 1, backgroundColor: screenBackgroundColor },
      ]}
    >
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );

  return (
    <SafeAreaView
      style={[styles.container, screenBackgroundColor && { backgroundColor: screenBackgroundColor }]}
      edges={['top', 'bottom']}
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          // keyboardVerticalOffset={keyboardOffset}
        >
          {scroll}
        </KeyboardAvoidingView>
      ) : (
        scroll
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  contentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inner: {
    gap: 16,
  },
});
