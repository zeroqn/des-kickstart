const Goal = artifacts.require('Goal');
const GoalRegistry = artifacts.require('GoalRegistry');
const helper = require('./helper');

contract('Goal', (accounts) => {

  const founder = accounts[1];
  const founderWallet = accounts[2];
  const emergencyMultisig = accounts[3];
  const testType = 9;
  const testTag = '#aircar';
  const testTopic = 'A car can fly';
  const testContentHash = 'aaaaaaa';
  let registry;
  let goal;

  before(async () => {
    registry = await GoalRegistry.new();
  });

  beforeEach(async () => {
    goal = await Goal.new(registry.address, testType, founder, founderWallet,
      emergencyMultisig, testTag, testTopic, testContentHash);
  });

  it('should create a new goal successfully ', async () => {
    let tag = '#test';
    let topic = 'test';
    let contentHash = web3.toHex('test');
    let goalInst;

    goalInst = await Goal.new(registry.address, testType, founder,
      founderWallet, emergencyMultisig, tag, topic, contentHash);

    let goal = await goalInst.goal.call();
    assert.equal(goal.length, 12,
      'goal should contain 12 properties except mapping');
    assert.equal(goal[0], registry.address);
    assert.equal(goal[1].toNumber(), 1, 'Status should be Active');
    assert.equal(goal[2].toNumber(), testType, 'goType should be ' + testType);
    assert.equal(goal[3], founder);
    assert.equal(goal[4], founderWallet);
    assert.equal(goal[5], emergencyMultisig);
    assert.equal(goal[6], tag);
    assert.equal(goal[7], topic);
    assert.equal(goal[8].toNumber(), 1, 'lastRev should be 1');
  });

  it('should not create new goal if registry address is wrong', async () => {
    await helper.assertThrow(Goal.new, '', testType, founder, founderWallet,
      emergencyMultisig, testTag, testTopic, testContentHash);
  });

  it('should not create new goal if goType is zero', async () => {
    await helper.assertThrow(Goal.new, registry.address, 0, founder,
      founderWallet, emergencyMultisig, testTag, testTopic, testContentHash);
  });

  it('should not create new goal if founder address is wrong', async () => {
    await helper.assertThrow(Goal.new, registry.address, testType, '',
      founderWallet, emergencyMultisig, testTag, testTopic, testContentHash);
  });

  it('should not create new goal if founder wallet is wrong', async () => {
    await helper.assertThrow(Goal.new, registry.address, testType, founder, '',
      emergencyMultisig, testTag, testTopic, testContentHash);
  });

  it('should not create new goal if emergencyMultisig is wrong', async () => {
    await helper.assertThrow(Goal.new, registry.address, testType, founder,
      founderWallet, '', testTag, testTopic, testContentHash);
  });

  it('should not create new goal if tag is empty', async () => {
    await helper.assertThrow(Goal.new, registry.address, testType, founder,
      founderWallet, emergencyMultisig, '', testTopic, testContentHash);
  });

  it('should not create new goal if topic is empty', async () => {
    await helper.assertThrow(Goal.new, registry.address, testType, founder,
      founderWallet, emergencyMultisig, testTag, '', testContentHash);
  });

  it('should not create new goal if contentHash is empty', async () => {
    await helper.assertThrow(Goal.new, registry.address, testType, founder,
      founderWallet, emergencyMultisig, testTag, testTopic, '');
  });

  it('should set goal registry', async () => {
    await goal.setGoalRegistry(accounts[4], {from: founder});
    assert.equal((await goal.goal.call())[0], accounts[4]);

    await goal.setGoalRegistry(accounts[5], {from: emergencyMultisig});
    assert.equal((await goal.goal.call())[0], accounts[5]);
  });

  it('should not set goal registry from sender without permission', async ()=>{
    await helper.assertThrow(goal.setGoalRegistry, accounts[4]);
  });

  it('should not set goal registry with wrong address value', async ()=>{
    await helper.assertThrow(goal.setGoalRegistry, '', {from: founder});
  });

  it('should set founder wallet', async () => {
    await goal.setFounderWalletAddress(accounts[4], {from: founder});
    assert.equal((await goal.goal.call())[4], accounts[4]);

    await goal.setFounderWalletAddress(accounts[5], {from: emergencyMultisig});
    assert.equal((await goal.goal.call())[4], accounts[5]);
  });

  it('should not set founder wallet from sender without permission', async ()=>{
    await helper.assertThrow(goal.setFounderWalletAddress, accounts[4]);
  });

  it('should not set founder wallet with wrong address value', async ()=>{
    await helper.assertThrow(goal.setFounderWalletAddress, '', {from: founder});
  });

  it('should retrieve last content hash', async () => {
    let contentHash = await goal.getLastContentHash();

    assert.equal(web3.toUtf8(contentHash), testContentHash);
  });

  it('should update content hash', async () => {
    const modifiedContentHash = 'new content hash';
    const modifiedContentHash2 = 'new content hash 2';
    let contentHash;

    let lastRev = await goal.updateContentHash(modifiedContentHash,
      {from: founder});
    contentHash = await goal.getLastContentHash();
    assert.equal(web3.toUtf8(contentHash), modifiedContentHash);

    await goal.updateContentHash(modifiedContentHash2,
      {from: emergencyMultisig});
    contentHash = await goal.getLastContentHash();
    assert.equal(web3.toUtf8(contentHash), modifiedContentHash2);
  });

  it('should fire OnContentHashUpdated event after update', async () => {
    const modifiedContentHash = 'new content hash';
    let events;

    await goal.updateContentHash(modifiedContentHash, {from: founder});
    events = await helper.getEvents(goal.OnContentHashUpdated());

    assert.equal(events.length, 1);
    assert.equal(events[0].args.lastRev.toNumber(), 2);
    assert.equal(web3.toUtf8(events[0].args.contentHash), modifiedContentHash);
  });

  it('should not update content hash from sender without permission',
    async () => {
      const modifiedContentHash = 'new content hash';
      await helper.assertThrow(goal.updateContentHash, modifiedContentHash);
    });

  it('should not update content hash with empty hash', async () => {
      await helper.assertThrow(goal.updateContentHash, '', {from: founder});
  });

  it('should pause a goal', async () => {
    let events;
    let status;

    await goal.pause({from: founder});
    events = await helper.getEvents(goal.OnStatusChanged());

    status = (await goal.goal.call())[1];
    assert.equal(status, 2, 'status should be Pause');
    assert.equal(events.length, 1);
    assert.equal(events[0].args.status.toNumber(), 2, 'status should be pause');
  });

  it('should not pause a goal from sender without permission', async () => {
    await helper.assertThrow(goal.pause);
  });

  it('should not pause a goal if status isnt Active', async () => {
    await goal.pause({from: founder});
    await helper.assertThrow(goal.pause, {from: founder});
  });

  it('should cancel a goal', async () => {
    let events;
    let status;

    await goal.cancel({from: founder});
    events = await helper.getEvents(goal.OnStatusChanged());
    status = (await goal.goal.call())[1];

    assert.equal(status, 3, 'status should be Cancel');
    assert.equal(events.length, 1);
    assert.equal(events[0].args.status.toNumber(), 3,'status should be Cancel');
  });

  it('should not cancel a goal from sender without permission', async () => {
    await helper.assertThrow(goal.cancel);
  });

  it('should not cancel a goal if status is Finish', async () => {
    await goal.finish({from: founder});
    await helper.assertThrow(goal.cancel, {from: founder});
  });

  it('should continue a goal from Pause', async () => {
    let events;
    let status;

    await goal.pause({from: founder});
    status = (await goal.goal.call())[1];
    assert.equal(status, 2, 'status should be Pause');

    await goal.reviveFromPause({from: founder});
    events = await helper.getEvents(goal.OnStatusChanged());

    status = (await goal.goal.call())[1];
    assert.equal(status, 1, 'status should be Cancel');
    assert.equal(events.length, 1);
    assert.equal(events[0].args.status.toNumber(), 1,'status should be Active');
  });

  it('should not continue a goal from sender without permission', async () => {
    await goal.pause({from: founder});
    await helper.assertThrow(goal.reviveFromPause);
  });

  it('should not continue a goal if status isnt Pause', async () => {
    await helper.assertThrow(goal.reviveFromPause, {from: founder});
  });

  it('should finish a goal', async () => {
    let events;
    let status;

    await goal.finish({from: founder});
    events = await helper.getEvents(goal.OnStatusChanged());

    status = (await goal.goal.call())[1];
    assert.equal(status, 4, 'status should be Finish');
    assert.equal(events.length, 1);
    assert.equal(events[0].args.status.toNumber(), 4,'status should be Finish');
  });

  it('should not finish a goal from sender without permission', async () => {
    await helper.assertThrow(goal.finish);
  });

  it('should not finish a goal if status isnt Active', async () => {
    await goal.pause({from: founder});
    await helper.assertThrow(goal.finish, {from: founder});
  });

});
