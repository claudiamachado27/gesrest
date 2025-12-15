import fs from "node:fs/promises";
import bodyParser from "body-parser";
import express from "express";
import multer from "multer";
import path from "path";

  const app = express();

// Configuração da biblioteca Multer (para fazer Upload das imagens pelo Gestor) 
    const storage = multer.diskStorage({
      // Define o destino onde os ficheiros serão guardados
      destination: (req, file, cb) => {
        cb(null, "./images"); 
      },
      // Define o nome do ficheiro (Nome Original)
      filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
      },
    });

    const upload = multer({ storage: storage });

    app.use(express.static("./images"));
    app.use(bodyParser.json());

    app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*"); // allow all domains
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      next();
    });

    // Caminho para o ficheiro de Pedidos 
    const orderPath = path.join('data', 'order-kitchen.json');

    // Constantes para IDs dos Pedidos (4 dígitos)
    const minOrderId = 1000;
    const maxOrderId = 9999;


    // Função Auxiliar para Gerar Novo ID (Menu) 
    async function generateNewId(category, menu) {
        const prefix = category === 'Entrada' ? 'e' : 
                      category === 'Prato Principal' ? 'p' : 's';
        
        // Filtra IDs da mesma categoria e obtém o maior número
        const maxNum = menu
            .filter(item => item.id.startsWith(prefix))
            .map(item => parseInt(item.id.substring(1)))
            .reduce((max, num) => (num > max ? num : max), 0);
        
        return prefix + (maxNum + 1);
    }

    // Função para Gerar Número de Pedido (4 dígitos)
    function generateOrderNumber(orders) {
        if (orders.length === 0) {
            return minOrderId.toString();
        }

        // Encontra o maior ID numérico existente
        const maxId = orders.reduce((max, order) => {
            // Assume que o ID é um número (string)
            const currentId = parseInt(order.id); 
            return currentId > max ? currentId : max;
        }, 0);

        let newId = maxId + 1;

        // Se o próximo ID for menor que o mínimo ou maior que o máximo
        if (newId < minOrderId || newId > maxOrderId) {
            // Se ultrapassou o limite (9999), recomeça em 1000.
            // Se for 0 (no caso de terem sido apagados todos os pedidos), começa em 1000.
            newId = minOrderId; 
        }
        
        // Retorna o novo ID como String
        return newId.toString(); 
    }

    // Rota GET para obter todos os itens disponíveis do menu.
    app.get("/menu", async (req, res) => {
      const fileContent = await fs.readFile("./data/menu.json");
      const menuData = JSON.parse(fileContent);
      res.status(200).json({ menu: menuData });
    });

    // Rota GET para obter todos os itens do menu quardados pelo utilizador
    app.get("/user-menu", async (req, res) => {
      const fileContent = await fs.readFile("./data/user-menu.json");
      const menu = JSON.parse(fileContent);
      res.status(200).json({ menu });
    });

    // Rota GET para obter todos os utilizadores registados
    app.get("/users", async (req, res) => {
      const fileContent = await fs.readFile("./data/users.json");
      const users = JSON.parse(fileContent);
      res.status(200).json({ users });
    });

    app.put("/user-menu", async (req, res) => {
      const menu = req.body.menu;
      await fs.writeFile("./data/user-menu.json", JSON.stringify(menu));
      res.status(200).json({ message: "Menu atualizado!" });
    });

    // Rota GET /order-kitchen (Para o ControleCozinha.jsx) 
    app.get("/order-kitchen", async (req, res) => {
        try {
            const fileContent = await fs.readFile(orderPath);
            const orders = JSON.parse(fileContent);
            res.status(200).json(orders); 
        } catch (error) {
            console.error("Erro ao ler pedidos:", error);
            res.status(500).json({ message: "Falha ao carregar pedidos da cozinha." });
        }
    });


    // Rota PUT /order-kitchen (Para atualização de status) 
    app.put("/order-kitchen", async (req, res) => {
        const { id, status } = req.body;
        
        if (!id || !status) {
            return res.status(400).json({ message: "ID do pedido e Status são obrigatórios." });
        }

        try {
            const data = await fs.readFile(orderPath, 'utf8');
            let orders = JSON.parse(data);
            
            const orderIndex = orders.findIndex(order => order.id === id);

            if (orderIndex === -1) {
                return res.status(404).json({ message: "Pedido não encontrado." });
            }

            // Atualiza o status
            orders[orderIndex].status = status;

            // Escreve os dados de volta para o ficheiro
            await fs.writeFile(orderPath, JSON.stringify(orders, null, 2));

            res.status(200).json({ message: `Status do pedido ${id} atualizado para ${status}` });

        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            res.status(500).json({ message: "Falha interna ao atualizar o status." });
        }
    });


    // Rota POST /order-kitchen (Para submeter novos pedidos)
    app.post("/order-kitchen", async (req, res) => {
        const newOrder = req.body;
        
        try {
            const data = await fs.readFile(orderPath, 'utf8');
            let orders = JSON.parse(data);
            
            // Gera ID de 4 dígitos
            const newOrderId = generateOrderNumber(orders);
            
            const orderWithDefaults = {
                ...newOrder,
                id: newOrderId, 
                status: newOrder.status || "Pendente"
            };

            // Adiciona o novo pedido
            orders.push(orderWithDefaults);

            // Escreve os dados de volta para o ficheiro
            await fs.writeFile(orderPath, JSON.stringify(orders, null, 2));

            res.status(201).json({ 
                message: "Pedido submetido com sucesso!", 
                id: orderWithDefaults.id 
            });

        } catch (error) {
            console.error("Erro ao submeter novo pedido:", error);
            res.status(500).json({ message: "Falha interna ao processar o pedido." });
        }
    });


    // Rota POST para registar um novo utilizador
    app.post("/signup", async (req, res) => {
      const fileContent = await fs.readFile("./data/users.json");
      const users = JSON.parse(fileContent);

      const newUser = req.body;
      users.push(newUser);

      await fs.writeFile("./data/users.json", JSON.stringify(users, null, 2));
      res.status(200).json({ message: "Usuário inserido!" });
    });

    //Rota de login (verifica se há user e se sim gera um token)
    app.post("/login", async (req, res) => {
      const fileContent = await fs.readFile("./data/users.json");
      const users = JSON.parse(fileContent);

      const email = req.body.email;
      const password = req.body.password;

      const login = users.find((u) => u.email === email && u.password === password);

      if (!login) {
        return res.status(422).json({
          message: "Credenciais inválidas.",
          errors: { credentials: "Email ou password inválidos." },
        });
      }

      const AuthUser = {
        firstName: login.firstName,
        role: login.role,
      };

      res.json(AuthUser);
    });

    // Rota POST para adicionar um novo item ao menu
    app.post("/menu-item", upload.single('image'), async (req, res) => {
        try {
            const { name, category, price, description, imageAlt } = req.body;
            
            // Verifica se o ficheiro foi realmente carregado
            if (!req.file) {
                return res.status(400).json({ message: "O ficheiro de imagem é obrigatório." });
            }
            
            const imageFilename = req.file.filename;

            // Lê o menu existente na base de dados (em menu.json)
            const fileContent = await fs.readFile("./data/menu.json");
            const menu = JSON.parse(fileContent);

            // Gera um novo ID baseado na categoria
            const newId = await generateNewId(category, menu);

            // Cria o novo item
            const newItem = {
                id: newId,
                name: name,
                category: category,
                price: parseFloat(price),  // Converter preço para float
                description: description,
                image: {
                    src: imageFilename,  // Usar o nome do ficheiro que o multer guardou
                    alt: imageAlt
                }
            };

            // 4. Adicionar o novo item e escrever de volta para menu.json
            menu.push(newItem);
            await fs.writeFile("./data/menu.json", JSON.stringify(menu, null, 2));

            // 5. Responder com sucesso
            res.status(201).json({ 
                message: "Prato adicionado com sucesso!", 
                item: newItem 
            });

        } catch (error) {
            console.error("Erro ao adicionar prato:", error);
            // Em caso de erro, removemos o ficheiro que possa ter sido guardado
            if (req.file) {
                await fs.unlink(req.file.path).catch(err => console.error("Erro ao eliminar ficheiro temporário:", err));
            }
            res.status(500).json({ message: "Falha interna do servidor ao processar o prato." });
        }
    });


    // Middleware para lidar com rotas não encontradas (404).
    app.use((req, res, next) => {
      if (req.method === "OPTIONS") {
        return next();
      }
      res.status(404).json({ message: "Página não Encontrada" });
    });

