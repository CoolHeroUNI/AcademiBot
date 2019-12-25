require("../schema/Cuentas");
require("../schema/Entidades");
require("../schema/Relaciones");
const { wait } = require("../lib");
const sequelize = require("../config/database");
const crearUsuario = require("../schema/transacciones/crearTodo");
const canalMensajeria = require("../schema/Entidades/CanalMensajeria");
const actualizarMensaje = require("../schema/transacciones/actualizarMensaje");
const actualizarDonacion = require("../schema/transacciones/actualizarDonacion");
const actualizarEnvio = require("../schema/transacciones/actualizarEnvio");
const getIdCuentaDonador = require("../schema/transacciones/operaciones/getIdCuentaDonador");
const getIdCuentaMensajeria = require("../schema/transacciones/operaciones/getIdCuentaMensajeria");
const getIdCuentaSolicitante = require("../schema/transacciones/operaciones/getIdCuentaSolicitante");
const getUserId = require("../schema/transacciones/operaciones/getUserId");

function createDB() {
  return sequelize.sync({ force: true })
};

async function creationTest() {
  await createDB();
  const canal = "WHATSAPP";
  const codigo = "9091354414";
  const recurso = "Lineal/1pc/21-4.jpg";
  await canalMensajeria.findOrCreate({ where: { nombre: canal }, defaults: { nombre: canal }});
  const id = await crearUsuario(canal, codigo);
  const cuentaDonador = await getIdCuentaDonador(id);
  await actualizarDonacion(cuentaDonador, recurso);
  const cuentaMensaje = await getIdCuentaMensajeria(id);
  await actualizarMensaje(cuentaMensaje);
  const cuentaEnvio = await getIdCuentaSolicitante(id);
  await actualizarEnvio(cuentaEnvio, true, recurso);
}

async function stressTest() {
  await createDB();
  await wait(5000);
  console.log("Starting Stress test Part 1 - Users");
  await wait(5000);
  const users = require("./testUsers");
  const messages = require("./testMessages");
  const donaciones = require("./testDonaciones");
  const solicitudes = require("./testSolicitudes");
  const canales = ["FACEBOOK", "WHATSAPP", "TELEGRAM", "WEB"];
  for (let nombre of canales) await canalMensajeria.create({ nombre });
  const promesasCreacionUsuarios = [];
  let i = 0;
  for (const { user, canal } of users) {
    promesasCreacionUsuarios.push(crearUsuario(canal, user));
    if (i++ % 1000 === 0) await wait(1000);
  }
  await Promise.all(promesasCreacionUsuarios);
  await wait(5000);
  console.log("Starting Stress test Part 2 - Messages");
  await wait(5000);
  const promesaMensaje = [];
  for (const { user } of messages) {
    const aux = users.find((v) => v.user === user);
    const canal = aux.canal;
    const id = await getUserId(user, canal);
    const cuenta = await getIdCuentaMensajeria(id);
    promesaMensaje.push(actualizarMensaje(cuenta));
    if (i++ % 1000 === 0) await wait(1000);
  }
  await Promise.all(promesaMensaje);
}
creationTest()
  .then(() => console.log('Finished!'))
  .catch(e => console.error(e));