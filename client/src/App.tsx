import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Wrapper from "./Shared/Wrapper";
import MembersPage from "./Members/MembersPage";
import MemberSummary from "./Members/MemberSummary";

const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/members" element={<Wrapper />}>
            <Route index element={<MembersPage />} />
            <Route path=":username" element={<MemberSummary />} />
          </Route>
        </Routes>
        
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App
