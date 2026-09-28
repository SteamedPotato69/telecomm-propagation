import { useState } from 'react';
import { CalculatorScreen } from './CalculatorScreen';
import { CellularHubScreen } from './CellularHubScreen';
import { ComparisonScreen } from './ComparisonScreen';
import { DimensioningScreen } from './DimensioningScreen';
import { EnvironmentScreen } from './EnvironmentScreen';
import { FadingScreen } from './FadingScreen';
import { GeometryScreen } from './GeometryScreen';
import { HomeScreen } from './HomeScreen';
import { LinkBudgetScreen } from './LinkBudgetScreen';
import { TrafficScreen } from './TrafficScreen';
import { WcdmaLoadScreen } from './WcdmaLoadScreen';
import type { EnvironmentCategory, PropagationInputs } from '../models/propagation';

type Route =
  | { name: 'home' }
  | { name: 'environment' }
  | { name: 'calculator'; environment: EnvironmentCategory }
  | { name: 'comparison'; environment: EnvironmentCategory; inputs: PropagationInputs }
  | { name: 'fading' }
  | { name: 'cellular-hub' }
  | { name: 'geometry' }
  | { name: 'traffic' }
  | { name: 'link-budget' }
  | { name: 'dimensioning' }
  | { name: 'wcdma' };

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
      return (
        <HomeScreen
          onSelectEmpiricalMethods={() => setRoute({ name: 'environment' })}
          onSelectFadingSimulator={() => setRoute({ name: 'fading' })}
          onSelectCellularPlanning={() => setRoute({ name: 'cellular-hub' })}
        />
      );

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

    case 'fading':
      return <FadingScreen onBack={() => setRoute({ name: 'home' })} />;

    case 'cellular-hub':
      return (
        <CellularHubScreen
          onBack={() => setRoute({ name: 'home' })}
          onSelectGeometry={() => setRoute({ name: 'geometry' })}
          onSelectTraffic={() => setRoute({ name: 'traffic' })}
          onSelectLinkBudget={() => setRoute({ name: 'link-budget' })}
          onSelectDimensioning={() => setRoute({ name: 'dimensioning' })}
          onSelectWcdma={() => setRoute({ name: 'wcdma' })}
        />
      );

    case 'geometry':
      return <GeometryScreen onBack={() => setRoute({ name: 'cellular-hub' })} />;

    case 'traffic':
      return <TrafficScreen onBack={() => setRoute({ name: 'cellular-hub' })} />;

    case 'link-budget':
      return <LinkBudgetScreen onBack={() => setRoute({ name: 'cellular-hub' })} />;

    case 'dimensioning':
      return <DimensioningScreen onBack={() => setRoute({ name: 'cellular-hub' })} />;

    case 'wcdma':
      return <WcdmaLoadScreen onBack={() => setRoute({ name: 'cellular-hub' })} />;

    default:
      return null;
  }
}
