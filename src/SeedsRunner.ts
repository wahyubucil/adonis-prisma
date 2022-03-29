import { join } from 'path'
import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import type {
  PrismaSeederConstructorContract,
  PrismaSeederFile,
  PrismaSeederStatus,
} from '@ioc:Adonis/Addons/Prisma'
import { esmRequire } from '@poppinss/utils'

export class SeedsRunner {
  constructor(private app: ApplicationContract) {}

  /**
   * Returns an array of seeders
   */
  public getList() {
    const prismaSeedersDirPath = join(this.app.appRoot, 'prisma/seeders')

    let nameList: string[]
    try {
      const indexFilePath = join(prismaSeedersDirPath, 'index')
      nameList = esmRequire(indexFilePath)
    } catch (_) {
      throw new Error("The index seed file doesn't exist, please run `node ace prisma-seeder:init`")
    }

    if (!Array.isArray(nameList) || nameList.some((e) => typeof e !== 'string')) {
      throw new Error('The index seed file should export an array of string')
    }

    const files: PrismaSeederFile[] = nameList.map((name) => {
      const absPath = join(prismaSeedersDirPath, name)
      const getSource = () => esmRequire(absPath)

      return {
        absPath,
        name,
        getSource,
      }
    })

    return files
  }

  /**
   * Returns the seeder source by ensuring value is a class constructor
   */
  private getSeederSource(file: PrismaSeederFile) {
    const source = file.getSource()
    if (typeof source === 'function') {
      return source as PrismaSeederConstructorContract
    }

    throw new Error(`Invalid schema class exported by "${file.name}"`)
  }

  public async run(file: PrismaSeederFile) {
    const Source = this.getSeederSource(file)

    const seeder: PrismaSeederStatus = {
      status: 'pending',
      file: file,
    }

    /**
     * Ignore when running in non-development environment and seeder is development
     * only
     */
    if (Source.developmentOnly && !this.app.inDev) {
      seeder.status = 'ignored'
      return seeder
    }

    try {
      const seederInstance = new Source()
      if (typeof seederInstance.run !== 'function') {
        throw new Error(`Missing method "run" on "${seeder.file.name}" seeder`)
      }

      await seederInstance.run()
      seeder.status = 'completed'
    } catch (error) {
      seeder.status = 'failed'
      seeder.error = error
    }

    return seeder
  }
}
