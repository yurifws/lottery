pragma solidity ^0.8.19;

contract Lottery {
    address public manager;

    constructor() public {
        manager = msg.sender;
    }
    
}