import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Wrapper from "./Shared/Wrapper";
import NavBar from "./Shared/NavBar";
import MembersPage from "./Members/MembersPage";
import MemberSummary from "./Members/MemberSummary";

const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Wrapper child={<NavBar />} />}>
            <Route index />
            <Route path="/events" />
            <Route path="/reference" />
            <Route path="/members" element={<Wrapper />}>
              <Route index element={<MembersPage />} />
              <Route path=":memberid" element={<MemberSummary />} />
            </Route>
          </Route>
        </Routes>
        
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App
