pragma solidity >=0.4.21 <0.6.0;

contract LockdropRecovery {
  mapping (address => uint) lockedAmounts;
  /**
      Constructor for creating a contract with specific addresses
      who have found themselves with locked funds in the contract
      to be deployed.
   */
  constructor(address[] memory lockers, uint256[] memory amounts) public {
    // Ensure the number of lockers match up with the amounts specified
    assert(lockers.length == amounts.length);
    // Add all lockers to a map
    for (uint i = 0; i < lockers.length; i++) {
      lockedAmounts[lockers[i]] = amounts[i];
    }
  }

  /**
      Sends funds back to accounts based on amounts used to create contract
   */
  function claim() external {
    // Ensure the sender has moneyz in the contract
    assert(lockedAmounts[msg.sender] > 0);
    // Get the moneyz
    uint amount = lockedAmounts[msg.sender];
    // Delete the record
    delete lockedAmounts[msg.sender];
    // Transfer the amount
    msg.sender.transfer(amount);
  }
}
