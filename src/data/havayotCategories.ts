type HavayaType = {
  name: string;
  description: string;
};

type CategoryKeyType = "professional" | "mental" | "emotional" | "social";

type CategoryType = {
  key: CategoryKeyType;
  name: string;
  description: string;
  havayot: HavayaType[];
};

export const havayotCategories: Record<CategoryKeyType, CategoryType> = {
  professional: {
    key: "professional",
    name: "מקצועי (טכני/טקטי)",
    description: "איך אתה מרגיש מבחינה מקצועית לקראת המשחק?",
    havayot: [
      { name: "טכני", description: "שליטה מעולה בכדור בכל מצב ומהירות" },
      { name: "מדייק", description: "דיוק גבוה במסירות ארוכות וקצרות" },
      { name: "שולט", description: "יכולת שליטה בשתי הרגליים באותה רמה" },
      { name: "מאזן", description: "שמירה על שיווי משקל מושלם בכל תנועה" },
      { name: "זריז", description: "מהירות תגובה וזריזות רגליים גבוהה" },
      { name: "מתמרן", description: "יכולת התמרון עם הכדור במרחבים צפופים" },
      { name: "מדויק", description: "ביצוע בעיטות מדויקות לשער מכל מרחק" },
      { name: "מקדים", description: "יכולת הקדמת היריב בכל מצב משחק" },
      { name: "מנתר", description: "קפיצה וניתור גבוה לכדורי אוויר" },
      { name: "מאלתר", description: "פתרונות טכניים יצירתיים במצבים מורכבים" },
      { name: "מתזמן", description: "תזמון מושלם בחיתוכים והשתלטות על כדור" },
      { name: "חודר", description: "יכולת חדירה מהירה עם כדור דרך מרחבים צרים" },
      { name: "בולם", description: "יכולת עצירת כדור והשתלטות מיידית" },
      { name: "מוביל", description: "הובלת כדור מהירה תוך שמירה על שליטה מלאה" },
      { name: "מגן", description: "טכניקת הגנה מתקדמת על הכדור מול לחץ" }
    ]
  },
  mental: {
    key: "mental",
    name: "מנטלי (גישה וחשיבה)",
    description: "איך אתה מרגיש מבחינה מנטלית לקראת המשחק?",
    havayot: [
      { name: "נחוש", description: "בעל רצון חזק להצליח ולהתקדם" },
      { name: "סבלני", description: "מסוגל להמתין לרגע הנכון" },
      { name: "אופטימי", description: "רואה את הצד החיובי בכל מצב" },
      { name: "ממוקד", description: "שומר על ריכוז לאורך זמן" },
      { name: "גמיש מחשבתית", description: "מסתגל בקלות לשינויים" },
      { name: "קור-רוח", description: "שומר על שליטה במצבי לחץ" },
      { name: "שליו", description: "רגוע ומאוזן נפשית" },
      { name: "מודע לעצמי", description: "מכיר את החוזקות והחולשות שלך" },
      { name: "בעל חוסן", description: "מתמודד היטב עם אתגרים" },
      { name: "סומך על עצמי", description: "בעל ביטחון ביכולות שלך" },
      { name: "מתעל טעויות", description: "לומד ומתפתח מטעויות" },
      { name: "בטוח בעצמי", description: "פועל מתוך אמונה עצמית" },
      { name: "לומד מהיר", description: "קולט ומיישם במהירות" },
      { name: "שאפתן נפשית", description: "תמיד שואף להתפתח ולהשתפר" },
      { name: "מתגבר על מכשולים", description: "מוצא דרכים להתמודד עם קשיים" }
    ]
  },
  emotional: {
    key: "emotional",
    name: "רגשי (אנרגיה ותשוקה)",
    description: "איך אתה מרגיש מבחינה רגשית לקראת המשחק?",
    havayot: [
      { name: "נלהב", description: "מלא התלהבות ואנרגיה חיובית" },
      { name: "מלא תשוקה", description: "בעל אהבה עזה למשחק" },
      { name: "כריזמטי", description: "מקרין אנרגיה חיובית לסביבה" },
      { name: "חיובי", description: "משרה אווירה טובה" },
      { name: "קליל", description: "משוחרר מלחץ ודאגות" },
      { name: "זורם", description: "נע בטבעיות עם המשחק" },
      { name: "נינוח", description: "רגוע ומשוחרר" },
      { name: "שמח", description: "מביא שמחת משחק למגרש" },
      { name: "חופשי", description: "משוחרר ממתחים" },
      { name: "מאיר פנים", description: "מקרין חיוך ושמחה" },
      { name: "משוחרר", description: "פועל בחופשיות וללא עכבות" },
      { name: "מחובר לרגע", description: "חי את הרגע במלואו" },
      { name: "סוער", description: "מלא אנרגיה ותשוקה" },
      { name: "מרים אווירה", description: "משפר את האווירה בקבוצה" },
      { name: "מלא השראה", description: "מעורר השראה בסביבתו" }
    ]
  },
  social: {
    key: "social",
    name: "חברתי-תקשורתי (אינטראקציה קבוצתית)",
    description: "איך אתה מרגיש מבחינה חברתית לקראת המשחק?",
    havayot: [
      { name: "תומך", description: "מעודד ועוזר לחברי הקבוצה" },
      { name: "מוביל", description: "מנהיג ומכוון את הקבוצה" },
      { name: "מגביר מוטיבציה", description: "מעלה את המורל הקבוצתי" },
      { name: "מקשיב", description: "קשוב לחברי הקבוצה והמאמן" },
      { name: "משתף פעולה", description: "עובד היטב עם אחרים" },
      { name: "פתוח לשינויים", description: "מקבל בהבנה שינויים והתאמות" },
      { name: "סבלני כלפי אחרים", description: "מגלה סבלנות לטעויות של אחרים" },
      { name: "רגוע בקבוצה", description: "משרה אווירה רגועה" },
      { name: "משפיע לטובה", description: "משפיע חיובית על הקבוצה" },
      { name: "יוזם שיח", description: "מתקשר באופן פעיל" },
      { name: "מעודד", description: "נותן חיזוקים חיוביים" },
      { name: "מאפשר", description: "נותן מקום לאחרים להתבטא" },
      { name: "מאחד", description: "מחבר בין חברי הקבוצה" },
      { name: "מקרב", description: "יוצר אווירה חברית" },
      { name: "מכבד", description: "מתייחס בכבוד לכולם" }
    ]
  }
};

export type { CategoryKeyType, CategoryType, HavayaType };