// ticket.controller.js
const Ticket = require("../models/ticket.model"); // Assurez-vous que le chemin est correct

// Cette fonction prend en charge la récupération des tickets pour chaque client
module.exports = (pool, io) => {
  const ticketController = {
    async getAllTickets(req, res) {
      try {
        console.log("Requête reçue pour récupérer les tickets");
        let allTickets = {};

        if (req.user.role === "globaladmin") {
          // Le globaladmin voit tous les tickets
          for (const client in pool) {
            const clientPool = pool[client];
            const ticket = new Ticket(clientPool, io);
            const tickets = await ticket.getAllTickets();
            allTickets[client] = tickets;
          }
        } else if (req.user.role === "superadmin1") {
          // superadmin1 ne voit que les tickets de techno1
          const ticket = new Ticket(pool.techno1, io);
          allTickets.techno1 = await ticket.getAllTickets();
        } else if (req.user.role === "superadmin2") {
          // superadmin2 ne voit que les tickets de techno2
          const ticket = new Ticket(pool.techno2, io);
          allTickets.techno2 = await ticket.getAllTickets();
        }

        //     console.log("Réponse finale envoyée :", JSON.stringify(allTickets, null, 2));
        res.status(200).json(allTickets);
      } catch (err) {
        console.error("Erreur lors de la récupération des tickets :", err);
        res.status(500).json({ error: "Impossible de récupérer les tickets." });
      }
    },
    async statTickets(req, res) {
      try {
        let allTickets = {};
        let priorityStats = { all: {} };
        console.log(" pool ", pool);
        if (req.user.role === "globaladmin") {
          for (const client in pool) {
            const clientPool = pool[client];
            const ticket = new Ticket(clientPool, io);
            const tickets = await ticket.getAllTickets();
            allTickets[client] = tickets;
          }
        } else if (req.user.role === "superadmin1") {
          const ticket = new Ticket(pool.techno1, io);
          allTickets.techno1 = await ticket.getAllTickets();
        } else if (req.user.role === "superadmin2") {
          const ticket = new Ticket(pool.techno2, io);
          allTickets.techno2 = await ticket.getAllTickets();
        }

        priorityStats.all = {};

        for (const key in allTickets) {
          const tickets = allTickets[key];

          priorityStats[key] = tickets.reduce((acc, ticket) => {
            const priority = ticket.priority || "Unknown";
            acc[priority] = (acc[priority] || 0) + 1;
            return acc;
          }, {});

          tickets.forEach((ticket) => {
            const priority = ticket.priority || "Unknown";
            priorityStats.all[priority] =
              (priorityStats.all[priority] || 0) + 1;
          });
        }

        res.status(200).json({
          allTickets,
          priorityStats,
        });
      } catch (err) {
        console.error("Erreur lors de la récupération des tickets :", err);
        res.status(500).json({ error: "Impossible de récupérer les tickets." });
      }
    },
  };

  return ticketController;
};
