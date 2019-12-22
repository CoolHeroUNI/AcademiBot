const cuentas = require("../schema/Cuentas");
const entidades = require("../schema/Entidades");
const relaciones = require("../schema/Relaciones");
const crearTodo = require("../schema/transacciones/crearTodo");
const canalMensajeria = require("../schema/Entidades/CanalMensajeria");
const actualizarMensaje = require("../schema/transacciones/actualizarMensaje");
const actualizarDonacion = require("../schema/transacciones/actualizarDonacion");
const actualizarEnvio = require("../schema/transacciones/actualizarEnvio");
const getIdCuentaDonador = require("../schema/transacciones/operaciones/getIdCuentaDonador");
const getIdCuentaMensajeria = require("../schema/transacciones/operaciones/getIdCuentaMensajeria");
const getIdCuentaSolicitante = require("../schema/transacciones/operaciones/getIdCuentaSolicitante");
for (const entidad of entidades) {
  entidad.sync();
}
for (const cuenta of cuentas) {
  cuenta.sync();
}
for (const relacion of relaciones) {
  relacion.sync();
}

const canal = "WHATSAPP";
const codigo = "9091354414";
const recurso = "Lineal/1pc/21-4.jpg";
async function test() {
  await canalMensajeria.findOrCreate({ where: { nombre: canal }, defaults: { nombre: canal }});
  const id = await crearTodo(canal, codigo);
  const cuentaDonador = await getIdCuentaDonador(id);
  await actualizarDonacion(cuentaDonador, recurso);
  const cuentaMensaje = await getIdCuentaMensajeria(id);
  await actualizarMensaje(cuentaMensaje);
  const cuentaEnvio = await getIdCuentaSolicitante(id);
  await actualizarEnvio(cuentaEnvio, true, recurso);
}
test()
  .then(() => console.log('Finished!'))
  .catch(e => console.error(e));