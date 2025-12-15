import { Link, Outlet, useNavigate } from "react-router-dom";
import  { AuthContext } from "../../contexts/AuthContext";
import { useContext, useEffect } from "react";
import logoImg from "../../assets/logogesrest.png";

export default function RootLayout() {
    
    const {logout, user} = useContext(AuthContext);
    const navigate = useNavigate();

    function handleLogout() {
        logout(); // limpa o estado de autenticação.
    }

    // Redireciona quando o estado do usuário muda para nulo (logout)
    useEffect(() => {
        // Se o usuário não existir (após o logout)
        if (!user) {
            // Certifica de que ele não está na página inicial antes de redirecionar,
            // ou apenas redireciona para garantir que a página seja recarregada/navegada.
            navigate('/', {replace: true}); // {replace: true} ajuda a não entupir o histórico
        }
    }, [user, navigate]);
    //Variável para armazenar a saudação e o perfil do utilizador
    const userSaudacao = user ? `Bem-vindo(a), ${user.firstName}` : '';


    return (
        // Usa um Fragment (<>) para agrupar múltiplos elementos sem adicionar um nó extra ao DOM
        <>
        {/* Barra de navegação principal do site. */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
            {/* Conteúdo da barra de navegação. */}
            <div className="container">
                <Link className="navbar-brand" to="/">
                    <img
                        src={logoImg}
                        alt="Logo GESREST"
                        height="40"
                        className="d-inline-block align-top"
                    />
                </Link>

                

                {!user ?
                    <div className="d-flex ms-auto">
                        <Link to="/login" className="btn-entrar me-2">
                            Entrar
                        </Link> 
                        <Link to="/register" className="btn-registar">
                            Registar
                        </Link>
                    </div>
                    : 
                 <div className="d-flex align-items-center ms-auto">
                        {/* Saudação  */}
                        <div className="me-3">
                            {userSaudacao}
                        </div>
                        {/* Botão de Logout */}
                        <button className="btn-registar" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                }

            </div>
        </nav>
     

        {/* O componente Outlet, o React Router irá renderizar o componente da rota que estiver ativa */}
        <div className="content-wrapper">
            <Outlet/>
        </div>

    
        <footer >
            © 2025 GESREST | Desenvolvido com ❤️ por <a 
                href="https://claudiamachado.me" target="_blank">Claudia Machado
            </a>
        </footer>
        </>
  )
}