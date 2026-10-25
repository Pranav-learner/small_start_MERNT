import "dotenv/config";
import app from "./app";
import { connectDatabase } from "./config/database";

const PORT = process.env.PORT || 5000;

async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(
      "Failed to start server:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

void startServer();