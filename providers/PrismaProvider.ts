import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { PrismaClient } from '@prisma/client'

/**
 * Registers Prisma with the IoC container
 */
export default class PrismaProvider {
  constructor(protected app: ApplicationContract) {}

  /**
   * Registering binding to the container
   */
  public register() {
    this.app.container.singleton('Adonis/Addons/Prisma', () => {
      return new PrismaClient()
    })
  }

  /**
   * Disconnect Prisma on app shutdown
   */
  public async shutdown() {
    const prisma = this.app.container.resolveBinding('Adonis/Addons/Prisma')
    await prisma.$disconnect()
  }
}
