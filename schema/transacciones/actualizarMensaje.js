const { averageTime } = require("../../lib");
const cuenta_Mensajeria = require("../Cuentas/cuenta_Mensajeria");
const Historial_Mensaje = require("../Relaciones/Historial_Mensaje");
const sequelize = require("../../config/database");

module.exports = function (idCuenta, estaHabilitado = true, contenidoMensaje = null) {
  return sequelize.transaction(async t => {
    const cuenta = await cuenta_Mensajeria.findByPk(idCuenta, { transaction: t });
    const n = cuenta.get('total_mensajes_enviados');
    const nuevaHoraPromedio = averageTime(cuenta.get('hora_promedio_mensajes_enviados'), n);
    await cuenta.update({
      total_mensajes_enviados: n + 1,
      hora_promedio_mensajes_enviados: nuevaHoraPromedio,
      esta_habilitado: estaHabilitado
    }, { transaction: t });
    await Historial_Mensaje.create({
      codigo_cuenta: idCuenta,
      contenido_mensaje: contenidoMensaje
    }, { transaction: t });
  });
};
