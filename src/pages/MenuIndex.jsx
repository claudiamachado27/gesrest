import { useState, useEffect, useCallback } from 'react';
import { updateUserMenu } from '../https.js';
import OpcoesMenu from '../components/menu/OpcoesMenu.jsx';

export default function AvailableMenu() {
  // Armazena a lista de todos os lugares disponíveis
  const[availableMenu, setAvailableMenu] = useState([]);
  // Armazena a lista de lugares selecionados pelo utilizador
  const[userMenu, setUserMenu] = useState([]);

  const [submissionMessage, setSubmissionMessage] = useState(null);
 
    // Hook useEffect busca todos os pratos disponíveis do backend quando o componente é montado
    useEffect(() =>{
      // Faz um pedido GET para o endpoint '/menu'
      fetch('http://localhost:3000/menu')
      // Converte a resposta para JSON
      .then((response) => {return response.json()})
      // Usa os dados da resposta
      .then((resData) =>{
        // Atualiza o estado 'AvailableMenu' com a lista de pratos recebida
        setAvailableMenu(resData.menu)
      })
    },[])// O array de dependências vazio [] garante que este efeito só corre uma vez

    useEffect(() =>{
      fetch('http://localhost:3000/user-menu')
      .then((response) => {return response.json()})
      .then((resData) =>{
        setUserMenu(resData.menu)
      })
    },[])

    // Função para adicionar um prato à lista de prato selecionados pelo utilizador
    function handleSelectPrato(onSelectPrato){
        setUserMenu((prevPickedMenu) => {
          if (!prevPickedMenu){
            prevPickedMenu = []
          }
          // Verifica se o prato já foi selecionado para evitar duplicados
          if (prevPickedMenu.some((prato) => prato.id === onSelectPrato.id)) {
            return prevPickedMenu
          }
          // Adiciona o novo prato ao início do array do menu(pratos) selecionados
          return [onSelectPrato, ...prevPickedMenu];
        })
        // Envia a lista atualizada para o backend para a alteração (Se o prato que selecionado ainda NÃO estiver na lista atual de pratos selecionados)
        !userMenu.includes(onSelectPrato) && updateUserMenu([onSelectPrato, ...userMenu]);
    }
    
    // Função para remover prato da lista de pratos selecionados pelo utilizador
    function handleRemovePrato(onSelectPrato){
      // Atualiza o estado 'userMenu' filtrando para remover o prato
      setUserMenu((prevPickedMenu) => {
        return prevPickedMenu.filter((prato) => prato.id !== onSelectPrato.id)
      })
       // Envia a lista atualizada (sem o prato removido) para o backend
      updateUserMenu(userMenu.filter((prato) => prato.id !== onSelectPrato.id))
    }

    // Função para submeter o pedido à cozinha
    const handleSubmitOrder = useCallback(async () => {// useCallback garante que a função só será recriada se uma de suas dependências mudar
        if (userMenu.length === 0) {
            alert("Não existem pratos selecionados. Por favor, selecione os pratos.");
            return;
        }

      const userFirstName = localStorage.getItem('userFirstName');
      const loggedInUser = userFirstName;

        // Prepara os dados do pedido
        const orderItems = userMenu.map(prato => ({
            id: prato.id,
            name: prato.name,
            price: prato.price,
            quantity: 1, // Assume desde o início a quantidade 1 (já que o utilizador só pode selecionar uma vez cada prato)
        }));
        
        const orderData = {
            customer: loggedInUser,
            items: orderItems,
        };

        try {
            const response = await fetch('http://localhost:3000/order-kitchen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Falha ao enviar pedido. Resposta do servidor: ${errorText}`);
            }

            const successData = await response.json();
            alert(`Pedido #${successData.id} enviado para a cozinha com sucesso!`);

            setSubmissionMessage("O seu pedido foi submetido para a cozinha com sucesso! Receberá um aviso no email quando estiver pronto.");
            
            // Remove os pratos selecionados (userMenu) no frontend após submissão ter sido realizada com sucesso
            setUserMenu([]);
            // e depois limpa no backend (userMenu)
            updateUserMenu([]); 

        } catch (error) {
            console.error("Erro ao realizar pedido:", error);
            alert(`Erro ao enviar pedido: ${error.message}`);
        }
    }, [userMenu]); // A função será recriada se userMenu mudar 

    return (
    <>
        <main>
          <div className="container"> 
             <div className="row">    
                
              {/* Pratos disponíveis do menu */}
                <div className="col-lg-9">
                    <OpcoesMenu
                      name="Menu"
                      fallbackText="Nenhum prato disponível no momento."
                      menu={availableMenu}
                      onSelectPrato={handleSelectPrato} 
                      isAvailableMenu={true}
                    />
                </div>
                 
                {/* Pratos selecionados pelo utilizador */}
                <div className="col-lg-3 mb-4 mb-lg-0">
                    <OpcoesMenu
                      name="Prato(s) Selecionado(s)"
                      fallbackText={submissionMessage || "Nenhum prato selecionado. Por favor, selecione o prato que deseja."}
                      menu={userMenu} 
                      onSelectPrato={handleRemovePrato} 
                      isAvailableMenu={false} 
                      onMakeOrder={handleSubmitOrder}
                    />
                </div>
             </div> 
          </div> 
        </main>
    </>
  );
}
