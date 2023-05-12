const fs = require('fs');
const stringToWrite = [{id: 1, name: "John Doe"}, {id: 2, name: "Jane Doe"}];
const stringToWrite2 = JSON.stringify(stringToWrite);

fs.writeFile("./test.txt", stringToWrite2, (err) => {
if (err) {
    console.error(err);
return;
  }
});
console.log("Data has been Written");



fs.readFile("./test.txt", (err, inputD) => {
    if (err) throw err;
       const text = inputD.toString();
         const data = JSON.parse(text);
         data[0].name = "Juan Perez";
         console.log(data);
         console.log(data[0].name);
         fs.writeFile("./test.txt", JSON.stringify(data), (err) => {
            if (err) {
                console.error(err);
            return;}})
        
 })