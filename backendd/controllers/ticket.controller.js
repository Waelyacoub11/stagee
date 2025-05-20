// ticket.controller.js
const Ticket = require("../models/ticket.model"); // Assurez-vous que le chemin est correct

// Cette fonction prend en charge la récupération des tickets pour chaque client
module.exports = (pool, io) => {
  // Fonction utilitaire pour calculer les statistiques par statut
  const calculateStatusStats = (tickets) => {
    console.log("Calculant les statistiques pour", tickets.length, "tickets");
    
    const stats = tickets.reduce((acc, ticket) => {
      // Vérifier si le statut est dans ticket.statut (et non ticket.status)
      const status = ticket.statut || ticket.status || "Inconnu";
      console.log("Ticket ID:", ticket.idticket, "Statut:", status);
      
      // Simplifier les noms de statut pour se concentrer sur "Résolu" et "Ouvert"
      let simplifiedStatus;
      if (status.toLowerCase().includes("resolu") || 
          status.toLowerCase().includes("résolu") || 
          status.toLowerCase().includes("fermé") || 
          status.toLowerCase().includes("ferme") || 
          status.toLowerCase().includes("closed") || 
          status.toLowerCase().includes("resolved") || 
          status.toLowerCase().includes("complete")) {
        simplifiedStatus = "Résolu";
      } else {
        simplifiedStatus = "Ouvert";
      }
      
      acc[simplifiedStatus] = (acc[simplifiedStatus] || 0) + 1;
      return acc;
    }, {});
    
    console.log("Statistiques calculées:", stats);
    return stats;
  };
  
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
    
    async statTicketsByStatus(req, res) {
      try {
        console.log("🔍 Récupération des statistiques de tickets par statut...");
        const selectedBase = req.body.selectedBase;
        let allTickets = {};
        let statusStats = { tot: {} };
        
        // Filtrage selon le rôle de l'utilisateur
        if (req.user.role === "globaladmin") {
          // Si une base spécifique est sélectionnée pour le globaladmin
          if (selectedBase && pool[selectedBase]) {
            console.log(`Globaladmin - Base sélectionnée: ${selectedBase}`);
            const clientPool = pool[selectedBase];
            const ticket = new Ticket(clientPool, io);
            const tickets = await ticket.getAllTickets();
            allTickets[selectedBase] = tickets;
            
            // Calcul des statistiques par statut pour la base sélectionnée
            statusStats[selectedBase] = calculateStatusStats(tickets);
            
            return res.status(200).json({
              statusStats
            });
          }
          
          // Si aucune base spécifique n'est sélectionnée, récupérer pour toutes les bases
          console.log("Globaladmin - Toutes les bases");
          for (const client in pool) {
            const clientPool = pool[client];
            const ticket = new Ticket(clientPool, io);
            const tickets = await ticket.getAllTickets();
            allTickets[client] = tickets;
            
            // Calcul des statistiques par statut pour chaque base
            statusStats[client] = calculateStatusStats(tickets);
            
            // Ajouter au total
            for (const status in statusStats[client]) {
              statusStats.tot[status] = (statusStats.tot[status] || 0) + statusStats[client][status];
            }
          }
        } else if (req.user.role === "superadmin1") {
          // superadmin1 ne voit que les tickets de techno1
          console.log("Superadmin1 - Base techno1 uniquement");
          const ticket = new Ticket(pool.techno1, io);
          const tickets = await ticket.getAllTickets();
          allTickets.techno1 = tickets;
          
          // Calcul des statistiques par statut pour techno1
          statusStats.techno1 = calculateStatusStats(tickets);
          statusStats.tot = statusStats.techno1;
        } else if (req.user.role === "superadmin2") {
          // superadmin2 ne voit que les tickets de techno2
          console.log("Superadmin2 - Base techno2 uniquement");
          const ticket = new Ticket(pool.techno2, io);
          const tickets = await ticket.getAllTickets();
          allTickets.techno2 = tickets;
          
          // Calcul des statistiques par statut pour techno2
          statusStats.techno2 = calculateStatusStats(tickets);
          statusStats.tot = statusStats.techno2;
        }

        console.log("Statistiques par statut calculées:", statusStats);
        res.status(200).json({
          statusStats
        });
      } catch (err) {
        console.error("❌ Erreur lors du calcul des statistiques par statut:", err);
        res.status(500).json({ error: "Impossible de récupérer les statistiques par statut." });
      }
    },
  };

  return ticketController;
};
