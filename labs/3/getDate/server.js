// Server.js
const http = require("http");
const url = require("url");
const utils = require("./modules/utils.js");
const messages = require("./lang/en/en.json");

const PORT = process.env.PORT || 8000;
const ROUTE = "/COMP4537/labs/3/getDate/";

class AppServer {
  constructor(port, route) {
    this.port = port;
    this.route = route;
  }

  formatMessage(template, ...values) {
    let result = template;
    values.forEach((val, i) => {
      result = result.replace(`%${i + 1}`, val);
    });
    return result;
  }

  handleRequest(req, res) {
    const reqUrl = url.parse(req.url, true);
    const path = reqUrl.pathname;

    if (path !== this.route) {
      const message = messages["404"] + " " + messages["tryRoute"];
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(`<html><body><p>${message}</p></body></html>`);
      return;
    }

    const name = reqUrl.query.name || messages.noName;
    const dateTimeNow = utils.getDateTimeNow();

    const message = this.formatMessage(messages.message, name, dateTimeNow);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<html><body><h3>${message}</h3></body></html>`);
  }

  start() {
    const server = http.createServer(this.handleRequest.bind(this));
    server.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}

const server = new AppServer(PORT, ROUTE);
server.start();