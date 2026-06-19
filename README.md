# Discord Voice MP3 Playback Bot

A lightweight Discord bot optimized to run via Docker. It listens for `!play` commands with attached `.mp3` files, joins the sender's voice channel, streams the file, and automatically cleans up after itself.

## Setup Instructions

1. **Clone the project repository** or extract files.
2. **Setup your environment properties**:
   - Duplicate `.env.example` and rename the copy to `.env`.
   - Open `.env` and configure your real bot string next to `DISCORD_TOKEN=`.
3. **Launch the platform via Docker**:
```bash
   docker compose up -d --build
