import React from 'react';


export default function PedidosClientes({ order, estados, getStatusStyle, onUpdateStatus }) {

    // Desestrutura as informações do pedido para facilitar o acesso às variáveis
    const { id, customer, status, items } = order;
    
    // Função para lidar com a mudança no select e chamar a função de atualização do status
    const handleChangeStatus = (event) => {
        onUpdateStatus(id, event.target.value); 
    };

    return (
        <div className="card shadow-sm" style={{borderColor: '#ddd'}}>
           
            <div className="card-header d-flex justify-content-between align-items-center" style={{backgroundColor: '#f8f9fa'}}>
                <h5 className="mb-0">Pedido # {id.substring(0, 5)}</h5>
                <span style={getStatusStyle(status)}>{status}</span> 
            </div>
            
           
            <div className="card-body">
                <p className="card-text mb-2 text-start ">
                    <strong>Cliente:</strong> {customer || 'N/A'}
                </p>
                
                <hr/>
                
                <h6 className='mb-2 text-start'>Itens:</h6>
                <ul className="list-group list-group-flush mb-3 small">
                    {items.map((item, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between py-1">
                            <span style={{ fontSize: '0.9em' }}>{item.name}</span>
                            <span className="badge bg-secondary rounded-pill">x{item.quantity}</span>
                        </li>
                    ))}
                </ul>

            
                <div className="mt-3 d-grid">
                    <select style={{ width: '180px' }}
                        className="form-select"
                        value={status} 
                        onChange={handleChangeStatus} 
                    >
                        {estados.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}