# agri-dealer

## Setup

1. Install Docker from https://docs.docker.com/compose/install/ . Make sure it's running on your machine (it shows up as a whale on the top right info bar on the desktop)

2. Do:

```bash
git clone git@github.com:fridgerator/agri-dealer.git
```

3. Download the 2 json files I sent you on slack and put copies of them in `/server/src`

4. In Terminal go to the root folder of the git repo and type in:

```bash
docker-compose build
```

That will install all the dependencies. First time around it will take a bit of time.

5. In that same root place type in:

```bash
docker-compose up
```

6. Open a new tab in Terminal (it should open up the same root folder location by default, if not navigate to that) and type in the following:

```bash
docker-compose run server /bin/bash
```

After that type in:

```bash
node src/seed.js
```

In that new tab you can type in exit after it installs those seed files

## import DB

psql -U postgres -d agri_dealer -f filename.sql -h localhost

## Running Tests

```bash
docker-compose run frontend /bin/bash -c "yarn run test"
```

## Deployment

Please follow the steps in
https://github.com/fridgerator/agri-dealer/wiki/Deployment

## Troubleshooting

If new libs added on package.json don't get imported or installed in the container:

```bash
docker-compose build <service>
```

**< service > : frontend || server**

### Material UI docs

[V1 Documentation](https://v1.material-ui.com/)

### Building and testing CRA with PWA

To run the app with the service worker, you will need to build the app in production mode.

1. Edit the docker-compose.yml file and change front-end command to `yarn start:prod`

2. Run `docker-compose up`

3. Navigating to localhost should register the service-worker and allow the app to be ran without a connection

(jay)
i have written some code which is temparary to make functionality work if you want to find those places then

search in code globally --> temp code here
go throw each file you will get something like this
const mapObj = { C: "CORN", B: "SOYBEAN", S: "SORGHUM", A: "ALFALFA", L: "CANOLA" };

as per my suggestion we have to setup it in environment file

this will give you all the files containing this comment

`truncate public."ApiSeedCompanies" cascade; truncate public."MonsantoProducts" cascade; truncate public."MonsantoProductLineItems" cascade; truncate public."MonsantoPriceSheets" cascade; truncate public."Customers" cascade; truncate public."MonsantoRetailerOrderSummaries" cascade; truncate public."MonsantoRetailerOrderSummaryProducts" cascade; truncate public."CustomerMonsantoProducts" cascade; truncate public."MonsantoProductBookingSummaryProducts" cascade; `

triggering jenkins build 4
