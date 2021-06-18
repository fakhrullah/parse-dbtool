> This is **Work in progress**. We can use it to create migration files and run migration.
> But migrations is not record in database, so there will be problem to undo migration.

> For now, we can only use it to run all migration on empty database and undo all migrations.

This is command line tool for Parse Server ([Parse Platform](https://parseplatform.org/)) 
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

But certain system is much strict, they cannot allow anyone to edit database. For that, parse-server
has option `allowClientClassCreation` that can be set to false to prevent anyone to create new collection.
Every class in parse-server has Class Level Protection (CLP) has `addField` option that when set to false,
will prevent anyone to add new field.

Migrations can help all developers on the same page of the database structure. Having strict parse-server
is also good for maintenance and security.

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
But it is **HARDLY RECOMMEND** that you use this inside your parse-sever source code.

Let said, you already have migration files and you want to run the migration. On which parse-server should
it run? So, you need to tell `parse-dbtool` the parse-server: `APPLICATION_ID`, `SERVER_URL` and `MASTER_KEY`.

How? Use those as environment.

```
APPLICATION_ID=<parse-server-appId> SERVER_URL=<parse-server-serverURL> MASTER_KEY=<parse-server-masterKey> npx parse-dbtool migrate
```

We are **HIGHLY RECOMMEND** you, to use `.env` file as suggested in The Twelve-Factor App (Rule no. 3).
By default, `parse-dbtool` will read `.env` to get environment data.

If you are following our recommendation, to store `parse-dbtool` generated files inside your parse-server source code,
running `parse-dbtool` will always use the same configuration as your parse-server environment.

```
npx parse-dbtool migrate
```

Doesn't it look cleaner, compared to before. All the enviroment is stored in `.env` file.

## Generating migrations

All your migration files will be stored inside in `databases/migrations/` directory.

Run `migration:make` command to create a database migration.

```
npx parse-dbtool migration:make create_pet
```

This will create a migration file named `XXXXXXXXXXXXXX-create_pet.js`. 
Then, you have to modify the migration file todo what you want.

The `parse-dbtool` will created pre-fill migration file. When you start with keyword `create`, the migration file
will be pre-fill with Parse.Schema function to create new schema.

Migration file use Parse.Schema to create or modify your parse-server data. 
So, refer [Parse JS SDK official documentation & API](https://docs.parseplatform.org/js/guide/#schema)
to know how to write migration file content.

For example, to modify already created Parse Object:

```
npx parse-dbtool migration:make add_firstname_lastname_field_to_user_schema
npx parse-dbtool migration:make prevent_add_field_to_pet_schema
```

## Migration file structure



## Running migration

## Undo migration

## Seeder

what is seeder

## Generating seeder

## Seeder file structure

## Running seeder
