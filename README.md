# sprintato

A Discord bot for writing sprints built on node and discordjs. Inspired by Sprinto.

1. Go and do the stuff you need to do on Discord to make a bot and get your bot token and whatnot. Don't forget to invite to your Discord-server!

2. Create a config.json in the root folder that looks like this:

```
{
    "prefix": "<Some prefix, recommended is exclamation mark>",
    "token": "<YOUR BOT TOKEN>"
}
```

3. Run
   `npm install discord.js`

4. Run
   `node index.js`

## TODO

1. ~~Make it actually work~~ (It kind of works now)
2. Add new commands:
   - `!time //Show remaining time`
   - `!join same //Join with previous word count`
   - `!leave //Leave sprint`
3. Check how it would work in different channels
4. Look into hosting it somewhere.

## (Implemented) Commands

| Command       | Effect                                                                      |
| ------------- | --------------------------------------------------------------------------- |
| !sprint       | starts a sprint with default values (20 minutes with 3 minutes buffer time) |
| !sprint #     | starts a # minute sprint                                                    |
| !Join #       | Joins sprint with # starting words, 0 if # is omitted                       |
| !wc #         | Reports new word count when sprint is finished                              |
| !cancel       | Cancels sprint that's about to start or is running                          |
| !setdefault # | Sets the default sprinting time to #                                        |

| Bonus     | Effect     |
| --------- | ---------- |
| !roll     | Rolls a d6 |
| !roll d#  | Rolls a d# |
| !roll #d# | rolls #d#s |
