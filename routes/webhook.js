const express = require('express');
const router = express.Router();
const AcademiBot = require('../src/AcademiBot');

// log cantidad de usuarios desde el reinicio
const usuarios = new Set();

const validaToken = (req, res) => {
  if (req.query['hub.verify_token'] === process.env.FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send("Wrong token");
  }
};

const procesaEventos = (req, res) => {
  const messaging_events = req.body.entry[0].messaging;
  for (const event of messaging_events) {
    const idUsuario = event.sender.id;
    usuarios.add(idUsuario);
    if (event.message && !event.message.sticker_id && event.message.attachments) {
      const urls = event.message.attachments.filter((elem) => (elem.payload && elem.payload.url)).map(elem => elem.payload.url);
      AcademiBot.procesaUrl(idUsuario, urls)
        .catch(e => console.log(e));
    } else if (event.postback && event.postback.payload) {
      AcademiBot.recibePostback(idUsuario, event.postback.payload);
    } else if (event.message && event.message.quick_reply && event.message.quick_reply.payload) {
      const payload =  event.message.quick_reply.payload;
      AcademiBot.recibePostback(idUsuario, payload);
    } else if (event.message && event.message.text) {
      const text = event.message.text;     
      AcademiBot.recibeTexto(idUsuario, text)
        .catch(e => console.log(e));
    }
  }
  res.sendStatus(200);
};

const actualiza = async (req,res) => {
  const intentoClave = req.params.clave;
  const claveSecreta = process.env.PROCESS_KEY;

  if (intentoClave === claveSecreta) {
    try {
      await AcademiBot.actualizaDirectorios();
    } catch (error) {
      res.send(error)
    }
    res.send("Actualizacion exitosa.")
  } else {
    res.send("Clave incorrecta.")
  }
};

const muestraFacultades = (req,res) => {
  const intentoClave = req.params.clave;
  const claveSecreta = process.env.PROCESS_KEY;

  if (intentoClave === claveSecreta) {
    const facultades = AcademiBot.UNI.getFacultadesObject();
    res.json(facultades);
  } else {
    res.send("Clave incorrecta.");
  }
};

const muestraUsuarios = (req,res) => {
  const intentoClave = req.params.clave;
  const claveSecreta = process.env.PROCESS_KEY;
  if (intentoClave === claveSecreta) {
    const usuarios = AcademiBot.UNI.getUsuarios();
    res.json(usuarios);
  } else {
    res.send("Clave incorrecta.")
  }
};

const muestraArchivador = (req,res) => {
  const intentoClave = req.params.clave;
  const claveSecreta = process.env.PROCESS_KEY;
  if (intentoClave === claveSecreta) {
    const archivador = AcademiBot.archivos.toJSON();
    res.json(archivador);
  } else {
    res.send("Clave incorrecta.")
  }
};
router.get('/', validaToken);
router.post('/', procesaEventos);
router.get('/actualiza/:clave', actualiza);
router.get('/muestra/usuarios/:clave', muestraUsuarios);
router.get('/muestra/facultades/:clave', muestraFacultades);
router.get('/muestra/archivador/:clave', muestraArchivador);

process.on("SIGTERM", () => {
  AcademiBot.guarda();
  setTimeout(() => {
    process.exit(0);
  }, 4000);
});

module.exports = router;