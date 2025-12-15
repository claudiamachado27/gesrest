/* eslint-disable no-unused-vars */
import { useNavigate } from 'react-router-dom'; // Importa o hook useNavigate do React Router para permitir a navegação 
import { AuthContext } from '../contexts/AuthContext'; // Importa o AuthContext para aceder ao estado de autenticação
import { useContext, useState } from 'react';// Importa os hooks useContext e useState do React
import '../components/Login.css';
import '../components/Button.css';

// Define e exporta o componente Login.
export default function Login() {
  
  const {login} = useContext(AuthContext);// Usa o hook useContext para obter a função 'login' do AuthContext
  const [error, setError] = useState(null);// Estado para mensagens de erro
    const navigate = useNavigate();// Hook para navegação 

    async function handleSubmit(event) {// Impede o recarregamento da página padrão do formulário
      
      event.preventDefault(); // Impede o comportamento padrão do formulário de recarregar a página

      setError(null); // Limpa erros anteriores ao tentar fazer login novamente

      const formData = new FormData(event.target);// Cria um objeto FormData a partir do formulário que disparou o evento.
      const data = Object.fromEntries(formData);  // Converte os dados do formulário num objeto JavaScript simples (chave/valor).

      // Chama a função de login do contexto, passando os dados do formulário
      // O try...catch lida com o sucesso ou a falha do login
      try {
        // Chama a função de login uma única vez e aguarda o resultado
        const user = await login(data);
      
      // Se o login for bem-sucedido, o objeto 'user' terá os dados do utilizador, incluindo a 'role'
      if (user && user.role) {
          switch (user.role) {
              case 'utilizador':
                  // Redireciona para a página do menu usuario
                  navigate('/menuusers'); 
                  break;
              case 'cozinha':
                  // Redireciona para a página da cozinha 
                  navigate('/cozinha'); 
                  break;
              case 'gerente':
                  // Redireciona para a página do gerente
                  navigate('/controlegerente');
                  break;
              default:
                  // Se a 'role' não for reconhecida, redireciona para a página inicial.
                  navigate('/'); 
          }
      } else {
          // Se o objeto user não for retornado corretamente, redireciona para a página inicial.
          navigate('/');
      }

      } catch (error) { 
        // Se o login falhar atualiza o estado de erro com uma mensagem
        setError('Email ou palavra-passe inválidos. Tente novamente.');
      }
    }    
 
    return (
      // O atributo onSubmit do formulário está ligado à função handleSubmit
      <form onSubmit={handleSubmit} action="/backend">
        <h2 style={{color: '#f7f3f3ff'}}>Login</h2>
        <p style={{color: '#f7f3f3ff'}}>Acesse a sua conta</p>

        {/* Bloco para exibir a mensagem de erro, se existir erro */}
        {error && <p style={{ color: '#f8baba', background: '#b71919ff', padding: '0.5rem', borderRadius: '4px' }}>{error}</p>}
 
        <div className="control">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" required />
        </div>
 

        <div className="control-row">
          <div className="control">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" required />
          </div>
        </div>
        
        <p className="form-actions">
          <button type="submit" className="button">
            Login
          </button>
        </p>
      </form>
    );
  }