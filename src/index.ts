import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import bootstrap from "./app.bootstrap";

bootstrap();