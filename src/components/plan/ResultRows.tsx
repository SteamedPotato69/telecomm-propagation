import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { LedgerItem } from '../../models/plan';
import { useTheme } from '../../theme';

/** One label / value row. */
export interface ResultRow {
  label: string;
  value: string;
  /** Short explanation shown under the label (used by the summary before the game). */
  hint?: string;
  emphasis?: boolean;
}

/** Turns language-neutral ledger rows into text in the active language. */
export function useLedgerRows(items: LedgerItem[]): ResultRow[] {
  const { t } = useTranslation();
  const translate = t as unknown as (key: string) => string;
  return items.map((item) => {
    const raw = typeof item.value === 'number' ? item.value.toFixed(item.decimals ?? 0) : translate(item.value.key);
    return { label: translate(`plan.ledger.${item.id}`), value: item.unit ? `${raw} ${item.unit}` : raw };
  });
}

export function ResultRows({ rows }: { rows: ResultRow[] }) {
  const { colors } = useTheme();
  return (
    <View>
      {rows.map((row, index) => (
        <View
          key={`${row.label}-${index}`}
          style={[styles.row, index > 0 && { borderTopColor: colors.borderMuted, borderTopWidth: StyleSheet.hairlineWidth }]}
        >
          <View style={styles.labels}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{row.label}</Text>
            {row.hint ? <Text style={[styles.hint, { color: colors.textMuted }]}>{row.hint}</Text> : null}
          </View>
          <Text style={[row.emphasis ? styles.valueStrong : styles.value, { color: colors.textPrimary }]}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 8, gap: 12 },
  labels: { flex: 1 },
  label: { fontSize: 13 },
  hint: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  value: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  valueStrong: { fontSize: 22, fontWeight: '700', textAlign: 'right' },
});
