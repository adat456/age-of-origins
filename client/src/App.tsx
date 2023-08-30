import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthenticatedContext from "./Shared/AuthenticatedContext";
import LogIn from "./Shared/LogIn";
import Wrapper from "./Shared/Wrapper";
import NavBar from "./Shared/NavBar";
import MembersPage from "./Members/MembersPage";
import MemberSummary from "./Members/MemberSummar/MemberSummary";
import HomeWrapper from "./Home/HomeWrapper";
import ReferenceHome from "./Reference/ReferenceHome";
import ReferenceForm from "./Reference/ReferenceForm";
import FullReferencePost from "./Reference/ReferenceResults/FullReferencePost";
import RecentReferences from "./Reference/ReferenceResults/RecentReferences";
import TaggedReferences from "./Reference/ReferenceResults/TaggedReferences";
import EventsHome from "./Events/EventsHome";
import EventForm from "./Events/EventForm";
import AllEvents from "./Events/AllEvents";
import ExpandedEvent from "./Events/ExpandedEvent";
import Scoreboard from "./Home/Scoreboard";
import MembersList from "./Members/MembersList";
import ScrollToTop from "./Shared/ScrollToTop";

const queryClient = new QueryClient();

function App() {
  const [ authenticated, setAuthenticated ] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticatedContext.Provider value={authenticated}>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/log-in" element={<LogIn setAuthenticated={setAuthenticated} />} />
            <Route path="/" element={<Wrapper child={<NavBar setAuthenticated={setAuthenticated} />} />}>
              <Route index element={<HomeWrapper />} />
              <Route path="battle-rankings" element={<Scoreboard stat="battle" />} />
              <Route path="contribution-rankings" element={<Scoreboard stat="contribution" />} />
              <Route path="/events" element={<EventsHome />}>
                <Route index element={<AllEvents />} />
                <Route path="create" element={<EventForm />} />
                <Route path=":eventid" element={<ExpandedEvent />} />
                <Route path=":eventid/edit" element={<EventForm />} />
              </Route>
              <Route path="/reference" element={<ReferenceHome />}>
                <Route index element={<RecentReferences />} />
                <Route path="tag/:tag" element={<TaggedReferences />} />
                <Route path="post/:referenceid/edit" element={<ReferenceForm />} />
                <Route path="post/:referenceid" element={<FullReferencePost />} />
                <Route path="create" element={<ReferenceForm />} />
              </Route>
              <Route path="/members" element={<MembersPage />}>
                <Route index element={<MembersList />} />
                <Route path=":memberid" element={<MemberSummary />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthenticatedContext.Provider>
    </QueryClientProvider>
  );
};

export default App
