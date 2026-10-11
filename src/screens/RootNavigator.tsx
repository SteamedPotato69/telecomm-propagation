import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { CalculatorScreen } from './CalculatorScreen';
import { CellularHubScreen } from './CellularHubScreen';
import { ComparisonScreen } from './ComparisonScreen';
import { DimensioningScreen } from './DimensioningScreen';
import { EnvironmentScreen } from './EnvironmentScreen';
import { FadingScreen } from './FadingScreen';
import { GeometryScreen } from './GeometryScreen';
import { HomeScreen } from './HomeScreen';
import { LinkBudgetScreen } from './LinkBudgetScreen';
import { SettingsScreen } from './SettingsScreen';
import { TrafficScreen } from './TrafficScreen';
import { WcdmaLoadScreen } from './WcdmaLoadScreen';
import type { EnvironmentCategory, PropagationInputs } from '../models/propagation';

type Route =
  | { name: 'home' }
  | { name: 'settings' }
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
 * Where Android's hardware/gesture back button should go for each route --
 * the exact same destination each screen's own `onBack` callback already
 * uses below, factored out so both can stay in sync. `null` for 'home'
 * means "let the OS handle it" (exit the app), the correct behavior at
 * the root of the stack.
 */
function getBackRoute(route: Route): Route | null {
  switch (route.name) {
    case 'home':
      return null;
    case 'settings':
    case 'environment':
    case 'fading':
    case 'cellular-hub':
      return { name: 'home' };
    case 'calculator':
      return { name: 'environment' };
    case 'comparison':
      return { name: 'calculator', environment: route.environment };
    case 'geometry':
    case 'traffic':
    case 'link-budget':
    case 'dimensioning':
    case 'wcdma':
      return { name: 'cellular-hub' };
    default:
      return null;
  }
}

/**
 * Local-state navigation instead of a router library: the app has a
 * fixed, shallow set of screens (home -> environment -> calculator ->
 * comparison) with no deep links or URL state to manage. Pulling in
 * expo-router for this would be more machinery than the actual
 * navigation need -- revisit if the screen graph grows non-linear.
 */
export function RootNavigator() {
  const [route, setRoute] = useState<Route>({ name: 'home' });

  useEffect(() => {
    // Without this, Android's hardware/gesture back button has no listener
    // to consume it (this navigator is plain useState, not a router the OS
    // integrates with) -- the default behavior for an unhandled back press
    // is to exit the app entirely, from any screen. Returning true here
    // instead pops to the same destination each screen's own back button
    // already goes to; returning false only at 'home' lets the OS exit as
    // normal, since there's nowhere left to go back to.
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const previous = getBackRoute(route);
      if (previous === null) {
        return false;
      }
      setRoute(previous);
      return true;
    });
    return () => subscription.remove();
  }, [route]);

  switch (route.name) {
    case 'home':
      return (
        <HomeScreen
          onSelectEmpiricalMethods={() => setRoute({ name: 'environment' })}
          onSelectFadingSimulator={() => setRoute({ name: 'fading' })}
          onSelectCellularPlanning={() => setRoute({ name: 'cellular-hub' })}
          onOpenSettings={() => setRoute({ name: 'settings' })}
        />
      );

    case 'settings':
      return <SettingsScreen onBack={() => setRoute({ name: 'home' })} />;

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
