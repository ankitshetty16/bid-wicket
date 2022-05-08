pragma solidity ^0.8.0;

interface IERC20 {

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);


    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


contract ERC20Basic is IERC20 {

    string public constant name = "Heathereum";
    string public constant symbol = "HTH";
    uint8 public constant decimals = 0;
    address HthOwner;


    mapping(address => uint256) balances;

    mapping(address => mapping (address => uint256)) allowed;

    uint256 totalAmount;

   constructor() {
    HthOwner = msg.sender;
    totalAmount = 50000*10**14;
    balances[msg.sender] = totalAmount;
    }

    modifier onlyOwner(){
    require(msg.sender == HthOwner,"Only owner is allowed to airdrop");
    _;
    }

    function totalSupply() public override view returns (uint256) {
    return totalAmount;
    }

    function balanceOf(address tokenOwner) public override view returns (uint256) {
        return balances[tokenOwner];
    }

    function transfer(address receiver, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender]-numTokens;
        balances[receiver] = balances[receiver]+numTokens;
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    function transferFromOwner(address receiver,uint256 numTokens) public returns (bool) {
        require(numTokens <= balances[HthOwner]);
        balances[HthOwner] = balances[HthOwner] - numTokens;
        balances[receiver] = balances[receiver] + numTokens;
        emit Transfer(HthOwner,receiver,numTokens);
        return true;
    }

    function approve(address delegate, uint256 numTokens) public override returns (bool) {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    function allowance(address owner, address delegate) public override view returns (uint) {
        return allowed[owner][delegate];
    }

    function transferFrom(address owner, address buyer, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[owner]);
        require(numTokens <= allowed[owner][msg.sender]);

        balances[owner] = balances[owner]-numTokens;
        allowed[owner][msg.sender] = allowed[owner][msg.sender]-numTokens;
        balances[buyer] = balances[buyer]+numTokens;
        emit Transfer(owner, buyer, numTokens);
        return true;
    }

    function SendHeathereum(address receiver,uint256 numTokens) onlyOwner public {
        require(numTokens <= 100);
        require(balances[HthOwner] > numTokens);
        balances[receiver] = balances[receiver] > 0 ? balances[receiver] + numTokens:numTokens;
        balances[HthOwner] = balances[HthOwner] - numTokens;
        emit Transfer(HthOwner, receiver, numTokens);
    }

}