// Inicia o servidor na porta 3000.
    app.listen(3000);

// import fs from "node:fs/promises";
// import bodyParser from "body-parser";
// import express from "express";
// import multer from "multer";
// import path from "path"; // Importação de 'path' necessária para segurança de caminhos

// const app = express();


// // --- Configuração do Multer (Upload de Ficheiros) ---
// const storage = multer.diskStorage({
//   // Define o destino onde os ficheiros serão guardados
//   destination: (req, file, cb) => {
//     cb(null, "./images"); 
//   },
//   // Define o nome do ficheiro 
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// app.use(express.static("./images"));
// app.use(bodyParser.json());// bodyParser.json() apenas para rotas que não envolvem ficheiros

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*"); // allow all domains
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   next();
// });

// // --- Caminho para o ficheiro de Pedidos ---
// const orders_path = path.join(process.cwd(), 'data', 'order-kitchen.json');


// // --- Função Auxiliar para Gerar Novo ID ---
// async function generateNewId(category, menu) {
//     const prefix = category === 'Entrada' ? 'e' : 
//                    category === 'Prato Principal' ? 'p' : 's';
    
//     // Filtra IDs da mesma categoria e obtém o maior número
//     const maxNum = menu
//         .filter(item => item.id.startsWith(prefix))
//         .map(item => parseInt(item.id.substring(1)))
//         .reduce((max, num) => (num > max ? num : max), 0);
//     return prefix + (maxNum + 1);
// }

