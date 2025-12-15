import '../components/Button.css';
import React, { useState, useEffect, useCallback } from 'react';
import PedidosClientes from '../components/orders/PedidosClientes.jsx';
import '/src/App.css';
import '../components/Login.css';

export default function ControleCozinha() {
    
    // Estados para gerenciar os dados, o carregamento e erros
    const [orders, setOrders] = useState([]);// Lista de pedidos
    const [isLoading, setIsLoading] = useState(true);// Inicia como true para mostrar o estado de carregamento
    const [error, setError] = useState(null);// Estado para armazenar mensagens de erro, se houver

    // Estados possíveis para o pedido
    const statusOrders = ["Pendente", "Em Confecção", "Entregue"];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Em Confecção':
                return { backgroundColor: '#ffc107', color: 'black', padding: '0.25rem', borderRadius: '4px', fontWeight: 'bold' };
            case 'Entregue':
                return { backgroundColor: '#28a745', color: 'white', padding: '0.25rem', borderRadius: '4px', fontWeight: 'bold' };
            default: // Pendente 
                return { backgroundColor: '#dc3545', color: 'white', padding: '0.25rem', borderRadius: '4px', fontWeight: 'bold' };
        }
    };


    //Função assíncrona para buscar e ordenar os pedidos do backend (GET /order-kitchen)
    const fetchOrders = useCallback(async () => {

        try {
            const response = await fetch('http://localhost:3000/order-kitchen');
            if (!response.ok) {
                throw new Error('Falha ao buscar pedidos. Código de status: ' + response.status);
            }
            //Converte aresposta HTTP, que está em formato de texto JSON, para um objeto JavaScript
            const data = await response.json();
            
            const ordersArray = data.orders || data; 

            // Lógica de ordenação dos pedidos
            // Prioriza "Pendente" sobre qualquer outro status
            const sortedOrders = ordersArray.sort((a, b) => {
                if (a.status === "Pendente" && b.status !== "Pendente") return -1;
                if (a.status !== "Pendente" && b.status === "Pendente") return 1;

                // Caso os status sejam iguais, ordena pelo ID crescente
                return parseInt(a.id) - parseInt(b.id); 
            });
            
            // Atualiza o estado com os pedidos ordenados e os erros anteriores são limpos
            setOrders(sortedOrders);
            setError(null);

            //Trata o estado de carregamento (erros)
        } catch (err) {
            console.error("Erro na busca de pedidos:", err);
            setError(err.message);
            setOrders([]);
        } 
        // Finaliza o estado de carregamento
        if (isLoading) setIsLoading(false); 
    }, [isLoading]);

    useEffect(() => {
        // Inicia o carregamento dos dados (pedidos)
        fetchOrders();
    }, [fetchOrders]); 


    const handleUpdateStatus = async (orderId, newStatus) => {
            // Atualiza o estado no frontend
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );

            // Envia a atualização para o backend
            const response = await fetch('http://localhost:3000/order-kitchen', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            });

            if (!response.ok) {
                // Se falhar mostra a mensagem de erro e recarrega a lista
                alert('Falha ao atualizar o estado no servidor. A lista de pedidos será recarregada');
                fetchOrders(); 
            } else {
                // Se for realizado com sucesso, reordena a lista com o novo status
                fetchOrders(); 
            }
        
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Controlo de Pedidos da Cozinha</h1>
            
            {isLoading && <p className="text-center">A carregar pedidos...</p>}
            {error && <p className="text-danger text-center">Erro: {error}</p>}
            
            {!isLoading && !error && orders.length === 0 && (
                <p className="text-center text-muted">Nenhum pedido pendente ou em confecção.</p>
            )}

            {!isLoading && !error && orders.length > 0 && (
                <div className="orders-list" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '20px' 
            }}>
                    {orders.map(order => (
                        <PedidosClientes
                            key={order.id}
                            order={order}
                            getStatusStyle={getStatusStyle}
                            estados={statusOrders}
                            onUpdateStatus={handleUpdateStatus}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}