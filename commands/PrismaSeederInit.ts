import { join } from 'path'
import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class PrismaSeederInit extends BaseCommand {
  public static commandName = 'prisma-seeder:init'
  public static description = 'Init Prisma Seeder'

  public async run() {
    const stub = join(__dirname, '..', 'templates', 'seed-index.txt')

    this.generator
      .addFile('seed')
      .stub(stub)
      .destinationDir('prisma')
      .useMustache()
      .appRoot(this.application.cliCwd || this.application.appRoot)

    await this.generator.run()
  }
}
