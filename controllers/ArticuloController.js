const ArticulosModel = require("../models/ArticulosModel.js");
const { validarArticulos } = require("../helpers/validar.js");
const fs = require("fs");
const path = require("path");

const crear = async (req, res) => {
    //Recoger los datos por post a guardar
    let parametros = req.body;

    //Validar datos
    try {

        validarArticulos(parametros)

        //Crear el objeto a guardar
        const articulo = new ArticulosModel(parametros);

        //Asignar valores a objeto basado en el modelo

        //Guardar el articulo en la base de datos
        const articuloGuardado = await articulo.save();

        return res.status(200).json({
            status: "Success",
            articulo: articuloGuardado,
            mensaje: "El articulo fue enviado con éxito",
        });

    } catch (error) {
        return res.status(400).json({
            status: "Error",
            mensaje: "Faltan datos por enviar",
        })
    }
}

const listar = (req, res) => {

    let consulta = ArticulosModel.find({});

    if (req.params.ultimos) {
        consulta.limit(1);
    }

    consulta.sort({ fecha: -1 }).then((articulos) => {
        //Ha entrado a consulta de artículos exitosa
        return res.status(200).send({
            status: "success",
            parametro: req.params.ultimos,
            contador: articulos.length,
            articulos
        })
    }).catch((error) => {
        return res.status(404).json({
            status: "error",
            mensaje: "No se han encontrado artículos"
        });
    });
}

const uno = (req, res) => {
    //Recoger id por articulo
    let id = req.params.id;

    //Buscar el articulo
    Promise.resolve()
        .then(() => {
            return ArticulosModel.findById(id).exec();
        })
        .then((articulo) => {
            if (!articulo) {
                return Promise.reject(new Error("No se han encontrado artículos"));
            }

            // Devolver el resultado
            return res.status(200).json({
                status: "success",
                articulo
            });
        })
        .catch((error) => {
            return res.status(404).json({
                status: "error",
                mensaje: error.message || "No se han encontrado artículos"
            });
        });
}

const borrar = async (req, res) => {

    let articulo_id = req.params.id;

    try {
        const articuloBorrado = await ArticulosModel.findOneAndDelete({ _id: articulo_id });
    
        if (!articuloBorrado) {
            return res.status(500).json({
                status: "error",
                mensaje: "Error al borrar"
            });
        }
    
        return res.status(200).json({
            status: "success",
            articulo: articuloBorrado,
            mensaje: "Método de borrar"
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            mensaje: "Error al borrar"
        });
    }

}

const editar = async (req, res) => {

    let articulo_id = req.params.id;

    //Recoger datos body
    let parametros = req.body;

    //Validar datos
    try {
        validarArticulos(parametros);
    } catch (error) {
        return res.status(400).json({
            status: "Error",
            mensaje: "Faltan datos por enviar",
        })
    }

    //Buscar y actualizar datos
    Promise.resolve()
        .then(() => {
            return ArticulosModel.findOneAndUpdate(
                { _id: articulo_id },
                req.body,
                { new: true }
            ).exec();
        })
        .then((articuloActualizado) => {
            if (!articuloActualizado) {
                return Promise.reject(new Error("Error al actualizar"));
            }

            // Devolver respuesta
            return res.status(200).json({
                status: "Success",
                articulo: articuloActualizado,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                status: "Error",
                mensaje: error.message || "Error al actualizar",
            });
        });

}

const subir = (req, res) => {

    //Configurar multer

    //Recoger fichero de imagen subida
    if (!req.file && !req.files) {
        return res.status(404).json({
            status: "error",
            mensaje: "Peticion invalida"
        })
    }

    //Nombre del archivo
    let archivo = req.file.originalname

    //Extension del archivo
    let archivo_split = archivo.split("\.");
    let extension = archivo_split[1];

    //Comprobar extension correcta
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif" && extension != "webp") {

        //Borrar archivos diferentes
        fs.unlink(req.file.path, (error) => {
            return res.status(400).json({
                status: "error",
                mensaje: "Imagen invalida"
            })
        })

    } else {

        //Artualizar articulo
        let articulo_id = req.params.id;

        //Buscar y actualizar datos
        Promise.resolve()
            .then(() => {
                return ArticulosModel.findOneAndUpdate(
                    { _id: articulo_id },
                    { imagen: req.file.filename },
                    { new: true }
                ).exec();
            })
            .then((articuloActualizado) => {
                if (!articuloActualizado) {
                    return res.status(500).json({
                        status: "Error",
                        mensaje: "Error al actualizar"
                    });
                }

                // Devolver respuesta
                return res.status(200).json({
                    status: "Success",
                    articulo: articuloActualizado,
                    fichero: req.file
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    status: "Error",
                    mensaje: "Error al actualizar"
                });
            });
    }
}

const imagen = (req, res) => {
    let fichero = req.params.fichero;
    let ruta_fisica = "./imagenes/articulos/" + fichero;

    fs.stat(ruta_fisica, (error, existe) => {
        if (existe) {
            return res.sendFile(path.resolve(ruta_fisica))
        } else {
            return res.status(404).json({
                status: "Error",
                mensaje: "La imagen no existe"
            });
        }
    })
}

const buscador = (req, res) => {
    // Sacar el string de busqueda
    let busqueda = req.params.busqueda;

    // Find OR
    Promise.resolve()
        .then(() => {
            return ArticulosModel.find({
                "$or": [
                    { "titulo": { "$regex": busqueda, "$options": "i" } },
                    { "contenido": { "$regex": busqueda, "$options": "i" } },
                ]
            })
                .sort({ fecha: -1 })
                .exec();
        })
        .then((articulosEncontrados) => {
            if (!articulosEncontrados || articulosEncontrados.length === 0) {
                return res.status(404).json({
                    status: "error",
                    mensaje: "No se han encontrado articulos"
                });
            }

            return res.status(200).json({
                status: "Success",
                articulos: articulosEncontrados
            });
        })
        .catch((error) => {
            return res.status(500).json({
                status: "error",
                mensaje: "Error al buscar los articulos"
            });
        });
}

module.exports = {
    crear,
    listar,
    uno,
    borrar,
    editar,
    subir,
    imagen,
    buscador
}