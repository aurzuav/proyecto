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
//const getInvoices = require("./getStatement.js");
const getData = require("./getData.js");

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
getCSVDictionaryProducts(Productdictionary, "./products_E3.csv");
getCSVDictionaryFormula(Formuladictionary, "./formulas_E3.csv");


module.exports =  router;


const leerArchivosXML = require("../SFTP3.js");
const { response } = require("express");
const wait = require("./wait.js");


function procesarPedidos() {
	leerArchivosXML()
		.then(async (pedidos) => {
			for (let pedido in pedidos){
				console.log(pedidos[pedido])
				manejarOrden(pedidos[pedido].id, "SFTP")
				await wait(3*60*1000)
			}
			// console.log(pedidos[pedidos.length -1])
			// manejarOrden(pedidos[pedidos.length -1].id, "SFTP")
		})
		.catch((error) => {
			console.error("Error:", error.message);
		});
}


// Llamar a la función inicialmente
//console.log("pidiendo datos banco")
//getData();
procesarPedidos();

// Ejecutar la función cada 15 minutos
setInterval(procesarPedidos, 15 * 60 * 1000); // 15 minutos en milisegundos


// setInterval(checkIngredients, 10 * 60 * 1000, BurgersinProdution, Productdictionary, Formuladictionary, ready_for_production);

// setInterval(produceBurgers, 10 * 60 * 1000, BurgersinProdution, ready_for_production, Productdictionary)



