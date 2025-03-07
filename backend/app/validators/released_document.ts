import vine from '@vinejs/vine'

export const createReleasedDocumentValidator = vine.compile(
  vine.object({
    id: vine.number().decimal(0).optional(),
    documentId: vine.number().decimal(0),
    doctorAddress: vine.string().regex(/(?:0x)?[\da-f]+/i),
    patientAddress: vine.string().regex(/(?:0x)?[\da-f]+/i),
    name: vine.string(),
    content: vine.string(),
  })
)
