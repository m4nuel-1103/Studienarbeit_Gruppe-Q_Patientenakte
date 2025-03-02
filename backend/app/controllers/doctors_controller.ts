import type { HttpContext } from '@adonisjs/core/http'
import DatabaseService from '#services/DatabaseService';
import { doctors } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { createDoctorValidator } from '#validators/doctor';


export default class DoctorsController {
  public async index({ response }: HttpContext) {
    const result = await DatabaseService.getDb().select().from(doctors);
    return response.json(result);
  }

  // public async forDoctor({ params, response }: HttpContext) {
  //   const result = await DatabaseService
  //     .getDb()
  //     .select()
  //     .from(patients)
  //     .innerJoin(documents, eq(patients.id, documents.patientAddress))
  //     .innerJoin(releasedDocuments, eq(documents.id, releasedDocuments.documentId))
  //     .where(eq(releasedDocuments.doctorAddress, params.id));
  //   return response.json(result);
  // }

  public async show({ params, response }: HttpContext) {
    const result = await DatabaseService
      .getDb()
      .select()
      .from(doctors)
      .where(eq(doctors.id, params.id));
    return response.json(result);
  }


  public async store({ request }: HttpContext) {
    const payload = await request.validateUsing(createDoctorValidator);
    await DatabaseService.getDb().insert(doctors).values(payload);
  }

  public async delete({ params, response }: HttpContext) {
    await DatabaseService.getDb().delete(doctors).where(eq(doctors.id, params.id));
    return response.ok({ success: true });
  }
}
