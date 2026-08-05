import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { chakraTheme } from "@/chakra/theme";
import { persistor, store } from "@/store";
import { LoadingComponent } from "@/components/ui/LoadingComponent";
import { MobileShell } from "@/components/layout/MobileShell";
import { DesktopUnsupported } from "@/pages/DesktopUnsupported";
import { useIsDesktopViewportBlocked } from "@/hooks/useDesktopBlock";
import { useConfigManager } from "@/hooks/useConfigManager";
import { UpdateRequiredPage } from "@/pages/UpdateRequiredPage";
import { LoginPage } from "@/modules/authentication/screens/LoginScreen/LoginPage";
import { CommunityAllPage } from "@/pages/CommunityAllPage";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { isEmpty } from "lodash";
import SearchScreen from "@/modules/directory/screens/SearchScreen/SearchScreen";
import FiltersScreen from "@/modules/directory/screens/FiltersScreen";
import CommunityWelcomePage from "@/pages/CommunityWelcomePage";
import GeetmalaAllPage from "@/pages/GeetmalaAllPage";
import GeetmalaDetailPage from "@/pages/GeetmalaDetailPage";
import MemberProfilePage from "@/pages/MemberProfilePage";
import EditProfilePage from "@/pages/EditProfilePage";
import AddMemberPage from "@/pages/AddMemberPage";
import AddFamilyMemberPage from "@/pages/AddFamilyMemberPage";
import { TabShell } from "@/components/layout/TabShell";

function BootGate({ children }: { children: React.ReactNode }) {
  const { loading, isAppVersionOK } = useConfigManager({ forceSync: true });
  const updateNeeded = useSelector((s: RootState) => s.auth.needAppUpdate);

  if (loading) {
    return <LoadingComponent />;
  }
  if (!isAppVersionOK || updateNeeded) {
    return <UpdateRequiredPage />;
  }
  return <>{children}</>;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);
  if (isEmpty(accessToken)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);
  if (!isEmpty(accessToken)) {
    return <Navigate to="/community/all" replace />;
  }
  return <>{children}</>;
}

function AppLayout() {
  const blocked = useIsDesktopViewportBlocked();

  if (blocked) {
    return <DesktopUnsupported />;
  }

  return (
    <MobileShell>
      <BootGate>
        <Outlet />
      </BootGate>
    </MobileShell>
  );
}

function RootRedirect() {
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);
  if (!isEmpty(accessToken)) {
    return <Navigate to="/community/all" replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingComponent />} persistor={persistor}>
        <ChakraProvider theme={chakraTheme}>
          <BrowserRouter>
            <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<RootRedirect />} />
              <Route
                path="/login"
                element={
                  <GuestOnly>
                    <LoginPage />
                  </GuestOnly>
                }
              />

              <Route element={<RequireAuth><Outlet /></RequireAuth>}>
                <Route path="/community/all" element={<CommunityAllPage />} />
                <Route path="/community/welcome" element={<CommunityWelcomePage />} />
                <Route path="/search/search" element={<SearchScreen />} />
                <Route path="/search/filters" element={<FiltersScreen />} />
                <Route path="/editprofile" element={<EditProfilePage />} />
                <Route path="/add-member" element={<AddMemberPage />} />
                <Route path="/add-family-member" element={<AddFamilyMemberPage />} />
                <Route path="/geetmala/all" element={<GeetmalaAllPage />} />
                <Route path="/geetmala/:id" element={<GeetmalaDetailPage />} />

                <Route element={<TabShell />}>
                  <Route path="/community/:id" element={null} />
                  <Route path="/business" element={null} />
                  <Route path="/profile" element={null} />
                  <Route path="/member/:memberId" element={<MemberProfilePage />} />
                </Route>
              </Route>
            </Route>
            </Routes>
          </BrowserRouter>
        </ChakraProvider>
      </PersistGate>
    </Provider>
  );
}
