const getToken = require("../app");
const axios = require("axios");

async function produceBurgers(BurgersinProdution, ready_for_production, Productdictionary) {
    for (let burger in ready_for_production) {
        // first we remove burger from production
        const index = fruits.indexOf(burger);

        if (index !== -1) {
        BurgersinProdution.splice(index, 1);
        }
        const info_burger = Productdictionary[burger];
        const sku = info_burger.sku;
        const quantity = info_burger.productionBatch;
        try {
            const token = await getToken();
            const headers = {
                "Content-Type": "application/json", // Adjust the content type if necessary
                Authorization: "Bearer " + token,
            };
            const response = await axios.post(
                "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/products ",
                { sku: `${sku}`, quantity: `${quantity}` },
                {
                    headers,
                }
            ); // Replace with the API endpoint URL
            //console.log(response.data);
            if (response.status === 201) {
                console.log(`Burger ${info_burger.name} producida`);
            }
        } catch (error) {
            console.log(error.response.data);
        }
    }
    //return ready_for_production;
    
}

module.exports = produceBurgers;