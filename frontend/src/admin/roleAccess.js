export const RESTRICTED_ROLE_ACCESS = {
  tender_user: {
    label: "Tender User",
    description: "Create, update and remove tender records.",
    paths: ["/admin/tenders"],
  },
  marketing_user: {
    label: "Marketing User",
    description: "Manage Marketing & Sales fuel prices and product specifications.",
    paths: ["/admin/fuel-prices", "/admin/product-specification", "/admin/products-page"],
  },
  hr_user: {
    label: "HR User",
    description: "Manage career opportunities.",
    paths: ["/admin/careers"],
  },
  media_user: {
    label: "Media User",
    description: "Manage news, notices, projects, publications, brochures and gallery media.",
    paths: ["/admin/news", "/admin/notices", "/admin/projects", "/admin/publications", "/admin/brochures", "/admin/media", "/admin/image-library"],
  },
};

export const accessForRole = (role) => RESTRICTED_ROLE_ACCESS[role] || null;

export const canAccessAdminPath = (role, pathname) => {
  const access = accessForRole(role);
  if (!access || pathname === "/admin") return true;
  return access.paths.some((allowed) => pathname === allowed || pathname.startsWith(`${allowed}/`));
};
