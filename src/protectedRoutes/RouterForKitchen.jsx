import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// Define o componente de rota protegida que recebe uma prop 'element', que é a página a ser protegida.
export default function RouterForKitchen({ element }) {
  // Usa o contexto de autenticação para obter o estado do utilizador
  const {user} = useContext(AuthContext);

  
    // Se o utilizador existe E a sua função NÃO é 'cozinha' ou se o utilizador não existe (não está autenticado).
    if((user && user.role != 'cozinha') || !user){
        // Se qualquer uma das condições for verdadeira, redireciona o utilizador para a página de login.
        return <Navigate to ='/' replace/>// A prop 'replace' substitui a entrada atual no histórico, impedindo o uso do botão "Voltar".
    }

  // Se o utilizador tiver permissão (está autenticado e é 'cozinha'), renderiza o elemento protegido.
  return element;
}