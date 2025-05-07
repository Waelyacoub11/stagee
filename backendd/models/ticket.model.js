class Ticket {
    constructor(pool, io) {
        this.pool = pool;
        this.io = io; // WebSocket pour la gestion en temps réel
    }

    async getAllTickets() {
        try {
            // Vérifier si la table users existe
            const checkTableQuery = `
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'users'
                );
            `;
            const tableExists = await this.pool.query(checkTableQuery);
            
            let query;
            if (tableExists.rows[0].exists) {
                // Si la table users existe, faire la jointure
                query = `
                    SELECT 
                        t.idticket,
                        t.sujet,
                        t.description,
                        t.priority,
                        t.created_at,
                        t.serialnumber,
                        t.piecesaremplacer,
                        t.statut,
                        a.nom as agent_nom,
                        a.prenom as agent_prenom,
                        r.nom as requester_nom,
                        r.prenom as requester_prenom,
                        CASE 
                            WHEN r.id != a.id AND LOWER(a.departement) = 'technocode' THEN true 
                            ELSE false 
                        END as is_technocode_ticket
                    FROM ticket t
                    LEFT JOIN users a ON t.agent = a.id
                    LEFT JOIN users r ON t.requester = r.id
                    ORDER BY t.idticket DESC
                `;
            } else {
                // Si la table users n'existe pas, récupérer uniquement les tickets
                query = `
                    SELECT 
                        idticket,
                        sujet,
                        description,
                        priority,
                        created_at,
                        serialnumber,
                        piecesaremplacer,
                        statut,
                        agent,
                        requester,
                        false as is_technocode_ticket
                    FROM ticket
                    ORDER BY idticket DESC
                `;
            }

            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            console.error("Erreur lors de la récupération des tickets:", error);
            throw new Error("Impossible de récupérer les tickets.");
        }
    }
}

module.exports = Ticket;
