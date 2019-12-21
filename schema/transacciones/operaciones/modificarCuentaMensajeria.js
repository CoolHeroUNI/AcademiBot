const moment = require("moment");
const cuenta_Mensajeria = require("../../Cuentas/cuenta_Mensajeria");
const Historial_Mensaje = require("../../Relaciones/Historial_Mensaje");

module.exports = async function modificarCuentaMensajeria(idCuenta, estaHabilitado, contenidoMensaje, t) {
  const cuenta = await cuenta_Mensajeria.findByPk(idCuenta, { transaction: t });
  const currentTime = moment(new Date().toTimeString().split(" ")[0], "HH:mm:ss").valueOf();
  const anteriorHoraPromedio = moment(cuenta.get('hora_promedio_mensajes_enviados'), "HH:mm:ss").valueOf();
  const n = cuenta.get('total_mensajes_enviados');
  const nuevaHoraPromedio = new Date((n*anteriorHoraPromedio + currentTime)/(n + 1)).toTimeString().split(" ")[0];
  await cuenta.update({
    total_mensajes_enviados: n + 1,
    hora_promedio_mensajes_enviados: nuevaHoraPromedio,
    esta_habilitado: estaHabilitado
  }, { transaction: t });
  return Historial_Mensaje.create({
    codigo_cuenta: cuenta.get('id'),
    contenido_mensaje: contenidoMensaje
  }, { transaction: t });
};
