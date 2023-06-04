const axios = require("axios");

async function checkIngredients(BurgersinProdution, dict_products, dict_formula, ready_for_production) {
	for (let burger in BurgersinProdution) { // burger is a sku
        const info_burger = dict_products[burger];
        const num_ingredients = JSON.parse(info_burger.numberIngredients);
        const array_ingredients = dict_formula[burger];
        let igd_available = 0;
		try {
			const headers = {
				"Content-Type": "application/json", // Adjust the content type if necessary
			};
			let condition = 1;
			while (condition == 1) {
				// iterate over all stores
				const response = await axios.get(
					`http://lagarto5.ing.puc.cl/stocks`,
					{ headers });
				const stock = response.data; 
                for (let stck of stock) {
                    const stock_sku = stck.sku;
                    if (array_ingredients.includes(stock_sku)) {
                            igd_available += 1;
                    
                    }
                }
                if (igd_available == num_ingredients) {
                    ready_for_production.push(burger);
                }
			}
		}
		catch (error) {
			console.log(error)
		}
	}
    //return ready_for_production;
	
}

module.exports = checkIngredients;