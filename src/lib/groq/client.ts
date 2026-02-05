import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function categorizeNote(content: string) {
  const prompt = `Tu es un assistant qui catégorise des notes et extrait les éléments importants.

Catégories disponibles:
- "todo": tâche à faire, action requise
- "done": tâche terminée, information
- "recurring": tâche récurrente/cyclique
- "waiting_followup": en attente d'une réponse/action externe avec relance nécessaire

Analyse cette note et réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de backticks):
{
  "category": "todo|done|recurring|waiting_followup",
  "title": "Titre court et descriptif (max 60 caractères)",
  "insights": ["élément 1", "élément 2", "élément 3"]
}

Les insights doivent être des éléments clés extraits du texte (noms propres, lieux, dates, objets importants, actions).
Exemple: Pour "Rendez-vous avec Michel pour plaquettes de frein", les insights sont: ["rendez-vous", "Michel", "plaquettes de frein"]

Note: ${content}`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.1-8b-instant",
    temperature: 0.3,
    max_tokens: 200,
  });

  const response = completion.choices[0]?.message?.content || "";
  return JSON.parse(response);
}
