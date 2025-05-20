const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const dataRoutes = require("./routes/data.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes d'authentification
app.use("/api/auth", authRoutes);

// Routes de données
app.use("/api", dataRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
