import api from "./api";

const createResourceService = (basePath) => ({
  getAll: async (params = {}) => {
    const response = await api.get(basePath, { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`${basePath}/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post(basePath, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`${basePath}/${id}`, data);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`${basePath}/${id}`);
    return response.data;
  },
});

const newsService = createResourceService("/admin/news");
const noticeService = createResourceService("/admin/notices");
const tenderService = createResourceService("/admin/tenders");
const projectService = createResourceService("/admin/projects");
const careerService = createResourceService("/admin/careers");
const supplierResourceService = createResourceService("/admin/supplier-resources");
const annualReportService = createResourceService("/admin/annual-reports");
const teamMemberService = createResourceService("/admin/team-members");
const managementContactService = createResourceService("/admin/management-contacts");
const contactService = createResourceService("/admin/contact-messages");
const fuelPriceService = createResourceService("/admin/fuel-prices");
const aviationPriceService = createResourceService("/admin/aviation-prices");
const fuelStationService = createResourceService("/admin/fuel-stations");
const regionalOfficeService = createResourceService("/admin/regional-offices");
const userService = createResourceService("/admin/users");
const homeServiceService = createResourceService("/admin/home-services");
const serviceService = createResourceService("/admin/services");
const mobileAppService = createResourceService("/admin/mobile-apps");
const historyPageService = {
  get: async () => (await api.get("/admin/history-page")).data,
  update: async (data) => (await api.put("/admin/history-page", data)).data,
};

const divisionService = {
  ...createResourceService("/admin/divisions"),
  getBySlug: async (slug) => {
    const response = await api.get(`/admin/divisions/slug/${slug}`);
    return response.data;
  },
};

const popupNoticeService = {
  ...createResourceService("/admin/popup-notices"),
  updateStatus: async (id, status) => {
    const response = await api.patch(`/admin/popup-notices/${id}/status`, { status });
    return response.data;
  },
  resetVisibility: async (id) => {
    const response = await api.post(`/admin/popup-notices/${id}/reset-visibility`);
    return response.data;
  },
};

const getDashboardStats = async () => {
  const response = await api.get("/admin/dashboard/stats");
  return response.data;
};

const getActiveFuelPrices = async () => {
  const response = await api.get("/admin/fuel-prices/active");
  return response.data;
};

const getActivePopupNotice = async () => {
  const response = await api.get("/admin/popup-notices/active");
  return response.data;
};

const supplierSectionService = {
  getAll: async () => {
    const response = await api.get("/admin/supplier-section");
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/admin/supplier-section", data);
    return response.data;
  },
  update: async (data) => {
    const response = await api.put("/admin/supplier-section", data);
    return response.data;
  },
};

export {
  newsService,
  noticeService,
  tenderService,
  projectService,
  careerService,
  supplierResourceService,
  supplierSectionService,
  annualReportService,
  teamMemberService,
  managementContactService,
  contactService,
  fuelPriceService,
  aviationPriceService,
  fuelStationService,
  regionalOfficeService,
  userService,
  homeServiceService,
  serviceService,
  mobileAppService,
  historyPageService,
  divisionService,
  popupNoticeService,
  getDashboardStats,
  getActiveFuelPrices,
  getActivePopupNotice,
};
