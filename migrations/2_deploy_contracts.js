var HackathonBetting = artifacts.require('../contracts/HackathonBetting.sol');
module.exports = function (deployer) {
    deployer.deploy(HackathonBetting);
};