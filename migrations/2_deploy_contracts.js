const BasicMathLib = artifacts.require('./BasicMathLib.sol');
// const FactoryUtils = artifacts.require('./FactoryUtils.sol');
const FundLibrary = artifacts.require('./FundLibrary.sol');
const Goal = artifacts.require('./Goal.sol');
const GoalFactory = artifacts.require('./GoalFactory.sol');
const GoalLibrary = artifacts.require('./GoalLibrary.sol');
const GoalRegistry = artifacts.require('./GoalRegistry.sol');
const OneShotGoal = artifacts.require('./OneShotGoal.sol');
const OneShotGoalFactory = artifacts.require('./OneShotGoalFactory.sol');
const OneShotGoalLibrary = artifacts.require('./OneShotGoalLibrary.sol');
const TierGoal = artifacts.require('./TierGoal.sol');
const TierGoalFactory = artifacts.require('./TierGoalFactory.sol');
const SubscribeGoal = artifacts.require('./SubscribeGoal.sol');
const SubscribeGoalFactory = artifacts.require('./SubscribeGoalFactory.sol');

module.exports = (deployer) => {
  deployer.deploy(GoalRegistry)
    .then(() => deployer.deploy([
      GoalLibrary,
      BasicMathLib,
      FundLibrary,
      OneShotGoalLibrary
    ]))
    .then(() => {
      deployer.link(GoalLibrary, Goal);
      deployer.link(BasicMathLib, FundLibrary);
      deployer.link(BasicMathLib, OneShotGoalFactory);
      deployer.link(FundLibrary, OneShotGoalLibrary);
      deployer.link(OneShotGoalLibrary, OneShotGoal);
      deployer.link(BasicMathLib, OneShotGoal);
      deployer.link(BasicMathLib, TierGoal);
      deployer.link(BasicMathLib, TierGoalFactory);
      deployer.link(BasicMathLib, SubscribeGoal);
      deployer.link(BasicMathLib, SubscribeGoalFactory);
    });
    // .then(() => deployer.deploy([
    //   GoalLibrary,
    //   GoalFactory
    // ]))
    // .then(() => deployer.link(GoalLibrary, Goal))
    // .then(() => deployer.deploy(BasicMathLib))
    // .then(() => {
    //   deployer.link(BasicMathLib, FundLibrary);
    //   return deployer.deploy(FundLibrary);
    // })
    // .then(() => {
    //   deployer.link(FundLibrary, OneShotGoalLibrary);
    //   return deployer.deploy(OneShotGoalLibrary);
    // })
    // .then(() => {
    //   deployer.link(OneShotGoalLibrary, OneShotGoal);
    //   deployer.link(BasicMathLib, OneShotGoalFactory);
    //   return deployer.deploy(OneShotGoalFactory);
    // });
};
