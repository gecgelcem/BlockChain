// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
contract FeeCollector{
    address public owner;
    uint256 public balance;
     constructor(){
         owner = msg.sender;
     }

     receive() payable external{ // will be called whenever someone send money to smart c.
         balance += msg.value; //represents in wei
     }

     function withdraw (uint256 amount, address payable receiveAddr) public  {
         require(msg.sender==owner,"Only owner can withdraw");
         require(balance >= amount,"Insufficent balance.");
         receiveAddr.transfer(amount);
         balance -= amount;
     }

}