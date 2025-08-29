import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { LandingModule } from '~/modules/LandingModule';
import { LandingAction } from '~/modules/LandingModule/action';
import { LandingLoader } from '~/modules/LandingModule/loader';

export async function loader(args: LoaderFunctionArgs) {
  return LandingLoader(args);
}

export async function action(args: ActionFunctionArgs) {
  return LandingAction(args);
}

export default function LandingPage() {
  return <LandingModule />;
}
