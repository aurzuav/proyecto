const axios = require("axios");
const getTokenW = require("./getTokenW");
const getToken = require("./getToken");
const produceBurgers = require("./produceBurgers")

async function checkIngredients(BurgersinProdution, dict_products, dict_formula, ready_for_production) {
	const length = BurgersinProdution.length;
	for (let i = 0; i < length; i++) { // burger is a sku
		// console.log("burgerrrrrr")
		// console.log(BurgersinProdution[i]);
		console.log("CHECK INGREDIENTEEEEEEEEEEEEE")
		const burger = BurgersinProdution[i]
		const info_burger = dict_products[burger];
		const num_ingredients = parseInt(JSON.parse(info_burger.numeroIngredientes));
		console.log("umer de ingredientes");
		console.log(num_ingredients)
		console.log(typeof(num_ingredients))
		const array_ingredients = dict_formula[burger].ingredientes;

		for (let ingr in array_ingredients) {
			let igd_available = 0;
			// console.log("ing");
			// console.log(ingr);
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
				const receptionId = "";
				const bufferId = "";

				ready_for_production.push("algo");

				const stores = storesResponse.data;
				stores.forEach((element) => {
					if (element.buffer == true) {
						inventoryDict[element._id] = "Bodega Buffer";
						bufferId = element._id;
					} else if (element.kitchen == true) {
						inventoryDict[element._id] = "Bodega Kitchen";
						kitchenId = element._id;
					} else {
						inventoryDict[element._id] = "Bodega";
						receptionId = element._id;
					}
				});
				// INVENTARIO DE BODEGA (RECEPCION)
				const stockResponse = await axios.get(
					`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${receptionId}/inventory`,
					{
						headers,
					}
				);

				//INGREDIENTES EN EL INVENTARIO DE RECEPCION
				for (const ingrediente of stockResponse.data) {
					console.log("ingrediente");
					console.log(ingrediente);
					// VER SI INGREDIENTE ESTA EN EL INVENTARIO
					if (ingrediente.sku == ingr) {
						//OBTENER DETALLE DE INGREDIENTE, PARA OBTENER ID
						const detalleIngrediente = await axios.get(
							`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${receptionId}/products?sku=${ingr}`,
							{
								headers,
							}
						);
						//ElIJO EL PRIMER ID QUE APARECE (lo elegi de manera random, podría ser cualquierA)
						productoId = detalleIngrediente.data[0]._id;
						//SI INGREDIENTE ESTA EN EL INVENTARIO, CAMBIAR A BODEGA KITCHEN
						const move = await axios.patch(
							`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/products/${productoId}`,
							{ store: `${kitchenId}` },
							{ headers }
						);
						console.log("MOVI", move.data);
					} else {
						console.log("NO está el INGREDIENTE", ingr);
					}

				const storesResponse_ = await axios.get(
					`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${kitchenId}/products?sku=${ingr}`,
					{ headers }
				);

				console.log("stores response");
				console.log(storesResponse_.data);
				if (storesResponse_.data.length > 0) {
					console.log("entro al if del length");
					console.log(igd_available);
					igd_available += 1;
					console.log("suma");
					console.log(igd_available);
				}

				if (igd_available == num_ingredients) {
					console.log("estan todos");
					ready_for_production.push(burger);
				}

				// INVENTARIO DE BODEGA (RECEPCION)
				const stockResponse = await axios.get(
					`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${receptionId}/inventory`,
					{
						headers,
					}
				);

				//INGREDIENTES EN EL INVENTARIO DE BUFFER
				for (const ingrediente of stockResponse.data) {
					console.log("ingrediente");
					console.log(ingrediente);
					// VER SI INGREDIENTE ESTA EN EL INVENTARIO
					if (ingrediente.sku == ingr) {
						//OBTENER DETALLE DE INGREDIENTE, PARA OBTENER ID
						const detalleIngrediente = await axios.get(
							`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${bufferId}/products?sku=${ingr}`,
							{
								headers,
							}
						);
						//ElIJO EL PRIMER ID QUE APARECE (lo elegi de manera random, podría ser cualquierA)
						productoId = detalleIngrediente.data[0]._id;
						//SI INGREDIENTE ESTA EN EL INVENTARIO, CAMBIAR A BODEGA KITCHEN
						const move = await axios.patch(
							`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/products/${productoId}`,
							{ store: `${kitchenId}` },
							{ headers }
						);
						console.log("MOVI", move.data);
					} else {
						console.log("NO está el INGREDIENTE", ingr);
					}

				const storesResponse_ = await axios.get(
					`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${kitchenId}/products?sku=${ingr}`,
					{ headers }
				);

				console.log("stores response");
				console.log(storesResponse_.data);
				if (storesResponse_.data.length > 0) {
					console.log("entro al if del length");
					console.log(igd_available);
					igd_available += 1;
					console.log("suma");
					console.log(igd_available);
				}

				if (igd_available == num_ingredients) {
					console.log("estan todos");
					ready_for_production.push(burger);
				}
			}
		}

			} catch (error) {
				console.log(error.message);
				return 0
			}
			
		}
	}

	setTimeout(produceBurgers, 1 * 60 * 1000, BurgersinProdution, ready_for_production, dict_products)
	//return ready_for_production
}


module.exports = checkIngredients;

