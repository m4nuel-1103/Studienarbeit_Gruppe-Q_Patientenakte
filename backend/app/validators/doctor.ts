import vine from '@vinejs/vine'

export const createDoctorValidator = vine.compile(
  vine.object({
    id: vine.string().fixedLength(32).regex(/[\da-fA-F]{32}/),
    name: vine.string(),
  })
)
