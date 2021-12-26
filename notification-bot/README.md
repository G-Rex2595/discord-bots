# Notification Bot for Discord

This is a bot that literally just sends notifications that are sent to an endpoint `/notify` with
a body `{"notification": "notification to send here"}`. It's very rudimentary and still needs some
setup. Do not try to use this publicly without doing some serious security analysis on the thing.
Seriously, it's not ready for primetime, and if there's any vulnerabilities with it, I'm not
responsible. You've been warned.

Anyway, since the bot can only send notifications to preconfigured users, and there are no
preconfigured users, you'll need to add your user ID to the list of receivers in config.json. Don't
know how to do that? Well, the way I did it was I got my user ID from another bot that read in the
user data of a message, and I copied and stored that data for that bot, and for this one I copied
and stored that data again. You could also [try this](https://www.alphr.com/discord-find-user-id/).
Once you've got the user ID set in the receivers list, you will receive any properly formatted
notification sent to `/notify`. Literally all of them, so don't share with people you don't know or
don't like.

Feel free to modify this to suit your needs. I have ideas for what I would like to do with this, but
I'm in no rush to get them done, so go ahead. Have fun with it. Just don't try to make money off of
it without asking me first. I won't appreciate that.

## Running the bot

I guess I should  put some information here about running the thing. I haven't tried it on another
machine yet, but it should work with a simple `tsnode -r dotenv/config app.ts`. If that doesn't
work for you, leave an issue, and I'll get back to you on it when I get the chance.