import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../auth/pages/Login";
import AdminLayout from "../admin/layouts/AdminLayout";
import Overview from "../admin/pages/Dashboard/Overview";
import Placeholder from "../admin/pages/Placeholder/Placeholder";
import PublicSite from "../App.jsx";
import NewsManagement from "../admin/pages/News/NewsManagement";
import NoticeManagement from "../admin/pages/Notices/NoticeManagement";
import TenderManagement from "../admin/pages/Tenders/TenderManagement";
import TenderDownloadManagement from "../admin/pages/Tenders/TenderDownloadManagement";
import ProjectManagement from "../admin/pages/Projects/ProjectManagement";
import SupplierResources from "../admin/pages/SupplierResources/SupplierResources";
import CareerManagement from "../admin/pages/Careers/CareerManagement";
import AnnualReportsManagement from "../admin/pages/AnnualReports/AnnualReportsManagement";
import TeamMembersManagement from "../admin/pages/TeamMembers/TeamMembersManagement";
import ManagementContactsManagement from "../admin/pages/ManagementContacts/ManagementContactsManagement";
import FuelPriceManagement from "../admin/pages/FuelPrices/FuelPriceManagement";
import AviationPriceManagement from "../admin/pages/AviationPrices/AviationPriceManagement";
import HistoricalPriceManagement from "../admin/pages/FuelPrices/HistoricalPriceManagement";
import FuelStationManagement from "../admin/pages/FuelStations/FuelStationManagement";
import RegionalOfficeManagement from "../admin/pages/RegionalOffices/RegionalOfficeManagement";
import ContactMessages from "../admin/pages/Messages/ContactMessages";
import UserManagement from "../admin/pages/Users/UserManagement";
import HomeServiceManagement from "../admin/pages/Home/HomeServiceManagement";
import MobileAppManagement from "../admin/pages/MobileApps/MobileAppManagement";
import ServicesManagement from "../admin/pages/Services/ServicesManagement";
import DivisionManagement from "../admin/pages/Services/DivisionManagement";
import DivisionEditor from "../admin/pages/Services/DivisionEditor";
import PopupNoticeManagement from "../admin/pages/Popups/PopupNoticeManagement";
import HistoryManagement from "../admin/pages/History/HistoryManagement";
import PageManagement from "../admin/pages/Pages/PageManagement";
import ImageLibrary from "../admin/pages/Media/ImageLibrary";
import RecycleBin from "../admin/pages/RecycleBin/RecycleBin";
import PageRevisions from "../admin/pages/Pages/PageRevisions";
import PriceAudit from "../admin/pages/FuelPrices/PriceAudit";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="news" element={<NewsManagement />} />
        <Route path="notices" element={<NoticeManagement />} />
        <Route path="projects" element={<ProjectManagement />} />
        <Route path="tenders" element={<TenderManagement />} />
        <Route path="tender-downloads" element={<ProtectedRoute roles={["super_admin", "admin"]}><TenderDownloadManagement /></ProtectedRoute>} />
        <Route path="supplier-resources" element={<SupplierResources />} />
        <Route path="careers" element={<CareerManagement />} />
        <Route path="publications" element={<AnnualReportsManagement />} />
        <Route path="team-members" element={<TeamMembersManagement />} />
        <Route path="about" element={<ManagementContactsManagement />} />
        <Route path="history" element={<HistoryManagement />} />
        <Route path="services-page" element={<ServicesManagement />} />
        <Route path="services-page/divisions" element={<DivisionManagement />} />
        <Route path="services-page/divisions/:slug" element={<DivisionEditor />} />
        <Route path="products-page" element={<Placeholder />} />
        <Route path="fuel-prices" element={<ProtectedRoute roles={["super_admin", "admin"]}><FuelPriceManagement /></ProtectedRoute>} />
        <Route path="aviation-prices" element={<ProtectedRoute roles={["super_admin", "admin"]}><AviationPriceManagement /></ProtectedRoute>} />
        <Route path="historical-prices" element={<ProtectedRoute roles={["super_admin", "admin"]}><HistoricalPriceManagement /></ProtectedRoute>} />
        <Route path="price-audit" element={<ProtectedRoute roles={["super_admin", "admin"]}><PriceAudit /></ProtectedRoute>} />
        <Route path="fuel-stations" element={<FuelStationManagement />} />
        <Route path="regional-offices" element={<RegionalOfficeManagement />} />
        <Route path="messages" element={<ProtectedRoute roles={["super_admin", "admin"]}><ContactMessages /></ProtectedRoute>} />
        <Route path="media" element={<ImageLibrary />} />
        <Route path="users" element={<ProtectedRoute roles={["super_admin", "admin"]}><UserManagement /></ProtectedRoute>} />
        <Route path="recycle-bin" element={<ProtectedRoute roles={["super_admin", "admin"]}><RecycleBin /></ProtectedRoute>} />
        <Route path="page-revisions" element={<ProtectedRoute roles={["super_admin", "admin"]}><PageRevisions /></ProtectedRoute>} />
        <Route path="popup-notices" element={<PopupNoticeManagement />} />
        <Route path="settings" element={<Placeholder />} />
        <Route path="home" element={<HomeServiceManagement />} />
        <Route path="pages" element={<PageManagement />} />
        <Route path="mobile-apps" element={<MobileAppManagement />} />
      </Route>

      <Route path="*" element={<PublicSite />} />
    </Routes>
  );
};

export default AppRoutes;
