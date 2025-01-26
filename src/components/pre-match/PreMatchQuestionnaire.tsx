import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useState } from "react";

interface PreMatchQuestionnaireProps {
  onSubmit: (answers: Record<string, string>) => void;
  onNext: () => void;
}

export const PreMatchQuestionnaire = ({ onSubmit, onNext }: PreMatchQuestionnaireProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answers);
    onNext(); // Call onNext after submitting
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">שאלון טרום משחק</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Form>
          {/* Example form fields */}
          <div>
            <label htmlFor="question1" className="block text-sm font-medium text-gray-700">שאלה 1</label>
            <input
              id="question1"
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
              onChange={(e) => setAnswers({ ...answers, question1: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="question2" className="block text-sm font-medium text-gray-700">שאלה 2</label>
            <input
              id="question2"
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
              onChange={(e) => setAnswers({ ...answers, question2: e.target.value })}
            />
          </div>
        </Form>
        
        <div className="flex justify-end">
          <Button 
            type="submit"
            size="lg"
            className="w-full md:w-auto"
          >
            המשך
          </Button>
        </div>
      </form>
    </div>
  );
};
