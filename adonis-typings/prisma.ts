declare module '@ioc:Adonis/Addons/Prisma' {
  import { PrismaClient } from '@prisma/client'

  const prisma: PrismaClient
  export default prisma
}
