
import { useContext } from "react";
// Importa o AuthContext para ter acesso ao estado do utilizador.
import { AuthContext } from "../contexts/AuthContext";
// Importa o componente Navigate do React Router para fazer redirecionamentos.
import { Navigate } from "react-router-dom";


// Define e exporta o componente de guarda RouterForUsers quee recebe uma prop 'element', que é o página a ser protegida
export default function RouterForManager({element}){
// Usa o contexto de autenticação para obter o estado do utilizador
    const {user} = useContext(AuthContext);

    // Se o utilizador existe E a sua função NÃO é 'gerente' ou se o utilizador não existe (não está autenticado).
    if((user && user.role != 'gerente') || !user){
        // Se qualquer uma das condições for verdadeira, redireciona o utilizador para a página de login.
        return <Navigate to ='/' replace/>// A prop 'replace' substitui a entrada atual no histórico, impedindo o uso do botão "Voltar".
    }

    // Se o utilizador tiver permissão (está autenticado e é um 'gerente'), renderiza o elemento protegido.
    return element;
}