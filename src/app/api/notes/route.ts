import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Note } from "@/lib/types/note";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les paramètres de query
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Construire la requête
    let query = supabase
      .from("notes")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtrer par catégorie si fourni
    if (category) {
      query = query.eq("category", category);
    }

    // Recherche full-text si fourni
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data: notes, error, count } = await query;

    if (error) {
      console.error("Error fetching notes:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des notes" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      notes: notes as Note[],
      total: count || 0,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Parser le body
    const body = await request.json();
    const { content, is_voice_note = false } = body;

    // Validation
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Le contenu est requis" },
        { status: 400 },
      );
    }

    if (content.length < 3) {
      return NextResponse.json(
        { error: "Le contenu doit contenir au moins 3 caractères" },
        { status: 400 },
      );
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { error: "Le contenu ne peut pas dépasser 10000 caractères" },
        { status: 400 },
      );
    }

    // Catégoriser la note avec l'API Groq
    const categorizeResponse = await fetch(
      `${request.nextUrl.origin}/api/categorize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      },
    );

    if (!categorizeResponse.ok) {
      return NextResponse.json(
        { error: "Erreur lors de la catégorisation" },
        { status: 500 },
      );
    }

    const { category, title } = await categorizeResponse.json();

    // Insérer la note
    const { data: note, error: insertError } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        title,
        content,
        category,
        is_voice_note,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting note:", insertError);
      return NextResponse.json(
        { error: "Erreur lors de la création de la note" },
        { status: 500 },
      );
    }

    return NextResponse.json(note as Note, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
