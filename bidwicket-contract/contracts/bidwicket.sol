// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./ERC20.sol";

contract bidwicket is ERC20Basic{
  address auctioneer;
  struct playerInfo
  {
    uint price;
    bool registered;
    address payable addr;
    bool alreadySold;
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
  address currentPlayerInAuction;


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

  modifier alreadySold(address playerAddr)
  {
    require(playerMembership[playerAddr].alreadySold == false,"Player already registered");
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

  modifier notCurrentHighestBidder()
  {
    require(msg.sender != currentBidderAddress);
    _;
  }

  modifier checkBidPhase()
  {
    require(state == Phase.bid,"Not in valid state");
    _;
  }

  constructor() {
    auctioneer = msg.sender;
  }
  
  function register(uint price) public payable alreadyRegistered buyerBalance
  {
    playerMembership[msg.sender].price = price;
    playerMembership[msg.sender].registered = true;
    playerMembership[msg.sender].addr = payable(msg.sender);
    playerMembership[msg.sender].alreadySold = false;
  }

  function buy(address playerAddr) public payable onlyRegisteredPlayer(playerAddr) buyerBalance alreadySold(playerAddr)
  { 
    uint amount = msg.value;
    playerMembership[playerAddr].addr.transfer(amount);
    playerMembership[msg.sender].alreadySold = true;
  }

  function changePhase(Phase newPhase) public onlyAuctioneer
  { 
    if(state == Phase.done){
      address payable transferAcc = payable(currentPlayerInAuction);
      transferAcc.transfer(currentBidValue);
      currentBidValue = 0;
      buyers[currentPlayerInAuction].status = 0;
      buyers[currentPlayerInAuction].amount = 0;
    }
    state = newPhase;
  }


  function bid(address playerAddr) public payable newBid checkBidPhase buyerBalance returns (uint bidValue,address bidderAddress)
  {
    buyers[msg.sender].addr = payable(msg.sender);
    buyers[msg.sender].amount = msg.value;
    buyers[msg.sender].status = 1;
    currentBidValue = msg.value;
    currentBidderAddress = msg.sender;
    bidValue = currentBidValue;
    bidderAddress = currentBidderAddress;
    currentPlayerInAuction = playerAddr;
  }

  function withdraw() public payable alreadyBidded notCurrentHighestBidder
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

  function getCurrentPhase() public view returns (Phase currentPhase)
  {
    currentPhase = state;
  }

  function getHth(uint256 tok) public payable{
    // ERC20 c = ERC20(auctioneer);
    transfer(msg.sender, tok);
  }

}
