export const listEventsForUser = async (req, res) => {
    try {
      const now = new Date();
  
      const events = await prisma.Event.findMany({
        where: {
          OR: [
            { eventDate: { gte: now } }, 
            { status: 'aberto' },       
            { status: 'encerrado' },    
          ],
        },
        orderBy: {
          eventDate: 'asc', 
        },
      });
  
      res.json(events);
  
    } catch (error) {
      console.error("Erro ao buscar eventos para o usuário:", error);
      res.status(500).json({ error: "Erro ao buscar eventos." });
    }
  };