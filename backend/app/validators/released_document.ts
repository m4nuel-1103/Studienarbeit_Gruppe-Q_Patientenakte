import vine from '@vinejs/vine'

export const createReleasedDocumentValidator = vine.compile(
  vine.object({
    id: vine.number().decimal(0).nullable(),
    documentId: vine.number().decimal(0),
    doctorAddress: vine.string().fixedLength(32).regex(/[\da-fA-F]{32}/),
    content: vine.string(),
  })
)