// // Rota GET para obter todos os itens disponíveis do menu.
// app.get("/menu", async (req, res) => {
//   const fileContent = await fs.readFile("./data/menu.json");
//   const menuData = JSON.parse(fileContent);
//   res.status(200).json({ menu: menuData });
// });

// // Rota GET para obter todos os itens do menu quardados pelo utilizador.
// app.get("/user-menu", async (req, res) => {
//   const fileContent = await fs.readFile("./data/user-menu.json");
//   const menu = JSON.parse(fileContent);
//   res.status(200).json({ menu });
// });

// // Rota GET para obter todos os utilizadores registados.
// app.get("/users", async (req, res) => {
//   const fileContent = await fs.readFile("./data/users.json");
//   const users = JSON.parse(fileContent);
//   res.status(200).json({ users });
// });

// app.put("/user-menu", async (req, res) => {
//   const menu = req.body.menu;
//   await fs.writeFile("./data/user-menu.json", JSON.stringify(menu));
//   res.status(200).json({ message: "Menu atualizado!" });
// });

// // Rota GET /order-kitchen (Para o ControleCozinha.jsx) ---
// app.get("/order-kitchen", async (req, res) => {
//     try {
//         const fileContent = await fs.readFile(orders_path);
//         const orders = JSON.parse(fileContent);
//         // Retorna os pedidos. O frontend espera {orders: [...]} ou o array diretamente.
//         // Devolve o array diretamente;
//         res.status(200).json(orders); 
//     } catch (error) {
//         console.error("Erro ao ler pedidos:", error);
//         res.status(500).json({ message: "Falha ao carregar pedidos da cozinha." });
//     }
// });


// // Rota PUT /order-kitchen (Para atualização de status) ---
// app.put("/order-kitchen", async (req, res) => {
//     const { id, status } = req.body;
    
//     if (!id || !status) {
//         return res.status(400).json({ message: "ID do pedido e Status são obrigatórios." });
//     }

//     try {
//         const data = await fs.readFile(orders_path, 'utf8');
//         let orders = JSON.parse(data);
        
//         const orderIndex = orders.findIndex(order => order.id === id);

//         if (orderIndex === -1) {
//             return res.status(404).json({ message: "Pedido não encontrado." });
//         }

//         // Atualiza o status
//         orders[orderIndex].status = status;

//         // Escreve os dados de volta para o ficheiro
//         await fs.writeFile(orders_path, JSON.stringify(orders, null, 2));

//         res.status(200).json({ message: `Status do pedido ${id} atualizado para ${status}` });

//     } catch (error) {
//         console.error("Erro ao atualizar status:", error);
//         res.status(500).json({ message: "Falha interna ao atualizar o status." });
//     }
// });


// // Rota POST /order-kitchen (Para submeter novos pedidos) ---
// app.post("/order-kitchen", async (req, res) => {
//     const newOrder = req.body;
    
//     // Adiciona valores padrão para um novo pedido
//     const orderWithDefaults = {
//         ...newOrder,
//         id: crypto.randomUUID(), // Gere um ID único
//         status: newOrder.status || "Pendente"
//     };

//     try {
//         const data = await fs.readFile(orders_path, 'utf8');
//         let orders = JSON.parse(data);
        
//         // Adiciona o novo pedido
//         orders.push(orderWithDefaults);

//         // Escreve os dados de volta para o ficheiro
//         await fs.writeFile(orders_path, JSON.stringify(orders, null, 2));

//         res.status(201).json({ 
//             message: "Pedido submetido com sucesso!", 
//             id: orderWithDefaults.id 
//         });

//     } catch (error) {
//         console.error("Erro ao submeter novo pedido:", error);
//         res.status(500).json({ message: "Falha interna ao processar o pedido." });
//     }
// });


