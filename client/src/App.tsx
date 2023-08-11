import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MembersList from "./MembersList";
import MemberForm from "./MemberForm";

const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <MembersList />
      <MemberForm />
    </QueryClientProvider>
  );
};

export default App
