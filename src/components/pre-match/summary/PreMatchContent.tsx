interface PreMatchContentProps {
  havaya: string;
  actions: Array<{ name: string; goal?: string }>;
  answers: Record<string, string>;
}

export const PreMatchContent = ({ havaya, actions, answers }: PreMatchContentProps) => {
  return (
    <div className="space-y-6">
      <div className="border-t pt-4">
        <h3 className="text-xl font-semibold mb-2 text-right">הוויה נבחרת</h3>
        <p className="text-gray-700 text-right">{havaya}</p>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-xl font-semibold mb-2 text-right">פעולות נבחרות</h3>
        <div className="space-y-2">
          {actions.map((action, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <p className="text-gray-600">{action.goal}</p>
              <p className="font-medium">{action.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-xl font-semibold mb-2 text-right">תשובות לשאלות</h3>
        <div className="space-y-4">
          {Object.entries(answers).map(([question, answer], index) => (
            <div key={index} className="text-right">
              <p className="font-medium mb-1">{question}</p>
              <p className="text-gray-600">{answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};