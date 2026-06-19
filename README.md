# Discord Voice MP3 Playback Bot

A lightweight Discord bot optimized to run via Docker. It listens for `!play` commands with attached `.mp3` files, joins the sender's voice channel, streams the file, and automatically cleans up after itself.

## Setup Instructions

1. **Clone the project repository** or extract files.
2. **Set up your environment properties**:
   - Duplicate `.env.example` and rename the copy to `.env`.
   - Open `.env` and replace `YOUR_BOT_TOKEN_HERE` with your real Discord bot token:

     ```env
     DISCORD_TOKEN=your-real-discord-bot-token
     ```

   - Do **not** leave the placeholder token in place. Discord rejects it and the container exits with `DiscordjsError [TokenInvalid]`.
3. **Launch the platform via Docker**:

   ```bash
   docker compose up -d --build
   ```

## Troubleshooting

### `DiscordjsError [TokenInvalid]: An invalid token was provided`

This means the bot was started without a valid token. Confirm that:

- `.env` exists next to `docker-compose.yml`.
- `.env` contains `DISCORD_TOKEN=` with the real token from the Discord Developer Portal.
- The token value does not include quotes, extra spaces, or the placeholder `YOUR_BOT_TOKEN_HERE`.
- You rebuilt/restarted the container after changing `.env`:

  ```bash
  docker compose up -d --build
  ```
