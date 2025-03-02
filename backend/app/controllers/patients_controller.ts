import type { HttpContext } from '@adonisjs/core/http'
import DatabaseService from '#services/DatabaseService';
import { patients, releasedDocuments, documents } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { createPatientValidator } from "#validators/patient";

export default class PatientsController {
  public async index({ response }: HttpContext) {
    const result = await DatabaseService.getDb().select().from(patients);
    return response.json(result);
  }

  public async forDoctor({ params, response }: HttpContext) {
    console.log(params);
    const result = await DatabaseService
      .getDb()
      .select()
      .from(patients)
      .innerJoin(documents, eq(patients.id, documents.patientAddress))
      .innerJoin(releasedDocuments, eq(documents.id, releasedDocuments.documentId))
      .where(eq(releasedDocuments.doctorAddress, params.id));
    return response.json(result);
  }

  public async show({ params, response }: HttpContext) {
    console.log(params);
    const result = await DatabaseService
      .getDb()
      .select()
      .from(patients)
      .where(eq(patients.id, params.id));
    return response.json(result);
  }

  public async store({ request }: HttpContext) {
    const payload = await request.validateUsing(createPatientValidator);
    await DatabaseService.getDb().insert(patients).values(payload);
  }

  public async delete({ params, response }: HttpContext) {
    console.log(params);
    await DatabaseService.getDb().delete(patients).where(eq(patients.id, params.id));
    return response.ok({ success: true });
  }
}
