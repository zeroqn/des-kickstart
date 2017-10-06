const BasicMathLib = artifacts.require('./BasicMathLib.sol');
// const FactoryUtils = artifacts.require('./FactoryUtils.sol');
const FundraiseLibrary = artifacts.require('./FundraiseLibrary.sol');
const Goal = artifacts.require('./Goal.sol');
const GoalFactory = artifacts.require('./GoalFactory.sol');
const GoalLibrary = artifacts.require('./GoalLibrary.sol');
const GoalRegistry = artifacts.require('./GoalRegistry.sol');
const OneShotGoal = artifacts.require('./OneShotGoal.sol');
const OneShotGoalFactory = artifacts.require('./OneShotGoalFactory.sol');
const OneShotGoalLibrary = artifacts.require('./OneShotGoalLibrary.sol');

module.exports = (deployer) => {
  deployer.deploy(GoalRegistry)
    .then(() => deployer.deploy([
      GoalLibrary,
      BasicMathLib,
      FundraiseLibrary,
      OneShotGoalLibrary
    ]))
    .then(() => {
      deployer.link(GoalLibrary, Goal);
      deployer.link(BasicMathLib, FundraiseLibrary);
      deployer.link(BasicMathLib, OneShotGoalFactory);
      deployer.link(FundraiseLibrary, OneShotGoalLibrary);
      deployer.link(OneShotGoalLibrary, OneShotGoal);
      deployer.link(BasicMathLib, OneShotGoal);
    });
    // .then(() => deployer.deploy([
    //   GoalLibrary,
    //   GoalFactory
    // ]))
    // .then(() => deployer.link(GoalLibrary, Goal))
    // .then(() => deployer.deploy(BasicMathLib))
    // .then(() => {
    //   deployer.link(BasicMathLib, FundraiseLibrary);
    //   return deployer.deploy(FundraiseLibrary);
    // })
    // .then(() => {
    //   deployer.link(FundraiseLibrary, OneShotGoalLibrary);
    //   return deployer.deploy(OneShotGoalLibrary);
    // })
    // .then(() => {
    //   deployer.link(OneShotGoalLibrary, OneShotGoal);
    //   deployer.link(BasicMathLib, OneShotGoalFactory);
    //   return deployer.deploy(OneShotGoalFactory);
    // });
};
