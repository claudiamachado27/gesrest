import '/src/App.css';
import entregaImg from '../assets/entrega.png';
import ingredientesImg from '../assets/ingredientes.png';
import personalizacaoImg from '../assets/personalize.png';

// Representa a página inicial do site
export default function HomePage(){
 
    return (
    <div className="cards">
       
        <h1>Da cozinha para a sua mesa em instantes!</h1>
    
        <div className="row justify-content-center g-4"> 
            
            <div className="col-md-4"> 
                <div className="card-item">
                    <img src={entregaImg} alt="Ícone Entrega" />
                    <h3>Entrega Expressa</h3>
                    <p>Do nosso sushiman direto para a sua mesa. Entrega rápida para manter o sabor intacto.</p>
                </div>
            </div>
            
            <div className="col-md-4"> 
                <div className="card-item">
                    <img src={ingredientesImg} alt="Ícone Ingredientes" />
                    <h3>Ingredientes Selecionados</h3>
                    <p>Trabalhamos apenas com salmão importado e ingredientes frescos de alta qualidade.</p>
                </div>
            </div>
            
            <div className="col-md-4"> 
                <div className="card-item">
                    <img src={personalizacaoImg} alt="Ícone Personalizar pedido" />
                    <h3>Personalize seu Pedido</h3>
                    <p>Monte seu pedido do seu jeito. Escolha a base, os peixes e os acompanhamentos.</p>
                </div>
           </div>
        </div>
       
    </div>
        
            
       
    );
}