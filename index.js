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
            name: 'authEnabled',
            default: true,
            message: "Enable JWT auth?"
        }
    ] )

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
    const isWin = process.platform === 'win32'
    await spawnSync( isWin ? 'npm.cmd' : 'npm',['install'], { stdio: 'inherit', cwd: path.join( process.cwd(), config.appName ) } )
    return config
}

run().then(config=>{
    const home = os.homedir()
    let appEnv = path.join(home, `.${config.appName}.env`);
    if(fs.existsSync(appEnv)){
        console.log(`${appEnv} already exists. You may need to update it to work for this new application.`)
    } else {
        fs.writeFileSync(appEnv, `#do not check this file in to source control!!\nSRFN_APP_NAME=${config.appName}\nAPP_URL=http://localhost:10420\n`)
        if(config.authEnabled) {
            console.warn( `With auth enabled, you should update JWT_SECRET and set JWT_ISSUER in ${appEnv}.` )
            fs.appendFileSync( appEnv, 'JWT_SECRET=change_this_value\n' )
        }
    }
    console.log( 'App initialized!\nTry `cd '+config.appName+' && npm run start` to start your app.' )
    console.log( 'To get logged in, create a user by running `node createUser.js`.' )
})