const TierGoal = artifacts.require('TierGoal');
const GoalRegistry = artifacts.require('GoalRegistry');
const helper = require('./helper');

contract('TierGoal', (accounts) => {
  const user = accounts[1];
  const founder = accounts[2];
  const founderWallet = accounts[3];
  const emergencyMultisig = accounts[5];
  const goType = 2;
  const testTag = '#aircar';
  const testTopic = 'a car can fly';
  const testContentHash = 'aaaaa';
  const testTier1 = {
    name: 'support',
    description: 'support',
    supply: 10000,
    price: 1,
  };
  const testTier2 = {
    name: 'show ticket',
    description: 'show ticket',
    supply: 5000,
    price: 100,
  };
  let registry;
  let goal;

  before(async () => {
    registry = await GoalRegistry.new();
  });

  beforeEach(async () => {
    goal= await TierGoal.new(registry.address, goType, founder, founderWallet,
      emergencyMultisig, testTag, testTopic, testContentHash);

    await goal.addTiers([testTier1.name, testTier2.name],
      [testTier1.description, testTier2.description],
      [testTier1.supply, testTier2.supply],
      [testTier1.price, testTier2.price], {from: founder});
  });

  it('should add tiers', async () => {
    let goal = await TierGoal.new(registry.address, goType, founder,
      founderWallet, emergencyMultisig, testTag, testTopic, testContentHash);

    await goal.addTiers([testTier1.name], [testTier1.description],
      [testTier1.supply], [testTier1.price], {from: founder});

    let [name, description, supply, price] = await goal.getTier.call(0);
    assert.equal(web3.toUtf8(name), testTier1.name);
    assert.equal(web3.toUtf8(description), testTier1.description);
    assert.equal(supply.toNumber(), testTier1.supply);
    assert.equal(price.toNumber(), testTier1.price);
  });

  it('should not add a tier when name is empty', async () => {
    await helper.assertThrow(goal.addTiers, [''], [testTier1.description],
      [testTier1.supply], [testTier1.price], {from: founder});
  });

  it('should not add a tier when description is empty', async () => {
    await helper.assertThrow(goal.addTiers, [testTier1.name], [''],
      [testTier1.supply], [testTier1.price], {from: founder});
  });

  it('should not add a tier when supply is 0', async () => {
    await helper.assertThrow(goal.addTiers, [testTier1.name],
      [testTier1.description], [0], [testTier1.price], {from: founder});
  });

  it('should not add a tier when price is 0', async () => {
    await helper.assertThrow(goal.addTiers, [testTier1.name],
      [testTier1.description], [testTier1.supply], [0], {from: founder});
  });

  it('should not add a tier from sender other than founder', async () => {
    await helper.assertThrow(goal.addTiers, [testTier1.name],
      [testTier1.description], [testTier1.supply], [testTier1.price],
      {from: emergencyMultisig});
  });

  it('should update the tier', async () => {
    const name = 'modified support';
    const description = 'modified support';
    const supply = 2000;
    const price = 999;

    await goal.updateTier(0, name, description, supply, price, {from: founder});

    let [rname, rdescription, rsupply, rprice] = await goal.getTier.call(0);
    assert.equal(web3.toUtf8(rname), name);
    assert.equal(web3.toUtf8(rdescription), description);
    assert.equal(rsupply.toNumber(), supply);
    assert.equal(rprice.toNumber(), price);
  });

  it('should not update the tier when name is empty', async () => {
    await helper.assertThrow(goal.updateTier, 0, '', testTier1.description,
      testTier1.supply, testTier1.price, {from: founder});
  });

  it('should not update the tier when description is empty', async () => {
    await helper.assertThrow(goal.updateTier, 0, testTier1.name, '',
      testTier1.supply, testTier1.price, {from: founder});
  });

  it('should not update the tier when supply is 0', async () => {
    await helper.assertThrow(goal.updateTier, 0, testTier1.name,
      testTier1.description, 0, testTier1.price, {from: founder});
  });

  it('should not update the tier when price is 0', async () => {
    await helper.assertThrow(goal.updateTier, testTier1.name,
      testTier1.description, testTier1.supply, 0, {from: founder});
  });

  it('should not update the tier from sender other than founder', async () => {
    await helper.assertThrow(goal.updateTier, 0, testTier1.name,
      testTier1.description, testTier1.supply, testTier1.price,
      {from: emergencyMultisig});
  });

  it('should not update the tier when the goal isnt paused', async () => {
    await goal.reviveFromPause({from: founder});
    await helper.assertThrow(goal.updateTier, 0, 'modified support',
      'modified support', 222, 999);
  });

  it('should back the tier', async () => {
    const price = testTier1.price;
    await goal.reviveFromPause({from: founder});
    await goal.back(0, {from: user, value: price});

    let amount = await goal.getUserFund(0, {from: user});
    assert.equal(amount.toNumber(), price);

    amount = await goal.getTierTotalFund(0);
    assert.equal(amount.toNumber(), price);

    amount = await goal.getTotalFund();
    assert.equal(amount.toNumber(), price);
  });

  it('should not back the tier when msg.value doesnt match price', async () =>{
    await goal.reviveFromPause({from: founder});
    await helper.assertThrow(goal.back, 0,
      {from: user, value: testTier1.price + 200});
  });

  it('should not back the tier when the goal isnt Active', async () => {
    await helper.assertThrow(goal.back, 0,
      {from: user, value: testTier1.price});
  });

  it('should allow user withdraw from the goal', async () => {
    const price = testTier1.price;
    await goal.reviveFromPause({from: founder});
    await goal.back(0, {from: user, value: price});

    let amount = await goal.getUserFund(0, {from: user});
    assert.equal(amount.toNumber(), price);

    await goal.withdraw(0, {from: user});
    amount = await goal.getUserFund(0, {from: user});
    assert.equal(amount.toNumber(), 0);
  });

  it('should allow user withdraw from the goal when it is canceled',
    async () => {
      const price = testTier1.price;
      await goal.reviveFromPause({from: founder});
      await goal.back(0, {from: user, value: price});

      let amount = await goal.getUserFund(0, {from: user});
      assert.equal(amount.toNumber(), price);

      await goal.cancel({from: founder});
      await goal.withdraw(0, {from: user});
      amount = await goal.getUserFund(0, {from: user});
      assert.equal(amount.toNumber(), 0);
    });

  it('should not allow user withdraw from the goal when it is paused',
    async () => {
      const price = testTier1.price;
      await goal.reviveFromPause({from: founder});
      await goal.back(0, {from: user, value: price});

      let amount = await goal.getUserFund(0, {from: user});
      assert.equal(amount.toNumber(), price);

      await goal.pause({from: founder});
      await helper.assertThrow(goal.withdraw, 0, {from: user});
    });

  it('should finish the goal', async () => {
    await goal.reviveFromPause({from: founder});
    await goal.finish({from: founder});

    assert.equal((await goal.getStatus()).toNumber(), 4,
      'Status should be Finish');
  });

  it('should not finish the goal from sender other than founder', async () => {
    await goal.reviveFromPause({from: founder});
    await helper.assertThrow(goal.finish, {from: emergencyMultisig});
  });

  it('should not finish the goal if it isnt active', async () => {
    await helper.assertThrow(goal.finish, {from: founder});
  });

  it('should allow user fund through fallback function', async () => {
    try {
      await helper.sendTransaction({from: user, to: goal.address, value: 1000});
    } catch (err) {
      return;
    }

    throw new Error('should throw error');
  });

});
