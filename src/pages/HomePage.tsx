import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play, Target, BarChart3, Clock, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "תכנון טרום משחק (24-48 שעות)",
      content: "קבל לוח זמנים מותאם אישית: שינה, תזונה, מדיטציה וחימום",
      icon: <Clock className="w-8 h-8 text-primary" />,
      link: "/pre-game-planner"
    },
    {
      title: "מטרות משחק מדויקות",
      content: "הגדר מטרות אישיות למשחק שלך והשג תוצאות מדידות",
      icon: <Target className="w-8 h-8 text-primary" />,
      link: "/pre-match-report"
    },
    {
      title: "סיכום משחק ותובנות",
      content: "קבל ניתוח משחק מקצועי עם המלצות מותאמות אישית",
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      link: "/game-history"
    },
    {
      title: "סרטוני אימון מנטלי",
      content: "צפה בסרטונים קצרים ומעשיים לשיפור המשחק המנטלי שלך",
      icon: <Brain className="w-8 h-8 text-primary" />,
      link: "/mental-learning"
    }
  ];

  const testimonials = [
    {
      content: "תכנון טרום משחק שינה לחלוטין את הגישה שלי. אני מרגיש הרבה יותר רגוע וממוקד.",
      author: "שחקן נוער"
    },
    {
      content: "השאלונים והתוכן עזרו לי לשפר את קבלת ההחלטות שלי במהלך המשחקים.",
      author: "שחקן בכיר"
    }
  ];

  return (
    <div className="min-h-screen bg-[#000932] text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/placeholder.svg"
        >
          <source src="/basketball-prep.mp4" type="video/mp4" />
        </video>
        
        <div className="container relative z-20 text-center space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold leading-tight"
          >
            תכנן את המשחק המושלם שלך
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto"
          >
            המערכת שלנו עוזרת לך לתכנן 48 שעות לפני המשחק, להגדיר מטרות ולסכם את המשחק עם תובנות מקצועיות
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg"
              onClick={() => navigate("/pre-match-report")}
              className="text-lg px-8 bg-primary hover:bg-primary/90"
            >
              תכנן את המשחק שלך עכשיו
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate("/mental-learning")}
              className="text-lg px-8 border-white text-white hover:bg-white/10"
            >
              למד איך זה עובד
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white text-[#000932]">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            איך אנחנו עוזרים לך להיות מוכן למשחק הבא
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Clock className="w-12 h-12" />, title: "תכנון מוקדם", content: "קבל לוח זמנים מותאם אישית הכולל שינה, תזונה ופעילויות הכנה" },
              { icon: <Target className="w-12 h-12" />, title: "מטרות משחק", content: "הגדר מטרות אישיות ומדידות לפני כל משחק" },
              { icon: <BarChart3 className="w-12 h-12" />, title: "ניתוח לאחר משחק", content: "קבל תובנות מדויקות ודוח מקצועי לשיפור מתמיד" }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center p-6 rounded-lg bg-gray-50 shadow-sm"
              >
                <div className="inline-block p-3 bg-primary/10 rounded-full mb-4 text-primary">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mental Content Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#000932] mb-12">
            תוכן מנטלי מותאם בדיוק בשבילך
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              "איך להפחית לחץ לפני משחק",
              "איך להגדיר מטרות מדויקות לכל משחק",
              "איך לנתח את המשחק שלך מנטלית"
            ].map((title, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden group cursor-pointer"
                onClick={() => navigate("/mental-learning")}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white text-lg font-medium">{title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#000932] mb-12">
            השירותים שלנו
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(service.link)}
              >
                <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#000932]">{service.title}</h3>
                <p className="text-gray-600">{service.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#000932] mb-12">
            שחקנים מספרים על השינוי שלהם
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-lg bg-white shadow-sm"
              >
                <div className="text-4xl text-primary mb-4">"</div>
                <p className="text-lg mb-4 text-gray-700">{testimonial.content}</p>
                <p className="font-semibold text-[#000932]">{testimonial.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="py-20 bg-[#000932] text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            אל תחכה! זה הזמן לשנות את המשחק שלך
          </h2>
          <Button 
            size="lg"
            onClick={() => navigate("/pre-match-report")}
            className="text-lg px-8 bg-primary hover:bg-primary/90"
          >
            התחל עכשיו
          </Button>
          <div className="mt-12 flex justify-center gap-8 text-gray-300">
            <a href="#" className="hover:text-white transition-colors">צור קשר</a>
            <a href="#" className="hover:text-white transition-colors">מדיניות פרטיות</a>
            <a href="#" className="hover:text-white transition-colors">איך זה עובד</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;