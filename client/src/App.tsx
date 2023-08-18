import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Wrapper from "./Shared/Wrapper";
import NavBar from "./Shared/NavBar";
import MembersPage from "./Members/MembersPage";
import MemberSummary from "./Members/MemberSummary";
import HomeWrapper from "./Home/HomeWrapper";
import ReferenceHome from "./Reference/ReferenceHome";
import ReferenceForm from "./Reference/ReferenceForm";
import FullReferencePost from "./Reference/ReferenceResults/FullReferencePost";
import RecentReferences from "./Reference/ReferenceResults/RecentReferences";
import TaggedReferences from "./Reference/ReferenceResults/TaggedReferences";

const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Wrapper child={<NavBar />} />}>
            <Route index element={<HomeWrapper />} />
            <Route path="/events" />
            <Route path="/reference" element={<ReferenceHome />}>
              <Route index element={<RecentReferences />} />
              <Route path="tag/:tag" element={<TaggedReferences />} />
              
              <Route path="post/:referenceid/edit" element={<ReferenceForm />} />
              <Route path="post/:referenceid" element={<FullReferencePost />} />
              <Route path="create" element={<ReferenceForm />} />
            </Route>
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
