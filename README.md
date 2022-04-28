# Adonis Prisma

> Prisma Provider for AdonisJS

[![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

If you want to use [Prisma](https://prisma.io) on AdonisJS, this package provides you with Prisma Client Provider and Auth Provider.

## Getting Started

### Installation

Make sure you've already installed Prisma related packages:

```sh
npm i --save-dev prisma && npm i @prisma/client
```

Install this package:

```sh
npm i @wahyubucil/adonis-prisma
```

### Setup

```sh
node ace configure @wahyubucil/adonis-prisma
```

It will install the provider, and add typings.

## Usage

### Prisma Client Provider

Import the Prisma Client from `@ioc:Adonis/Addons/Prisma`. For example:

```ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { prisma } from '@ioc:Adonis/Addons/Prisma'

export default class UsersController {
  public async index({}: HttpContextContract) {
    const users = await prisma.user.findMany()
    return users
  }
}
```

### Authentication (Prisma Auth Provider)

Install and configure Adonis Auth first:

```sh
npm i @adonisjs/auth
node ace configure @adonisjs/auth
```

When configuring Adonis Auth, you'll be asked some questions related to the provider. Because we're not using the default provider, answer the following questions like these so we can complete the configuration:

```
❯ Select provider for finding users · database
...
❯ Enter the database table name to look up users · users
❯ Create migration for the users table? (y/N) · false
...
```

Other questions like `guard`, `storing API tokens`, etc, are based on your preference.

After configuring the Adonis Auth, you need to config Prisma Auth Provider. Here's the example.

First, define the schema. Example `schema.prisma`:

```prisma
// prisma/schema.prisma

...

model User {
  id              String  @id @default(cuid())
  email           String  @unique
  password        String
  rememberMeToken String?
  name            String
}

...
```

**IMPORTANT**: You need to define `password` and `rememberMeToken` fields like that because those fields are required.

After configuring the schema, you need to config Prisma Auth Provider on `contracts/auth.ts` and `config/auth.ts`. For example:

```ts
// contracts/auth.ts
import { PrismaAuthProviderContract, PrismaAuthProviderConfig } from '@ioc:Adonis/Addons/Prisma'
import { User } from '@prisma/client'

declare module '@ioc:Adonis/Addons/Auth' {
  interface ProvidersList {
    user: {
      implementation: PrismaAuthProviderContract<User>
      config: PrismaAuthProviderConfig<User>
    }
  }

  ......
}
```

```ts
// config/auth.ts
import { AuthConfig } from '@ioc:Adonis/Addons/Auth'

const authConfig: AuthConfig = {
  guard: 'api',

  guards: {
    api: {
      driver: 'oat',
      provider: {
        driver: 'prisma',
        identifierKey: 'id',
        uids: ['email'],
        model: 'user',
      },
    },
  },
}

export default authConfig
```

Then, you're ready to go!

The rest usage is the same as other providers. You can refer to the [AdonisJS Authentication guide](https://docs.adonisjs.com/guides/auth/introduction) about the implementation.

#### Configuration options

Following is the list of all the available configuration options.

```ts
{
  provider: {
    driver: 'prisma',
    identifierKey: 'id',
    uids: ['email'],
    model: 'user',
    hashDriver: 'argon',
  }
}
```

##### driver

The driver name must always be set to `prisma`.

---

##### identifierKey

The `identifierKey` is usually the primary key on the configured model. The authentication package needs it to uniquely identify a user.

---

##### uids

An array of model columns to use for the user lookup. The `auth.login` method uses the `uids` to find a user by the provided value.

For example: If your application allows login with email and username both, then you must define them as `uids`. Also, you need to define the model column names and not the database column names.

---

##### model

The model to use for user lookup.

---

##### hashDriver (optional)

The driver to use for verifying the user password hash. It is used by the `auth.login` method. If not defined, we will use the default hash driver from the `config/hash.ts` file.

---

### Seeder (Prisma Seeder)

Init Prisma Seeder first with the following Ace command:

```sh
node ace prisma-seeder:init
```

It will create a file `prisma/seeders/index.ts` to define all of the seeders later.

You can create a new seeder file by running the following Ace command:

```sh
node ace prisma-seeder:make User
```

It will create a file `prisma/seeders/User.ts`.

Every seeder file must extend the `PrismaSeederBase` class and implement the `run` method. Here's an example implementation:

```ts
// prisma/seeders/User.ts

import { prisma, PrismaSeederBase } from '@ioc:Adonis/Addons/Prisma'

export default class UserSeeder extends PrismaSeederBase {
  public static developmentOnly = false

  public async run() {
    await prisma.user.upsert({
      where: {
        email: 'viola@prisma.io',
      },
      update: {
        name: 'Viola the Magnificent',
      },
      create: {
        email: 'viola@prisma.io',
        name: 'Viola the Magnificent',
      },
    })

    await prisma.user.createMany({
      data: [
        { name: 'Bob', email: 'bob@prisma.io' },
        { name: 'Bobo', email: 'bob@prisma.io' },
        { name: 'Yewande', email: 'yewande@prisma.io' },
        { name: 'Angelique', email: 'angelique@prisma.io' },
      ],
      skipDuplicates: true,
    })
  }
}
```

After creating a seeder, add the file name to `prisma/seeders/index.ts`. That file is useful to arrange the execution order of all seeders. For example:

```ts
// prisma/seeders/index.ts

/**
 * Put all seeders filename here. It will be executed based on the order
 */
export default ['User', 'Category', 'Article']
```

#### Running seeders

Before running seeders, make sure you've already config `prisma/seeders/index.ts` because the execution order will be based on that file.

To run seeders, just run the following ace command:

```sh
node ace prisma-seeder:run
```

#### Development only seeders

You can mark a seeder file as development only. This ensures that you don't seed your production database with dummy data by mistake. Seeders for development will only run when the `NODE_ENV` environment variable is set to `development`.

You can create a development only seeder with `--dev` as the argument. For example:

```sh
node ace prisma-seeder:make User --dev
```

Or, if you want to make an existing seeder to development only, just change `developmentOnly` property to `true` on the implementation. For example:

```ts
import { prisma, PrismaSeederBase } from '@ioc:Adonis/Addons/Prisma'

export default class UserSeeder extends PrismaSeederBase {
  public static developmentOnly = true // <-- change this

  public async run() {
    // Write your database queries inside the run method
  }
}
```

---

<div align="center">
  <sub>Built with ❤︎ by <a href="https://twitter.com/wahyubucil">Wahyu "The GOAT" Bucil</a>
</div>

[npm-image]: https://img.shields.io/npm/v/@wahyubucil/adonis-prisma.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@wahyubucil/adonis-prisma 'npm'
[license-image]: https://img.shields.io/npm/l/@wahyubucil/adonis-prisma?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md 'license'
[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]: "typescript"
