// import type { HttpContext } from '@adonisjs/core/http'
import type { HttpContext } from '@adonisjs/core/http'
import DatabaseService from '#services/DatabaseService';
import { documents } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { createDocumentValidator } from "#validators/document";

export default class DocumentsController {
  public async index({ response }: HttpContext) {
    const result = await DatabaseService.getDb().select().from(documents);
    return response.json(result);
  }

  // public async forDoctor({ params, response }: HttpContext) {
  //   const result = await DatabaseService
  //     .getDb()
  //     .select()
  //     .from(documents)
  //     .innerJoin(releasedDocuments, eq(documents.id, releasedDocuments.documentId))
  //     .where(eq(releasedDocuments.doctorAddress, params.id));
  //   return response.json(result);
  // }

  public async forPatient({ params, response }: HttpContext) {
    const result = await DatabaseService
      .getDb()
      .select()
      .from(documents)
      .where(eq(documents.patientAddress, params.id));
    return response.json(result);
  }

  public async show({ params, response }: HttpContext) {
    const result = await DatabaseService
      .getDb()
      .select()
      .from(documents)
      .where(eq(documents.id, params.id));
    return response.json(result);
  }

  public async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createDocumentValidator);
    const oid = await DatabaseService.getDb().insert(documents).values(payload).then((r) => r.oid);
    response.ok({id: oid});
  }

  public async delete({ params, response }: HttpContext) {
    await DatabaseService.getDb().delete(documents).where(eq(documents.id, params.id));
    return response.ok({ success: true });
  }
}

