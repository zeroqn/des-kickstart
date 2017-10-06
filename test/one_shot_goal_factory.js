const GoalRegistry = artifacts.require('GoalRegistry');
const OneShotGoal = artifacts.require('OneShotGoal');
const OneShotGoalFactory = artifacts.require('OneShotGoalFactory');
const helper = require('./helper');

contract('OneShotGoalFactory', (accounts) => {
  const founder = accounts[2];
  const founderWallet = accounts[3];
  const emergencyMultisig = accounts[5];
  const testTag = '#aircar';
  const testTopic = 'a car can fly';
  const testContentHash = 'aaaaa';
  const testAmount = 10;
  let registry;
  let factory;

  before(async () => {
    registry = await GoalRegistry.deployed();
    factory = await OneShotGoalFactory.new(registry.address,
      emergencyMultisig);
    await registry.setFactories([factory.address], [true]);
  });

  it('should kick a new one shot goal', async () => {
    let events;
    let goal;

    await factory.kickNewGoal(founder, founderWallet, testTag, testTopic,
      testContentHash, testAmount);
    events = await helper.getEvents(registry.OnNewGoalKicked());

    assert.equal(events.length, 1);
    assert.equal(events[0].args.tag, testTag);
    assert.equal(events[0].args.founder, founder);
    assert.equal(events[0].args.founderWallet, founderWallet);
    assert.equal(events[0].args.minFundraiseTarget, testAmount);

    goal = OneShotGoal.at(events[0].args.goal);
    assert.equal((await goal.goal.call())[5], testTag);
  });

});
