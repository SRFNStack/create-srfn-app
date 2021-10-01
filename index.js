#!/usr/bin/env node
const path = require( 'path' );
const os = require('os');
const fs = require('fs');
const { runner } = require( 'hygen' );
const Logger = require( 'hygen/lib/logger' );
const defaultTemplates = path.resolve( __dirname, 'templates' );
const { spawnSync } = require( 'child_process' )
const { prompt } = require( 'enquirer' )

async function run() {

    const config = await prompt( [
        {
            type: 'input',
            name: 'appName',
            message: "Enter your app's name:"
        },
        {
            type: 'confirm',
            default: false,
            name: 'userApiEnabled',
            message: "Enable User Api?"
        },
        {
            type: 'confirm',
            name: 'authEnabled',
            default: false,
            message: "Enable JWT auth?"
        },

    ] )

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

    if( config.authEnabled ) {
        Object.assign( config, await prompt( [
                {
                    type: 'confirm',
                    name: 'googleAuthEnabled',
                    default: false,
                    message: "Enable Google Auth?"
                }
            ] )
        )
    } else {
        config.googleAuthEnabled = false
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
    await spawnSync( 'npm',['i'], { stdio: 'inherit', cwd: path.join( process.cwd(), config.appName ) } )
    return config
}

run().then(config=>{
    const home = os.homedir()
    let appEnv = path.join(home, `.${config.appName}.env`);
    if(fs.existsSync(appEnv)){
        console.log(`${appEnv} already exists. You may need to update it to work for this new application.`)
    } else {
        fs.writeFileSync(appEnv, `#do not check this file in to source control!!\nSRFN_APP_NAME=${config.appName}\n`)
        if(config.authEnabled){
            console.warn(`With auth enabled, you should update JWT_SECRET in ${appEnv}.`)
            fs.appendFileSync(appEnv, 'JWT_SECRET=change_this_value\n')
        }
        if(config.googleAuthEnabled){
            console.error(`With google auth enabled, you need to update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in ${appEnv} before your application will start.`)
            fs.appendFileSync(appEnv, 'GOOGLE_CLIENT_ID=123456\nGOOGLE_CLIENT_SECRET=654321\n')
        }
    }
    console.log( 'App initialized!\nTry `cd '+config.appName+' && docker-compose up -d && npm run start` to start your app.' )
})