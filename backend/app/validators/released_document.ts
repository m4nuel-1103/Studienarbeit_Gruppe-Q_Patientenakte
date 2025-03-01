import vine from '@vinejs/vine'

export const createReleasedDocumentValidator = vine.compile(
  vine.object({
    id: vine.number().decimal(0).nullable(),
    documentId: vine.number().decimal(0),
    doctorAddress: vine.string().regex(/(?:0x)?[\da-f]+/i),
    content: vine.string(),
  })
)
