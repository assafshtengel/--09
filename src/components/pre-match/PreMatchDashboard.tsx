interface PreMatchDashboardProps {
  onCreateNew: () => void;
}

export const PreMatchDashboard = ({ onCreateNew }: PreMatchDashboardProps) => {
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-right text-primary">למה חשוב למלא דוח טרום משחק?</h2>
      
      <div className="space-y-4 text-right leading-relaxed">
        <p className="text-lg">
          דוח טרום משחק הוא{" "}
          <span className="font-semibold text-primary">כלי חיוני</span>{" "}
          לכל ספורטאי שרוצה להגיע ל
          <span className="font-semibold text-accent">שיא הביצועים</span>. 
          הוא מאפשר לך להתכונן{" "}
          <span className="font-semibold text-primary">מנטלית ופיזית</span>, 
          לזהות חוזקות וחולשות, ולתכנן את המשחק שלך בצורה אסטרטגית.
        </p>
        
        <p className="text-lg">
          מילוי הדוח עוזר להגדיל את{" "}
          <span className="font-semibold text-secondary">המודעות העצמית</span>, 
          לשפר את{" "}
          <span className="font-semibold text-accent">המיקוד</span>{" "}
          ולהפחית את{" "}
          <span className="font-semibold text-primary">הלחץ</span>{" "}
          לפני המשחק.
        </p>
        
        <p className="text-lg">
          בנוסף, הדוח מאפשר לך{" "}
          <span className="font-semibold text-secondary">לעקוב אחר ההתקדמות</span>{" "}
          לאורך זמן ולשתף את המאמן במידע קריטי לשיפור הביצועים.
        </p>
        
        <p className="text-lg font-medium text-accent">
          זהו צעד קטן שמוביל לתוצאות גדולות על המגרש.
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={onCreateNew}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 text-lg font-medium shadow-md hover:shadow-lg"
        >
          צור דוח חדש
        </button>
      </div>
    </div>
  );
};