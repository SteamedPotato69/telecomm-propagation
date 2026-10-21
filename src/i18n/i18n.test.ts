import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createInstance } from 'i18next';
import { describe, expect, it } from 'vitest';
import { calculateIkegamiLoss } from '../models/propagation/ikegami';
import { calculateHataLoss } from '../models/propagation/hata';
import { LocalizedError } from '../utils/localizedMessage';
import { en } from './locales/en';
import { es } from './locales/es';
import { pt } from './locales/pt';
import { translateError, translateMessage } from './translateMessage';

type Tree = { [key: string]: string | Tree };
const LOCALES: Record<string, Tree> = { es, en, pt };

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out[path] = value;
    else Object.assign(out, flatten(value, path));
  }
  return out;
}

const placeholders = (text: string) => [...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort();

function makeT(language: 'es' | 'en' | 'pt') {
  const instance = createInstance();
  void instance.init({
    resources: { es: { translation: es }, en: { translation: en }, pt: { translation: pt } },
    lng: language,
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return instance.t.bind(instance);
}

describe('locale parity', () => {
  // tsc already guarantees the same keys exist in every language; what it can't
  // see is a translation that drops or renames an {{interpolation}} placeholder.
  const spanish = flatten(es);

  for (const language of ['en', 'pt'] as const) {
    it(`${language} uses the same {{placeholders}} as es for every key`, () => {
      const translated = flatten(LOCALES[language]);
      for (const [path, text] of Object.entries(spanish)) {
        expect(placeholders(translated[path]), `${language}:${path}`).toEqual(placeholders(text));
      }
    });

    it(`${language} has no empty translation where es has text`, () => {
      const translated = flatten(LOCALES[language]);
      for (const [path, text] of Object.entries(spanish)) {
        if (text !== '') expect(translated[path], `${language}:${path}`).not.toBe('');
      }
    });
  }
});

/** Source files (not tests) under a directory, recursively. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.ts$/.test(name) && !/\.test\.ts$/.test(name) ? [path] : [];
  });
}

describe('field labels used by the pure modules', () => {
  // A label passed to assert*/requireField/rangeWarning must be a `fields.*`
  // key. A leftover human-readable literal (e.g. 'Área total a cubrir')
  // compiles fine but renders as a raw key path in the UI -- tsc can't see it.
  const patterns = [
    /\bassert\w+\(\s*[^,()]+(?:\([^()]*\))?\s*,\s*'([^']+)'/g,
    /\brequireField\(\s*[^,]+,\s*'([^']+)'/g,
    /\bpushRangeWarning\(\s*'[^']+',\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*'([^']+)'/g,
  ];
  const known = new Set(Object.keys(es.fields));

  it('every literal label in src/models and src/utils exists under fields.*', () => {
    const missing: string[] = [];
    for (const file of [...sourceFiles('src/models'), ...sourceFiles('src/utils')]) {
      const text = readFileSync(file, 'utf8');
      for (const pattern of patterns) {
        for (const match of text.matchAll(pattern)) {
          if (!known.has(match[1])) missing.push(`${file}: '${match[1]}'`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});

describe('translateMessage', () => {
  it('translates a validation error, resolving the field label in the active language', () => {
    const error = new LocalizedError('errors.mustBePositive', { field: { key: 'frequency' } });
    expect(translateError(makeT('es') as never, error)).toBe('Frecuencia debe ser un número mayor que 0.');
    expect(translateError(makeT('en') as never, error)).toBe('Frequency must be a number greater than 0.');
    expect(translateError(makeT('pt') as never, error)).toBe('Frequência deve ser um número maior que 0.');
  });

  it('resolves a dotted field key as an absolute path and nested field params', () => {
    const t = makeT('en') as never;
    const message = {
      key: 'errors.mustBePositive',
      params: { field: { key: 'serviceBitRate', params: { service: { key: 'wcdma.services.voice' } } } },
    };
    expect(translateMessage(t, message)).toBe('Bit rate (AMR voice) must be a number greater than 0.');
  });

  it('translates structured range warnings produced by the models', () => {
    const { warnings } = calculateHataLoss({
      frequencyMHz: 2000,
      distanceKm: 5,
      baseStationHeightM: 30,
      mobileHeightM: 1.5,
      citySize: 'small-medium',
      environment: 'urban',
      metropolitanCenter: false,
    });
    expect(warnings).toHaveLength(1);
    expect(translateMessage(makeT('en') as never, warnings[0].message)).toBe(
      'Frequency = 2000 MHz is outside the model’s valid range [150-1500] MHz; the result is an extrapolation.'
    );
  });

  it('translates errors thrown by a model, in every language', () => {
    let thrown: unknown;
    try {
      calculateIkegamiLoss({
        frequencyMHz: 900,
        distanceKm: 1,
        baseStationHeightM: 30,
        mobileHeightM: 1.5,
        citySize: 'small-medium',
        environment: 'urban',
        metropolitanCenter: false,
        streetWidthM: 20,
        diffractingBuildingHeightM: 1,
        streetOrientationDeg: 30,
        facadeReflectionLr: 3.2,
      });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(LocalizedError);
    expect(translateError(makeT('en') as never, thrown)).toMatch(/diffracting building height/i);
    expect(translateError(makeT('pt') as never, thrown)).toMatch(/edifício de difração/i);
    expect(translateError(makeT('es') as never, thrown)).toMatch(/edificio de difracción/i);
  });

  it('falls back to a generic message for errors that are not LocalizedError', () => {
    expect(translateError(makeT('en') as never, new Error('boom'))).toBe('Unknown error.');
  });

  it('uses plural forms for counted strings', () => {
    const t = makeT('en') as never as (key: string, options: object) => string;
    expect(t('environment.modelsAvailable', { count: 1 })).toBe('1 model available');
    expect(t('environment.modelsAvailable', { count: 3 })).toBe('3 models available');
  });
});
