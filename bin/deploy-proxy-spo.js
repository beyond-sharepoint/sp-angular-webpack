const Promise = require("bluebird");
const deploy = require("../lib/deploy.js");

deploy.initSPO()
    .then(deploy.deployProxySPO);