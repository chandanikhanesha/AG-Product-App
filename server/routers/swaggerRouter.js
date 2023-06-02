const path = require('path');
const YAML = require('yamljs');
const swaggerUI = require('swagger-ui-express');
const { Router } = require('express');
const swaggerDoc = YAML.load('docs/swagger.yaml');
const monsantoDraftAPIDoc = require('docs/monsantoDraftAPI.json');
const router = Router();

// Hack: re-instance per doc
const useSchema =
  (schema) =>
  (...args) =>
    swaggerUI.setup(schema)(...args);

router.use('/', swaggerUI.serve);
router.get('/', useSchema(swaggerDoc));
router.get('/monsanto', useSchema(monsantoDraftAPIDoc));

module.exports = router;
