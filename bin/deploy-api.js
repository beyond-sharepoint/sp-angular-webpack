const Promise = require("bluebird");
const deploy = require("../lib/deploy.js");

deploy.initSP()
    .then(deploy.deployApi);