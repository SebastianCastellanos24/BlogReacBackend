const mongoose = require("mongoose");

const conexion = async () => {

    try {
        await mongoose.connect("mongodb://localhost:27017/mi_blog")

        console.log("Conectado a la base de datos")
        
    } catch(error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos")
    }

}

module.exports = {
    conexion
}