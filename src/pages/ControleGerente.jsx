import '../components/Login.css';
import '../components/Button.css';
import { useState } from 'react';

// Função para adicionar pratos ao menu
export default function FormGerente({ onPratoAdicionado }){
    const [formData, setFormData] = useState({
        name: '',
        category: 'Entrada', 
        price: '',
        description: '',
        imageAlt: ''
    });
    const [imageFile, setImageFile] = useState(null); 
    const [status, setStatus] = useState('');

    function handleChange(event) {
        const { name, value, files } = event.target;

        if (name === 'imageFile' && files) {
            setImageFile(files[0]);
        } else {
            setFormData(prevData => ({
                ...prevData,
                [name]: value
            }));
        }
    }

   async function handleSubmit(event) {
        event.preventDefault();
        
        if (!imageFile) {
            setStatus('Erro: Selecione um ficheiro de imagem.');
            return;
        }

        const dataToSend = new FormData();
        dataToSend.append('image', imageFile);

        for (const key in formData) {
            dataToSend.append(key, formData[key]);
        }
        
        try {
            const response = await fetch('http://localhost:3000/menu-item', {
                method: 'POST',
                body: dataToSend 
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Falha ao adicionar o prato. Verifique a ligação.');
            }
            
            setStatus('Prato adicionado com sucesso!');

            // Se houver uma função de callback, chama
            if (onPratoAdicionado) {
                onPratoAdicionado();
            }

            setFormData({
                name: '', category: 'Entrada', price: '', description: '', imageAlt: ''
            });
            setImageFile(null);
            
        } catch (error) {
            setStatus(`Erro ao enviar: ${error.message}`);
        }
    }

    return (
        <form onSubmit={handleSubmit} action="/backend" encType="multipart/form-data">
                
            <h1 style={{color: '#f7f3f3ff'}}>Gestão do Menu</h1>
            <p style={{color: '#f7f3f3ff'}}>Insira um novo prato no menu</p>
            {status && <p style={{ color: '#ffffff', background: '#333333', padding: '0.5rem', borderRadius: '4px' }} >{status}</p>}

                <div className="control">
                    <label htmlFor="category" >Selecione a Categoria do Prato</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="form-select"
                        required style={{ width: '180px' }}
                    >
                        <option value="Entrada">Entrada</option>
                        <option value="Prato Principal">Prato Principal</option>
                        <option value="Sobremesa">Sobremesa</option>
                    </select>
                </div>

                {/* Inserir imagem */}
                <div className="control">
                    <label htmlFor="imageFile" className="form-label">Ficheiro de Imagem</label>
                    <input 
                        type="file" 
                        id="imageFile" 
                        name="imageFile" 
                        onChange={handleChange} 
                        className="form-control" 
                        accept="image/*" 
                        required 
                    />
                </div>

                <div className="control">
                    <label htmlFor="imageAlt" className="form-label">Descrição da Imagem (Alt Text)</label>
                    <input type="text" id="imageAlt" name="imageAlt" value={formData.imageAlt} onChange={handleChange} className="form-control" required />
                </div>
              
                <div className="control">
                    <label htmlFor="name" className="form-label">Nome do Prato</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="form-control" required />
                </div>

                 <div className="control">
                    <label htmlFor="description" className="form-label">Descrição do Prato</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="form-control" required />
                </div>
                
               
                <div className="control">
                    <label htmlFor="price" className="form-label">Preço (€)</label>
                    <input type="number" step="0.01" id="price" name="price" value={formData.price} onChange={handleChange} className="form-control" required style={{ width: '100px' }}/>
                </div>
                

                 <p className="form-actions">
                <button type="submit" className="button mt-3">
                    Adicionar ao Menu
                </button>
                </p>
                
            </form>
    );
}

