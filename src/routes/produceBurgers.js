const getTokenW = require("./getTokenW");
const axios = require("axios");

async function produceBurgers(BurgersinProdution, ready_for_production, Productdictionary) {
    const len = ready_for_production.length;
    for (let i = 0; i < len; i++) {
        const burger = ready_for_production[i];
        console.log("enra a produce");
        console.log(BurgersinProdution)
        console.log(ready_for_production)
        console.log(burger);
        // first we remove burger from production
        const index = BurgersinProdution.indexOf(burger);

        if (index !== -1) {
        BurgersinProdution.splice(index, 1);
        }
        console.log(BurgersinProdution)
        const info_burger = Productdictionary[burger];
        console.log("info gurger");
        console.log(info_burger);
        const sku = burger;
        const quantity = info_burger.loteProduccion;
        console.log("datos");
        console.log(sku);
        console.log(quantity);
        try {
            const token = await getTokenW();
            const headers = {
                "Content-Type": "application/json", // Adjust the content type if necessary
                Authorization: "Bearer " + token,
            };
            const response = await axios.post(
                "https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/products ",
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
            console.log("este es el error");
            console.log(error.response.data);
        }
    }
    while(ready_for_production.length > 0) {
        ready_for_production.pop();
    }
    //return ready_for_production;
    
}

module.exports = produceBurgers;