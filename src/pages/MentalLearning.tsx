const MentalLearningPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">למידה מנטלית</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">טכניקות נשימה</h2>
          <p className="text-gray-600 mb-4">
            למד טכניקות נשימה מתקדמות לשליטה במתח ולחץ במהלך משחקים.
          </p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            התחל ללמוד
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">דמיון מודרך</h2>
          <p className="text-gray-600 mb-4">
            תרגילי דמיון מודרך לשיפור הביצועים והביטחון העצמי.
          </p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            התחל ללמוד
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">ניהול לחץ</h2>
          <p className="text-gray-600 mb-4">
            כלים ואסטרטגיות להתמודדות עם לחץ במצבים מאתגרים.
          </p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            התחל ללמוד
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">מיינדפולנס</h2>
          <p className="text-gray-600 mb-4">
            תרגילי מיינדפולנס לשיפור הריכוז והמודעות במגרש.
          </p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            התחל ללמוד
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">הצבת מטרות</h2>
          <p className="text-gray-600 mb-4">
            למד כיצד להציב מטרות אפקטיביות ולהשיג אותן.
          </p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            התחל ללמוד
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">חשיבה חיובית</h2>
          <p className="text-gray-600 mb-4">
            פיתוח גישה חיובית והתמודדות עם מחשבות שליליות.
          </p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            התחל ללמוד
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentalLearningPage;