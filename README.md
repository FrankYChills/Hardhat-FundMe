# HardHat FundME Sample Project

## Notes

### Testing

> **Unit Test** : Unit tests is basically testing fragments of a code.It is done locally.

> _Unit tests can be done on ->_ **local hardhat** or **forked hardhat**

> **Staging Test** : Staging tests are basically done on a testnet before deploying to mainnet(!LAST STOP!)

## INTERNAL FUNC VS EXTERNAL FUNC || PUBLIC VS PRIVATE

**public - all can access**

**external - Cannot be accessed internally, only externally**

**internal - only this contract and contracts deriving from it can access**

**private - can be accessed only from this contract**

> ### CONSTANT defined variables and variables inside of functions do not take space in the storage

> ### Memory is like an array if we are storing an array at memory only length of that array is stored at that respective index but the items are not stored there.Items are stored according to a hash function which takes the index of array position as input and stores at that location.Same goes for Objects/Dictionaries.

> ### The Ethereum Virtual Machine has three areas where it can store items.

```
The first is “storage”, where all the contract state variables reside. Every contract has its own storage and it is persistent between function calls and quite expensive to use.

The second is “memory”, this is used to hold temporary values. It is erased between (external) function calls and is cheaper to use.

The third one is the stack, which is used to hold small local variables. It is almost free to use, but can only hold a limited amount of values.
```
