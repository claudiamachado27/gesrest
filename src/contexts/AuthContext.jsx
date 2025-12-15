/* eslint-disable react-refresh/only-export-components */
// Importa as funções createContext e useState do React
import { createContext, useState} from "react";

// Cria e exporta um novo Contexto de Autenticação que será usado para partilhar o estado de autenticação e as funções relacionadas
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);


  // Define uma função assíncrona para o login
  const login = async (authData) => {
    console.log(authData);
    // Envia um pedido POST para o endpoint de login do backend com os dados de autenticação
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(authData),
    });

    // Se a resposta não tiver sucesso, mostra um erro
    if (!response.ok) {
      throw new Error("Erro de autenticação");
    }

    // Se a resposta tiver sucesso, extrai os dados JSON
    const data = await response.json();
    // Campo para que AvailableMenu.jsx possa construir o nome do cliente (aparecer no pedido)
    localStorage.setItem('userFirstName', data.firstName);
  
    setUser(data); // Armazena o objeto completo do utilizador
    return data; // Retorna o objeto do utilizador para quem chamou a função
  };

  // Define a função de logout, que redefine o estado do utilizador para 'null'
  const logout = () => {
    // Remove o primeiro nome do utilizador do localStorage
    localStorage.removeItem('userFirstName');
    // Muda o estado do utilizador para 'null'
    setUser(null);
  };

  // Retorna o componente AuthContext.Provider.  O 'value' é um objeto que contém o estado do 'user' e as funções 'login' e 'logout'. Todos os componentes filhos ('children') terão acesso a este contexto
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};