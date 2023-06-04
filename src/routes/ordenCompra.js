const Router = require("koa-router");
const axios = require("axios");
const router = new Router();
const fs = require("fs");
const csv = require("csv-parser");
const moment = require("moment");
const producirSku = require("./producir.js");
const moveProduct = require("./moveProduct.js");
const getStock = require("./getStock.js");
const newOrder = require("./newOrder.js");
const notifyOrder = require("./notifyOrder.js");
const checkIngredients = require("./checkIngredients.js");
const produceBurgers = require("./produceBurgers.js");
const ReceptionToKitchen = require("./receptiontoKitchen.js");
const getToken = require("./getToken.js");
const poblar_or = require("../ordenes_recibidas.js")
const manejarOrden = require("./manejarOrden.js")

const {
	getCSVDictionaryProducts,
	getCSVDictionaryFormula,
} = require("./obtenerDiccionarios.js");

// Se usa el excel de la E2
const Productdictionary = {};
const Formuladictionary = {}; // Declara la variable dictionary fuera de la función
const BurgersinProdution = [];
const ready_for_production = [];

// Llama a la función getCSVDictionary para comenzar la carga del diccionario
getCSVDictionaryProducts(Productdictionary, "./products_E2.csv");
getCSVDictionaryFormula(Formuladictionary, "./formulas_E2.csv");


// // Esta es una funcion para obtener el token, la usamos para hacer los llamados a la API (necesitan el token como autorizacion)
// async function getToken() {
// 	try {
// 		const headers = {
// 			"Content-Type": "application/json",
// 		};
// 		const response = await axios.post(
// 			"https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/autenticar",
// 			{ group: 5, secret: "J6RyeTrwNgX.Z+*MKh4EaBuLn" },
// 			{
// 				headers,
// 			}
// 		);
// 		return response.data.token;
// 	} catch (error) {
// 		console.error(error);
// 		return null;
// 	}
// }


//obtener orden de compra












module.exports =  router;

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
			for (let pedido in pedidos){
				//console.log(pedidos[pedido])
				manejarOrden(pedidos[pedido].id, "SFTP")
			}
			//manejarOrden(pedidos[0].id, "SFTP")
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


