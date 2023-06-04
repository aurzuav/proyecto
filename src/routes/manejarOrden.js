const Router = require("koa-router");
const router = new Router();
const getToken = require("./getToken.js");

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
const notifyCreateOrder = require("./notifyCreateOrder.js");
const getStock = require("./getStock.js")
const producirSku = require("./producir.js");
const moment = require("moment");
const newOrder = require("./newOrder.js")
const ReceptionToDispatch = require("./ReceptiontoDispatch.js")
const actualizarOrden = require("./actualizarOrden")
const obtenerOrden = require("./obtenerOrden");
const getStockRecepcion = require("./getStockRecepcion.js");
const ReceptionToKitchen = require("./receptiontoKitchen.js")

//app.use(router.routes());

getCSVDictionaryFormula(Formuladictionary, "./formulas_E2.csv");
getCSVDictionaryProducts(Productdictionary, "./products_E2.csv");

async function manejarOrden(OrderId, canal) {
	try {
		datos = await obtenerOrden(OrderId)
		try {
			console.log(OrderId, canal)
			if (canal === "grupo"){
				const stock = await getStockRecepcion(datos.sku, 5)
				if (stock >= datos.cantidad){
					console.log("lo tengo")
					requestBody = {"estado":"aceptada"}
					await actualizarOrden(requestBody, OrderId, canal);
					await ReceptionToDispatch(OrderId, canal, datos.cantidad)
				}else{
					//producir
					console.log("no lo tengo")
					requestBody = {"estado":"rechazada"}
					await producir_orden(datos);
					await actualizarOrden(requestBody, OrderId, canal);
					
				}
			}else if (canal === "SFTP"){
				console.log("SFTP")
				requestBody = {"estado":"aceptada"}
				BurgersinProdution.push(datos.sku);
				await actualizarOrden(requestBody, OrderId, canal);
				await producir_orden(datos);
				await ReceptionToKitchen(datos, Formuladictionary[datos.sku].ingredientes);
			}
			
		} catch (error) {
			console.log(error);
		}
	} catch (error) {
		console.log(error);
	}
}

async function producir_orden(datos) {
	try {
		const sku = datos.sku;
		const producto = Productdictionary[sku];
		// si es una hamburguesa debiera tener una formula que esta en Formulasdictionary
		if (producto.produccion === "cocina") { // si es una hamburguesa
			console.log("es una hamburguesa")
			const formula = Formuladictionary[sku].ingredientes;
			for (let ingrediente in formula) {
				console.log(ingrediente)
				const ingredient = Productdictionary[ingrediente];
				const array_groups = JSON.parse(ingredient.gruposProductores)
				if (array_groups.includes(5)) {
					console.log("entro al if, producimos nosotros")
					if (formula.hasOwnProperty(ingrediente)) {
						const qty = parseInt(ingredient.loteProduccion);
						producirSku(ingrediente, qty)
					}
				}
				else { // ask ingredient to another group
					for (indice in array_groups) {
						const grupoProductor = array_groups[indice].toString()
						console.log("entro al else, estamos pidiendo");
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
							//console.log(fechaHoraUtc4)
							const requestBody = {
								"cliente": "5",
								"proveedor": grupoProductor,
								"sku": ingrediente,
								"cantidad": parseInt(ingredient.loteProduccion),
								"vencimiento": fechaHoraUtc4
							};
							//console.log(requestBody)
							try {
								const order = await newOrder(requestBody);
								//console.log(order)
								await notifyCreateOrder(order)
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