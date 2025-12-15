import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom"; // Importa o componente Navigate do React Router para fazer redirecionamentos.


// Define e exporta o componente de guarda RouterForUsers que recebe uma prop 'element', que é o página a ser protegida
export default function RouterForUsers({element}){
    // Usa o hook useContext para obter o objeto 'user' do AuthContext
    const {user} = useContext(AuthContext);

     // Se o utilizador existe E a sua função NÃO é 'utilizador' ou se o utilizador não existe (não está autenticado)
    if((user && user.role != 'utilizador') || !user){
        // Se qualquer uma das condições for verdadeira, redireciona o utilizador para a página de login
        return <Navigate to ='/' replace/>// A prop 'replace' substitui a entrada atual no histórico, impedindo o uso do botão "Voltar"
    }
    
    // Se o utilizador tiver permissão (está autenticado e é um 'utilizador'), renderiza o elemento protegido
    return element;
}