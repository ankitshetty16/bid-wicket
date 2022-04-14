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
  modifier validateBuy(address playerAddr)
  {
    require(msg.value == playerMembership[playerAddr].price);
    _;
  }

  function register(uint price) public payable
  {
    playerMembership[msg.sender].price = price;
    playerMembership[msg.sender].registered = true;
  }

  function buy(address playerAddr) public payable onlyRegisteredPlayer(playerAddr) validateBuy (playerAddr) 
  { 
    uint amount = msg.value - 1;
    playerMembership[playerAddr].addr.transfer(amount);
  }

}
