import type { HttpContext } from '@adonisjs/core/http'
import DatabaseService from '#services/DatabaseService';
import { patients, releasedDocuments, documents } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export default class PatientsController {
  public async index({ response }: HttpContext) {
    console.log("all");
    const result = await DatabaseService.getDb().select().from(patients);
    return response.json(result);
  }

  public async show({ params, response }: HttpContext) {
    const result = await DatabaseService
      .getDb()
      .select()
      .from(patients)
      .innerJoin(documents, eq(patients.id, documents.patientAddress))
      .innerJoin(releasedDocuments, eq(documents.id, releasedDocuments.documentId))
      .where(eq(releasedDocuments.doctorAddress, params.id));
    return response.json(result);
  }
}
