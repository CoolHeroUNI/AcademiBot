const { averageTime } = require("../../lib");
const cuenta_Solicitante = require("../Cuentas/cuenta_Solicitante");
const Historial_Envio = require("../Relaciones/Historial_Envio");
const Recurso = require("../Entidades/Recurso");
const sequelize = require("../../config/database");

module.exports = function (idCuenta, exitoso, rutaSeleccionada) {
  return sequelize.transaction(async t => {
    const cuenta = await cuenta_Solicitante.findByPk(idCuenta, { transaction: t });
    let totalExitosos = cuenta.get('total_envios_exitosos');
    let totalFallidos = cuenta.get('total_envios_fallidos');
    const totalEnvios = cuenta.get('total_envios');
    if (exitoso) {
      totalExitosos += 1;
    } else {
      totalFallidos += 1;
    }
    const nuevaHoraPromedio = averageTime(cuenta.get('hora_promedio_envios'), totalEnvios);
    await cuenta.update({
      total_envios: totalEnvios + 1,
      total_envios_exitosos: totalExitosos,
      total_envios_fallidos: totalFallidos,
      hora_promedio_envios: nuevaHoraPromedio
    }, { transaction: t });
    const recurso = await Recurso.findOne({
      where: { ruta: rutaSeleccionada },
      transaction: t
    });
    await Historial_Envio.create({
      codigo_cuenta: cuenta.get('id'),
      codigo_recurso: recurso.get('id'),
      envio_exitoso: exitoso
    }, { transaction: t });
  });
};
