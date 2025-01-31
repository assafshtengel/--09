import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const motivationalQuotes = [
  "הניצחון מתחיל בראש, עוד לפני שהרגליים זזות.",
  "הגדר לאן אתה רוצה להגיע, כדי שלא תתפזר בדרך.",
  "התמדה היא הדלק שמניע כישרון קדימה.",
  "טעות היא מדרגה בלימוד – דרוך עליה כדי לגדול.",
  "מי שלא עוצר ללמוד – ממשיך תמיד להתקדם.",
  "ההצלחה היא תוצר לוואי של התהליך היומיומי המדויק שלך.",
  "כשאתה בשליטה בעצמך, אתה בשליטה במצב.",
  "זכור שהראש שלך חזק יותר מכל שריר בגוף.",
  "כשאתה נהנה, המשחק הופך לפשוט יותר.",
  "ביקורת בונה עוזרת לך לחדד את היכולות ולהשתפר.",
  "דמיין את עצמך כמצליח, ותרגיש איך הדרך נפתחת.",
  "הכן את התרגילים ואת האסטרטגיה מראש – אל תסמוך רק על האלתורים.",
  "כשאתה מרים את כולם סביבך, אתה גדל איתם.",
  "מנוחה היא חלק מהאימון – בלי הפסקה, הגוף והנפש נשחקים.",
  "תן לרגליים לעבוד, אך שמור את הראש פתוח תמיד.",
  "פרט קטן יכול להכריע משחק גדול.",
  "אל תסתמך על מחיאות הכפיים של אחרים – ספק אותן לעצמך.",
  "להגיע לפסגה לוקח זמן, אך בכל צעד אתה חזק יותר.",
  "כשאתה לוקח אחריות, אתה יכול לשנות את המצב.",
  "כמו במשחק, חפש את המהלך קדימה – אל תיתקע בעבר.",
  "ההווה הוא המקום היחיד בו אתה יכול לפעול ולשנות.",
  "יותר חשוב להיות טוב בכמה פעולות בסיסיות מאשר להתפזר על מיליון טריקים.",
  "הפוך את הכעס והאכזבה לכוח שדוחף קדימה.",
  "תרגל את המצב בראש לפני שהוא קורה במגרש.",
  "כוח פיזי הוא אדיר – אבל מנטליות חזקה מנצחת.",
  "שלב טכניקות שונות כדי למנוע שעמום ולשפר יכולות.",
  "כשאתה מלמד אחרים, אתה לומד פי שניים.",
  "קבלת החלטות חכמה מצריכה רוגע גם בזמנים של לחץ.",
  "מדרגות ההצלחה נבנות אחת אחרי השנייה, לא בדילוג אחד ענק.",
  "אם לא תאמין בעצמך, למה שמישהו אחר יאמין?",
  "איזון בין כדורגל, לימודים, משפחה וחברים תורם לכוח המנטלי.",
  "המשחק לא בונה אופי, הוא חושף אותו – אבל אתה יכול לעצב אותו במהלך הדרך.",
  "תן לעצמך מילה טובה אחרי כל אימון מוצלח, זה נותן כוח להמשיך.",
  "כל כישלון הוא זריקת מוטיבציה להתקדם טוב יותר.",
  "כשאתה נחוש, אתה לא עוצר עד שאתה מצליח.",
  "כשאתה מכבד את היריב, אתה מכבד את עצמך.",
  "שינוי קל באימון או בסגנון המשחק יכול לפתוח אפשרויות חדשות.",
  "אל תזניח את הבסיס – הוא העוגן שלך ברגעי לחץ.",
  "זכור שתמיד יש מה ללמוד ממאמנים ושחקנים אחרים.",
  "אם הראש אומר שאתה יכול, הגוף ימצא את הדרך.",
  "ניצחון היום הוא האתגר של מחר – אל תעצור.",
  "הכן תוכנית מה תעשה במקרה של תוצאה שלילית, כך לא תופתע.",
  "חישוב נכון ומהיר מונע פספוסים: תחשוב מהר, תפעל בבהירות.",
  "נהלים ברורים לפני משחק מקצרים את ההתעסקות המיותרת בפרטים.",
  "הצלחה אמיתית מגיעה כשאתה מחפש להצליח, לא רק להיראות מצליח.",
  "בלי להעז, לא תשיג את מה שמעבר ליכולתך הנוכחית.",
  "תזונה, שינה והתאוששות – אלה לא מותרות, זה חלק מאימון.",
  "אחרי טעות, אל תישאר שם. חזור מיד לקצב ולפעולה.",
  "המשחק הוא גם כיף: זכור את זה בכל פעם שאתה עולה למגרש.",
  "תלה שלטים קטנים בראש על הניצחונות מהעבר, כדי לתת השראה בעתיד.",
  "העזה לשחק אחרת – לפעמים המהלך הבלתי צפוי מביא לשער.",
  "אתה לא מפסיד – אתה לומד מההפסד.",
  "להרגיש את המשחק בלב ולקרוא את המשחק בראש.",
  "הגדר יעדים קטנים שיקרבו אותך למטרה הגדולה.",
  "שחקן גדול נוצץ יותר כשהוא יודע לשתף אחרים בהצלחה.",
  "עשה גם את מה שפחות כיף – זה בדיוק מה שמצמיח אותך.",
  "חלק יגידו שאתה לא מספיק טוב; תוכיח להם (ולעצמך) שהם טועים.",
  "היכנס למשחק עם רוטינה שעושה לך טוב ומשקיטה לחץ.",
  "שיקום הוא חלק מהמשחק – התמקד במה שאפשר לעשות כדי לחזור חזק יותר.",
  "אתה לא חייב לצעוק כדי להשפיע – דוגמה אישית חזקה מכל מילה.",
  "לפני משחק, תראה בדמיון את המהלכים – המוח יקלוט זאת כתרגול.",
  "החינוך הערכי חשוב לא פחות מהניצחון.",
  "אם הלחץ גדול, אתה כנראה נמצא ברגע חשוב שמחשל אותך.",
  "לפעמים לשחרר ולנשום עמוק זה המהלך החכם ביותר.",
  "הסתכל מסביב, לא רק על הכדור – המשחק קורה בכל המגרש.",
  "זהה את החולשה שלך – עבד עליה עד שהיא תתמוסס.",
  "תעד את האימונים והמשחקים שלך, כדי להבין את השיפור ולבחון מה עוד אפשר לשפר.",
  "תן לרגשות את המקום, אבל אל תיתן להם לנהל אותך.",
  "כשיש בעיה, תציע פתרון ולא רק תלונות.",
  "כמו שעובדים על כוח שרירי, כך צריך לעבוד על ריכוז ומיקוד.",
  "חפש סיפורים של שחקנים שהתגברו על קשיים, כדי להזכיר לעצמך שהכול אפשרי.",
  "הכנס למשחק בהרגשה שהיום אתה יוצא לנצח.",
  "הצבת גבולות עצמית הופכת אותך לחופשי יותר במשחק.",
  "כשאתה חושב שאתה גמור, יש לך עדיין כוח לפעולה נוספת.",
  "אל תתן לגול אחד לשנות את כל מצב הרוח – המשך בתוכנית המקורית.",
  "דמיין את עצמך מבצע את הטכניקה הנכונה – המוח 'זוכר' את זה בפועל.",
  "צור שגרת הכנה, חימום וניהול משחק שחוזרת על עצמה בעקביות.",
  "כשאתה עוזר לחבר לקבוצה, אתה יוצר סביבת צמיחה לכולם.",
  "כל דקה באימון חשובה – נצל אותה במלואה.",
  "למוד לזהות את מצבי הרוח שלך ושל חבריך לקבוצה, זה משפיע על המשחק.",
  "אל תסתפק ב'כמעט' מוצלח, לך עד הסוף במלוא העוצמה.",
  "לפעמים עדיף למסור, ולא לתקוע מהלך שיכול להיכשל.",
  "אחרי הצלחה גדולה, אל תוריד רגל מהגז; אחרי הפסד גדול, אל תהרוס הכול.",
  "גם כשאתה טוב, תמשיך לחפש תחום נוסף לשיפור.",
  "הכרת תודה למאמנים ולחברים מעצימה את היחסים בקבוצה.",
  "אם אתה מרגיש אבוד, חזור ליסודות: מסירה נכונה, שליטה בכדור, מיקום מדויק.",
  "חדשנות במגרש יכולה לתת לך יתרון על יריב שקפא על השמרים.",
  "שים יעדים ריאליים – כך ההתקדמות שלך תהיה יציבה וסבלנית.",
  "החלץ את עצמך ממשימות מיותרות מחוץ למגרש, כדי לשמור אנרגיה לאימונים.",
  "פעולות קטנות וחיוביות מדי יום נהיות חלק בלתי נפרד מהאישיות שלך.",
  "שחקן שכל הזמן לומד, לעולם לא מפסיק להשתפר.",
  "הפחד הגדול ביותר הוא לפעמים לא הניסיון, אלא החמצת ההזדמנות.",
  "התבונן בטעויות מהצד, בלי לשפוט את עצמך בחומרה.",
  "גם אם אתה לא בהרכב הפותח, חשוב להיות מוכן – ההזדמנות תגיע.",
  "היזכר למה התחלת לשחק מלכתחילה – התשוקה היא הדלק הטוב ביותר.",
  "עונה אחת לא מגדירה קריירה שלמה, אל תישבר על פספוסים נקודתיים.",
  "הקשב למאמן ולחברים, אבל בסוף – קח את ההחלטה שאתה שלם איתה.",
  "כל אימון הוא הזדמנות להתכונן למהלך הגדול הבא.",
  "טפח על השכם גם על התקדמות צנועה – זה מחזק את הביטחון.",
  "לפעמים הדרך ארוכה ומפותלת, אבל מי שממשיך לצעוד מגיע לפסגה.",
  "ניצחתם? שאלו את עצמכם איך אפשר להשתפר עוד יותר. הפסדתם? מצאו מה לשפר לפעם הבאה.",
  "דווקא כשקשה, מתגלים הכוחות האמיתיים שבך.",
  "הקפד לדמיין את עצמך מצליח ולא נכשל – הגוף ילך אחרי התמונה בראש.",
  "אחרי משחק רע, שאל את עצמך: איך ייראה שבוע הבא? חודש הבא?",
  "יצירת קשרים עם שחקנים ומאמנים שונים פותחת דלתות וידע.",
  "הראה דוגמא אישית לשחקנים צעירים – גם אתה תגדל מכך.",
  "קח כמה דקות חשיבה ביום בלי הסחות דעת; הרעיונות הטובים מגיעים בשקט.",
  "התאם את עצמך למצב החדש בשטח – כך תישאר רלוונטי בכל רגע.",
  "ספורטאי יציב לאורך זמן עדיף על 'כוכב ליום אחד'.",
  "ההבנה מה מפעיל אותך רגשית תעזור לך לשלוט ברגשות.",
  "כשאתה משחק ממקום של אהבה ספורטיבית אמיתית, זה נותן לך יתרון על יריב שמשחק רק מתוך חובה.",
  "גם אם התוצאה לא לטובתך, אתה יכול להיות שלם עם עצמך כשנתת 100%.",
  "טוב הוא האויב של המצוינות – אל תסתפק ב'טוב'.",
  "קבע דפוסי הכנה לפני משחק שמכניסים אותך למנטליות של הצלחה.",
  "חבר לקבוצה עם ביטחון נמוך? חזק אותו מילולית ורגשית – זה יחזור אליך ולכולם.",
  "עקוב אחר הביצועים דרך וידאו וסטטיסטיקה, כדי לנתח וללמוד איך להשתפר.",
  "שמור על עצמך מפציעות עם חיזוק הגוף וגמישות – משחקנים פצועים לא מצפים ליותר מדי.",
  "אל תיתקע באשמה או בכעס לאחר טעות – למד ממנה והתקדם.",
  "חושב מה תשאיר אחריך – האם אתה רק שחקן טוב, או גם מודל לחיקוי?",
  "הערכים שתיקח איתך לכל החיים חשובים יותר מטבלה זמנית.",
  "האתגרים מחוץ לאזור הנוחות הם אלו שיגרמו לך לזנק קדימה.",
  "ההרגלים היומיומיים – שינה, תזונה, מתיחות – הם הבסיס לביצועים טובים.",
  "תוך כדי משחק, קבל פידבק מהמאמן או החברים ויישם כבר במהלך המשחק.",
  "לפעמים מאמן רואה בך פוטנציאל בתפקיד אחר – אל תפחד לנסות.",
  "גם ניצחון גדול לא הופך אותך לחסין, וגם הפסד לא הופך אותך לחלש.",
  "האתגר הוא מה שעושה את הניצחון למתוק.",
  "מוטב אימון אחד עם נוכחות מלאה מאשר שניים שאתה 'מעביר' בלי ריכוז.",
  "עשה פעולה חיובית אחת – ריצה קצרה, מסירה מדויקת – כדי לשבור את המעגל השלילי.",
  "הנגיעות הראשונות, דיוק במסירה, תנועה בלי כדור – שם טמון ההבדל הגדול.",
  "שתף את המאמן או חבריך כשאתה מתקשה – לעיתים זה החוליה החסרה לפתרון.",
  "הגב אותו בביטחון – רק כך תשאיר חותם אישי על המשחק.",
  "כשאתה נותן הכל, אתה מעורר השראה באחרים לעשות אותו הדבר.",
  "הכדור שאתה מחפש נמצא בפעולה הבאה, לא בהחמצה שעברה.",
  "אם אתה מצפה להערכה על הצלחה, קח גם אחריות על כישלון.",
  "הכן לוז מסודר: הארוחות, המנוחות, זמני האימון, כדי לשמור על ריכוז ושגרה.",
  "לפני המשחק או האימון, עצור לרגע והודה על ההזדמנות לשחק.",
  "הפוך כל אימון לרמה מעל הקודם – עקביות יוצרת התקדמות.",
  "התבונן בכוכבים: איך הם זזים, חושבים ומתנהגים – ואז התאם לעצמך.",
  "ברגע האמת במגרש, התרכז רק במשחק – זה אתה, הקבוצה והכדור.",
  "כשאתה מתאמן על תרגיל אלפי פעמים, הוא נהפך לטבע שני.",
  "הזהות שלך לא תלויה רק בתוצאות המשחק – זכור מי אתה מחוץ למגרש.",
  "תקשורת ברורה מונעת תסכול ומשפרת את הדרך להצלחה.",
  "גם אם עכשיו אתה בספסל, אתה לא יודע מה יביא המשחק הבא. הישאר מוכן.",
  "היה השחקן שלא חשוב כמה פעמים הוא נופל – הוא תמיד קם.",
  "זכור מה הופך אותך לשחקן מיוחד – אל תאבד את זה תוך כדי רדיפה אחרי אחרים.",
  "כשאתה ממוקד במשימה – רמות הלחץ יורדות, כי הראש שלך בעשייה.",
  "ניצחתם יחד – תחגגו יחד. זה מחזק את הקשר והזיכרונות הטובים.",
  "כשהם טועים, חזק אותם. כשהם מצליחים, שמח איתם באמת.",
  "כל סיום הוא התחלה של אתגר חדש – שמור תמיד על רעב להשתפר.",
  "בסופו של יום – אם אינך נהנה מהמשחק, הפסדת את העיקר."
];

interface MotivationalPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MotivationalPopup = ({ isOpen, onClose }: MotivationalPopupProps) => {
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-amber-50 to-orange-50 border-none shadow-xl">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center space-y-6 p-6"
        >
          <div className="relative">
            <div 
              className="absolute -top-1 -right-1 w-full h-full bg-primary/5 rounded-lg transform rotate-2"
              aria-hidden="true"
            />
            <div 
              className="absolute -top-2 -right-2 w-full h-full bg-primary/5 rounded-lg transform -rotate-1"
              aria-hidden="true"
            />
            <p 
              className="relative font-heebo text-xl leading-relaxed text-gray-800 p-6 bg-white rounded-lg shadow-sm transform transition-transform hover:scale-[1.02] cursor-default"
              style={{ 
                fontWeight: 500,
                letterSpacing: '0.01em',
                lineHeight: 1.6
              }}
            >
              {randomQuote}
            </p>
          </div>
          
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 text-white font-medium px-8 py-3 rounded-full shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
          >
            סגור
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};