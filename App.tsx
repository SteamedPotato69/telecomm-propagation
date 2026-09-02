import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { RootNavigator } from './src/screens/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme';

function AppContent() {
  const { colors, resolvedScheme } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
