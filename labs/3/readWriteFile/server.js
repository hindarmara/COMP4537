const path = require("path");
const http = require("http");
const url = require("url");
const Utils = require("./modules/utils");
const messages = require("./lang/en/en.json");

const FILE_NAME = "file.txt";

class AppServer {
  constructor() {
    this.port = process.env.PORT || 8000;
    this.writerRoute = "/COMP4537/labs/3/writeFile/";
    this.readerRoute = "/COMP4537/labs/3/readFile/";
    this.filePath = path.join(__dirname, FILE_NAME);
    this.fileName = FILE_NAME;
  }

  handleWriterRequest(res, receivedRoute, queryText) {
    if (receivedRoute === this.writerRoute) {
      Utils.appendToFile(this.filePath, queryText);
      Utils.sendResponse(
        res,
        200,
        "text/html",
        `<html><body><h3>${messages.fileWritten}</h3></body></html>`
      );
    } else {
      Utils.invalidRoute(res);
    }
  }

  handleReaderRequest(res, receivedRoute) {
    console.log(`Received route: ${receivedRoute}`);

    // Check if the route starts with the reader route and extract filename
    if (receivedRoute.startsWith(this.readerRoute)) {
      const fileName = receivedRoute.substring(this.readerRoute.length);
      console.log(`Requested file: ${fileName}`);

      if (fileName === this.fileName) {
        console.log(`File path: ${this.filePath}`);
        Utils.showFileContent(this.filePath, res);
      } else {
        Utils.invalidRoute(res);
      }
    } else {
      Utils.invalidRoute(res);
    }
  }

  appMode(req, res, receivedRoute, queryText) {
    switch (true) {
      case req.url.startsWith(this.writerRoute):
        this.handleWriterRequest(res, receivedRoute, queryText);
        break;

      case req.url.startsWith(this.readerRoute):
        if (!Utils.fileExists(this.filePath)) {
          Utils.fileNotFound(res);
          return;
        }
        this.handleReaderRequest(res, receivedRoute);
        break;

      default:
        Utils.invalidRoute(res);
    }
  }

  start() {
    http
      .createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        const receivedRoute = parsedUrl.pathname;
        const queryText = parsedUrl.query.text || messages.noQuery;

        console.log(`Received URL: ${req.url}`);
        console.log(`Received route: ${receivedRoute}`);
        console.log(`Received query: ${queryText}`);

        this.appMode(req, res, receivedRoute, queryText);
      })
      .listen(this.port);

    console.log(`Server running at port: ${this.port}`);
  }
}

const app = new AppServer();
app.start();
