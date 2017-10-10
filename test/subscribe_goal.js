const SubscribeGoal = artifacts.require('SubscribeGoal');
const GoalRegistry = artifacts.require('GoalRegistry');
const helper = require('./helper');

contract('SubscribeGoal', (accounts) => {
  const user = accounts[1];
  const founder = accounts[2];
  const founderWallet = accounts[3];
  const emergencyMultisig = accounts[5];
  const goType = 3;
  const testTag = '#aircar';
  const testTopic = 'a car can fly';
  const testContentHash = 'aaaa';
  const testRoundTarget = 1000;

  let registry;
  let goal;

  before(async () => {
    registry = await GoalRegistry.new();
  });

  beforeEach(async () => {
    goal = await SubscribeGoal.new(registry.address, goType, founder,
      founderWallet, emergencyMultisig, testTag, testTopic,
      testContentHash, testRoundTarget);
  });

  it('should set round raise target', async () => {
    await goal.setRoundTarget(testRoundTarget + 1000, {from: founder});

    let target = await goal.getRoundRaiseTarget();
    assert.equal(target.toNumber(), testRoundTarget + 1000);
  });

  it('should not set round raise target from sender other than founder',
    async () => {
      await helper.assertThrow(goal.setRoundTarget, 999,
        {from: emergencyMultisig});
    });

  it('should not set round raise target if goal status is Cancel',
    async () => {
      await goal.cancel({from: founder});

      assert.equal((await goal.getStatus()).toNumber(), 3,
        'Status should be Cancel');
      await helper.assertThrow(goal.setRoundTarget, 999,
        {from: founder});
    });

  it('should not set round raise target if goal status is Finish',
    async () => {
      await goal.finish({from: founder});

      assert.equal((await goal.getStatus()).toNumber(), 4,
        'Status should be Finish');
      await helper.assertThrow(goal.setRoundTarget, 999,
        {from: founder});
    });

  it('should allow user back the goal', async () => {
    await goal.back({from: user, value: 1000});

    let amount = await goal.getRoundUserFund({from: user});
    assert.equal(amount.toNumber(), 1000);

    amount = await goal.getRoundTotalFund();
    assert.equal(amount.toNumber(), 1000);
  });

  it('should not allow user back the goal if status isnt Active',
    async () => {
      await goal.pause({from: founder});

      assert.equal((await goal.getStatus()).toNumber(), 2,
        'Status should be Pause');
      await helper.assertThrow(goal.back, {from: user, value: 999});
    });

  it('should allow users to withdraw their funds', async () => {
    await goal.back({from: user, value: 1000});

    let amount = await goal.getRoundUserFund({from: user});
    assert.equal(amount.toNumber(), 1000);

    await goal.withdraw({from: user});

    amount = await goal.getRoundUserFund({from: user});
    assert.equal(amount.toNumber(), 0);
    amount = await goal.getRoundTotalFund();
    assert.equal(amount.toNumber(), 0);
  });

  it('should allow users to withdraw their funds if status is Cancel',
    async () => {
      await goal.back({from: user, value: 1000});
      await goal.cancel({from: founder});

      let amount = await goal.getRoundUserFund({from: user});
      assert.equal(amount.toNumber(), 1000);
      assert.equal((await goal.getStatus()).toNumber(), 3,
        'Status should be Cancel');

      await goal.withdraw({from: user});

      amount = await goal.getRoundUserFund({from: user});
      assert.equal(amount.toNumber(), 0);
      amount = await goal.getRoundTotalFund();
      assert.equal(amount.toNumber(), 0);
    });

  it('should not allow withdraw if status is Pause', async () => {
      await goal.back({from: user, value: 1000});
      await goal.pause({from: founder});

      assert.equal((await goal.getStatus()).toNumber(), 2,
        'Status should be Pause');
      await helper.assertThrow(goal.withdraw, {from: user});
    });

  it('should not allow withdraw if status is Finish', async () => {
      await goal.back({from: user, value: 1000});
      await goal.finish({from: founder});

      assert.equal((await goal.getStatus()).toNumber(), 4,
        'Status should be Finish');
      await helper.assertThrow(goal.withdraw, {from: user});
    });

  it('should finish current round and start new round with previous target',
    async () => {
      await goal.back({from: user, value: 1000});
      await goal.finishRound({from: founder});

      assert.equal((await goal.getRoundRaiseTarget()).toNumber(),
        testRoundTarget);
      assert.equal((await goal.getRoundUserFund({from: user})).toNumber(),
        0);
    });

  it('should not finish current round from sender other than founder',
    async () => {
      await goal.back({from: user, value: 1000});
      await helper.assertThrow(goal.finishRound,
        {from: emergencyMultisig});
    });

  it('should not finish current round if status isnt Active',
    async () => {
      await goal.back({from: user, value: 1000});
      await goal.pause({from: founder});
      await helper.assertThrow(goal.finishRound, {from: founder});
    });

  it('should allow user fund through fallback function', async () => {
    await helper.sendTransaction({from: user, to: goal.address,
      value: 1000});

    let amount = await goal.getRoundUserFund({from: user});
    assert.equal(amount.toNumber(), 1000);
  });

});
