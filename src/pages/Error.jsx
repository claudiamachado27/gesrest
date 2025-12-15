// Importa o componente Link do React Router para criar links de navegação
import { Link } from "react-router-dom";

// É exibido quando o utilizador navega para uma rota que não existe
export default function ErrorPage(){

    // Define o caminho para a imagem de erro
    const imageUrl = "./src/assets/404error.png";

    return (<div>
        {/* Mostra a imagem de erro */}
        <img src={imageUrl} alt="Erro 404 - Página não encontrada"/>
        <h1>Ups! Página não encontrada!</h1>
        {/* Link para o utilizador voltar para a página inicial ('/') */}
        <Link to="/" className="btn-registar">
         Voltar para a Página Inicial
        </Link>
    </div>)

}