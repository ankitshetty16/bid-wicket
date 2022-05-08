App = {
    web3Provider: "https://ropsten.infura.io/v3/8cf80ccb22dd4231b0b609cad3f58383",
    contracts: {},
    url: 'http://127.0.0.1:7545',
    auctioneer:null,
    currentAccount:null,
    init: function() {
      return App.initWeb3();
    },
  
    initWeb3: function() {
      if (typeof web3 !== 'undefined') {
        App.web3Provider = ethereum;
      } else {
        App.web3Provider = new Web3.providers.HttpProvider(App.url);
      }
      web3 = new Web3(App.web3Provider);
  
      ethereum.enable();
  
      return App.initContract();
    },
  
    initContract: function() {
        $.getJSON('bidwicket.json', function(data) {
              var appArtifact = data;

              web3.eth.defaultAccount=web3.eth.accounts[0];

              App.contracts.cric = TruffleContract(appArtifact);
              App.contracts.cric.defaults({gasLimit:"100000"});
              App.contracts.cric.setProvider(App.web3Provider);
            
              App.getCurrentPhase();
              App.getHthBalance();

            return App.bindEvents();
        });     
    },
    bindEvents: function()
    {
      /* Register a player */
        $(document).on('click','#register-button',function(_event){
          pName = document.getElementById('name').value;
          type = document.getElementById('player-type').value;
          price = document.getElementById('price').value;

          if(price != ""){
            App.registerPlayer(pName,type,price);
          }
        });      
      /* Buy a player */ 
        $(document).on('click','.buy-now',function(event){
            playerInfo = JSON.parse(event.target.value);        
            App.buyPlayer(playerInfo);
        });
      /* Bid for player */ 
        $(document).on('click','.bid-now',function(event){
          playerInfo = JSON.parse(event.target.value);     
          App.newBid(playerInfo);
        });
      /* Withdraw amount */ 
        $(document).on('click','.withdraw-bid',function(){
          App.withdrawAmt();
        });
      /* Change Phase */ 
      $(document).on('click','.change-phase',function(event){
        var newPhase = currentPhase == 2 ? 0: currentPhase + 1;
        var playerInfo = JSON.parse(event.target.value);
        App.changePhase(newPhase,playerInfo);
      });
      /* To get current Bid Value */
      $(document).on('click','.bid-value',function(event){
        var playerInfo = JSON.parse(event.target.value);
        App.getCurrentBidInfo(playerInfo);
      });
      /* To get HTH for users from main account */
      $(document).on('click','#ad-button',function(event){
        var amount = document.getElementById('token-amt').value;
        var bAddress = document.getElementById('b-address').value;
        console.log();
        if(amount && bAddress){
          App.airDropHth(bAddress,amount);
        }else{
          alert("You are required to fill in both address and amount");
        }
      });      
    },

    registerPlayer: function(pName,type,price){
      web3.eth.getAccounts(function(_error, accounts) {
        var account = accounts[0];
        App.contracts.cric.deployed().then(function(instance) 
        {
          cricInstance = instance;
          return cricInstance.register(parseInt(price),{from: account, value: 1*10**18});
        }).then(function(result, _err){
          if(result){
              if(parseInt(result.receipt.status) == 1){
                info = {
                  "pAddress": account,
                  "name": pName,
                  "price": price,
                  "type": type
                }
                App.updateRecords(info,type,'fresh');
                alert("Registration Successful");
              }else if(parseInt(result.receipt.status) == 2){
                alert(" Player already registered by this account!");
              }else{
                alert("Registration failed due to insufficient funds");
              }
          } else {
              alert("Registration Failed");
          }   
        });     
      });
    },

    updateRecords: function(playerRecord,type,txType) {
      fetch("data.json").then(response => {return response.json();})
      .then((playerInfo) => {
        var updatedRecords = playerInfo;

        if (txType == "fresh"){
          var len = parseInt(updatedRecords[type].length)+1;
          playerRecord.id = type.slice(0,3)+"_"+len;
          playerRecord.sold = "";
          playerRecord.purchasedBy = "";
          playerRecord.type = playerRecord.type;
          updatedRecords[type].push(playerRecord);
        }else if (txType == "update"){
          updatedRecords[type].filter(x => x.id === playerRecord.id).map(record =>{
            record.sold = playerRecord.sold;
            record.purchasedBy = playerRecord.purchasedBy;
            if(playerRecord.currentBid) { record.currentBid = playerRecord.currentBid; };
            if(playerRecord.active == false) { record.active = playerRecord.active };
          });
        }

        $.post("/saveToFile",{data:JSON.stringify(updatedRecords)}, function(){
          document.location.reload();
        });
      });
    },    

    buyPlayer: function(playerInfo){
        web3.eth.getAccounts(function(_error, accounts) {
          var account = accounts[0];
          App.contracts.cric.deployed().then(function(instance) 
          {
              cricInstance = instance;
              price = parseInt(playerInfo.price);
              return cricInstance.buy(playerInfo.pAddress,{from: account, value: price*10**18});
          }).then(function(result, _err){
              if(result){
                  if(parseInt(result.receipt.status) == 1){
                    info={
                      "sold": playerInfo.price,
                      "purchasedBy": account,
                      "id": playerInfo.id
                    }

                    App.updateRecords(info,playerInfo.type,"update");
                    alert("Player bought successfully");
                  }else
                  alert("Purchase unsuccessful. Please try again.")
              } else {
                  alert("Purchase unsuccessful. Please make sure you have sufficient funds")
              }
          })
      });
    },

    getCurrentPhase: function(){
        App.contracts.cric.deployed().then(function(instance) 
        {
            cricInstance = instance;
            return cricInstance.getCurrentPhase();
        }).then(function(result, _err){
          currentPhase = result.c[0];
          displayPlayers();
        });       
    },  

    changePhase: function(phase,playerInfo){
      web3.eth.getAccounts(function(_error, accounts) {
        var account = accounts[0];
        App.contracts.cric.deployed().then(function(instance)
        {
            cricInstance = instance;
            return cricInstance.changePhase(phase,{from: account});
        }).then(function(result, _err){
            if(result && parseInt(result.receipt.status) == 1){
              App.getCurrentPhase();
              if (phase == 2){
                playerInfo.sold = playerInfo.currentBid;
                App.updateRecords(playerInfo,"marquee","update");
              }
              if (phase == 0){
                playerInfo.active = false;
                App.updateRecords(playerInfo,"marquee","update"); 
              }
              alert("Phase changed succesfully. Current Phase: "+auctionPhases[phase]);
              document.location.reload();
            } else {
                alert("Phase can only be changed by Auctioneer");
            }
        })
    });      
    },

    newBid: function(playerInfo){
      web3.eth.getAccounts(function(_error, accounts) {
        var account = accounts[0];
        App.contracts.cric.deployed().then(function(instance) 
        {
            cricInstance = instance;
            price = playerInfo.currentBid != "" ? parseInt(playerInfo.currentBid)+1 :parseInt(playerInfo.price);
            return cricInstance.bid(playerInfo.pAddress,{from: account, value: price*10**18});
        }).then(function(result, _err){
            if(result && parseInt(result.receipt.status) == 1){
                playerInfo.currentBid = price;
                playerInfo.purchasedBy = account;
                App.updateRecords(playerInfo,"marquee","update");
                alert("Bid placed succesfully. Current Bid: "+playerInfo.currentBid+"ETH by : "+playerInfo.purchasedBy);
            } else {
                alert("Error in placing bid");
            }
        })
    });      
    },

    withdrawAmt: function(){
      web3.eth.getAccounts(function(_error, accounts) {
        var account = accounts[0];
        App.contracts.cric.deployed().then(function(instance)
        {
            cricInstance = instance;
            return cricInstance.withdraw({from: account});
        }).then(function(result, _err){
            if(result && parseInt(result.receipt.status) == 1){
              alert("Amount withdrawn successfully");
              document.location.reload();
            } else {
                alert("Error in withdrawing amount.");
            }
        })
    });       
    },

    getCurrentBidInfo: function(playerInfo){
      App.contracts.cric.deployed().then(function(instance) 
      {
          cricInstance = instance;
          return cricInstance.getCurrentBidInfo();
      }).then(function(result, _err){
        if (result){
          playerInfo.currentBid = result[0].c[0]/10000;
          playerInfo.purchasedBy = result[1];
          App.updateRecords(playerInfo,"marquee","update");
        }
      });
    },

    getHthBalance: function(){
      web3.eth.getAccounts(function(_error, accounts) {
        var account = accounts[0];
        App.contracts.cric.deployed().then(function(instance){
          tokenInstance = instance;
            // return tokenInstance.getHeathereum(210000).then(function(res){
            return tokenInstance.balanceOf(account).then(function(res){
              var balance = res.c[0];
              console.log(res.c[0]);
              document.getElementById('hth-balance').innerHTML = "Account Balance: "+balance+" HTH";          
          })
        }).then(function(_result, err){
            if (err){
              alert('Something went wrong. Please try again!');
            }
          });
      });
    },

    airDropHth: function(bAddress,tokenValue){
      App.contracts.cric.deployed().then(function(instance){
        tokenInstance = instance;
          return tokenInstance.SendHeathereum(bAddress,tokenValue)
      }).then(function(result){
          if (result){
            document.location.reload();
          }
        });      
    }
  }
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
  
