"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = formData.get("name") as string;
  const baseSlug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Garante que o slug seja único, adicionando -2, -3... se já existir
  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing) break;

    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .limit(1)
    .single();

  const { error } = await supabase.from("products").insert({
    organization_id: org?.id,
    category_id: (formData.get("category_id") as string) || null,
    name,
    slug,
    brand: formData.get("brand") as string,
    model: formData.get("model") as string,
    description: formData.get("description") as string,
    warranty: formData.get("warranty") as string,
    status: formData.get("status") as string,
    created_by: user?.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const baseSlug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Garante que o slug seja único (exceto para o próprio produto)
  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (!existing) break;

    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const { error } = await supabase
    .from("products")
    .update({
      category_id: (formData.get("category_id") as string) || null,
      name,
      slug,
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      description: formData.get("description") as string,
      warranty: formData.get("warranty") as string,
      status: formData.get("status") as string,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}
