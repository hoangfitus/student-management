// server.ts
import app from "./app";
import logger from "./logger";

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
