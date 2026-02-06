import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UserTag } from "@/lib/types/note";

export async function GET() {
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

    // Récupérer tous les tags de l'utilisateur, triés par ordre alphabétique
    const { data: tags, error } = await supabase
      .from("user_tags")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching tags:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des tags" },
        { status: 500 },
      );
    }

    return NextResponse.json({ tags: tags as UserTag[] });
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
    const { name } = body;

    // Validation
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Le nom est requis" },
        { status: 400 },
      );
    }

    // Normaliser le nom: trim + lowercase
    const normalizedName = name.trim().toLowerCase();

    // Validation de la longueur
    if (normalizedName.length < 1 || normalizedName.length > 30) {
      return NextResponse.json(
        { error: "Le nom doit contenir entre 1 et 30 caractères" },
        { status: 400 },
      );
    }

    // Insérer le tag
    const { data: tag, error: insertError } = await supabase
      .from("user_tags")
      .insert({
        user_id: user.id,
        name: normalizedName,
      })
      .select()
      .single();

    if (insertError) {
      // Gérer la contrainte UNIQUE (duplicate)
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Ce tag existe déjà" },
          { status: 409 },
        );
      }
      console.error("Error inserting tag:", insertError);
      return NextResponse.json(
        { error: "Erreur lors de la création du tag" },
        { status: 500 },
      );
    }

    return NextResponse.json(tag as UserTag, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
