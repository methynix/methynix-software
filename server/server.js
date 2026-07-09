require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Methynix server running on port ${PORT}`);
    });

    process.on("unhandledRejection", (err) => {
      console.error("Unhandled rejection:", err.message);
      server.close(() => process.exit(1));
    });
  })
  .catch((err) => {
    console.error("Could not connect to the database:", err.message);
    process.exit(1);
  });
