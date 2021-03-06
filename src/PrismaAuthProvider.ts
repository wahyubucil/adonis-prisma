import type { HashContract } from '@ioc:Adonis/Core/Hash'
import type { ProviderUserContract } from '@ioc:Adonis/Addons/Auth'
import type {
  PrismaAuthBaseUser,
  PrismaAuthProviderConfig,
  PrismaAuthProviderContract,
} from '@ioc:Adonis/Addons/Prisma'
import type { PrismaClient } from '@prisma/client'

/**
 * Provider user works as a bridge between your User provider and
 * the AdonisJS auth module.
 */
class ProviderUser<User extends PrismaAuthBaseUser> implements ProviderUserContract<User> {
  constructor(
    public user: User | null,
    private config: PrismaAuthProviderConfig<User>,
    private hash: HashContract
  ) {}

  public getId() {
    return this.user ? this.user[this.config.identifierKey] : null
  }

  public getRememberMeToken() {
    return this.user ? this.user.rememberMeToken || null : null
  }

  public setRememberMeToken(token: string) {
    if (!this.user) {
      throw new Error('Cannot set "rememberMeToken" on non-existing user')
    }
    this.user.rememberMeToken = token
  }

  public async verifyPassword(plainPassword: string) {
    if (!this.user) {
      throw new Error('Cannot "verifyPassword" for non-existing user')
    }

    if (!this.user.password) {
      throw new Error('Auth user object must have a password in order to call "verifyPassword"')
    }

    const hasher = this.config.hashDriver ? this.hash.use(this.config.hashDriver) : this.hash
    return hasher.verify(this.user.password, plainPassword)
  }
}

/**
 * The User provider implementation to lookup a user for different operations
 */
export class PrismaAuthProvider<User extends PrismaAuthBaseUser>
  implements PrismaAuthProviderContract<User>
{
  constructor(
    private config: PrismaAuthProviderConfig<User>,
    private hash: HashContract,
    private prisma: PrismaClient
  ) {}

  public async getUserFor(user: User | null) {
    return new ProviderUser(user, this.config, this.hash)
  }

  public async updateRememberMeToken(user: ProviderUser<User>) {
    await (this.prisma[this.config.model] as any).update({
      where: {
        [this.config.identifierKey]: user.getId(),
      },
      data: {
        rememberMeToken: user.getRememberMeToken(),
      },
    })
  }

  public async findById(id: string | number) {
    const user = await (this.prisma[this.config.model] as any).findUnique({
      where: { [this.config.identifierKey]: id },
    })
    return this.getUserFor(user)
  }

  public async findByUid(uidValue: string) {
    const orStatements = this.config.uids.map((field) => ({
      [field]: uidValue,
    }))
    const user = await (this.prisma[this.config.model] as any).findFirst({
      where: {
        OR: orStatements,
      },
    })
    return this.getUserFor(user)
  }

  public async findByRememberMeToken(userId: string | number, token: string) {
    const user = await (this.prisma[this.config.model] as any).findFirst({
      where: {
        [this.config.identifierKey]: userId,
        rememberMeToken: token,
      },
    })
    return this.getUserFor(user)
  }
}
