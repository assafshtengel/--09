import { Video, BookOpen, Play } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LearningResource {
  id: number;
  title: string;
  description: string;
  type: 'video' | 'article';
  url: string;
  icon: 'video' | 'book' | 'play';
}

const resources: LearningResource[] = [
  {
    id: 1,
    title: "חשיבה חיובית במשחק",
    description: "למד כיצד לשמור על גישה חיובית גם ברגעים מאתגרים",
    type: 'video',
    url: "https://www.youtube.com/watch?v=example1",
    icon: 'video'
  },
  {
    id: 2,
    title: "טכניקות להתמודדות עם לחץ",
    description: "שיטות מעשיות להתמודדות עם לחץ לפני ובמהלך המשחק",
    type: 'article',
    url: "https://example.com/article1",
    icon: 'book'
  },
  {
    id: 3,
    title: "תרגילי מיינדפולנס לספורטאים",
    description: "סדרת תרגילים לשיפור הריכוז והמיקוד",
    type: 'video',
    url: "https://www.youtube.com/watch?v=example2",
    icon: 'play'
  }
];

const MentalLearning = () => {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'book':
        return <BookOpen className="h-6 w-6" />;
      case 'play':
        return <Play className="h-6 w-6" />;
      default:
        return <Video className="h-6 w-6" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">לימוד מנטאלי</h1>
        <p className="text-gray-600">
          צפה בסרטונים וקרא מאמרים כדי לשפר את היכולות המנטליות שלך
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <Card key={resource.id} className="p-6 hover:shadow-lg transition-shadow">
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block">
              <div className="flex items-center mb-4 text-primary">
                {getIcon(resource.icon)}
                <span className="mr-2 text-sm">
                  {resource.type === 'video' ? 'סרטון' : 'מאמר'}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
              <p className="text-gray-600">{resource.description}</p>
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MentalLearning;