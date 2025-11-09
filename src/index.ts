import "reflect-metadata";
import { createApp } from "./infrastructure/web/http";
import { container } from "./config/inversify.container";

const port = 3000;
const app = createApp(container);

app.listen(port, () => console.log(`Server listening on port ${port}...`));
