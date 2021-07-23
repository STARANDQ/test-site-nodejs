let express = require("express");
let app = express();



app.get('/', function(request, response) {
    response.send('Hello World!');
});

let port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});