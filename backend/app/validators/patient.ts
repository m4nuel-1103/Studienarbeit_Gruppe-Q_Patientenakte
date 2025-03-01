import vine from '@vinejs/vine'


export const createPatientValidator = vine.compile(
  vine.object({
    id: vine.string().fixedLength(32).regex(/[\da-fA-F]{32}/),
    name: vine.string(),
    birthdate: vine.string(),
    gender: vine.string(),
    city: vine.string(),
    diagnosis: vine.string(),
  })
)

