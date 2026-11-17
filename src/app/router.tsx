import { createBrowserRouter } from 'react-router';
import { Root } from './Root';
import { Home } from '../screens/Home';
import { Notifications } from '../screens/Notifications';
import { Onboarding } from '../screens/Onboarding';
import { NotFound } from '../screens/NotFound';
import { Search } from '../screens/Search';
import { Product } from '../screens/Product';
import { Chat } from '../screens/Chat';
import { Checkout } from '../screens/Checkout';
import { Reserved } from '../screens/Reserved';
import { Sell } from '../screens/Sell';
import { Messages } from '../screens/Messages';
import { Profile } from '../screens/Profile';
import { Feedback } from '../screens/Feedback';
import { Results } from '../screens/Results';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: 'bienvenida', element: <Onboarding /> },
      { path: 'notificaciones', element: <Notifications /> },
      { path: 'buscar', element: <Search /> },
      { path: 'producto/:id', element: <Product /> },
      { path: 'chat/:id', element: <Chat /> },
      { path: 'pagar/:id', element: <Checkout /> },
      { path: 'reservado/:id', element: <Reserved /> },
      { path: 'vender', element: <Sell /> },
      { path: 'mensajes', element: <Messages /> },
      { path: 'perfil', element: <Profile /> },
      { path: 'opinion', element: <Feedback /> },
      { path: 'resultados', element: <Results /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
