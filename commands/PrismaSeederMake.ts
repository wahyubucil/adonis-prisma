import { join } from 'path'
import { args, BaseCommand, flags } from '@adonisjs/core/build/standalone'

export default class PrismaSeederMake extends BaseCommand {
  public static commandName = 'prisma-seeder:make'
  public static description = 'Make a new Prisma Seeder file'

  @args.string({ description: 'Name of the seeder class' })
  public name: string

  @flags.boolean({ description: 'Create seeder for development only' })
  public dev: boolean

  public async run() {
    const stub = join(__dirname, '..', 'templates', 'seeder.txt')

    this.generator
      .addFile(this.name, { pattern: 'pascalcase', form: 'singular' })
      .stub(stub)
      .destinationDir('prisma/seeders')
      .useMustache()
      .appRoot(this.application.cliCwd || this.application.appRoot)
      .apply({ developmentOnly: Boolean(this.dev) })

    await this.generator.run()
  }
}
