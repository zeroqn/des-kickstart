const GoalRegistry = artifacts.require('GoalRegistry');
const SubscribeGoal = artifacts.require('SubscribeGoal');
const SubscribeGoalFactory = artifacts.require('SubscribeGoalFactory');
const helper = require('./helper');

contract('SubscribeGoalFactory', (accounts) => {
  const founder = accounts[2];
  const founderWallet = accounts[3];
  const emergencyMultisig = accounts[5];
  const goType = 3;
  const testTag = '#aircar';
  const testTopic = 'a car can fly';
  const testContentHash = 'aaaaa';
  const initialRaiseTarget = 1000;
  let registry;
  let factory;

  before(async () => {
    registry = await GoalRegistry.new();
    factory = await SubscribeGoalFactory.new(registry.address,
      emergencyMultisig);
    await registry.setFactories([factory.address], [true]);
  });

  it('should kick new subscribe goal', async () => {
    let events;
    let goal;

    await factory.kickNewGoal(founder, founderWallet, testTag, testTopic,
      testContentHash, initialRaiseTarget);
    events = await helper.getEvents(registry.OnNewGoalKicked());

    assert.equal(events.length, 1);
    assert.equal(events[0].args.tag, testTag);
    assert.equal(events[0].args.goType, goType);
    assert.equal(events[0].args.founder, founder);
    assert.equal(events[0].args.founderWallet, founderWallet);

    goal = SubscribeGoal.at(events[0].args.goal);
    assert.equal((await goal.goal.call())[1], 1, 'Status should be Active');;
    assert.equal((await goal.goal.call())[6], testTag);

    assert.equal((await goal.getRoundRaiseTarget()).toNumber(),
      initialRaiseTarget);
  });

});
