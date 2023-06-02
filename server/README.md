# Development

#### Environment variables

1. copy `.env-example` to `.env`
2. fill `.env` with real api keys and other environment variables

#### Creating models / migrations

1. Start server container with interactive shell: `docker-compose run -u node server /bin/bash`
2. use [sequelize](http://docs.sequelizejs.com/manual/tutorial/migrations.html#creating-first-model-and-migration-): `./node_modules/.bin/sequelize model:generate --name User --attributes ...`
   , or `sequelize migration:generate --name <migration_name>`
3. exit the docker container `exit`

#### Migrations Management

1. Start server container with interactive shell: `docker-compose run -u node server /bin/bash`
2. `NODE_PATH=. node bin/migrate.js <command>`

   - **status**: print current migration status
   - **up** || **migrate**: executed all unexecuted migrations
   - **down** || **reset**: revert all executed migrations
   - **next** || **migrate-next**: execute the next pending migration
   - **prev** || **reset-prev**: revert the previous executed migration
   - **reset-hard**: reset the database using a dropdb/createdb postgres command

3. exit the docker container `exit`

#### Troubleshooting

If server container faces issues with server _.env folder_ , try deleting it from inside the VM before run `docker-compose up`
or just **rebuild** the container:

```bash
docker-compose up  --build --force-recreate server
```
