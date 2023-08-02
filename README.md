A command line tool for Parse Server ([Parse Platform](https://parseplatform.org/)) 
to help you create migrations and seeders for Parse Server.

## Introduction

Migrations are like Git for your database. Use **migrations** to keep tracks of database changes.

Have you ever had an error and the problem is caused by latest software version required new field or
new collections (table)?

Migrations solved it by keeping everyone has same database structure.

This `parse-dbtool` is a command line tool that can help you to create migrations for any instance of 
Parse Server. So, the knowledge of parse-server is required.

The migration files is using [Parse.Schema](https://docs.parseplatform.org/js/guide/#schema).

Parse server by default is not strict. You can send schema with new field or new collection, parse-server will
add it without warning.

But certain system is needed to be strict, they cannot allow anyone to edit database.
For that, parse-server has option `allowClientClassCreation` that can be set to false to prevent anyone to create new collection.
Every class in parse-server has Class Level Protection (CLP) has `addField` option that when set to false,
will prevent anyone to add new field.

Migrations can help all developers on the same page of the database structure.
Having strict parse-server is also good for maintenance and security.

> Before you continue, I would like to give a warning.
> 
> This tool, or any other migration tool like `Laravel > Migration` & `Sequelize-cli migration`
> will make a change your database structure and also the data.
> So, **be careful**. Backup your database.
>
> For me, I use migrations & seeding on development and testing a lot.
> But, for production, I will be seriously careful.

## Usage

You can just use it with `npx` command

```
npx parse-dbtool --help
```

## Setup folders structure so that you can start using `parse-dbtool`

Start using parse-dbtool by initialize folder structure.

```
npx parse-dbtool init
```

This will create following folders:

- `databases\migrations` - contains all migration files
- `databases\seeders` - contains all seed files

## Connecting to parse-server

The `parse-dbtool` is a standalone software. You can create a new repo just to store only migrations and seeders.
But it is **HIGHLY RECOMMEND**, that you use this inside your parse-sever source code.

Let said, you already have migration files and you want to run the migration.
On which parse-server should it run?

So, you need to tell `parse-dbtool` the parse-server: `APPLICATION_ID`, `SERVER_URL` and `MASTER_KEY`.

How? Use those as environment.

```
APPLICATION_ID=<parse-server-appId> SERVER_URL=<parse-server-serverURL> MASTER_KEY=<parse-server-masterKey> npx parse-dbtool migrate
```

To make it easier, you should use `.env` file. The `parse-dbtool` will read `.env` to get environment data.

If you store `parse-dbtool` generated files inside your parse-server source code,
running `parse-dbtool` will always use the same configuration as your parse-server environment.

```
npx parse-dbtool migrate
```

Doesn't it look cleaner, compared to before. All the enviroment is stored in `.env` file.

You can also specified custom `.env.*` file. The following command will read `.env.test` instead of default `.env`.

```
ENV_FILE='.env.test' npx parse-dbtool migrate
```

## Generating migrations

All your migration files will be stored inside in `databases/migrations/` directory.

Run `migration:make` command to create a database migration.

```
npx parse-dbtool migration:make create_pet
```

This will create a migration file named `XXXXXXXXXXXXXX-create_pet.js`. 
Then, you have to modify the migration file todo what you want.

The `parse-dbtool` will created pre-fill migration file. When you start with keyword `create`, the migration file
will be pre-fill with template to create new schema.

Migration file use `Parse.Schema` to create or modify your parse-server data. 
So, refer [Parse JS SDK official documentation](https://docs.parseplatform.org/js/guide/#schema)
to know how to write migration file content.

## Migration file structure

After migration file created. You must write your migration code.
Refer [Parse JS SDK official documentation on Schema section](https://docs.parseplatform.org/js/guide/#schema)
to know how to write the migration code.

A migration file contains 2 functions, `up` and `down`. 

The `up` function is used to run the migration you want,
while the `down` function should reverse what happen in `up` function.

For example, the following migration will create a `Pet` class with fields 
`name`, `photoUrl`, `objectId`, `createdAt`, `updatedAt` and `ACL`  in parse-server.

Some fields such as `objectId`, `createdAt`, `updatedAt`  and `ACL` are automatically created by parse-server.

```javascript
exports.up = async (Parse) => {
  const className = 'Pet';
  const schema = new Parse.Schema(className);

  schema
    .addString('name')
    .addString('photoUrl');

  return schema.save();
};

exports.down = async (Parse) => {
  const className = 'Pet';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};

```

Both `up` & `down` must be written by you. Those are not automatically generated.

If you do not write correct `down` function that revert what is run on `up` function, 
running `migration:undo` will not working as expected.

For example, your `up` function is creating new Pet class but `down` is not doing anything.

```javascript
exports.up = async (Parse) => {
  const className = 'Pet';
  const schema = new Parse.Schema(className);

  schema
    .addString('name')
    .addString('photoUrl');

  return schema.save();
};

exports.down = async (Parse) => {
  return ;
};
```

When running `migration:undo`, nothing will happen. Your Pet class created in migration before, will
stay in your database.

> **You are responsible to write the `down` function that correctly revert written `up` function**

### Migration file name extension

Since version 1.0.8, `parse-dbtool` will automatically read your project `package.json` file.
When you are using `type: "module"`, it will automatically make migration/seeder file with `.cjs` extension.
Because `parse-dbtool` not using ESM module, you will need to set `.cjs` extension when developing on ESM project.

But, you can always override this behaviour, by using environment `PDBT_FILE_EXT`. For example, `PDBT_FILE_EXT='.js'`

## Running migration

Once you have write your migration code, you can run it. The `parse-dbtool` will run all your outstanding migrations.

```
npx parse-dbtool migrate
```

The command above will run all available migrations that had not run yet.
You can see your migrations status using the following command:

```
npx parse-dbtool migration:status
```

Migration with status `up` means already run, and it is recorded in same databases under `Migration` classname.

## Undo migration

Cancel your previous migration with `migration:undo` command. The following command will undo last one step of migration.

```
npx parse-dbtool migration:undo
```

The `migration:undo` accepts how many step back you want to undo. 

```
npx parse-dbtool migration:undo 3
npx parse-dbtool migration:undo --step=3
```

Will revert the last third migrations.

If you want to undo all migrations, just pass step more than migrations you have run.

```
npx parse-dbtool migration:undo 9999
```

Will revert the last 9999th migrations. If you have less than 9999 migrations, this will revert all the migrations.

## Seeder

You can insert data to your database by using seeder.

For example, our system might default type of pets. Seeder can be used to pre-fill types of pets data.

Seeder can also be use to seed test data.

## Generating seeder

Create seeder file. 

```
npx parse-dbtool seed:make seed_pets
```

The command above will create a file named `XXXXXXXXXXXXXX-seed_pets.js` inside `databases/seeder` directory.
The file will contain example code to seed data.

You should delete the code and write your own seeder.

The `parse-dbtool` is a tool to manage your migrations and seeder file. At the back, `parse-dbtool` will
use official Parse JS SDK to run your code.

Inside created file, you will find the code is creating Parse.Object and save all.

## Seeder file structure

```
npx parse-dbtool seed:make seed_users
```

This command will create `databases/seeder/XXXXXXXXXXXXXX-seed_users.js`. It will pre-fil with example seeder like below:

```javascript
/**
 *
 * @param {Parse} Parse
 */
exports.run = async (Parse) => {
  /**
    * Example:
    *
    * Seed pets
    */

  const tom = new Parse.Object('Pet');
  tom.set('name', 'Tom');
  tom.set('photoUrl', 'https://placekitten.com/200/300');

  const angela = new Parse.Object('Pet');
  angela.set('name', 'angela');
  angela.set('photoUrl', 'https://placekitten.com/300/300');

  const pets = [tom, angela];

  return Parse.Object.saveAll(pets, { useMasterKey: true });
};
```

You should delete those code, then wrote your own. The file will contain `run` function that will be run when
you run `seed` command.

As you can see, the code is how you create `Parse.Object` and save it to parse-server using Parse JS SDK.

Because, `parse-dbtool` is just a runner and management tool for your migrations file and seeder.

## Running seeder

The following command will run all seed files.

```
npx parse-dbtool seed
```

## Helper command

Run `parse-dbtool helper --help` for more detail.

### Get current schema from server.

**Use case.** When you want to create migration and change Parse.Classname Class Level Permission (CLP),
you will need to see the current CLP. So that, in migration down, you can revert it back to current status.

```bash
$ parse-dbtool helper getSchema _User

# Will print detail as below

# Parse DBTool v1.1.0 - Parse server tool for data migration and seeding.
#
# {
#   className: '_User',
#   fields: {
#     objectId: { type: 'String' },
#     createdAt: { type: 'Date' },
#     updatedAt: { type: 'Date' },
#     ACL: { type: 'ACL' },
#     username: { type: 'String' },
#     password: { type: 'String' },
#     email: { type: 'String' },
#     emailVerified: { type: 'Boolean' },
#     authData: { type: 'Object' }
#   },
#   classLevelPermissions: {
#     find: { '*': true },
#     get: { '*': true },
#     create: { '*': true },
#     update: { '*': true },
#     delete: { '*': true },
#     addField: { '*': true }
#   },
#   indexes: {
#     _id_: { _id: 1 },
#     username_1: { username: 1 },
#     email_1: { email: 1 }
#   }
# }

```

## Contribution

Always welcome for contribution.
