import { useTranslation } from 'react-i18next';
import { NumericField } from './NumericField';

/** String-valued mirror of LinkBudgetInputs, for controlled NumericFields (raw text, parsed by the caller). */
export interface LinkBudgetFormValues {
  transmitPowerDbm: string;
  transmitAntennaGainDbi: string;
  bodyLossDb: string;
  receiveAntennaGainDbi: string;
  feederLossDb: string;
  receiverSensitivityDbm: string;
  shadowFadingMarginDb: string;
  interferenceMarginDb: string;
}

/** Defaults reproducing the course's own 1G worked example (docs/curso-referencia.md §13.3, diap. 45). */
export const DEFAULT_LINK_BUDGET_VALUES: LinkBudgetFormValues = {
  transmitPowerDbm: '33',
  transmitAntennaGainDbi: '0',
  bodyLossDb: '3',
  receiveAntennaGainDbi: '13',
  feederLossDb: '3',
  receiverSensitivityDbm: '-116',
  shadowFadingMarginDb: '8',
  interferenceMarginDb: '5',
};

interface LinkBudgetFormProps {
  values: LinkBudgetFormValues;
  onChange: (field: keyof LinkBudgetFormValues, value: string) => void;
}

/**
 * The link-budget parameter block (docs/curso-referencia.md §13.3), shared
 * by LinkBudgetScreen and (in later phases) DimensioningScreen/
 * WcdmaLoadScreen -- without this, the same ~8-field form gets
 * copy-pasted three times.
 */
export function LinkBudgetForm({ values, onChange }: LinkBudgetFormProps) {
  const { t } = useTranslation();
  return (
    <>
      <NumericField
        label={t('linkBudgetForm.transmitPower')}
        unit="dBm"
        value={values.transmitPowerDbm}
        onChangeText={(v) => onChange('transmitPowerDbm', v)}
      />
      <NumericField
        label={t('linkBudgetForm.msAntennaGain')}
        unit="dBi"
        value={values.transmitAntennaGainDbi}
        onChangeText={(v) => onChange('transmitAntennaGainDbi', v)}
      />
      <NumericField
        label={t('fields.bodyLoss')}
        unit="dB"
        value={values.bodyLossDb}
        onChangeText={(v) => onChange('bodyLossDb', v)}
      />
      <NumericField
        label={t('linkBudgetForm.btsAntennaGain')}
        unit="dBi"
        value={values.receiveAntennaGainDbi}
        onChangeText={(v) => onChange('receiveAntennaGainDbi', v)}
      />
      <NumericField
        label={t('linkBudgetForm.btsFeederLoss')}
        unit="dB"
        value={values.feederLossDb}
        onChangeText={(v) => onChange('feederLossDb', v)}
      />
      <NumericField
        label={t('linkBudgetForm.btsSensitivity')}
        unit="dBm"
        value={values.receiverSensitivityDbm}
        onChangeText={(v) => onChange('receiverSensitivityDbm', v)}
        helperText={t('linkBudgetForm.sensitivityHelper')}
      />
      <NumericField
        label={t('fields.shadowFadingMargin')}
        unit="dB"
        value={values.shadowFadingMarginDb}
        onChangeText={(v) => onChange('shadowFadingMarginDb', v)}
      />
      <NumericField
        label={t('fields.interferenceMargin')}
        unit="dB"
        value={values.interferenceMarginDb}
        onChangeText={(v) => onChange('interferenceMarginDb', v)}
      />
    </>
  );
}
