import '../components/Login.css';
import { useState } from 'react';// Importa o hook useState do React para gerir o estado do componente
import { useNavigate } from 'react-router-dom'; // Importa o hook useNavigate do React Router para permitir a navegação

// Define e exporta o componente funcional Signup
export default function Signup() {

    // Declara uma variável de estado 'passwordsAreNotEqual' para controlar se as palavras-passe inseridas são diferentes
    // Inicia como 'false'. 'setPasswordsNotEqual' é a função para atualizar este estado
    const [passwordsAreNotEqual, setPasswordsNotEqual] = useState(false);
    
    // Inicializa o hook useNavigate para poder redirecionar o utilizador após login
    const navigate = useNavigate();


    // Função chamada quando o formulário é submetido
    function handleSubmit(event) {
      // Impede o comportamento padrão do formulário de recarregar a página
      event.preventDefault();   
      
      //faz validações
      // Cria um objeto FormData a partir do formulário que disparou o evento
      const formData = new FormData(event.target);
      // Converte os dados do formulário num objeto JavaScript simples
      const data = Object.fromEntries(formData)

        // Verifica se a palavra-passe e a confirmação da palavra-passe não são iguais
        if(data.password != data.confirmPassword){
          // Se não forem iguais, atualiza o estado para mostrar a mensagem de erro
          setPasswordsNotEqual(true);
        }else {
      //enviar dados para a API
      // Se as palavras-passe forem iguais, cria um objeto 'user' com os dados do formulário
        const user = {
            email: data.email,
            password: data.password,
            firstName: data["first-name"],
            lastName: data["last-name"],
            role: data.role,
            termsAccepted: data.terms === "on",
        };
        
        // Envia os dados do utilizador para o endpoint do backend via POST
        const response = fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Converte o objeto 'user' para uma string JSON para ser enviada no corpo do pedido
            body: JSON.stringify(user),
        });

        console.log(response)
        // Navega para a página inicial ('/') 
        navigate('/', {state: {message: 'Utilizador registado com sucesso!'}});
         }
    }  
 
    return (
      //envia para o backend quando o formulário for submetido
      <form onSubmit={handleSubmit} action="/backend">
                      
        <h2 style={{color: '#f7f3f3ff'}}>Registo</h2>
        <p style={{color: '#f7f3f3ff'}}>Crie a sua conta  🚀</p>
  
   
        <div className="control">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" required />
        </div>

         {/* Mostra a mensagem de erro apenas se 'passwordsAreNotEqual' for true */}
            {passwordsAreNotEqual && <p style={{color: '#f8baba', background: '#b71919ff', padding: '0.5rem', borderRadius: '4px', textAlign: 'left'}}>*Passwords não são iguais</p>}
  
        <div className="control-row">
          <div className="control">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" required />
          </div>
          <div className="control">
            <label htmlFor="confirm-password">Confirme a Password</label>
            <input
              id="confirm-password"
              type="password"
              name="confirmPassword"
              required
            />
          </div>
        </div>
         <div style={{ clear: 'both' }}></div>
           
 
  
        <hr />
  
        <div className="control-row">
          <div className="control">
            <label htmlFor="first-name">Nome</label>
            <input type="text" id="first-name" name="first-name" 
            required/>
          </div>
  
          <div className="control">
            <label htmlFor="last-name">Apelido</label>
            <input type="text" id="last-name" name="last-name" required />
          </div>
        </div>
  
        <div className="control">
          <label htmlFor="phone">Indique qual será o seu perfil?</label>
          <select id="role" name="role" required>
            <option value="utilizador">Utilizador</option>
            <option value="cozinha">Cozinha</option>
            <option value="gerente">Gerente</option>
     
          </select>
        </div>
        <div className="control">
          <label className="terms" htmlFor="terms-and-conditions">
            <input required type="checkbox" id="terms-and-conditions" name="terms" />Li e aceito os termos e condições
          </label>
        </div>
  
        <p className="form-actions">
          <button type="submit" className="button">
            Registar
          </button>
        </p>
      </form>
    );
  }