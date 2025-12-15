import './App.css'
import {createHashRouter, RouterProvider} from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext';
import RootLayout from './components/layouts/RootLayout';
import ErrorPage from './pages/Error.jsx';
import HomePage from './pages/HomePage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Register.jsx';
import MenuIndex from './pages/MenuIndex.jsx';
import RouterForUsers from './protectedRoutes/RouterForUsers.jsx';
import RouterForManager from './protectedRoutes/RouterForManager.jsx';
import ControleGerente from './pages/ControleGerente.jsx';
import RouterForKitchen from './protectedRoutes/RouterForKitchen.jsx';
import ControleCozinha from './pages/ControleCozinha.jsx';




// Esta função recebe um array de objetos, onde cada objeto define uma rota
const router = createHashRouter ([
  {path:'/',
  element: <RootLayout/>,
  errorElement: <ErrorPage/>,
  children:[
  {path: '/', element: <HomePage/>},
  {path: '/login', element: <Login/>},
  {path: '/register', element: <Signup/>},
  {path: '/menuusers', element: <RouterForUsers element={<MenuIndex/>}/>},
  {path: '/controlegerente', element: <RouterForManager element={<ControleGerente/>}/>},
  {path: '/cozinha', element: <RouterForKitchen element={<ControleCozinha/>}/>},
  

  ]}
]);

// O componente principal da aplicação
function App() {
  return (
  // O AuthProvider envolve toda a aplicação, disponibilizando o contexto de autenticação para todos os componentes renderizados pelo router
  <AuthProvider>
    {/* O RouterProvider é o que ativa o sistema de rotas, recebendo a configuração do router */}
    <RouterProvider router={router} />
  </AuthProvider>
  )
}

export default App
