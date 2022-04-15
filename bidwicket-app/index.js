var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require("body-parser");
var file = require("./src/data.json");
app.use(express.static('src'));
app.use(express.static('../bidwicket-contract/build/contracts'));
app.get('/', function(req, res) {
    res.render('index.html');
});

app.use(bodyParser.urlencoded({
    extended: false
}));

app.post('/saveToFile', function (req, res) {
    file = JSON.parse(req.body.data);
       fs.writeFile("./src/data.json", JSON.stringify(file, null, 2), function (err) {
        if (err) return console.log(err);
        res.send({ status: 'ok' });
      });
});


app.listen(3000,function(){
    console.log('Bidwicket application is running on port 3000!');
});