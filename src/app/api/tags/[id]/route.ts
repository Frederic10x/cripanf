import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Validation UUID
function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
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

    // Récupérer le tag pour vérifier qu'il existe et obtenir son nom
    const { data: tag, error: fetchError } = await supabase
      .from("user_tags")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !tag) {
      return NextResponse.json(
        { error: "Tag introuvable" },
        { status: 404 },
      );
    }

    // Récupérer toutes les notes qui contiennent ce tag
    const { data: notes, error: notesError } = await supabase
      .from("notes")
      .select("id, tags")
      .eq("user_id", user.id)
      .contains("tags", [tag.name]);

    if (notesError) {
      console.error("Error fetching notes with tag:", notesError);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour des notes" },
        { status: 500 },
      );
    }

    // Mettre à jour chaque note pour enlever le tag
    if (notes && notes.length > 0) {
      const updatePromises = notes.map((note) => {
        const updatedTags = (note.tags || []).filter((t: string) => t !== tag.name);
        return supabase
          .from("notes")
          .update({ tags: updatedTags })
          .eq("id", note.id);
      });

      const results = await Promise.all(updatePromises);

      // Vérifier si toutes les mises à jour ont réussi
      const hasError = results.some((result) => result.error);
      if (hasError) {
        console.error("Error updating notes:", results);
        return NextResponse.json(
          { error: "Erreur lors de la mise à jour des notes" },
          { status: 500 },
        );
      }
    }

    // Supprimer le tag
    const { error: deleteError } = await supabase
      .from("user_tags")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting tag:", deleteError);
      return NextResponse.json(
        { error: "Erreur lors de la suppression du tag" },
        { status: 500 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
