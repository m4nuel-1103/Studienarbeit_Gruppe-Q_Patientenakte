import vine from '@vinejs/vine'

export const createDocumentValidator = vine.compile(
  vine.object({
    id: vine.number().decimal(0).nullable(),
    patientAddress: vine.string().fixedLength(32).regex(/[\da-fA-F]{32}/),
    name: vine.string(),
    content: vine.string(),
  })
)
