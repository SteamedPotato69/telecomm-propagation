import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { ListCard } from '../components/ListCard';
import { useTheme } from '../theme';

interface CellularHubScreenProps {
  onBack: () => void;
  onSelectGeometry: () => void;
  onSelectTraffic: () => void;
  onSelectLinkBudget: () => void;
  onSelectDimensioning: () => void;
  onSelectWcdma: () => void;
  onSelectGuidedPlan: () => void;
}

type CellularFeatureId = 'geometry' | 'traffic' | 'link-budget' | 'dimensioning' | 'wcdma';

interface CellularFeatureItem {
  id: CellularFeatureId;
  enabled: boolean;
}

/**
 * Hub for the cellular-planning features (docs/curso-referencia.md §13),
 * mirroring EnvironmentScreen's list-of-choices shape. Items go from
 * disabled to enabled one at a time as each phase of the feature lands --
 * see the project plan for the phase order. Titles/descriptions are the
 * translations under `cellularHub.features.<id>`.
 */
const CELLULAR_FEATURES: CellularFeatureItem[] = [
  { id: 'geometry', enabled: true },
  { id: 'traffic', enabled: true },
  { id: 'link-budget', enabled: true },
  { id: 'dimensioning', enabled: true },
  { id: 'wcdma', enabled: true },
];

export function CellularHubScreen({
  onBack,
  onSelectGeometry,
  onSelectTraffic,
  onSelectLinkBudget,
  onSelectDimensioning,
  onSelectWcdma,
  onSelectGuidedPlan,
}: CellularHubScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const onPressById: Record<CellularFeatureId, () => void> = {
    geometry: onSelectGeometry,
    traffic: onSelectTraffic,
    'link-budget': onSelectLinkBudget,
    dimensioning: onSelectDimensioning,
    wcdma: onSelectWcdma,
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BackButton onPress={onBack} />

      <Text style={[styles.title, { color: colors.textPrimary }]}>{t('cellularHub.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('cellularHub.subtitle')}</Text>

      {/* The guided plan is the main way in; the standalone calculators below stay as tools. */}
      <ListCard
        title={t('cellularHub.features.guided.title')}
        description={t('cellularHub.features.guided.description')}
        onPress={onSelectGuidedPlan}
      />

      <Text style={[styles.toolsHeading, { color: colors.textMuted }]}>{t('cellularHub.toolsHeading')}</Text>

      {CELLULAR_FEATURES.map((feature) => (
        <ListCard
          key={feature.id}
          title={t(`cellularHub.features.${feature.id}.title`)}
          description={t(`cellularHub.features.${feature.id}.description`)}
          statusText={feature.enabled ? undefined : t('common.comingSoon')}
          disabled={!feature.enabled}
          onPress={onPressById[feature.id]}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 20 },
  toolsHeading: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 12, marginBottom: 10 },
});
