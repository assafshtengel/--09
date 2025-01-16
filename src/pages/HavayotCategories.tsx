import { HavayotManager } from "@/components/havayot/HavayotManager";

const HavayotCategories = () => {
  return (
    <div className="container mx-auto py-4 md:py-6">
      <h1 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">קטגוריות הוויה</h1>
      <HavayotManager />
    </div>
  );
};

export default HavayotCategories;