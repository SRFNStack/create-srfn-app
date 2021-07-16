#!/usr/bin/env node
const path = require( 'path' );
const { runner } = require( 'hygen' );
const Logger = require( 'hygen/lib/logger' );
const defaultTemplates = path.resolve( __dirname, 'templates' );
const { exec } = require( 'child_process' )
const { prompt } = require( 'enquirer' )

async function run() {


    const config = await prompt( [
        {
            type: 'input',
            name: 'appName',
            message: "Enter your new app's name:"
        },
        {
            type: 'confirm',
            default: false,
            name: 'userApiEnabled',
            message: "Enable UserApi?"
        },
        {
            type: 'confirm',
            name: 'authEnabled',
            default: false,
            message: "Enable auth?"
        },

    ] )

    if( config.authEnabled ) {
        Object.assign( config, await prompt( [
                {
                    type: 'confirm',
                    name: 'googleAuthEnabled',
                    default: false,
                    message: "Enable Google Auth"
                }
            ] )
        )
    } else {
        config.googleAuthEnabled = false
    }

    if(config.userApiEnabled) {
        Object.assign(config, await prompt([
            {
                type: 'confirm',
                name: 'rolesEnabled',
                default: false,
                message: "Enable roles?"
            }
        ]))
    } else {
        config.rolesEnabled = false
    }

    await runner( [
        'create-srfn-app',
        'new'
    ], {
        cwd: process.cwd(),
        debug: true,
        createPrompter: ()=>({prompt:()=>config}),
        logger: new Logger( console.log.bind( console ) ),
        templates: defaultTemplates
    })
    exec( 'npm i', { cwd: path.join( process.cwd(), config.appName ) } )
    return config
}

run().then(config=>console.log( 'App initialized!\nTry `cd '+config.appName+' && npm run start` to start your app.' ))