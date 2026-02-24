import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import {
  BookOpen, Play, Clock, ArrowRight, CheckCircle,
  ChevronRight, Star, Users, Zap, Target, BarChart3, Mail, Palette
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  lessons: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  enrolled?: boolean;
  progress?: number;
  image: string;
}

const courses: Course[] = [
  {
    id: "email-fundamentals",
    title: "Email Marketing Fundamentals",
    description: "Pelajari dasar-dasar email marketing dari nol hingga mahir.",
    lessons: 8,
    duration: "45 menit",
    level: "Beginner",
    enrolled: true,
    progress: 75,
    image: "email",
  },
  {
    id: "automation-masterclass",
    title: "Email Automation Masterclass",
    description: "Buat workflow email otomatis yang mengkonversi subscriber jadi pelanggan.",
    lessons: 12,
    duration: "1.5 jam",
    level: "Intermediate",
    enrolled: true,
    progress: 25,
    image: "automation",
  },
  {
    id: "advanced-segmentation",
    title: "Advanced List Segmentation",
    description: "Teknik segmentasi lanjutan untuk kampanye yang lebih personal dan efektif.",
    lessons: 6,
    duration: "30 menit",
    level: "Advanced",
    image: "segmentation",
  },
  {
    id: "email-design",
    title: "Email Design Principles",
    description: "Desain email yang menarik dan meningkatkan engagement.",
    lessons: 10,
    duration: "1 jam",
    level: "Beginner",
    image: "design",
  },
  {
    id: "analytics-mastery",
    title: "Email Analytics Mastery",
    description: "Baca, analisis, dan optimalkan performa kampanye berdasarkan data.",
    lessons: 7,
    duration: "40 menit",
    level: "Intermediate",
    image: "analytics",
  },
  {
    id: "deliverability-guide",
    title: "Email Deliverability Guide",
    description: "Pastikan email sampai ke inbox, bukan folder spam.",
    lessons: 5,
    duration: "25 menit",
    level: "Intermediate",
    image: "deliverability",
  },
];

const featuredLessons = [
  { id: "1", title: "Cara Meningkatkan Open Rate", course: "Email Marketing Fundamentals", duration: "8 menit", type: "video" },
  { id: "2", title: "Setup Welcome Email Series", course: "Email Automation Masterclass", duration: "12 menit", type: "video" },
  { id: "3", title: "A/B Testing Subject Lines", course: "Email Marketing Fundamentals", duration: "6 menit", type: "article" },
  { id: "4", title: "DKIM & SPF Setup", course: "Email Deliverability Guide", duration: "10 menit", type: "video" },
];

const levelColors = {
  Beginner: "bg-green-500/10 text-green-600 border-green-200",
  Intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  Advanced: "bg-red-500/10 text-red-600 border-red-200",
};

const imageIcons: Record<string, React.ElementType> = {
  email: Mail,
  automation: Zap,
  segmentation: Target,
  design: Palette,
  analytics: BarChart3,
  deliverability: CheckCircle,
};

const Learn = () => {
  const { user } = useAuth();
  const enrolledCourses = courses.filter(c => c.enrolled);
  const otherCourses = courses.filter(c => !c.enrolled);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Selamat pagi";
    if (h < 18) return "Selamat siang";
    return "Selamat malam";
  })();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting}, {userName} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Tingkatkan skill email marketing Anda
          </p>
        </div>

        {enrolledCourses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Lanjutkan Belajar</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {enrolledCourses.map((course) => {
                const Icon = imageIcons[course.image];
                return (
                  <Card key={course.id} className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-md cursor-pointer">
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="flex h-32 w-32 shrink-0 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 transition-all">
                          <Icon className="h-10 w-10 text-primary/60 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
                                {course.title}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                {course.description}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{course.progress}% selesai</span>
                              <span className="text-muted-foreground">{course.lessons} lessons</span>
                            </div>
                            <Progress value={course.progress} className="h-1.5" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold">Semua Course</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {courses.map((course) => {
                const Icon = imageIcons[course.image];
                return (
                  <Card key={course.id} className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-md cursor-pointer overflow-hidden">
                    <div className="flex h-28 items-center justify-center bg-gradient-to-br from-muted to-muted/50 group-hover:from-primary/10 transition-all">
                      <Icon className="h-12 w-12 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-xs ${levelColors[course.level]}`}>
                          {course.level}
                        </Badge>
                        {course.enrolled && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" /> Enrolled
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> {course.lessons}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {course.duration}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                          {course.enrolled ? "Continue" : "Start"} <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Popular Lessons</h2>
              <Card className="border-border/60">
                <CardContent className="p-0">
                  <div className="divide-y divide-border/60">
                    {featuredLessons.map((lesson, i) => (
                      <button key={lesson.id} className="flex w-full items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight truncate">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{lesson.course}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.type === "video" && (
                              <Badge variant="outline" className="text-[10px] h-5 gap-1">
                                <Play className="h-2.5 w-2.5" /> Video
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Stats</h2>
              <Card className="border-border/60">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Courses Enrolled</span>
                    <span className="text-sm font-semibold">{enrolledCourses.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lessons Completed</span>
                    <span className="text-sm font-semibold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Time</span>
                    <span className="text-sm font-semibold">2.5 jam</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Learn;
