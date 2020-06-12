# kudos-me
A Slack chat bot


# Development

Create `.env` from `.env-sample`.

```
nvm use
npm i
npm run dev
```

Use [ngrok](https://ngrok.com/) to expose your local

```
ngrok http -region=ap -subdomain=unique-kudos-me-duck 3000
```

# Features

## Kudos
- Register a `/kudos` command for recording all kudos messages of people. Everyone has 10 kudos per day. Also provided a dashboard to show top kudos givers and revivers

## Poll
- Register a `/poll` command to provide the feature into workspace.
