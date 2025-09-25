const fs = require("fs");
const messages = require("../lang/en/en.json");

class Utils {
  static sendResponse(response, statusCode, contentType, message) {
    response.writeHead(statusCode, { "Content-Type": contentType });
    response.end(message);
  }

  static appendToFile(filePath, content) {
    fs.appendFileSync(filePath, content + "\n", "utf8");
  }

  static showFileContent(filePath, res) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    Utils.sendResponse(res, 200, "text/plain", fileContent);
  }

  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  static invalidRoute(res) {
    Utils.sendResponse(
      res,
      404,
      "text/html",
      `<html><body><h3>${messages.invalidRoute}</h3></body></html>`
    );
  }

  static checkRoute(receivedRoute, expectedRoute) {
    return receivedRoute === expectedRoute;
  }

  static fileNotFound(res) {
    Utils.sendResponse(
      res,
      404,
      "text/html",
      `<html><body><h3>${messages.fileNotFound}</h3></body></html>`
    );
  }

  static fileNotFoundWithName(res, fileName) {
    const message = messages.fileNotFoundWithName.replace("%1", fileName);

    Utils.sendResponse(res, 404, "text/html", `<html><body><h3>${message}</h3></body></html>`);
  }
}

module.exports = Utils;
