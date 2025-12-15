import './OpcoesMenu.css'

// Funçaõ para agrupar o menu pela categoria
function groupMenuByCategory(menu) {
    if (!menu) {
        return {};
    }
    return menu.reduce((acc, prato) => {
        const category = prato.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(prato);
        return acc;
    }, {});
}

// 💡Ordenação das categorias
const categoryOrder = {
    'Entrada': 1,
    'Prato Principal': 2,
    'Sobremesa': 3,
};

export default function OpcoesMenu({ name, menu = null, fallbackText, onSelectPrato, isAvailableMenu = false, onMakeOrder }) {

    const itemColClass = isAvailableMenu ? "col-md-4 mb-4" : "col-12 mb-3";
    const keyPrefix = isAvailableMenu ? 'card-' : 'sidebar-'; 
    const listContainerClass = isAvailableMenu ? "menu-grid" : "prato-sidebar-list"; 
    
    // Agrupa o menu, SOMENTE se for o menu principal (isAvailableMenu = true)
    const groupedMenu = isAvailableMenu ? groupMenuByCategory(menu) : {}; 
    
    // Recebe as categorias em ordem para garantir que a iteração seja correta
    const sortedCategories = isAvailableMenu 
        ? Object.keys(groupedMenu).sort((a, b) => {
            const orderA = categoryOrder[a] || 999;
            const orderB = categoryOrder[b] || 999;
            return orderA - orderB;
        })
        : [];

    return (
        <section className="menu-category mt-5">
            <h2 className="fw-bold sidebar-title text-center my-3 py-3">{name}</h2>
            
            {/* Fallback Text */}
            {(!menu || menu.length === 0) && <p className="fallback-text text-center">{fallbackText}</p>}
            
            {/* Renderiza a lista se houver itens no menu */}
            {menu && menu.length > 0 && (

                <div className={listContainerClass}> 
                    
                    {/* Lógica para  renderização  */}
                    {isAvailableMenu ? (
                        // Menu Principal: Iterar por Categoria
                        sortedCategories.map(category => (
                            <div key={category} className="category-section w-100"> 
                                <h3 className="category-title text-center text-light bg-dark py-2 my-4 rounded">
                                    {category}
                                </h3>
                                {/* Iterar pelos Pratos dentro da Categoria */}
                                <div className="row"> 
                                    {groupedMenu[category].map((prato) => (
                                        <div key={keyPrefix + prato.id} className={itemColClass}>
                                            
                                            {/* CÓDIGO DO CARD DO PRATO DISPONÍVEL */}
                                            <div className="card card-menu h-100">
                                                <div className="card-body d-flex flex-column">
                                                      
                                                    <div className="image-container">
                                                        {prato.image && prato.image.src && (
                                                            <img 
                                                                src={`http://localhost:3000/${prato.image.src}`} 
                                                                alt={prato.image.alt} 
                                                                className="card-img" 
                                                            />
                                                        )}
                                                         {/* O badge da categoria  */}
                                                        <span className="badge-tag">{prato.category}</span> 
                                                    </div>
                                                    
                                                    <h4 className="fw-bold card-title pt-2 fs-5">{prato.name}</h4>
                                                    <p className="card-text mb-0">{prato.description}</p>

                                                    <div className="mt-auto"> 
                                                        <p className="prato-price fw-bold fs-4">{`€ ${prato.price.toFixed(2)}`}</p>
                                                        
                                                        <button 
                                                            className="button w-100" 
                                                            onClick={() => onSelectPrato(prato)} 
                                                        > Selecionar Prato
                                                        </button> 
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        // Sidebar
                        menu.map((prato) => (
                            <div key={keyPrefix + prato.id} className={itemColClass}>

                                {/* Item selecionado na sidebar */}
                                <div className="prato-item">
                                    <div className="d-flex align-items-center"> 
                                        
                                        <div className="image me-2"> 
                                            {prato.image && prato.image.src && (
                                                <img 
                                                    src={`http://localhost:3000/${prato.image.src}`} 
                                                    alt={prato.image.alt} 
                                                    className="prato-img-sm" 
                                                /> 
                                            )}
                                        </div>
                                        
                                        <div className="prato-info flex-grow-1 text-start"> 
                                            <p className="fw-bold fs-5 mb-0">{prato.name}</p> 
                                            <p className="card-text mb-0">{prato.description}</p>
                                        </div>
                                        
                                        <button 
                                            className="btn btn-sm btn-danger ms-auto" 
                                            onClick={() => onSelectPrato(prato)}
                                        > X 
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    
                    {/* Botão Realizar Pedido  */}
                    {!isAvailableMenu && (
                        <button 
                            className="btn-registar w-100 d-block mx-auto mt-4" 
                            onClick={onMakeOrder}
                        >
                            Realizar Pedido
                        </button>
                    )}
                </div> 
            )}
        </section>
    );
}


