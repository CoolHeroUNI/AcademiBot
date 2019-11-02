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
    const action = req.query['action'];
    const Key = req.body['Key'];
    const NewKey = req.body['NewKey'];
    switch (action) {
        case 'move':

            return S3.getObject(NewKey)
                .then(() => {
                    MySQL.logInternalError(new Error('Ya existe un archivo con el mismo nombre'), 'AdminClasificador');
                    res.sendStatus(500);
                    return Promise.resolve();
                })
                .catch(e => {
                    return S3.moveObject(Key, NewKey)
                        .then(() => res.sendStatus(200))
                        .catch((e) => {
                            res.sendStatus(500);
                            MySQL.logInternalError(e, 'AdminClasificador');
                        });
                });

        case 'delete':
            return S3.deleteObject(Key)
                .then(() => res.sendStatus(200))
                .catch((e) => {
                    res.sendStatus(500);
                    MySQL.logInternalError(e, 'AdminClasificador');
                });
        default:
            return res.sendStatus(405);
    }
});
module.exports = router;