import { useState } from 'react';
import { CalculatorScreen } from './CalculatorScreen';
import { ComparisonScreen } from './ComparisonScreen';
import { EnvironmentScreen } from './EnvironmentScreen';
import { HomeScreen } from './HomeScreen';
import type { EnvironmentCategory, PropagationInputs } from '../models/propagation';

type Route =
  | { name: 'home' }
  | { name: 'environment' }
  | { name: 'calculator'; environment: EnvironmentCategory }
  | { name: 'comparison'; environment: EnvironmentCategory; inputs: PropagationInputs };

/**
 * Local-state navigation instead of a router library: the app has a
 * fixed, shallow set of screens (home -> environment -> calculator ->
 * comparison) with no deep links or URL state to manage. Pulling in
 * expo-router for this would be more machinery than the actual
 * navigation need -- revisit if the screen graph grows non-linear.
 */
export function RootNavigator() {
  const [route, setRoute] = useState<Route>({ name: 'home' });

  switch (route.name) {
    case 'home':
      return <HomeScreen onSelectEmpiricalMethods={() => setRoute({ name: 'environment' })} />;

    case 'environment':
      return (
        <EnvironmentScreen
          onBack={() => setRoute({ name: 'home' })}
          onSelectEnvironment={(environment) => setRoute({ name: 'calculator', environment })}
        />
      );

    case 'calculator':
      return (
        <CalculatorScreen
          environment={route.environment}
          onBack={() => setRoute({ name: 'environment' })}
          onCompare={(inputs) => setRoute({ name: 'comparison', environment: route.environment, inputs })}
        />
      );

    case 'comparison':
      return (
        <ComparisonScreen
          environment={route.environment}
          inputs={route.inputs}
          onBack={() => setRoute({ name: 'calculator', environment: route.environment })}
        />
      );

    default:
      return null;
  }
}
