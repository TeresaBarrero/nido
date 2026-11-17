import { createBrowserRouter } from 'react-router';
import { Root } from './Root';
import { Home } from '../screens/Home';
import { Notifications } from '../screens/Notifications';
import { Onboarding } from '../screens/Onboarding';
import { Placeholder } from '../screens/Placeholder';
import { NotFound } from '../screens/NotFound';
import { Search } from '../screens/Search';
import { Product } from '../screens/Product';
import { Chat } from '../screens/Chat';
import { Checkout } from '../screens/Checkout';
import { Reserved } from '../screens/Reserved';

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
      { path: 'vender', element: <Placeholder title="Vender" /> },
      { path: 'mensajes', element: <Placeholder title="Mensajes" /> },
      { path: 'perfil', element: <Placeholder title="Perfil" /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
