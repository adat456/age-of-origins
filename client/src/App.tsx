import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MemberForm from "./MemberForm"

const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <MemberForm />
    </QueryClientProvider>
  );
};

export default App
