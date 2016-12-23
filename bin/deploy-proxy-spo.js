const Promise = require("bluebird");
const deploy = require("../lib/deploy.js");

deploy.init()
    .then(deploy.deployProxySPO);