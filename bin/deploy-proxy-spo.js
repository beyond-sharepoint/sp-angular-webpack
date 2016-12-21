const Promise = require("bluebird");
const deploy = require("../deploy.js");

deploy.init()
    .then(deploy.deployProxySPO);