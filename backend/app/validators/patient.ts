import vine from '@vinejs/vine'


export const createPatientValidator = vine.compile(
  vine.object({
    id: vine.string().regex(/(?:0x)?[\da-f]+/i),
    name: vine.string(),
    birthdate: vine.string(),
    gender: vine.string(),
    city: vine.string(),
    diagnosis: vine.string(),
  })
)

