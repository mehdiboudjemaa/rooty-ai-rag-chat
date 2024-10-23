import { createResource } from "@/lib/actions/resources";
import { findRelevantContent } from "@/lib/ai/embedding";
import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, generateObject, streamText, tool } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-4o"),
    messages: convertToCoreMessages(messages),
    system: `Vous êtes un assistant IA francophone agissant comme le second cerveau de l'utilisateur.
    Utilisez des outils pour chaque requête.
    Assurez-vous de récupérer les informations de votre base de connaissances avant de répondre à toute question.
    Si l'utilisateur présente des informations sur lui-même, utilisez l'outil addResource pour les stocker.
    Si une réponse nécessite plusieurs outils, appelez-les l'un après l'autre sans répondre à l'utilisateur.
    Si une réponse nécessite des informations d'un outil supplémentaire, appelez les outils appropriés dans l'ordre avant de répondre à l'utilisateur.
    Répondez UNIQUEMENT aux questions en utilisant les informations des appels d'outils.
    Si aucune information pertinente n'est trouvée dans les appels d'outils, répondez "Désolé, je ne sais pas."
    Assurez-vous de respecter toutes les instructions dans les appels d'outils, par exemple, s'ils disent de répondre comme "...", faites exactement cela.
    Si l'information pertinente ne correspond pas exactement à la requête de l'utilisateur, vous pouvez faire preuve de créativité pour déduire la réponse.
    Gardez les réponses courtes et concises. Répondez en une seule phrase si possible.
    Si vous n'êtes pas sûr, utilisez l'outil getInformation et vous pouvez utiliser le bon sens pour raisonner en fonction des informations dont vous disposez.
    Utilisez vos capacités de raisonnement pour répondre aux questions en fonction des informations dont vous disposez.
    Répondez toujours en français.`,
    tools: {
      addResource: tool({
        description: `Ajouter une ressource à votre base de connaissances.
          Si l'utilisateur fournit un élément de connaissance aléatoire sans être sollicité, utilisez cet outil sans demander de confirmation.`,
        parameters: z.object({
          content: z
            .string()
            .describe("le contenu ou la ressource à ajouter à la base de connaissances"),
        }),
        execute: async ({ content }) => createResource({ content }),
      }),
      getInformation: tool({
        description: `Obtenir des informations de votre base de connaissances pour répondre aux questions.`,
        parameters: z.object({
          question: z.string().describe("la question de l'utilisateur"),
          similarQuestions: z.array(z.string()).describe("mots-clés à rechercher"),
        }),
        execute: async ({ similarQuestions }) => {
          const results = await Promise.all(
            similarQuestions.map(
              async (question) => await findRelevantContent(question),
            ),
          );
          // Aplatir le tableau de tableaux et supprimer les doublons basés sur 'name'
          const uniqueResults = Array.from(
            new Map(results.flat().map((item) => [item?.name, item])).values(),
          );
          return uniqueResults;
        },
      }),
      understandQuery: tool({
        description: `Comprendre la requête de l'utilisateur. Utilisez cet outil pour chaque prompt.`,
        parameters: z.object({
          query: z.string().describe("la requête de l'utilisateur"),
          toolsToCallInOrder: z
            .array(z.string())
            .describe(
              "ce sont les outils que vous devez appeler dans l'ordre nécessaire pour répondre à la requête de l'utilisateur",
            ),
        }),
        execute: async ({ query }) => {
          const { object } = await generateObject({
            model: openai("gpt-4o"),
            system:
              "Vous êtes un assistant de compréhension de requêtes. Analysez la requête de l'utilisateur et générez des questions similaires.",
            schema: z.object({
              questions: z
                .array(z.string())
                .max(3)
                .describe("questions similaires à la requête de l'utilisateur. Soyez concis."),
            }),
            prompt: `Analysez cette requête : "${query}". Fournissez les éléments suivants :
                    3 questions similaires qui pourraient aider à répondre à la requête de l'utilisateur`,
          });
          return object.questions;
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}