import { createBrowserRouter } from 'react-router';
import { Root } from './Root';
import { Home } from '../screens/Home';
import { Notifications } from '../screens/Notifications';
import { Onboarding } from '../screens/Onboarding';
import { Placeholder } from '../screens/Placeholder';
import { NotFound } from '../screens/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: 'bienvenida', element: <Onboarding /> },
      { path: 'notificaciones', element: <Notifications /> },
      { path: 'buscar', element: <Placeholder title="Buscar" /> },
      { path: 'producto/:id', element: <Placeholder title="Ficha" /> },
      { path: 'chat/:id', element: <Placeholder title="Chat" /> },
      { path: 'pagar/:id', element: <Placeholder title="Pagar y reservar" /> },
      { path: 'reservado/:id', element: <Placeholder title="Reservado" /> },
      { path: 'vender', element: <Placeholder title="Vender" /> },
      { path: 'mensajes', element: <Placeholder title="Mensajes" /> },
      { path: 'perfil', element: <Placeholder title="Perfil" /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
