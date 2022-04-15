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
              App.contracts.cric.defaults({gasLimit:"100000"});
            //   // Set the provider for our contract
              App.contracts.cric.setProvider(App.web3Provider);
            
            //   App.getChairperson();
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
      })          
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
    }
  }
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
  
