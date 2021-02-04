# wizekit-slack-app

A Slack App for a collection of tools like giving appreciation, poll, sending messages anonymously etc.

New commands are welcome.

# Frontend Repository

https://github.com/wizeline/kudos-me-fe

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
- Register a `/kudos` command for recording all kudos messages of people. Everyone has 10 kudos per day. Also provided a dashboard to show top kudos givers and receivers
- Endpoints:
	-  Command: `http://localhost:3000/commands/kudos-me`

## Poll
- Register a `/poll` command to provide the feature into workspace.
- Endpoints:
	- Command: `http://localhost:3000/interactive/endpoint`
	- Interactivity: `http://localhost:3000/commands/wize-poll`


# Deployment
## GCP

### Resources
- Google CloudRun
- DataStore

### Environment variables
- SLACK_TOKEN: xoxb-

### Script

https://github.com/wizeline/wizekit-slack-app/blob/main/cloudbuild/cloudrun.yaml

