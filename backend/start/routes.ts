/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import 'dotenv/config';
import PatientsController from '#controllers/patients_controller';
// import { drizzle } from 'drizzle-orm/node-postgres';
// import { patientTable } from '../db/schema.js';

// const db = drizzle(process.env.VITE_DATABASE_URL!);

import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})


router.get('/patients', [PatientsController, "index"])
router.get('/doc_patients/:id', [PatientsController, "show"])
