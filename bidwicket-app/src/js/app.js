App = {
    web3Provider: null,
    contracts: {},
    names: new Array(),
    url: 'http://127.0.0.1:7545',
    chairPerson:null,
    currentAccount:null,
    init: function() {
      return App.initWeb3();
    },
  
    initWeb3: function() {
          // Is there is an injected web3 instance?
      if (typeof web3 !== 'undefined') {
        App.web3Provider = ethereum;
      } else {
        // If no injected web3 instance is detected, fallback to the TestRPC
        App.web3Provider = new Web3.providers.HttpProvider(App.url);
      }
      web3 = new Web3(App.web3Provider);
  
      ethereum.enable();
  
      return App.initContract();
    },
  
    initContract: function() {
        $.getJSON('bidwicket.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with truffle-contract
              var appArtifact = data;

              web3.eth.defaultAccount=web3.eth.accounts[0];

              App.contracts.cric = TruffleContract(appArtifact);
            //   // Set the provider for our contract
              App.contracts.cric.setProvider(App.web3Provider);
            
            //   App.getChairperson();
            return App.bindEvents();
        });
    },
  
    bindEvents: function()
    {
        $(document).on('click','.card',function(){
            App.handleBuy(1);});
    },

    handleBuy: function(val){
      console.log('handleBuy called');
        if (val == 0)
        {
            alert('Invalid entry');
        }
        App.contracts.cric.deployed().then(function(instance) 
        {
            cricInstance = instance;
            return cricInstance.buy(val);
        }).then(function(result, err){
            if(result){
                if(parseInt(result.receipt.status) == 1)
                alert("Player bought successfully")
                else
                alert(" buy not done successfully due to revert")
            } else {
                alert(" buy failed")
            }   
        })

    }, 
    // abi: [
    //     {
    //       "inputs": [],
    //       "stateMutability": "nonpayable",
    //       "type": "constructor"
    //     },
    //     {
    //       "inputs": [
    //         {
    //           "internalType": "uint256",
    //           "name": "price",
    //           "type": "uint256"
    //         }
    //       ],
    //       "name": "register",
    //       "outputs": [],
    //       "stateMutability": "payable",
    //       "type": "function",
    //       "payable": true
    //     },
    //     {
    //       "inputs": [
    //         {
    //           "internalType": "uint256",
    //           "name": "price",
    //           "type": "uint256"
    //         }
    //       ],
    //       "name": "buy",
    //       "outputs": [],
    //       "stateMutability": "payable",
    //       "type": "function",
    //       "payable": true
    //     }
    //   ]
  }

  //   bindEvents: function() {
  //     $(document).on('click', '.btn-vote', App.handleVote);
  //     $(document).on('click', '#win-count', App.handleWinner);
  //     $(document).on('click', '#register', function(){ var ad = $('#enter_address').val(); App.handleRegister(ad); });
  //   },
  
  //   populateAddress : function(){
  //     new Web3(new Web3.providers.HttpProvider(App.url)).eth.getAccounts((err, accounts) => {
  //       web3.eth.defaultAccount=web3.eth.accounts[0]
  //       jQuery.each(accounts,function(i){
  //         if(web3.eth.coinbase != accounts[i]){
  //           var optionElement = '<option value="'+accounts[i]+'">'+accounts[i]+'</option';
  //           jQuery('#enter_address').append(optionElement);  
  //         }
  //       });
  //     });
  //   },
  
  //   getChairperson : function(){
  //     App.contracts.vote.deployed().then(function(instance) {
  //       return instance;
  //     }).then(function(result) {
  //       App.chairPerson = result.constructor.currentProvider.selectedAddress.toString();
  //       App.currentAccount = web3.eth.coinbase;
  //       if(App.chairPerson != App.currentAccount){
  //         jQuery('#address_div').css('display','none');
  //         jQuery('#register_div').css('display','none');
  //       }else{
  //         jQuery('#address_div').css('display','block');
  //         jQuery('#register_div').css('display','block');
  //       }
  //     })
  //   },
  
  //   handleRegister: function(addr){
  //     var voteInstance;
  //     web3.eth.getAccounts(function(error, accounts) {
  //     var account = accounts[0];
  //     App.contracts.vote.deployed().then(function(instance) {
  //       voteInstance = instance;
  //       return voteInstance.register(addr, {from: account});
  //     }).then(function(result, err){
  //         if(result){
  //             if(parseInt(result.receipt.status) == 1)
  //             alert(addr + " registration done successfully")
  //             else
  //             alert(addr + " registration not done successfully due to revert")
  //         } else {
  //             alert(addr + " registration failed")
  //         }   
  //     })
  //     })
  // },
  
  //   handleVote: function(event) {
  //     event.preventDefault();
  //     var proposalId = parseInt($(event.target).data('id'));
  //     var voteInstance;
  
  //     web3.eth.getAccounts(function(error, accounts) {
  //       var account = accounts[0];
  
  //       App.contracts.vote.deployed().then(function(instance) {
  //         voteInstance = instance;
  
  //         return voteInstance.vote(proposalId, {from: account});
  //       }).then(function(result, err){
  //             if(result){
  //                 console.log(result.receipt.status);
  //                 if(parseInt(result.receipt.status) == 1)
  //                 alert(account + " voting done successfully")
  //                 else
  //                 alert(account + " voting not done successfully due to revert")
  //             } else {
  //                 alert(account + " voting failed")
  //             }   
  //         });
  //     });
  //   },
  
  //   handleWinner : function() {
  //     console.log("To get winner");
  //     var voteInstance;
  //     App.contracts.vote.deployed().then(function(instance) {
  //       voteInstance = instance;
  //       return voteInstance.reqWinner();
  //     }).then(function(res){
  //     console.log(res);
  //       alert(App.names[res] + "  is the winner ! :)");
  //     }).catch(function(err){
  //       console.log(err.message);
  //     })
  //   }
  // };
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
  