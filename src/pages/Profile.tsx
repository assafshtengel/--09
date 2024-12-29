import { PlayerForm } from "@/components/PlayerForm";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-right">הפרופיל שלי</h1>
          <PlayerForm onSubmit={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default Profile;