// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract bidwicket {
  address auctioneer;
  struct playerInfo
  {
    uint price;
    bool registered;
  }
  mapping (address=>playerInfo) playerMembership;
  mapping (address=>uint) buyers;

  constructor() public {
    auctioneer = msg.sender;
  }

  function register(uint price) public payable
  {
    playerMembership[msg.sender].price = price;
    playerMembership[msg.sender].registered = true;
  }

  function buy(uint price) public payable
  {
    if (price != 15)
    {
        revert();
    }
  }

}
