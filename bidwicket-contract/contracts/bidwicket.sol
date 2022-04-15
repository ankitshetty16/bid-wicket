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

  struct buyerInfo
  {
    address payable addr;
    uint amount;
    uint status;
  }

  mapping (address=>playerInfo) playerMembership;
  mapping (address=>buyerInfo) buyers;
  enum Phase{init,bid,done}
  Phase public state = Phase.init;
  uint currentBidValue = 0;
  address currentBidderAddress;

  constructor() {
    auctioneer = msg.sender;
  }

  modifier onlyRegisteredPlayer(address playerAddr)
  {
    require(playerMembership[playerAddr].registered == true,"Player not registered");
    _;
  }

  modifier buyerBalance()
  {
    require(msg.value <= msg.sender.balance, "Insufficient balance");
    _;
  }

  modifier alreadyRegistered()
  {
    require(playerMembership[msg.sender].registered == false,"Player already registered");
    _;
  }

  modifier isBiddingPhase()
  {
    require(state == Phase.bid);
    _;
  }

  modifier newBid()
  {
    require(buyers[msg.sender].status == 0,"Bidder needs to withdraw oldBid");
    _;
  }

  modifier alreadyBidded()
  {
    require(buyers[msg.sender].status == 1,"Bidder doesn't have an oldBid");
    _;
  }

  modifier onlyAuctioneer()
  {
    require(msg.sender == auctioneer,"Only auctioneer can change phase");
    _;
  }

  function register(uint price) public payable alreadyRegistered
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

  function changePhase(Phase newPhase) public onlyAuctioneer
  {
    state = newPhase;
  }

  function bid() public payable newBid
  {
    buyers[msg.sender].addr = payable(msg.sender);
    buyers[msg.sender].amount = msg.value;
    buyers[msg.sender].status = 1;
    currentBidValue = msg.value;
    currentBidderAddress = msg.sender;
  }

  function withdraw() public payable alreadyBidded
  { 
    uint amount = buyers[msg.sender].amount;
    buyers[msg.sender].addr.transfer(amount);
    buyers[msg.sender].status = 0;
    buyers[msg.sender].amount = 0;
  }

  function getCurrentBidInfo() public view returns (uint bidValue,address bidAddress)
  {
    bidValue = currentBidValue;
    bidAddress = currentBidderAddress;
  }

}
