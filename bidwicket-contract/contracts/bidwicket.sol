// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract bidwicket {
  address auctioneer;
  struct playerInfo
  {
    uint price;
    bool registered;
    address payable addr;
  }
  mapping (address=>playerInfo) playerMembership;
  mapping (address=>uint) buyers;

  constructor() {
    auctioneer = msg.sender;
  }

  modifier onlyRegisteredPlayer(address playerAddr)
  {
    require(playerMembership[playerAddr].registered == true);
    _;
  }

  modifier buyerBalance()
  {
    require(msg.value <= msg.sender.balance, "Insufficient balance");
    _;
  }

  function register(uint price) public payable
  {
    playerMembership[msg.sender].price = price;
    playerMembership[msg.sender].registered = true;
    playerMembership[msg.sender].addr = payable(msg.sender);
  }

  function buy(address playerAddr) public payable onlyRegisteredPlayer(playerAddr) buyerBalance
  { 
    uint amount = msg.value;
    playerMembership[playerAddr].addr.transfer(amount);
  }

}
