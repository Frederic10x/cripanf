import { NextRequest, NextResponse } from "next/server";
import { categorizeNote } from "@/lib/groq/client";
import { Category } from "@/lib/types/note";

export async function POST(request: NextRequest) {
  try {
    // Parser le body
    const body = await request.json();
    const { content } = body;

    // Validation
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Le contenu est requis" },
        { status: 400 },
      );
    }

    try {
      // Appeler l'API Groq pour catégoriser
      const result = await categorizeNote(content);

      // Valider la réponse
      if (!result.category || !result.title) {
        throw new Error("Invalid response from Groq");
      }

      return NextResponse.json({
        category: result.category as Category,
        title: result.title,
      });
    } catch (groqError) {
      // Fallback en cas d'erreur Groq
      console.error("Groq API error:", groqError);

      return NextResponse.json({
        category: "todo" as Category,
        title: content.slice(0, 60).trim(),
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
