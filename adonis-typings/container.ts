declare module '@ioc:Adonis/Core/Application' {
  import adonisPrisma from '@ioc:Adonis/Addons/Prisma'

  export interface ContainerBindings {
    'Adonis/Addons/Prisma': typeof adonisPrisma
  }
}
