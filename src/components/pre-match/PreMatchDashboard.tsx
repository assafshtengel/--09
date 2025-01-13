interface PreMatchDashboardProps {
  onCreateNew: () => void;
}

export const PreMatchDashboard = ({ onCreateNew }: PreMatchDashboardProps) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">דוח טרום משחק</h2>
      <p className="mb-4">ברוך הבא לדוח הטרום משחק שלך. כאן תוכל להוסיף פרטים על המשחק הקרוב שלך.</p>
      <button
        onClick={onCreateNew}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        צור דוח חדש
      </button>
    </div>
  );
};
