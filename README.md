# create-srfn-app

This project is an app generator to create a new app using the [SRFNStack](https://github.com/SRFNStack)

## Pre-requisites
Install a recent version of node (node 14+)

Install docker and ensure docker-compose is usable on the command line.

## Getting started
Execute the app generator by running
```shell
npx create-srfn-app
```

Answer the prompts to generate your application.

After running the command, you will have a new folder based on the app name that contains a fully initialized SRFN app.

Cd into this new directory and run `npm install` to download all the dependencies. The app will not start until this is done.

After starting the test database and app using `npm run start`, you can create a new user by running `npm run createUser`. This will connect to the database started by docker-compose by default.

After creating a user, navigate to [http://localhost:10420](http://localhost:10420)
to access your new application and log in with the user you created.

### What is where
Everything under www is publicly accessible. Be careful about what code you put in that directory as it will be accessible
via http, including all static files. 

Server side code lives in the ./lib directory. This includes all of the database access code.

The app uses a RESTful pattern for interacting with the api. All api code is under ./www/api

The rest of the files under ./www are front end related. The files under ./www/ui are the front end routes.
fntags is configured for directory based routing already. To add a new route, make a new file in ./www/ui. Sub folders become
part of the route path, and you can add an index.js file to any folder that will be accessible at the folder path. I.e. ./www/ui/foo/index.js will be accessible at http://localhost:10420/foo/ path in the browser.

Partial elements (i.e. components) live under ./www/part and are meant to be reused throughout the app.

Front end functionality (i.e. auth logic, api wrappers, etc) live under ./www/fn.

You can re-use your front end code in your backend by importing the modules into your route handler. 

### Configuration
The application loads it's environment configuration from $HOME/.$appName.env. This file is created for you with default values
when you create the application.

If using JWT auth, you should set JWT_SECRET and JWT_ISSUER to appropriate values when deploying your application in your various environments.

The app uses ardb, a redis compatible database built on rocks db. You can also use redis with no changes to the app.
The advantage of ardb is that it stores everything on disk and is not limited to the amount of memory available on the machine.
If using redis, you must have enough memory to store all the data in your database in memory.

To change the database host, set the ARDB_SERVICE_HOST environment variable.

No authentication is configured for the database by default, and it's recommended that you set it up in your production environment.
