# Deployment - Resume Builder

## Environments
* **Development / Local Run**: Runs using Express dev server or wrangler local preview:
  ```bash
  npm run dev
  ```
  or
  ```bash
  npx wrangler dev
  ```
* **Production**: Cloudflare Workers deployment at `https://professional.cvcraft.workers.dev`.

## Secrets Configuration
Before deployment, configure the OpenRouter API key inside Cloudflare Workers:
```bash
npx wrangler secret put OPENROUTER_API_KEY
```

## Publish Steps
To deploy the static assets and the worker logic to Cloudflare:
1. Ensure all local tests pass:
   ```bash
   python .validation/scripts/test-all.py
   ```
2. Deploy the Worker using wrangler:
   ```bash
   npx wrangler deploy
   ```
3. Verify the deployment at `https://professional.cvcraft.workers.dev/builder`.
