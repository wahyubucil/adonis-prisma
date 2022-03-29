import { BaseCommand } from '@adonisjs/core/build/standalone'
import type { PrismaSeederFile, PrismaSeederStatus } from '@ioc:Adonis/Addons/Prisma'

export default class PrismaSeederRun extends BaseCommand {
  public static commandName = 'prisma-seeder:run'
  public static description = 'Execute Prisma seeders'
  public static settings = {
    loadApp: true,
  }

  /**
   * Print log message to the console
   */
  private printLogMessage(file: PrismaSeederStatus) {
    const colors = this.colors

    let color: keyof typeof colors = 'gray'
    let message: string = ''
    let prefix: string = ''

    switch (file.status) {
      case 'pending':
        message = 'pending  '
        color = 'gray'
        break
      case 'failed':
        message = 'error    '
        prefix = file.error!.message
        color = 'red'
        break
      case 'ignored':
        message = 'ignored  '
        prefix = 'Enabled only in development environment'
        color = 'dim'
        break
      case 'completed':
        message = 'completed'
        color = 'green'
        break
    }

    console.log(`${colors[color]('❯')} ${colors[color](message)} ${file.file.name}`)
    if (prefix) {
      console.log(`  ${colors[color](prefix)}`)
    }
  }

  public async run() {
    const { SeedsRunner } = await import('../src/SeedsRunner')
    const seeder = new SeedsRunner(this.application)

    let files: PrismaSeederFile[]
    try {
      files = seeder.getList()
    } catch (error) {
      this.logger.error(error)
      this.exitCode = 1
      return
    }

    let hasError = false

    for (let file of files) {
      const response = await seeder.run(file)
      if (response.status === 'failed') {
        hasError = true
      }
      this.printLogMessage(response)
    }

    this.exitCode = hasError ? 1 : 0
  }
}
