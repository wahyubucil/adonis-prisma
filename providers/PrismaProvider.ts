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
   * Extend Adonis Auth with Prisma Auth Provider
   */
  public async boot() {
    const Auth = this.app.container.resolveBinding('Adonis/Addons/Auth')
    const Hash = this.app.container.resolveBinding('Adonis/Core/Hash')
    const Prisma = this.app.container.resolveBinding('Adonis/Addons/Prisma')

    const { PrismaAuthProvider } = await import('../src/PrismaAuthProvider')

    Auth.extend('provider', 'prisma', (_, __, config) => {
      return new PrismaAuthProvider(config, Hash, Prisma)
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
