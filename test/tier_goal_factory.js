const GoalRegistry = artifacts.require('GoalRegistry');
const TierGoal = artifacts.require('TierGoal');
const TierGoalFactory = artifacts.require('TierGoalFactory');
const helper = require('./helper');

contract('TierGoalFactory', (accounts) => {
  const founder = accounts[2];
  const founderWallet = accounts[3];
  const emergencyMultisig = accounts[5];
  const goType = 2;
  const testTag = '#aircar';
  const testTopic = 'a car can fly';
  const testContentHash = 'aaaaa';
  let registry;
  let factory;

  before(async () => {
    registry = await GoalRegistry.new();
    factory = await TierGoalFactory.new(registry.address,
      emergencyMultisig);
    await registry.setFactories([factory.address], [true]);
  });

  it('should kick new tier goal', async () => {
    let events;
    let goal;

    await factory.kickNewGoal(founder, founderWallet, testTag, testTopic,
      testContentHash);
    events = await helper.getEvents(registry.OnNewGoalKicked());

    assert.equal(events.length, 1);
    assert.equal(events[0].args.tag, testTag);
    assert.equal(events[0].args.goType, goType);
    assert.equal(events[0].args.founder, founder);
    assert.equal(events[0].args.founderWallet, founderWallet);

    goal = TierGoal.at(events[0].args.goal);
    assert.equal((await goal.goal.call())[1], 2, 'Status should be Pause');;
    assert.equal((await goal.goal.call())[6], testTag);
  });

});
