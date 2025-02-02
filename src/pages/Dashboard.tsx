import { useAuth } from "@/providers/AuthProvider";

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {user?.email}</p>
    </div>
  );
}