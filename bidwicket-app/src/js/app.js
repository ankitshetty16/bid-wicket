// App = {
//     url:"http://127.0.0.1:7545",
//     web3: null,
//     contracts: {},
//     address:' 0xe210387Bc3Ba15D646dEf0742f68e90b86835C0c',
//     network_id:5777, // 5777 for local
//     handler:null,
//     value:1000000000000000000,
//     init:function() {
//         console.log("Inside init");
//         return App.initWeb3();
//     },

//     initWeb3: function() {
//         if (typeof web3 !== 'undefined') {
//             App.web3 = new Web3(Web3.givenProvider);
//           } else {
//             App.web3 = new Web3(App.url);
//           }
//           ethereum.enable();
//           console.log("Inside web3");  
//         return App.initContract();
//     },

//     initContract: function() {
//         App.contracts.bidWicket = new App.web3.eth.Contract(App.address,{});
//         getJson('data.json',function(data){
//             return App.bindEvents();
//         })
//     },

//     bindEvents: function()
//     {
//         $(document).on('click','.card',function(){
//             App.handleBuy(1);});
//     },

//     handleBuy: function(val){
//         if (val == 0)
//         {
//             alert('Invalid entry');
//         }
//         var option={from:App.handler} 
//         App.contracts.bidWicket.methods.buy(val)
//         .send(option)
//         .on('receipt',(receipt)=>{
//         if(receipt.status){
//           toastr.success("Player bought for " + val);
//         }})

//     }
// }
App = {
    web3: null,
    url:"http://127.0.0.1:7545",
    contracts: {},
    address:'0xe210387Bc3Ba15D646dEf0742f68e90b86835C0c',
    network_id:3, // 5777 for local
    handler:null,
    value:1000000000000000000,
    index:0,

    init: function() {
      return App.initWeb3();
    },
  
    initWeb3: function() {         
      if (typeof web3 !== 'undefined') {
        App.web3 = new Web3(Web3.givenProvider);
      } else {
        App.web3 = new Web3(App.url);
      }
      ethereum.enable();  

      console.log("Inside web3"); 
         
      return App.initContract();  
    },

    initContract: function() { 
      App.contracts.Counter = new App.web3.eth.Contract(App.abi,App.address, {});
      // console.log(random)
      getJson('data.json',function(data){
                    return App.bindEvents();
                })   
      return App.bindEvents();
    },  
  
    bindEvents: function()
    {
        $(document).on('click','.card',function(){
            App.handleBuy(1);});
    },

    handleBuy: function(val){
        if (val == 0)
        {
            alert('Invalid entry');
        }
        var option={from:App.handler} 
        App.contracts.bidWicket.methods.buy(val)
        .send(option)
        .on('receipt',(receipt)=>{
        if(receipt.status){
          toastr.success("Player bought for " + val);
        }})

    }, 
  abi:[
    {
      "constant": false,
      "inputs": [
        {
          "name": "price",
          "type": "int256"
        }
      ],
      "name": "buy",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    }
  ]

  }
  
  $(function() {
    $(window).load(function() {
      App.init();
      toastr.options = {
        // toastr.options = {
          "closeButton": true,
          "debug": false,
          "newestOnTop": false,
          "progressBar": false,
          "positionClass": "toast-bottom-full-width",
          "preventDuplicates": false,
          "onclick": null,
          "showDuration": "300",
          "hideDuration": "1000",
          "timeOut": "5000",
          "extendedTimeOut": "1000",
          "showEasing": "swing",
          "hideEasing": "linear",
          "showMethod": "fadeIn",
          "hideMethod": "fadeOut"
        // }
      };
    });
  });
  

