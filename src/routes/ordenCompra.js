const Router = require("koa-router");
const axios = require("axios");
const router = new Router();
const fs = require("fs");
const csv = require("csv-parser");
const moment = require("moment");
const producirSku = require("./producir.js");
const moveProduct = require("./moveProduct.js");
const getStock = require("./getStock.js");
//const newOrder = require("./newOrder.js");
const notifyOrder = require("./notifyOrder.js");
const checkIngredients = require("./checkIngredients.js");
const produceBurgers = require("./produceBurgers.js");
const ReceptionToKitchen = require("./receptiontoKitchen.js");

const {
	getCSVDictionaryProducts,
	getCSVDictionaryFormula,
} = require("./obtenerDiccionarios");

// Se usa el excel de la E2
const Productdictionary = {};
const Formuladictionary = {}; // Declara la variable dictionary fuera de la función
const BurgersinProdution = [];
const ready_for_production = [];

// Llama a la función getCSVDictionary para comenzar la carga del diccionario
getCSVDictionaryProducts(Productdictionary, "./products_E2.csv");
getCSVDictionaryFormula(Formuladictionary, "./formulas_E2.csv");


// Esta es una funcion para obtener el token, la usamos para hacer los llamados a la API (necesitan el token como autorizacion)
async function getToken() {
	try {
		const headers = {
			"Content-Type": "application/json",
		};
		const response = await axios.post(
			"https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/autenticar",
			{ group: 5, secret: "J6RyeTrwNgX.Z+*MKh4EaBuLn" },
			{
				headers,
			}
		);
		return response.data.token;
	} catch (error) {
		console.error(error);
		return null;
	}
}


//obtener orden de compra
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
		console.log(response.data);
		if (response.status === 201) {
			notificarActualizacion(response.data, 5)
		}
	} catch (error) {
		console.log(error.response.data);
	}
};

//crear orden
const actualizarOrden = async (requestBody, idOrden) => {
	try {
		const token = await getToken();
		const headers = {
			"Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
			Authorization: "Bearer " + token,
		};
		//console.log(requestBody)
		const response = await axios.post(
			`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}/estado`,
			requestBody,
			{ headers }
		);
		//console.log(response.data);
		return response.data;
	} catch (error) {
		console.log(error.response.data);
	}
};

//notificar al grupo que la orden fue actualizada
const notificarActualizacion = async (data, group) => {
	try {
		const headers = {
			"Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
		};
		const requestBody = {
			cliente: data.cliente,
			sku: data.sku,
			fechaEntrega: data.vencimiento,
			cantidad: data.cantidad,
			urlNotificacion: "nosequeesesto.cl",
		};
		const response = await axios.post(
			`http://lagarto${group}.ing.puc.cl/ordenes-compra/${data.id}`,
			requestBody,
			{ headers }
		);
		console.log(response.data);
	} catch (error) {
		console.log(error.response.data);
	}
};


async function manejarOrden(pedido) {
	try {
		requestBody = { estado: "aceptada" };
		idOrden = pedido.id;
		BurgersinProdution.push(pedido.sku);
		try {
			await actualizarOrden(requestBody, idOrden, 5);
			await producir_orden(idOrden);
			await ReceptionToKitchen(idOrden);
		} catch (error) {
			console.log(error);
		}
	} catch (error) {
		console.log(error);
	}
}


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
			for (let ingrediente in formula) {
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
}


async function newOrder(requestBody) {
    try {
        const token = await getToken();
        const headers = {
            "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
            Authorization: "Bearer " + token,
        };
        const response = await axios.post(
            `https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes`,
            requestBody,
            { headers }
        );

        console.log(response.data);
        if (response.status === 201) {
            console.log("ORDEN CREADA");
            return response.data;
        }
    } catch (error) {
		console.log("error en newOrder")
        console.log(error.request.data);
    }
};



module.exports = router;

//prueba crear orden
// const fechaActualUtc = moment.utc();
// const fechaHoraUtc4 = fechaActualUtc.add(4, "hours").format("YYYY-MM-DD HH:mm:ss");
// const requestBody = {
//   "cliente":"5",
//   "proveedor":"7",
//   "sku":"22993410e2",
//   "cantidad":4,
//   "vencimiento":fechaHoraUtc4
// }
// crearOrden(requestBody)

// prueba obtener orden
// idOrden = "6477d6983a956b399c778e0b"
// obtenerOrden(idOrden)

//prueba Actualizar estado de Orden de Compra
// requestBody = {
//   "estado": "aceptada"
// }
// idOrden = "6477d6983a956b399c778e0b"
// actualizarOrden(requestBody, idOrden)

const leerArchivosXML = require("../SFTP2.js");
const { response } = require("express");

function procesarPedidos() {
	leerArchivosXML()
		.then((pedidos) => {
			//console.log(pedidos);
			//for cada pedido, manejar orden
			console.log(pedidos)
			//obtenerOrden(pedidos[0].id);
			manejarOrden(pedidos[0]);
			//console.log(Formuladictionary);
			//console.log(Productdictionary);
		})
		.catch((error) => {
			console.error("Error:", error.message);
		});
}

// Llamar a la función inicialmente
procesarPedidos();

// Ejecutar la función cada 15 minutos
setInterval(procesarPedidos, 15 * 60 * 1000); // 15 minutos en milisegundos

setInterval(checkIngredients, 10 * 60 * 1000, BurgersinProdution, Productdictionary, Formuladictionary, ready_for_production);

setInterval(produceBurgers, 10 * 60 * 1000, BurgersinProdution, ready_for_production, Productdictionary)


