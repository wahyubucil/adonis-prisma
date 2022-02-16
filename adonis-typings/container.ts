declare module '@ioc:Adonis/Core/Application' {
  import type { PrismaClient } from '@prisma/client'

  export interface ContainerBindings {
    'Adonis/Addons/Prisma': PrismaClient
  }
}
