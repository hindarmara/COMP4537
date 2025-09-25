const http = require("http");
const url = require("url");
const utils = require("./modules/utils.js");
const messages = require("./lang/en/en.json");

const PORT = process.env.PORT || 8000;

// https://yourDomainName.xyz/COMP4537/labs/3/getDate/?name=John
const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);

  const path = reqUrl.pathname; // "/COMP4537/labs/3/getDate/"
  console.log(`Path: ${path}`);
  console.log(`Query: ${JSON.stringify(reqUrl.query)}`);

  const name = reqUrl.query.name || "Stranger";
  console.log(`Name: ${name}`);

  const dateTimeNow = utils.getDateTimeNow();
  console.log(`Date and time now: ${dateTimeNow}`);

  const message = messages.message.replace("%1", name).replace("%2", dateTimeNow);
  console.log(`Message: ${message}`);

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(
    `<html>
      <body>
        <p>${message}</p>
      </body>
    </html>`
  );
});

server.listen(PORT);
