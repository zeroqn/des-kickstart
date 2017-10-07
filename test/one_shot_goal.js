const OneShotGoal = artifacts.require('OneShotGoal');
const GoalRegistry = artifacts.require('GoalRegistry');
const helper = require('./helper');

contract('OneShotGoal', (accounts) => {
  const user = accounts[1];
  const founder = accounts[2];
  const founderWallet = accounts[3];
  const emergencyMultisig = accounts[5];
  const testTag = '#aircar';
  const testTopic = 'a car can fly';
  const testContentHash = 'aaaaa';
  const testAmount = 10;
  let registry;
  let goal;

  before(async () => {
    registry = await GoalRegistry.new();
  });

  beforeEach(async () => {
    goal = await OneShotGoal.new(registry.address, founder, founderWallet,
      emergencyMultisig, testTag, testTopic, testContentHash, testAmount);
  });

  it('should fund a goal', async () => {
    await goal.back({from: user, value: 100});

    let amount = await goal.getUserFund({from: user});
    let totalFund = await goal.getTotalFund();

    assert.equal(amount.toNumber(), 100);
    assert.equal(totalFund.toNumber(), 100);
  });

  it('should not fund a goal with empty eth', async () => {
    await helper.assertThrow(goal.fund, {from: user});
  });

  it('should not fund a goal if it isnt Active', async () => {
    await goal.pause({from: founder});
    await helper.assertThrow(goal.fund, {from: user, value: 100});
  });

  it('should allow user withdraw their fund', async () => {
    let amount;

    await goal.back({from: user, value: 1000});
    amount = await goal.getUserFund({from: user});
    assert.equal(amount.toNumber(), 1000);

    await goal.withdraw({from: user});
    amount = await goal.getUserFund({from: user});
    assert.equal(amount.toNumber(), 0);
  });

  it('should allow user withdraw their fund if status is Cancel', async () => {
    let amount;

    await goal.back({from: user, value: 1000});
    amount = await goal.getUserFund({from: user});
    assert.equal(amount.toNumber(), 1000);

    await goal.cancel({from: founder});
    assert.equal((await goal.goal.call())[1], 3, 'status should be Cancel');

    await goal.withdraw({from: user});
    amount = await goal.getUserFund({from: user});
    assert.equal(amount.toNumber(), 0);
  });

  it('should not allow user withdraw their fund if status is Pause',
    async () => {
      await goal.back({from: user, value: 1000});
      await goal.pause({from: founder});

      await helper.assertThrow(goal.withdraw, {from: user});
    });

  it('should not allow user withdraw their fund if status is Finish',
    async () => {
      await goal.back({from: user, value: 1000});
      await goal.finish({from: founder});

      await helper.assertThrow(goal.withdraw, {from: user});
    });

  it('should allow funder finish a goal', async () => {
    let amount;

    await goal.back({from: user, value: 1000});
    amount = await goal.getTotalFund();
    assert.equal(amount.toNumber(), 1000);

    await goal.finish({from: founder});
    amount = await goal.getTotalFund();
    assert.equal(amount.toNumber(), 0);
    assert.equal((await goal.goal.call())[1], 4, 'status should be Finish');
  });

  it('should allow emergencyMultisig finish a goal', async () => {
    let amount;

    await goal.back({from: user, value: 1000});
    amount = await goal.getTotalFund();
    assert.equal(amount.toNumber(), 1000);

    await goal.finish({from: emergencyMultisig});
    amount = await goal.getTotalFund();
    assert.equal(amount.toNumber(), 0);
    assert.equal((await goal.goal.call())[1], 4, 'status should be Finish');
  });

  it('should not finish a goal if status isnt Active', async () => {
    await goal.back({from: user, value: 1000});
    await goal.pause({from: founder});

    await helper.assertThrow(goal.finish, {from: founder});
  });

  it('should allow user fund through fallback function', async () => {
    await helper.sendTransaction({from: user, to: goal.address, value: 1000});

    let amount = await goal.getUserFund({from: user});
    assert.equal(amount.toNumber(), 1000);
  });

});
