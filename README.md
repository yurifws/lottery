# Lottery Smart Contract

A decentralized Ethereum lottery where players enter by sending ETH and a manager randomly selects a winner to receive the entire prize pool.

## Overview

This smart contract implements a simple lottery system where:
- Anyone can participate by sending at least 0.01 ETH
- The contract creator acts as the manager
- The manager can pick a random winner who receives all funds
- After each round, the lottery resets automatically

## Smart Contract Details

### Variables
- `manager` - Address of the contract deployer (only one who can pick winners)
- `players` - Dynamic array storing all participant addresses

### Functions

#### `enter()` - Join the Lottery
```solidity
function enter() public payable
```
- **Requirement**: Minimum 0.01 ETH
- **Action**: Adds sender to the players array
- **Access**: Public (anyone can call)

#### `pickWinner()` - Select Winner
```solidity
function pickWinner() public restricted
```
- **Action**: Randomly selects a winner, transfers all funds, resets lottery
- **Access**: Manager only
- **Modifier**: `restricted`

#### `getPlayers()` - View Participants
```solidity
function getPlayers() public view returns (address[] memory)
```
- **Returns**: Array of all current player addresses
- **Access**: Public read-only

#### `random()` - Generate Random Number
```solidity
function random() private view returns (uint)
```
- **Internal function** for pseudo-random number generation
- Uses `block.prevrandao`, `block.timestamp`, and players array

### Modifier

#### `restricted`
```solidity
modifier restricted()
```
Ensures only the manager can execute certain functions

## How It Works

1. **Deployment**: Contract creator becomes the manager
2. **Entry Phase**: Players send ETH (≥0.01) to enter
3. **Winner Selection**: Manager calls `pickWinner()`
4. **Prize Distribution**: Winner receives entire contract balance
5. **Reset**: Players array cleared for next round

## Installation & Testing

### Prerequisites
```json
{
  "dependencies": {
    "ganache": "^7.9.2",
    "mocha": "^10.8.2",
    "solc": "^0.8.19",
    "web3": "^4.16.0"
  }
}
```

### Install Dependencies
```bash
npm install
```

### Run Tests
```bash
npm test
```

## Usage Example

```javascript
const { Web3 } = require('web3');
const web3 = new Web3('YOUR_PROVIDER_URL');

// Enter lottery
await lottery.methods.enter().send({
    from: '0xPlayerAddress',
    value: web3.utils.toWei('0.02', 'ether')
});

// Check players
const players = await lottery.methods.getPlayers().call();
console.log('Current players:', players);

// Pick winner (manager only)
await lottery.methods.pickWinner().send({
    from: '0xManagerAddress'
});
```

## Testing

The contract includes comprehensive tests:
- ✅ Contract deployment
- ✅ Single player entry
- ✅ Multiple players entry
- ✅ Minimum ETH requirement
- ✅ Manager-only winner selection
- ✅ Prize distribution and reset

Run tests with: `npm test`

## Security Considerations

⚠️ **WARNING**: This contract is for educational purposes only.

### Known Limitations

1. **Pseudo-Random Generation**: The `random()` function uses `block.prevrandao`, `block.timestamp`, and `players` array, which can be predicted or manipulated by miners.

2. **No Refund Mechanism**: Once entered, players cannot withdraw their ETH.

3. **Manager Trust**: The system relies entirely on the manager to pick winners fairly.

### Production Recommendations

For production deployment, implement:
- **Chainlink VRF** for truly random number generation
- **Time-locked rounds** with automatic winner selection
- **Multi-signature** for manager actions
- **Emergency pause** functionality
- **Refund mechanism** if lottery cancelled

## Contract Code

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Lottery {
    address public manager;
    address[] public players;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value >= 0.01 ether);
        players.push(msg.sender);
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, players)));
    }

    function pickWinner() public restricted {
        uint index = random() % players.length;
        payable(players[index]).transfer(address(this).balance);
        players = new address[](0);
    }

    function getPlayers() public view returns (address[] memory){
        return players;
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
}
```

## License

MIT

## Solidity Version

```solidity
pragma solidity ^0.8.19;
```

## Contributing

This is an educational project. Feel free to fork and improve!

---

**Disclaimer**: This contract is for learning purposes. Do not deploy to mainnet without proper security audits and improvements.