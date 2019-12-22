const cuenta_Solicitante = require("../Cuentas/cuenta_Solicitante");
const Historial_Seleccion = require("../Relaciones/Historial_Seleccion");
const sequelize = require("../../config/database");

module.exports = function (idCuenta, exitoso, nuevaRuta) {
  return sequelize.transaction(async t => {
    const cuenta = await cuenta_Solicitante.findByPk(idCuenta, { transaction: t });
    const antiguaRuta = cuenta.get('ruta_seleccionada');
    await cuenta.update({
      ruta_seleccionada: nuevaRuta
    }, { transaction: t });
    await Historial_Seleccion.create({
      codigo_cuenta: cuenta.get('id'),
      anterior_ruta_seleccionada: antiguaRuta,
      nueva_ruta_seleccionada: nuevaRuta
    }, { transaction: t });
  });
};
