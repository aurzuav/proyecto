const getToken = require("./getToken");
const axios = require("axios");
const moveProduct = require("./moveProduct")

const {
	getCSVDictionaryProducts,
	getCSVDictionaryFormula,
} = require("./obtenerDiccionarios.js");
const Formuladictionary = {};
const Productdictionary = {};

getCSVDictionaryFormula(Formuladictionary, "./formulas_E2.csv");
getCSVDictionaryProducts(Productdictionary, "./products_E2.csv");





//module.exports = ReceptionToKitchen;