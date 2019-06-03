# edgeware-lockdrop-recovery
In what seems like the most ironic turn of events, the lockdrop has truly led to locked coins. This is a repo for the only trick in the book to save the day.

Contracts addresses in Ethereum are created using the hash of the RLP encoding of the sender address and the transaction nonce of the respective sender. This is
consistent across any test or main network that exists on Ethereum. If people mistakingly send ETH to contract addresses generated on different networks, the
owner private keys that were used to create said contracts can be used to recover these lost funds. This is what we achieve here: a simple contract for inputting
the accounts and amounts of lost funds to be recovered by those individuals.
