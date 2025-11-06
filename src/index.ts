import "reflect-metadata";
import { createApp } from "@/infrastructure/web/http";
import { productionContainer } from "@/config/inversify.container";

const port = 3000;
const app = createApp(productionContainer);

app.listen(port, () => console.log(`Server listening on port ${port}...`));
