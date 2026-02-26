# NetZeal Auth Pages (Static)

The authentication pages are built for a static hosting environment using a directory-based routing strategy.

Deploy these files/directories to the root of your web server:

- `verify-email/index.html`
- `reset-password/index.html`
- `config.js`

## Required URL mapping

Because of the directory structure (`folder/index.html`), static web servers (like Nginx, Apache, Netlify, Vercel, S3) will automatically resolve these URLs:

- `https://netzeal.in/verify-email?token=...`
- `https://netzeal.in/reset-password?token=...`

## Frontend Configuration

Both pages load the API Base URL from a global configuration file `config.js`.
To change the backend URL for your production environment, simply update `config.js`:

```javascript
window.ENV = {
  API_BASE_URL: "https://api.netzeal.in/api/v1"
};
```
(If `config.js` fails to load or is missing, it will securely fallback to `https://api.netzeal.com/api/v1`)

## Backend env

Set in backend `.env`:

- `FRONTEND_BASE_URL=https://netzeal.in`

This makes email links point to your website auth pages.
