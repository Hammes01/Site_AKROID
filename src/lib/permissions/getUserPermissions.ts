import { createClient } from "@/lib/supabase/server";

interface Permission {
  slug: string;
}

interface RolePermission {
  permissions: Permission;
}

interface Role {
  role_permissions: RolePermission[];
}

interface UserRole {
  roles: Role;
}

export async function getUserPermissions() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, permissions: [] as string[] };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, is_owner")
    .eq("id", user.id)
    .single();

  // Owner tem acesso a tudo, sem precisar checar tabela
  if (profile?.is_owner) {
    const { data: allPermissions } = await supabase
      .from("permissions")
      .select("slug");

    return {
      user,
      profile,
      permissions: (allPermissions ?? []).map((p) => p.slug),
    };
  }

  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("roles(role_permissions(permissions(slug)))")
    .eq("user_id", user.id);

  const permissions = new Set<string>();

  (userRoles as UserRole[] | null)?.forEach((ur) => {
    ur.roles?.role_permissions?.forEach((rp) => {
      if (rp.permissions?.slug) permissions.add(rp.permissions.slug);
    });
  });

  return { user, profile, permissions: Array.from(permissions) };
}
