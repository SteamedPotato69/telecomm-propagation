import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { LedgerItem } from '../../models/plan';
import { useTheme } from '../../theme';
import { ResultRows, useLedgerRows } from './ResultRows';

/** "Tu plan hasta ahora": what the previous steps already decided, in order. Hidden while empty. */
export function PlanLedger({ items }: { items: LedgerItem[] }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const rows = useLedgerRows(items);
  if (rows.length === 0) return null;
  return (
    <View
      accessibilityRole="summary"
      style={[styles.card, { backgroundColor: colors.accentSurface, borderColor: colors.accent }]}
    >
      <Text style={[styles.title, { color: colors.accentText }]}>{t('plan.shell.ledgerTitle')}</Text>
      <ResultRows rows={rows} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4, marginBottom: 16 },
  title: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
});
