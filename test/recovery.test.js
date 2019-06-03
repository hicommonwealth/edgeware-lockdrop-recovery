const LockdropRecovery = artifacts.require("./LockdropRecovery.sol");
const rlp = require('rlp');
const keccak = require('keccak');

contract('LockdropRecovery', (accounts) => {
  it('send ETH to a future contract made from nonce 10 and recover it', async function() {
    // Get the contract for the first account created at nonce 10
    const nonce = 10;
    const input = [ accounts[0], nonce ];
    const rlpEncoded = rlp.encode(input);
    const contractAddressLong = keccak('keccak256').update(rlpEncoded).digest('hex');
    const contractAddr = `0x${contractAddressLong.substring(24)}`;
    // Send this future contract address Ether from all accounts
    let promises = accounts.map(async a => {
      await web3.eth.sendTransaction({
        from: a,
        to: contractAddr,
        value: web3.utils.toWei('1', 'ether'),
      });
    });
    // Resolve promises
    await Promise.all(promises);
    // Get balance and ensure its 10 Ether
    const balance = await web3.eth.getBalance(contractAddr);
    assert.equal(web3.utils.fromWei(balance, 'ether').toString(), '10');
    // Get current nonce of account
    const txNonce = await web3.eth.getTransactionCount(accounts[0]);
    // Send enough txs to up the nonce
    for (var i = txNonce; i < 10; i++) {
      await web3.eth.sendTransaction({
        from: accounts[0],
        to: accounts[1],
        value: web3.utils.toWei('1', 'ether'),
      });
    }
    // Asset it is at nonce 10
    assert.equal(await web3.eth.getTransactionCount(accounts[0]), 10);
    // Create amounts array for each account, all sent 1 ETH for example
    const amounts = accounts.map(() => web3.utils.toWei('1', 'ether'));
    // Create the contract
    const lockdropRecoveryContract = await LockdropRecovery.new(accounts, amounts);
    assert.equal(lockdropRecoveryContract.address.toLowerCase(), contractAddr.toLowerCase());
    promises = accounts.map(async a => {
      return await web3.eth.getBalance(a);
    });
    // Resolve all balance promises
    let balancesBefore = await Promise.all(promises);
    // Claim back all locked funds
    promises = accounts.map(async a => {
      return await lockdropRecoveryContract.claim({
        from: a,
      });
    });
    // Resolve all claim promises
    await Promise.all(promises);
    promises = accounts.map(async a => {
      return await web3.eth.getBalance(a);
    });
    // Resolve all balance promises
    let balancesAfter = await Promise.all(promises);
    balancesBefore.forEach((bal, inx) => {
      // Assert all balances are higher after claiming
      assert.ok(web3.utils.toBN(bal).lt(web3.utils.toBN(balancesAfter[inx])));
    });
    // Ensure one cannot send Ether to the contract after it is created
    try {
      await web3.eth.sendTransaction({
        from: accounts[0],
        to: contractAddr,
        value: web3.utils.toWei('1', 'ether'),
      });
    } catch (e) {
      assert.ok(e.toString().indexOf('VM Exception while processing transaction: revert') !== -1);
    }
  });
});