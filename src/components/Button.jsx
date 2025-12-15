// Importa a folha de estilos específica para este componente.
import './Button.css';

// Define o componente Button que recebe três propriedades (props) desestruturadas: - children: é o conteúdo exibido dentro do botão, - aoClicar: é a função que será executada quando o botão for clicado; - isActive: é um booleano que indica se o botão deve ter o estilo "ativo"
function Button({children, aoClicar, isActive}){
 
    // Retorna um elemento <button> em que a className: Aplica a classe 'cor-botao' somente se a prop 'isActive' for verdadeira.  onClick: Atribui a função 'aoClicar' ao evento de clique do botão.
    return <button className={isActive && 'button-color'} onClick={aoClicar} >{children}</button>;
}

// Exporta o componente Button como o padrão deste ficheiro, para que possa ser importado e usado em outras partes da aplicação
export default Button;