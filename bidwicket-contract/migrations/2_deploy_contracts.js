var bidwicket = artifacts.require("bidwicket");
var erc20 = artifacts.require("ERC20Basic");

module.exports = function (deployer){
    deployer.deploy(bidwicket);
    deployer.deploy(erc20);
}