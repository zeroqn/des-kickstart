const GoalRegistry = artifacts.require('GoalRegistry');
const helper = require('./helper');

contract('GoalRegistry', (accounts) => {
  const owner = accounts[0];
  const fakeFactory = accounts[1];
  const fakeNewGoal = accounts[2];
  const founder = accounts[3];
  const founderWallet = accounts[4];
  let registry;

  before(async () => {
    registry = await GoalRegistry.new();
    await registry.setFactories([fakeFactory], [true]);
  });

  it('should add new goal to registry', async () => {
    let tag = '#aircar';
    let amount = 10;
    let events;

    await registry.registerGoal(fakeNewGoal, tag, founder, founderWallet,
      amount, {from: fakeFactory});
    events = await helper.getEvents(registry.OnNewGoalKicked());

    assert.isTrue(await registry.isGoal.call(fakeNewGoal));
    assert.equal(events.length, 1);
    assert.equal(events[0].args.goal, fakeNewGoal);
    assert.equal(events[0].args.tag, tag);
    assert.equal(events[0].args.founder, founder);
    assert.equal(events[0].args.founderWallet, founderWallet);
    assert.equal(events[0].args.minFundraiseTarget.toNumber(), amount);
  });

  it('should not add new goal if sender isnt a factory contract', async () => {
    let tag = '#aircar';
    let amount = 10;

    helper.assertThrow(registry.registerGoal, fakeNewGoal, tag, founder,
      founderWallet, amount);
  });

});
