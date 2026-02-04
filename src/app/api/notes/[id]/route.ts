import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Note, CATEGORIES } from "@/lib/types/note";

// Validation UUID
function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Valider le format UUID
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Format d'ID invalide" },
        { status: 400 },
      );
    }

    // Récupérer la note (RLS vérifie ownership)
    const { data: note, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !note) {
      return NextResponse.json(
        { error: "Note introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json(note as Note);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Valider le format UUID
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Format d'ID invalide" },
        { status: 400 },
      );
    }

    // Parser le body
    const body = await request.json();
    const { category, title, content } = body;

    // Construire l'objet de mise à jour
    const updates: Partial<Note> = {};

    if (category !== undefined) {
      // Valider la catégorie
      const validCategories = Object.values(CATEGORIES);
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: "Catégorie invalide" },
          { status: 400 },
        );
      }
      updates.category = category;
    }

    if (title !== undefined) {
      if (typeof title !== "string" || title.length === 0) {
        return NextResponse.json(
          { error: "Le titre doit être une chaîne non vide" },
          { status: 400 },
        );
      }
      updates.title = title;
    }

    if (content !== undefined) {
      if (typeof content !== "string") {
        return NextResponse.json(
          { error: "Le contenu doit être une chaîne" },
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
      updates.content = content;
    }

    // Vérifier qu'il y a au moins une mise à jour
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Aucune mise à jour fournie" },
        { status: 400 },
      );
    }

    // Mettre à jour la note (RLS vérifie ownership)
    const { data: note, error } = await supabase
      .from("notes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !note) {
      if (error?.code === "PGRST116") {
        return NextResponse.json(
          { error: "Note introuvable" },
          { status: 404 },
        );
      }
      console.error("Error updating note:", error);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour de la note" },
        { status: 500 },
      );
    }

    return NextResponse.json(note as Note);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Valider le format UUID
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Format d'ID invalide" },
        { status: 400 },
      );
    }

    // Supprimer la note (RLS vérifie ownership)
    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Note introuvable" },
          { status: 404 },
        );
      }
      console.error("Error deleting note:", error);
      return NextResponse.json(
        { error: "Erreur lors de la suppression de la note" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
