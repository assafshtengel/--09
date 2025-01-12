const NotificationsManagerPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">התראות</h1>
      <div className="grid gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">הגדרות התראות</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>התראות על אימונים</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span>התראות על משחקים</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span>תזכורות יומיות</span>
              <input type="checkbox" className="toggle" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">היסטוריית התראות</h2>
          <div className="space-y-2">
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium">תזכורת לאימון קבוצה</p>
              <p className="text-sm text-gray-600">לפני 2 שעות</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium">עדכון ללוח הזמנים</p>
              <p className="text-sm text-gray-600">אתמול</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium">תזכורת למשחק</p>
              <p className="text-sm text-gray-600">לפני 2 ימים</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsManagerPage;