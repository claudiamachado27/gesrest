// Define e exporta a função assíncrona updateUserMenu que recebe o argumento, 'userMenu' (lista de itens do menu a ser guardada)
export async function updateUserMenu(userMenu){
    
    const response = await fetch("http://localhost:3000/user-menu", {// Usa a API fetch para enviar um pedido para o backend. 'await' pausa a execução até que a promessa do fetch seja resolvida
    method: "PUT", // O método HTTP é 'PUT', que é usado para atualizar um recurso existente no servidor
    body: JSON.stringify({menu:userMenu}),// O corpo do pedido contém os dados a serem enviados. Envia o array diretamente
   
    headers: {
      "Content-Type": "application/json", // 'Content-Type' informa ao servidor que estamos a enviar dados no formato JSON
    },
  });

  // Aguarda a resposta do servidor e converte o corpo da resposta de JSON para um objeto JavaScript
  const data = await response.json();
  // Verifica se a resposta do servidor indica um erro
  if (!response.ok) {
    // Se houver um erro, lança um erro com a mensagem do servidor
    throw new Error(data.message || "Falha ao atualizar o menu.");
  }

  // Retorna a propriedade 'message' dos dados recebidos do servidor
  return data.message;
}