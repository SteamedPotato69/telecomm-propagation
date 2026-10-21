import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LocaleProvider } from './src/i18n';
import { PlanProvider } from './src/plan/PlanContext';
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
    <SafeAreaProvider>
      <LocaleProvider>
        <ThemeProvider>
          <PlanProvider>
            <AppContent />
          </PlanProvider>
        </ThemeProvider>
      </LocaleProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
