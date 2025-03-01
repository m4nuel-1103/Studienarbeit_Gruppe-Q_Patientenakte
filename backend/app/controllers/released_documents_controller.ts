import type { HttpContext } from '@adonisjs/core/http'
import DatabaseService from '#services/DatabaseService';
import { releasedDocuments } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { createReleasedDocumentValidator } from "#validators/released_document";

export default class ReleasedDocumentsController {
  public async index({ response }: HttpContext) {
    const result = await DatabaseService.getDb().select().from(releasedDocuments);
    return response.json(result);
  }

  public async forDoctor({ params, response }: HttpContext) {
    const result = await DatabaseService
      .getDb()
      .select()
      .from(releasedDocuments)
      .where(eq(releasedDocuments.doctorAddress, params.id));
    return response.json(result);
  }

  public async show({ params, response }: HttpContext) {
    const result = await DatabaseService
      .getDb()
      .select()
      .from(releasedDocuments)
      .where(eq(releasedDocuments.id, params.id));
    return response.json(result);
  }

  public async store({ request }: HttpContext) {
    const payload = await request.validateUsing(createReleasedDocumentValidator);
    await DatabaseService.getDb().insert(releasedDocuments).values(payload);
  }

  public async delete({ params, response }: HttpContext) {
    await DatabaseService.getDb().delete(releasedDocuments).where(eq(releasedDocuments.id, params.id));
    return response.ok({ success: true });
  }
}
