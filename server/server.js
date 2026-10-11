require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");
const reminders = require("./services/reminderService");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Methynix server running on port ${PORT}`);
    });

    reminders.start();

    process.on("unhandledRejection", (err) => {
      console.error("Unhandled rejection:", err.message);
      server.close(() => process.exit(1));
    });
  })
  .catch((err) => {
    console.error("Could not connect to the database:", err.message);
    process.exit(1);
  });