// // Rota POST para registar um novo utilizador.
// app.post("/signup", async (req, res) => {
// // ... (Rotas /signup e /login existentes) ...
//   const fileContent = await fs.readFile("./data/users.json");
//   const users = JSON.parse(fileContent);

//   const newUser = req.body;
//   users.push(newUser);

//   await fs.writeFile("./data/users.json", JSON.stringify(users, null, 2));
//   res.status(200).json({ message: "Usuário inserido!" });
// });

// //Rota de login (verifica se há user e se sim gera um token)
// app.post("/login", async (req, res) => {
//   const fileContent = await fs.readFile("./data/users.json");
//   const users = JSON.parse(fileContent);

//   const email = req.body.email;
//   const password = req.body.password;

//   const login = users.find((u) => u.email === email && u.password === password);

//     if (!login) {
//       return res.status(422).json({
//         message: "Credenciais inválidas.",
//         errors: { credentials: "Email ou password inválidos." },
//       });
//     }


//   const AuthUser = {
//     firstName: login.firstName,
//     role: login.role,
//   };

//   res.json(AuthUser);
// });

// // 2. Rota POST para adicionar um novo item ao menu
// // 'upload.single('image')' processa o ficheiro enviado sob a chave 'image' (definida no frontend)
// app.post("/menu-item", upload.single('image'), async (req, res) => {
// // ... (Rota /menu-item existente) ...
//     try {
        
//         // req.body contém os dados de texto do formulário (name, category, price, description, imageAlt)
//         // req.file contém a informação do ficheiro guardado
//         const { name, category, price, description, imageAlt } = req.body;
        
//         // Verifica se o ficheiro foi realmente carregado
//         if (!req.file) {
//              return res.status(400).json({ message: "O ficheiro de imagem é obrigatório." });
//         }
        
//         const imageFilename = req.file.filename;

//         // Ler o menu existente
//         const fileContent = await fs.readFile("./data/menu.json");
//         const menu = JSON.parse(fileContent);

//         // Gerar um novo ID baseado na categoria
//         const newId = await generateNewId(category, menu);

//         // Construir o novo item
//         const newItem = {
//             id: newId,
//             name: name,
//             category: category,
//             // Converter preço para float
//             price: parseFloat(price), 
//             description: description,
//             image: {
//                 // Usar o nome do ficheiro que o multer guardou
//                 src: imageFilename, 
//                 alt: imageAlt
//             }
//         };

//         // Adiciona o novo item e escrever de volta para menu.json
//         menu.push(newItem);
//         await fs.writeFile("./data/menu.json", JSON.stringify(menu, null, 2));

//         // Responder com sucesso
//         res.status(201).json({ 
//             message: "Prato adicionado com sucesso!", 
//             item: newItem 
//         });

//     } catch (error) {
//         console.error("Erro ao adicionar prato:", error);
//         // Em caso de erro, removemos o ficheiro que possa ter sido guardado
//         if (req.file) {
//             await fs.unlink(req.file.path).catch(err => console.error("Erro ao eliminar ficheiro temporário:", err));
//         }
//         res.status(500).json({ message: "Falha interna do servidor ao processar o prato." });
//     }
// });


// // Middleware para lidar com rotas não encontradas (404).
// app.use((req, res, next) => {
//   if (req.method === "OPTIONS") {
//     return next();
//   }
//   res.status(404).json({ message: "Página não Encontrada" });
// });

// // Inicia o servidor na porta 3000.
// app.listen(3000);




// import fs from "node:fs/promises";
// import bodyParser from "body-parser";
// import express from "express";
// import multer from "multer";

// const app = express();

// // --- Configuração do Multer (Upload de Ficheiros) ---
// const storage = multer.diskStorage({
//   // Define o destino onde os ficheiros serão guardados
//   destination: (req, file, cb) => {
//     cb(null, "./images"); 
//   },
//   // Define o nome do ficheiro (Timestamp + Nome Original)
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// app.use(express.static("./images"));
// app.use(bodyParser.json());// bodyParser.json() apenas para rotas que não envolvem ficheiros

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*"); // allow all domains
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   next();
// });

// // --- Função Auxiliar para Gerar Novo ID ---
// async function generateNewId(category, menu) {
//     const prefix = category === 'Entrada' ? 'e' : 
//                    category === 'Prato Principal' ? 'p' : 's';
    
//     // Filtra IDs da mesma categoria e obtém o maior número
//     const maxNum = menu
//         .filter(item => item.id.startsWith(prefix))
//         .map(item => parseInt(item.id.substring(1)))
//         .reduce((max, num) => (num > max ? num : max), 0);
    
