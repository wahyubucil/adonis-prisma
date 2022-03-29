declare module '@ioc:Adonis/Addons/Prisma' {
  import type { UserProviderContract } from '@ioc:Adonis/Addons/Auth'
  import type { HashersList } from '@ioc:Adonis/Core/Hash'

  // @ts-ignore `Prisma` need to generated first, so we ignore the error
  import type { PrismaClient, Prisma } from '@prisma/client'

  /** PRISMA AUTH **/

  /**
   * Shape of the extended property of user object for PrismaProvider
   */
  export type PrismaAuthBaseUser = {
    password: string
    rememberMeToken: string | null
  }

  /**
   * The shape of configuration accepted by the PrismaAuth.
   */
  export type PrismaAuthProviderConfig<User extends PrismaAuthBaseUser> = {
    driver: 'prisma'
    identifierKey: string
    uids: (keyof Omit<User, keyof PrismaAuthBaseUser>)[]
    model: Lowercase<Prisma.ModelName>
    hashDriver?: keyof HashersList
  }

  /**
   * Prisma Auth Provider
   */
  export interface PrismaAuthProviderContract<User extends PrismaAuthBaseUser>
    extends UserProviderContract<User> {}

  /** PRISMA SEEDER **/

  /**
   * Prisma Seeder file node
   */
  export interface PrismaSeederFile {
    absPath: string
    name: string
    getSource: () => unknown
  }

  /**
   * Shape of file node returned by the run method
   */
  export type PrismaSeederStatus = {
    status: 'pending' | 'completed' | 'failed' | 'ignored'
    error?: any
    file: PrismaSeederFile
  }

  /**
   * Shape of seeder class
   */
  export type PrismaSeederConstructorContract = {
    developmentOnly: boolean
    new (): {
      run(): Promise<void>
    }
  }

  export const PrismaSeederBase: PrismaSeederConstructorContract

  /** PRISMA CLIENT PROVIDER **/

  const prisma: PrismaClient
  export default prisma
}
