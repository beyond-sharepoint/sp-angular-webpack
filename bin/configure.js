'use strict';

const inquirer = require('inquirer');
const fs = require('fs');

console.log("Configuring sp-angular-webpack...");

var questions = [
    {
        type: 'input',
        name: 'siteUrl',
        message: 'Please enter the URL to the SharePoint site where the app will be used?\n(ex: https://mytenant.sharepoint.com)',
        validate: function(value) {
            if (value.length > 1)
                return true;
            return "A site url is required"
        }
    },
    {
        type: 'input',
        name: 'proxyUrl',
        message: 'Please enter the site-relative url to the location where the HostWebProxy will be deployed, or press enter to accept the default.\n',
        default: '/Shared%20Documents/HostWebProxy.aspx'
    }
];

inquirer.prompt(questions).then(function (answers) {
    var settings = {
        siteUrl: answers.siteUrl,
        proxyUrl: answers.proxyUrl,
        "trustedOriginAuthorities": [
            answers.siteUrl,
            "http://localhost:8080"
        ],
        "knownSiteCollections": []
    };
    fs.writeFileSync("./src/HostWebProxy.config.json", JSON.stringify(settings, null, '  '));
    console.log('\nThe following settings have been written to ./src/HostWebProxy.config.json:');
    console.log(JSON.stringify(settings, null, '  '));
});