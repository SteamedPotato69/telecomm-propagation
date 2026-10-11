import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { ListCard } from '../components/ListCard';
import { ENVIRONMENT_CATEGORIES } from '../models/propagation';
import type { EnvironmentCategory } from '../models/propagation';
import { useTheme } from '../theme';

interface EnvironmentScreenProps {
  onSelectEnvironment: (environment: EnvironmentCategory) => void;
  onBack: () => void;
}

export function EnvironmentScreen({ onSelectEnvironment, onBack }: EnvironmentScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BackButton onPress={onBack} />

      <Text style={[styles.title, { color: colors.textPrimary }]}>{t('environment.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {t('environment.subtitle')}
      </Text>

      {ENVIRONMENT_CATEGORIES.map((environment) => {
        const count = environment.applicableModelIds.length;
        const isEmpty = count === 0;
        return (
          <ListCard
            key={environment.id}
            title={t(`environments.${environment.id}.label`)}
            description={t(`environments.${environment.id}.description`)}
            statusText={isEmpty ? t('common.comingSoon') : t('environment.modelsAvailable', { count })}
            disabled={isEmpty}
            onPress={() => onSelectEnvironment(environment)}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 20 },
});
