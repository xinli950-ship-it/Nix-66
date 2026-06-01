# Deployment Guide for Dream Matches

This project is built with Next.js and can be easily deployed to platforms like Vercel, Netlify, or any Node.js environment.

## Prerequisites

1.  **Kling AI API Keys:** You need `KLING_ACCESS_KEY` and `KLING_SECRET_KEY` from the Kling AI Global API dashboard.
2.  **Database:** The project currently uses a SQLite database via the `team-db` CLI tool. For production, you should migrate to a hosted Turso database or any other LibSQL/SQLite compatible provider.

## Environment Variables

Create a `.env.local` file (or set these in your deployment platform):

```env
KLING_ACCESS_KEY=your_access_key
KLING_SECRET_KEY=your_secret_key
USE_MOCK_VIDEO=true # Set to 'false' to use real Kling AI generation
TURSO_DATABASE_URL=your_turso_url (e.g., libsql://project-name.turso.io)
TURSO_AUTH_TOKEN=your_token
```

## Production Database Switch (Turso)

To switch from the local `team-db` / Mock mode to a live Turso database:

1.  **Provision a Turso Database**: Create a new database in your Turso dashboard.
2.  **Initialize Schema**: Run the following SQL commands in your Turso SQL shell to create the necessary tables:

    ```sql
    CREATE TABLE matches (
      id TEXT PRIMARY KEY,
      player1_id TEXT,
      player2_id TEXT,
      status TEXT,
      video_url TEXT,
      task_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE suggestions (
      id TEXT PRIMARY KEY,
      fighter1 TEXT,
      fighter2 TEXT,
      user_email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    ```
3.  **Update Environment Variables**: Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in your hosting provider (e.g., Vercel).
    *   **Development Tip**: You can use the production database URL for testing: `libsql://noxa-loanis7.aws-us-east-2.turso.io`.
4.  **Verify**: Use the `PRODUCTION_SWITCH_CHECKLIST.md` to ensure everything is working correctly.

## Deployment Steps

### Option 1: Vercel (Recommended)

1.  Push the code to a GitHub repository.
2.  Connect the repository to Vercel.
3.  Add the environment variables in the Vercel dashboard.
4.  Deploy!

### Option 2: Self-Hosted (Node.js)

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build the project:
    ```bash
    npm run build
    ```
4.  Start the server:
    ```bash
    npm start
    ```

## Post-Deployment Checklist

1.  **Verify API Connectivity:** Ensure the Kling AI integration is working by generating a test match.
2.  **Check Database Persistence:** Confirm that match data is being saved and can be retrieved via the status API.
3.  **SEO Verification:** Check that the sitemap and robots.txt are accessible at `/sitemap.xml` and `/robots.txt`.
4.  **Social Sharing:** Test the Open Graph tags using tools like the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or [Twitter Card Validator](https://cards-dev.twitter.com/validator).
