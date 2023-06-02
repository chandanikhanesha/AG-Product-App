import Home from '../../../components/public/home';
import LogIn from '../../../components/public/log_in';
import Invite from '../../../components/public/invite';
import SignUp from '../../../components/public/sign_up';
import ConfirmSignUp from '../../../components/public/sign_up/confirm';
import ForgotPassword from '../../../components/public/forgot_password';
import ResetPassword from '../../../components/public/reset_password';
const publicRoutes = [
  {
    path: '/',
    component: Home,
    name: 'Home',
    short: 'Home',
    exact: true,
    mini: 'Home?',
  },
  {
    path: '/log_in',
    component: LogIn,
    name: 'Log In',
    short: 'Log In',
    mini: 'Log In',
  },
  {
    path: '/forgot_password',
    component: ForgotPassword,
    visible: false,
  },
  {
    path: '/reset_password/:token',
    component: ResetPassword,
    visible: false,
  },
  {
    path: '/invite/:token',
    component: Invite,
    visible: false,
  },
  {
    path: '/sign_up',
    component: SignUp,
    name: 'Sign Up',
    short: 'Sign Up',
    min: 'Sign up',
  },
  {
    path: '/confirm/:token',
    component: ConfirmSignUp,
    visible: false,
  },
];

export default publicRoutes;
