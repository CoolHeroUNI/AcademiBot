const express = require('express');
const router = express.Router();
const {S3, MySQL} = require('../src/Instances');
const CacheHandler = require('../model/Classes/CacheHandler');
const cache = new CacheHandler(1800);
const submissionsFolder = process.env.ACADEMIBOT_SUBMISSIONS_FOLDER;
const AcademiBot = require('../src/AcademiBot');




router.get('/', (req, res) => {
  let Keys;
  let Facultades;
  let Cursos;
  return S3.listObjectsUnder(submissionsFolder)
      .then(keys => keys.filter(key => {
          if (key.indexOf('.') >= 0) return true;
          S3.deleteObject(key);
          return false;
        }))
      .then(keys => {
        Keys = keys;
        const cached = cache.get('INFORMACION');
        if (cached) return Promise.resolve({
            keys : keys,
            facultades : cached['Facultades'],
            cursos : cached['Cursos']
          });
        return MySQL.getFacultades()
            .then(facultades => {
              Facultades = facultades.map(facultad => facultad['Id']);
              return Promise.all(facultades.map(facultad => MySQL.getCoursesByFaculty(facultad)));
            })
            .then(cursos => {
              Cursos = cursos.map(curso => {
                  return {
                      Codigo : curso['Codigo'],
                      Nombre : curso['Nombre']
                  }
              });
              cache.set('INFORMACION', {Facultades,Cursos});
              return Promise.resolve({
                keys : Keys,
                facultades : Facultades,
                cursos : Cursos,
              })
            })
      })
      .then(informacion => res.render('adminClasificador', informacion))
      .catch(e => res.render('error', e));
});

router.post('/', (req, res) => {

  const tipe = req.query.tipo || 'image';
  const page = req.query.page || 0;
  const action = req.query.action;
  console.log(req.body);
  if (!action || !req.body.ruta) {
    return res.send(404);
  }
  if (action === 'move') {
    const origen = req.body.ruta;
    const curso = req.body.curso_opcional ? req.body.curso_opcional : req.body.curso;
    const carpeta = req.body.carpeta_opcional ? req.body.carpeta_opcional : req.body.carpeta;
    const archivo = `${req.body.archivo}-${req.body.pagina}${req.body.extension}`;
    const destino = `${req.body.facultad}/${curso}/${carpeta}/${archivo}`;
    AcademiBot.mueveArchivo(origen, destino)
      .then(() => {
        AcademiBot.submissions.eliminaArchivo(req.body.ruta);
        res.redirect(`/admin/clasificador?tipo=${tipe}&page=${page}`);
      })
      .catch(e => {
        console.log(e);
        res.render('error', e);
      });
  } else if (action === 'delete') {
    AcademiBot.borraArchivo(req.body.ruta)
      .then(() => {
        AcademiBot.submissions.eliminaArchivo(req.body.ruta);
        res.redirect(`/admin/clasificador?tipo=${tipe}&page=${page}`);
      })
      .catch(e => {
        console.log(e);
        res.render('error', e);
      });
  }

});
module.exports = router;