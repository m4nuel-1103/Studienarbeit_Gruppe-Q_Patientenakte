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
import DoctorsController from '#controllers/doctors_controller';
import DocumentsController from '#controllers/documents_controller';
import ReleasedDocumentsController from '#controllers/released_documents_controller';
import EncryptionController from '#controllers/encryptions_controller';
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
router.post('/patients', [PatientsController, "store"])
router.get('/patients/:id', [PatientsController, "show"])
router.get('/patients_doctor/:id', [PatientsController, "forDoctor"])
router.delete('/patients/:id', [PatientsController, "delete"])

router.get('/doctors', [DoctorsController, "index"])
router.post('/doctors', [DoctorsController, "store"])
router.get('/doctors/:id', [DoctorsController, "show"])
// router.get('/doctors/doctor/:id', [DoctorsController, "forDoctor"])
router.delete('/doctors/:id', [DoctorsController, "delete"])

router.get('/documents', [DocumentsController, "index"])
router.post('/documents', [DocumentsController, "store"])
router.get('/documents/:id', [DocumentsController, "show"])
// router.get('/documents/doctor/:id', [DocumentsController, "forDoctor"])
router.get('/documents/patient/:id', [DocumentsController, "forPatient"])
router.delete('/documents/:id', [DocumentsController, "delete"])

router.get('/released_documents', [ReleasedDocumentsController, "index"])
router.post('/released_documents', [ReleasedDocumentsController, "store"])
router.get('/released_documents/:id', [ReleasedDocumentsController, "show"])
router.get('/released_documents/doctor/:id', [ReleasedDocumentsController, "forDoctor"])
router.get('/released_documents_for/doctor_patient/', [ReleasedDocumentsController, "forDoctorPatient"])
router.delete('/released_documents/:id', [ReleasedDocumentsController, "delete"])
router.delete('/released_documents_dd/', [ReleasedDocumentsController, "deleteDoctor"])



router.post('/encrypt/', [EncryptionController, "encrypt"])
