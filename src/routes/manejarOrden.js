const Router = require("koa-router");
const router = new Router();
const getToken = require("./getToken.js");
const poblar_or = require("../ordenes_recibidas.js")
const axios = require("axios");
const BurgersinProdution = [];
const {
	getCSVDictionaryProducts,
	getCSVDictionaryFormula,
} = require("./obtenerDiccionarios.js");
const Formuladictionary = {};
const Productdictionary = {};
const moveProduct = require("./moveProduct.js");
const notifyOrder = require("./notifyOrder.js");

//app.use(router.routes());

getCSVDictionaryFormula(Formuladictionary, "./formulas_E2.csv");
getCSVDictionaryProducts(Productdictionary, "./products_E2.csv");

async function ReceptionToKitchen(idOrden, Formuladictionary, canal) {
	try {
		const token = await getToken();
		const headers = {
			"Content-Type": "application/json", // Adjust the content type if necessary
			Authorization: "Bearer " + token,
		};
		const response = await axios.get(
			`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}`,
			{ headers }
		);
        console.log(response.data)
        const cliente = response.data.cliente;
		sku = response.data.sku;

        let ingrediente_buscado;
        let formula;
        //console.log(sku);
        //console.log(Formuladictionary);
        // si es sftp, la formula es distinta
        if (canal == "SFTP"){
            const formula = Formuladictionary[sku].ingredientes;
        }   
        else{
            for (const dato in Formuladictionary) {
                const hamburguesa = Formuladictionary[dato];
              
                // Verificar si la hamburguesa tiene el ingrediente buscado
                if (hamburguesa.ingredientes[sku]) {
                  const nombreHamburguesa = hamburguesa.nombre;
                  const ingrediente_buscado = hamburguesa.ingredientes[sku];
              
                  console.log(nombreHamburguesa);
                  console.log(ingrediente_buscado);
                }
              }
            //const formula2 = Formuladictionary[sku].formula;
        }
        //console.log(formula);

		// CAMBIAR DE BODEGA DE RECEPCION A COCINA EL INGREDIENTE QUE NECESITAMOS PARA LA HAMBURGUESA
        console.log(canal);
        if (canal == "SFTP"){
            for (let sku in formula) {
                moveProduct(sku);
            }
        }
        else{
            router.get("/dispatch", async (ctx) => {
                try {
                  const token = await getToken();
                  //console.log("dispatch");
                  console.log(token);
              
                  const headers = {
                    "Content-Type": "application/json", // Adjust the content type if necessary
                    Authorization: "Bearer " + token,
                  };
              
                  const response = await axios.post(
                    "https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/dispatch",
                    { productId: `${sku}`, orderId: `${idOrden}` },
                    {
                      headers,
                    }
                  ); // Replace with the API endpoint URL
                  ctx.body = response.data;
                  //console.log(response.data);
                } catch (error) {
                  ctx.status = 500;
                  ctx.body = { error: error.message };
                }
              });
              console.log("se despacho");

              // Ahora notificamos al grupo
              console.log(idOrden);
              notifyOrder("Aceptada", cliente, idOrden);

        }


	} catch (error) {
        console.log("aqui?");
		console.log(error);
	}
}

const obtenerOrden = async (idOrden) => {
	try {
		const token = await getToken();
		const headers = {
			"Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
			Authorization: "Bearer " + token,
		};
		const response = await axios.get(
			`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}`,
			{
				headers,
			}
		);

		return (response.data);
		// if (response.status === 201) {
		// 	notificarActualizacion(response.data, 5)
		// }
	} catch (error) {
		console.log(error.response.data);
	}
};


async function manejarOrden(pedido, canal) {
	try {
		requestBody = { estado: "aceptada" };
		idOrden = pedido.id;
		BurgersinProdution.push(pedido.sku);
        console.log("llego aca");
		try {
			await actualizarOrden("aceptada2", idOrden, canal);
            //console.log("llego aca 2")
			await producir_orden(idOrden);
            //console.log("llego aca 3")  
			await ReceptionToKitchen(idOrden, Formuladictionary, canal);
            //console.log("llego aca 4")
		} catch (error) {
			console.log(error);
		}
	} catch (error) {
		console.log(error);
	}
}


const actualizarOrden = async (requestBody, idOrden, canal) => {
	try {
		const token = await getToken();
		const headers = {
			"Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
			Authorization: "Bearer " + token,
		};
        const body = {}
		//console.log(requestBody)
		const response = await axios.post(
			`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}/estado`,
			requestBody,
			{ headers }
		);
		//console.log(response.data);
		
		
		const datos = await(obtenerOrden(idOrden))
		poblar_or(datos.id, "creada", datos.sku, datos.cantidad,canal)
		return response.data;
	} catch (error) {
		console.log(error.response.data);
	}
};

async function producir_orden(idOrden) {
	try {
		const token = await getToken();
		const headers = {
			"Content-Type": "application/json", // Adjust the content type if necessary
			Authorization: "Bearer " + token,
		};
		const response = await axios.get(
			`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}`,
			{ headers })
		const sku = response.data.sku;
		const producto = Productdictionary[sku];
		const groups = producto.gruposProductores;
		const qty_burger = producto.loteProduccion;
		// si es una hamburguesa debiera tener una formula que esta en Formulasdictionary
		if (producto.produccion === "cocina") { // si es una hamburguesa
			console.log("es una hamburguesa")
			const formula = Formuladictionary[sku].ingredientes;
			console.log(formula)
			for (let ingrediente in formula) {
				console.log(ingrediente)
				const ingredient = Productdictionary[ingrediente];
				const array_groups = JSON.parse(ingredient.gruposProductores)
				if (array_groups.includes(5)) {
					console.log("entro al if")
					if (formula.hasOwnProperty(ingrediente)) {
						const qty = parseInt(ingredient.loteProduccion);
						console.log(qty);
						producirSku(ingrediente, qty)
					}
				}
				else { // ask ingredient to another group
					for (indice in array_groups) {
						const grupoProductor = array_groups[indice].toString()
						console.log("entro al else");
						// const length = array_groups.length;
						// const value = Math.floor(Math.random() * length);
						// const group = array_groups[value];
						//const group = 1;
						const stock = await getStock(ingrediente, grupoProductor);
						console.log(`el stock es:${stock}`)
						if (stock === 1) {
							console.log("entro al if de stock");
							console.log(grupoProductor);
							const fechaActualUtc = moment.utc();
							const fechaHoraUtc4 = fechaActualUtc.add(4, "hours").format("YYYY-MM-DD HH:mm:ss");
							const requestBody = {
								"cliente": "5",
								"proveedor": grupoProductor,
								"sku": ingrediente,
								"cantidad": parseInt(ingredient.loteProduccion),
								"vencimiento": fechaHoraUtc4
							};
							console.log(requestBody)
							try {
								const order = await newOrder(requestBody);
								console.log(order)
								const requestBody1 = {
									"cliente": "5",
									"sku": ingredient.sku,
									"fechaEntrega": Date.now(),
									"cantidad": ingredient.loteProduccion,
									"urlNotificacion": `http://lagarto${grupoProductor}.ing.puc.cl/ordenes-compra/${order.id}`,
								};
								try {
									notifyOrder(requestBody1, grupoProductor, order.id);
								} catch (error) {
									console.log(error);
								}
							} catch (error) {
								console.log(error);
							}
						}
				}
			}
		}}
	} catch (error) {
		console.log(error.message);
	}
	console.log("ya produjimos/pedimos todo")
}

module.exports = manejarOrden;