//     return prefix + (maxNum + 1);
// }

// // Rota GET para obter todos os itens disponíveis do menu.
// app.get("/menu", async (req, res) => {
//   const fileContent = await fs.readFile("./data/menu.json");
//   const menuData = JSON.parse(fileContent);
//   res.status(200).json({ menu: menuData });
// });

// // Rota GET para obter todos os itens do menu quardados pelo utilizador.
// app.get("/user-menu", async (req, res) => {
//   const fileContent = await fs.readFile("./data/user-menu.json");
//   const menu = JSON.parse(fileContent);
//   res.status(200).json({ menu });
// });

// // Rota GET para obter todos os utilizadores registados.
// app.get("/users", async (req, res) => {
//   const fileContent = await fs.readFile("./data/users.json");
//   const users = JSON.parse(fileContent);
//   res.status(200).json({ users });
// });

// app.put("/user-menu", async (req, res) => {
//   const menu = req.body.menu;
//   await fs.writeFile("./data/user-menu.json", JSON.stringify(menu));
//   res.status(200).json({ message: "Menu atualizado!" });
// });

// // Rota POST para registar um novo utilizador.
// app.post("/signup", async (req, res) => {
//   const fileContent = await fs.readFile("./data/users.json");
//   const users = JSON.parse(fileContent);

//   const newUser = req.body;
//   users.push(newUser);

//   await fs.writeFile("./data/users.json", JSON.stringify(users, null, 2));
//   res.status(200).json({ message: "Usuário inserido!" });
// });

// //rota de login (verifica se há user e se sim gera um token)
// app.post("/login", async (req, res) => {
//   const fileContent = await fs.readFile("./data/users.json");
//   const users = JSON.parse(fileContent);

//   const email = req.body.email;
//   const password = req.body.password;

//   const login = users.find((u) => u.email === email && u.password === password);

//   if (!login) {
//     return res.status(422).json({
//       message: "Credenciais inválidas.",
//       errors: { credentials: "Email ou password inválidos." },
//     });
//   }


//   const AuthUser = {
//     firstName: login.firstName,
//     role: login.role,
//   };

//   res.json(AuthUser);
// });

// // 2. Rota POST para adicionar um novo item ao menu
// // 'upload.single('image')' processa o ficheiro enviado sob a chave 'image' (definida no frontend)
// app.post("/menu-item", upload.single('image'), async (req, res) => {
//     try {
//         console.log("-> ROTA /menu-item FOI ATINGIDA <-"); // Para diagnóstico

//         // req.body contém os dados de texto do formulário (name, category, price, description, imageAlt)
//         // req.file contém a informação do ficheiro guardado
//         const { name, category, price, description, imageAlt } = req.body;
        
//         // Verifica se o ficheiro foi realmente carregado
//         if (!req.file) {
//              return res.status(400).json({ message: "O ficheiro de imagem é obrigatório." });
//         }
        
//         const imageFilename = req.file.filename;

//         // 1. Ler o menu existente
//         const fileContent = await fs.readFile("./data/menu.json");
//         const menu = JSON.parse(fileContent);

//         // 2. Gerar um novo ID baseado na categoria
//         const newId = await generateNewId(category, menu);

//         // 3. Construir o novo item
//         const newItem = {
//             id: newId,
//             name: name,
//             category: category,
//             // Converter preço para float
//             price: parseFloat(price), 
//             description: description,
//             image: {
//                 // Usar o nome do ficheiro que o multer guardou
//                 src: imageFilename, 
//                 alt: imageAlt
//             }
//         };

//         // 4. Adicionar o novo item e escrever de volta para menu.json
//         menu.push(newItem);
//         await fs.writeFile("./data/menu.json", JSON.stringify(menu, null, 2));

//         // 5. Responder com sucesso
//         res.status(201).json({ 
//             message: "Prato adicionado com sucesso!", 
//             item: newItem 
//         });

//     } catch (error) {
//         console.error("Erro ao adicionar prato:", error);
//         // Em caso de erro, removemos o ficheiro que possa ter sido guardado
//         if (req.file) {
//             await fs.unlink(req.file.path).catch(err => console.error("Erro ao eliminar ficheiro temporário:", err));
//         }
//         res.status(500).json({ message: "Falha interna do servidor ao processar o prato." });
//     }
// });


// // Middleware para lidar com rotas não encontradas (404).
// app.use((req, res, next) => {
//   if (req.method === "OPTIONS") {
//     return next();
//   }
//   res.status(404).json({ message: "Página não Encontrada" });
// });

// // Inicia o servidor na porta 3000.
// app.listen(3000);
