import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { LoginModule } from '~/modules/LoginModule';
import { LoginAction } from '~/modules/LoginModule/action';
import { LoginLoader } from '~/modules/LoginModule/loader';

export async function loader(args: LoaderFunctionArgs) {
  return LoginLoader(args);
}

export async function action(args: ActionFunctionArgs) {
  return LoginAction(args);
}

export default function LoginPage() {
  return <LoginModule />;
}
