import vine from '@vinejs/vine'

export const createDocumentValidator = vine.compile(
  vine.object({
    id: vine.number().decimal(0).optional(),
    patientAddress: vine.string().regex(/(?:0x)?[\da-f]+/i),
    name: vine.string(),
    content: vine.string(),
  })
)
