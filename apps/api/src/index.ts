import { app } from './app.js';

const port = process.env.PORT ?? 4000;

app.listen(Number(port), "0.0.0.0", () => {
  console.log(`[server]: Jago Akademi API running at http://localhost:${port}`);
});
