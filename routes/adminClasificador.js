const express = require('express');
const router = express.Router();
const {S3, MySQL} = require('../src/Instances');
const CacheHandler = require('../model/Classes/CacheHandler');
const cache = new CacheHandler(1800);
const submissionsFolder = process.env.ACADEMIBOT_SUBMISSIONS_FOLDER;

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
              return Promise.all(facultades.map(facultad => MySQL.getCoursesByFaculty(facultad['Id'])));
            })
            .then(cursosPorFacultad => {
              Cursos = cursosPorFacultad.map(cursos => cursos.map(curso => {
                  return {
                      Codigo : curso['Codigo'],
                      Nombre : curso['Nombre']
                  }
              }));
              cache.set('INFORMACION', {Facultades,Cursos});
              return Promise.resolve({
                keys : Keys,
                facultades : Facultades,
                cursos : Cursos,
              })
            })
      })
      .then(informacion => res.render('adminClasificador', informacion))
      .catch(e => {
          console.log(e);
          res.render('error', e)
      });
});

router.post('/', (req, res) => {
    res.sendStatus(200);
});
module.exports = router;