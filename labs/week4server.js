const http = require("http");

const server = 8000;

http
  .createServer(function (req, res) {
    console.log("The server received a request!");
    res.writeHead(200, { "Content-Type": "text/html", "Access-Control-Allow-Origin": "*" });
    res.end("Hello <b>you all! --------------------</b>");
  })
  .listen(server);

console.log("Server listening on port " + server);

// "text/html" means run the content as text/HTML, is there anything else? why not just HTML?
// HTML is categorized as a subtype of text that is why text/HTML