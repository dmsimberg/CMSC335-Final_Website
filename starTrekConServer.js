const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(express.static(path.join(__dirname, "templates")));
app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({extended:false}));

const portNumber = 9876;

process.stdin.setEncoding("utf8");

console.log(`Web server started and running at http://localhost:${portNumber}`);

const registrations = require("./routes/registrations");
const eventData = require("./routes/eventData");

app.get("/", async (request, response) => {
    let text = "Live Long and Prosper!!";
  let klingon, forecast;

  const apiUrls = {
    klingon: `https://api.funtranslations.com/translate/klingon.json?text=${text}`,
    point: "https://api.weather.gov/points/38.989167,-76.936389",
  };

  try {
    const kResponse = await fetch(apiUrls.klingon);
    klingon = (await kResponse.json()).contents.translated;

  } catch (err) {
    console.log("One or more translation servers are busy.");
  }

  try {
    const pointResp = await fetch(apiUrls.point);
    const pointData = await pointResp.json();
    const forecastUrl = pointData.properties.forecast;

    const forecastResp = await fetch(forecastUrl);
    const forecastData = await forecastResp.json();
    forecast = forecastData.properties.periods[0].detailedForecast;
  } catch (err) {
    console.log("Weather service is unavailable.");
  }

  let variables = {
    translate: klingon || "Unavailable",
    forecast: forecast || "Unavailable",
  };
    response.render("welcome", variables);
});

app.use("/registrations", registrations);

app.use("/eventData", eventData);

app.listen(portNumber);

const prompt = "Stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on("readable", function () {
    const dataInput = process.stdin.read();
    if (dataInput !== null) {
      const command = dataInput.trim();
      if (command === "stop") {
        process.stdout.write("Shutting down the server\n");
        process.exit(0);
      }
      else {
        process.stdout.write(`Invalid command: ${dataInput}`);
      }
      process.stdout.write(prompt);
      process.stdin.resume();
    }
});