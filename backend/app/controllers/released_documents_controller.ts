import type { HttpContext } from '@adonisjs/core/http'
import DatabaseService from '#services/DatabaseService';
import { documents, releasedDocuments } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
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

  public async forDoctorPatient(ctx: HttpContext) {
    const patient = ctx.request.qs()["patient"];
    const doctor = ctx.request.qs()["doctor"];
    console.log(`doc for doctor: ${doctor} from patient: ${patient}`);
    const result = await DatabaseService
      .getDb()
      .select()
      .from(releasedDocuments)
      .where(
        and(
          eq(releasedDocuments.doctorAddress, doctor),
          eq(releasedDocuments.patientAddress, patient)
        )
      );
    return ctx.response.json(result);
  }

  public async forDoctorPatientNoContent(ctx: HttpContext) {
    const patient = ctx.request.qs()["patient"];
    const doctor = ctx.request.qs()["doctor"];
    console.log(`doc for doctor: ${doctor} from patient: ${patient}`);
    const result = await DatabaseService
      .getDb()
      .select({
        id: releasedDocuments.id,
        documentId: releasedDocuments.documentId,
        doctorAddress: releasedDocuments.doctorAddress,
        patientAddress: releasedDocuments.patientAddress,
        name: releasedDocuments.name,
      })
      .from(releasedDocuments)
      .where(
        and(
          eq(releasedDocuments.doctorAddress, doctor),
          eq(releasedDocuments.patientAddress, patient)
        )
      );
    return ctx.response.json(result);
  }

  public async show({ params, response }: HttpContext) {
    const result = await DatabaseService
      .getDb()
      .select()
      .from(releasedDocuments)
      .where(eq(releasedDocuments.id, params.id));
    return response.json(result);
  }

  public async store(ctx: HttpContext) {
    const payload = await createReleasedDocumentValidator.validate(ctx.request.body());
    const oid = await DatabaseService.getDb().insert(releasedDocuments).values(payload).then((a) => a.oid);
    ctx.response.json({ id: oid });
  }

  public async delete({ params, response }: HttpContext) {
    await DatabaseService.getDb().delete(releasedDocuments).where(eq(releasedDocuments.id, params.id));
    return response.ok({ success: true });
  }

  public async deleteDoctor(ctx: HttpContext) {
    const body = ctx.request.body();
    const docId = body.documentId;
    const doctAdd = body.doctorAddress;
    console.log("document-id to unrelease: ", docId);
    console.log("doctor address to unrelease from: ", doctAdd);
    await DatabaseService
      .getDb()
      .delete(releasedDocuments)
      .where(
        and(
          eq(releasedDocuments.documentId, docId),
          eq(releasedDocuments.doctorAddress, doctAdd)
        )).execute();
    return ctx.response.ok({ success: true });
  }
}
