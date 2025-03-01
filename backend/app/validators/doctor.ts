import vine from '@vinejs/vine'

export const createDoctorValidator = vine.compile(
  vine.object({
    id: vine.string().regex(/(?:0x)?[\da-f]+/i),
    name: vine.string(),
  })
)
