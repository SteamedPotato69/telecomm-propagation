import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { CalculatorScreen } from './CalculatorScreen';
import { CellPuzzleScreen } from './CellPuzzleScreen';
import { CellularHubScreen } from './CellularHubScreen';
import { ComparisonScreen } from './ComparisonScreen';
import { DimensioningScreen } from './DimensioningScreen';
import { EnvironmentScreen } from './EnvironmentScreen';
import { FadingScreen } from './FadingScreen';
import { GeometryScreen } from './GeometryScreen';
import { HomeScreen } from './HomeScreen';
import { LinkBudgetScreen } from './LinkBudgetScreen';
import { Plan1g2gWizard, Plan3gWizard } from './PlanWizardScreen';
import { PlanStartScreen } from './PlanStartScreen';
import { PuzzlePathScreen } from './PuzzlePathScreen';
import { SettingsScreen } from './SettingsScreen';
import { TutorialScreen } from './TutorialScreen';
import { TrafficScreen } from './TrafficScreen';
import { WcdmaLoadScreen } from './WcdmaLoadScreen';
import type { TutorialId } from '../models/game';
import { STEPS_1G2G, STEPS_3G } from '../models/plan';
import type { GameMission, Generation } from '../models/plan';
import type { EnvironmentCategory, PropagationInputs } from '../models/propagation';

type Route =
  | { name: 'home' }
  | { name: 'settings' }
  | { name: 'environment' }
  | { name: 'calculator'; environment: EnvironmentCategory }
  | { name: 'comparison'; environment: EnvironmentCategory; inputs: PropagationInputs }
  | { name: 'fading' }
  | { name: 'cellular-hub' }
  | { name: 'plan-start' }
  | { name: 'plan-step'; generation: Generation; step: number }
  | { name: 'puzzle-path'; mission: GameMission }
  | { name: 'tutorial'; mission: GameMission; id: TutorialId }
  | { name: 'cell-puzzle'; mission: GameMission; step: number }
  | { name: 'geometry' }
  | { name: 'traffic' }
  | { name: 'link-budget' }
  | { name: 'dimensioning' }
  | { name: 'wcdma' };

/** The wizard's last step (the summary the puzzle was opened from) for the mission's generation. */
function summaryRoute(mission: GameMission): Route {
  const steps = mission.generation === '3g' ? STEPS_3G : STEPS_1G2G;
  return { name: 'plan-step', generation: mission.generation, step: steps.length - 1 };
}

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
    case 'plan-start':
      return { name: 'cellular-hub' };
    // Back inside the wizard walks the steps one by one; from the first step it leaves to the chooser.
    case 'plan-step':
      return route.step > 0 ? { name: 'plan-step', generation: route.generation, step: route.step - 1 } : { name: 'plan-start' };
    // The path of levels sits between the plan's summary and the games: back from a game returns to it,
    // and back from the path returns to the summary. Inside the mission, back walks its steps first.
    case 'puzzle-path':
      return summaryRoute(route.mission);
    case 'tutorial':
      return { name: 'puzzle-path', mission: route.mission };
    case 'cell-puzzle':
      return route.step > 0
        ? { name: 'cell-puzzle', mission: route.mission, step: route.step - 1 }
        : { name: 'puzzle-path', mission: route.mission };
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
          onSelectGuidedPlan={() => setRoute({ name: 'plan-start' })}
        />
      );

    case 'plan-start':
      return (
        <PlanStartScreen
          onBack={() => setRoute({ name: 'cellular-hub' })}
          onOpen={(generation, step) => setRoute({ name: 'plan-step', generation, step })}
        />
      );

    case 'plan-step': {
      const onStep = (step: number) => setRoute({ name: 'plan-step', generation: route.generation, step });
      const onLeave = () => setRoute({ name: 'plan-start' });
      const onPlay = (mission: GameMission) => setRoute({ name: 'puzzle-path', mission });
      return route.generation === '3g' ? (
        <Plan3gWizard step={route.step} onStep={onStep} onLeave={onLeave} onPlay={onPlay} />
      ) : (
        <Plan1g2gWizard generation={route.generation} step={route.step} onStep={onStep} onLeave={onLeave} onPlay={onPlay} />
      );
    }

    case 'puzzle-path':
      return (
        <PuzzlePathScreen
          mission={route.mission}
          onBack={() => setRoute(summaryRoute(route.mission))}
          onPlayTutorial={(id) => setRoute({ name: 'tutorial', mission: route.mission, id })}
          onPlayMission={() => setRoute({ name: 'cell-puzzle', mission: route.mission, step: 0 })}
        />
      );

    // key: each level starts from a clean board even though it is the same component.
    case 'tutorial':
      return (
        <TutorialScreen
          key={route.id}
          id={route.id}
          onBack={() => setRoute({ name: 'puzzle-path', mission: route.mission })}
          onNext={(id) => setRoute({ name: 'tutorial', mission: route.mission, id })}
        />
      );

    case 'cell-puzzle':
      return (
        <CellPuzzleScreen
          mission={route.mission}
          step={route.step}
          onStep={(step) => setRoute({ name: 'cell-puzzle', mission: route.mission, step })}
          onLeave={() => setRoute({ name: 'puzzle-path', mission: route.mission })}
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
