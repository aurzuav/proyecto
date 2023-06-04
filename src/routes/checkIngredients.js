const axios = require("axios");
const getTokenW = require("./getTokenW");
const getToken = require("./getToken");

async function checkIngredients(BurgersinProdution, dict_products, dict_formula, ready_for_production) {
	for (let burger in BurgersinProdution) { // burger is a sku
		const info_burger = dict_products[burger];
		const num_ingredients = JSON.parse(info_burger.numeroIngredientes);
		const array_ingredients = dict_formula[burger];
		let igd_available = 0;
		console.log("check ingrediets");

		for (let ingr in array_ingredients) {
			try {
				const token = await getTokenW();
				const headers = {
					"Content-Type": "application/json",
					Authorization: "Bearer " + token,
				};
	
				const storesResponse = await axios.get(
					"https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores",
					{ headers }
				);
				const inventoryDict = {};
				let kitchenId = "";
	
				const stores = storesResponse.data;
				stores.forEach((element) => {
					if (element.kitchen === true) {
						inventoryDict[element._id] = "Bodega Kitchen";
						kitchenId = element._id;
				}});
	
				const storesResponse_ = await axios.get(
					`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${kitchenId}/products?sku=${ingr}`,
					{ headers }
				);
				console.log("stores response");
				console.log(storesResponse_);
	
			} catch (error) {
				console.log(error.message);
				return 0
			}
		}

	
		// try {
		// 	const headers = {
		// 		"Content-Type": "application/json", // Adjust the content type if necessary
		// 	};
		// 	let condition = 1;
		// 	while (condition == 1) {
		// 		// iterate over all stores
		// 		const response = await axios.get(
		// 			`http://lagarto5.ing.puc.cl/stocks`,
		// 			{ headers });
		// 		const stock = response.data;
		// 		for (let stck of stock) {
		// 			const stock_sku = stck.sku;
		// 			if (array_ingredients.includes(stock_sku)) {
		// 				igd_available += 1;

		// 			}
		// 		}
		// 		if (igd_available == num_ingredients) {
		// 			ready_for_production.push(burger);
		// 		}
		// 	}
		// }
		// catch (error) {
		// 	console.log(error)
		// }
		// try {
		// 	const token = await getTokenW();
		// 	const headers = {
		// 		"Content-Type": "application/json",
		// 		Authorization: "Bearer " + token,
		// 	};

		// 	const storesResponse = await axios.get(
		// 		"https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores",
		// 		{ headers }
		// 	);
		// 	const inventoryDict = {};
		// 	let receptionId = "";
		// 	let kitchenId = "";


		// 	const stores = storesResponse.data;
		// 	stores.forEach((element) => {
		// 		if (element.buffer === true) {
		// 			inventoryDict[element._id] = "Bodega Buffer";
		// 		} else if (element.kitchen === true) {
		// 			inventoryDict[element._id] = "Bodega Kitchen";
		// 			kitchenId = element._id;
		// 		} else {
		// 			inventoryDict[element._id] = "Bodega";
		// 			receptionId = element._id;
		// 		}
		// 	});

		// 	const headers_ = {
		// 		"Content-Type": "application/json",
		// 		Authorization: "Bearer " + token,
		// 	};

		// 	const storesResponse_ = await axios.get(
		// 		`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${receptionId}/products?sku=${sku}`,
		// 		{ headers }
		// 	);
		// 	return storesResponse_.data.length

		// } catch (error) {
		// 	console.log(error.message);
		// 	return 0
		// }
	}
}
    //return ready_for_production;

module.exports = checkIngredients;