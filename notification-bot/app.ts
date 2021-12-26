import { Client, ClientOptions, Intents, User } from "discord.js";
import express from "express";
import config from "./config/config.json";

const app = express();
const port = 3000;
app.use(express.json());

const client = new Client({ intents: [Intents.FLAGS.GUILDS] } as ClientOptions);
let userId: string;
let receivers = new Array<User>();

const OWNER = process.env.OWNER || "";
const ENVIRONMENT = process.env.ENVIRONMENT
  ? process.env.ENVIRONMENT.toLocaleLowerCase()
  : process.exit();
const IS_LIVE = ENVIRONMENT === "live";

client.login(process.env.BOT_TOKEN);

client.once("ready", () => {
  console.log("Bot ready");
  if (config.sendStartupMessage) {
    client.users.fetch(OWNER).then((owner) => {
      owner.send("Bot has started");
    });
  }
  userId = client.user && client.user.id ? client.user.id : "";
  (config.receivers as Array<string>).forEach((receiver) => {
    client.users.fetch(receiver).then((user) => {
      receivers.push(user);
    });
  });
});

app.post("/notify", (req, res) => {
  const notification = req.body.notification;
  if (notification && typeof notification === 'string') {
    receivers.forEach((receiver) => {
      receiver.send(notification);
    });
    res.status(204).send();
  } else {
    res.status(400).send({
      error: {
        detail: "Request is malformed. Could not send the notification.",
      },
    });
  }
});

app.listen(port, () => {});
