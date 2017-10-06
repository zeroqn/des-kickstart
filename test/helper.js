const promisify = (fn) =>
  new Promise((resolve, reject) =>
    fn((err, res) => {
      if (err) { reject(err); }
      resolve(res);
    })
  );

const getBalance = (account, at) =>
  promisify(cb => web3.eth.getBalance(account, at, cb));

const getEvents = (watcher) => promisify(cb => watcher.get(cb));

const assertThrow = async (fn, ...args) => {
  try {
    await fn.apply(this, args)
  } catch (err) {
    return;
  }

  throw new Error('should throw an error');
}

const sendTransaction = (opts) =>
  promisify(cb => web3.eth.sendTransaction(opts, cb));

module.exports = {
  promisify,
  getBalance,
  getEvents,
  assertThrow,
  sendTransaction,
};
