import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";

type Lesson = { id: string; title: string; duration: string };
type CourseInfo = {
  id: string;
  title: string;
  description: string;
  lessons: number;
  duration: string;
  lessonsList: Lesson[];
};

const COURSE_MAP: Record<string, CourseInfo> = {
  "email-fundamentals": {
    id: "email-fundamentals",
    title: "Email Marketing Fundamentals",
    description: "Pelajari dasar-dasar email marketing dari nol hingga mahir.",
    lessons: 4,
    duration: "40 menit",
    lessonsList: [
      { id: "l1", title: "Pengenalan Email Marketing", duration: "8 menit" },
      { id: "l2", title: "Membangun Lists & Segmentation", duration: "8 menit" },
      { id: "l3", title: "Subject Lines & Content", duration: "12 menit" },
      { id: "l4", title: "Deliverability Basics", duration: "12 menit" },
    ],
  },
  "automation-masterclass": {
    id: "automation-masterclass",
    title: "Email Automation Masterclass",
    description: "Buat workflow email otomatis yang mengkonversi subscriber jadi pelanggan.",
    lessons: 4,
    duration: "1 jam",
    lessonsList: [
      { id: "a1", title: "Intro to Automation", duration: "10 menit" },
      { id: "a2", title: "Trigger & Actions", duration: "12 menit" },
      { id: "a3", title: "Onboarding Series", duration: "15 menit" },
      { id: "a4", title: "Engagement Flows", duration: "13 menit" },
    ],
  },
};

export const LearnCourse: React.FC = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const course = COURSE_MAP[courseId ?? ""] ?? null;
  const [progress, setProgress] = useState<number>(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!course) { setLoading(false); return; }
    const load = async () => {
      if (!user) { setProgress(0); setCompleted([]); setLoading(false); return; }
      try {
        const { data, error } = await supabase
          .from("learn_progress")
          .select("progress, completed_lessons")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .single();
        if (!error && data) {
          setProgress(data.progress ?? 0);
          const cl = data.completed_lessons ?? [];
          setCompleted(cl as string[]);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [course, courseId, user]);

  const updateProgress = async (value: number) => {
    if (!user || !course) return;
    const next = Math.max(0, Math.min(100, value));
    // update on backend
    await supabase.from("learn_progress").upsert({
      user_id: user.id,
      course_id: courseId,
      progress: next,
      completed: next >= 100,
      completed_lessons: completed,
    });
    setProgress(next);
  };

  const toggleLesson = async (lessonId: string) => {
    const already = completed.includes(lessonId);
    const updated = already ? completed.filter((id) => id !== lessonId) : [...completed, lessonId];
    setCompleted(updated);
    const total = course?.lessonsList.length ?? 0;
    const pct = total ? Math.round((updated.length / total) * 100) : 0;
    await updateProgress(pct);
  };

  if (!course || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{course.title}</h1>
            <p className="text-sm text-muted-foreground">{course.description}</p>
          </div>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Progress</CardTitle>
            <CardDescription>Progress per course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {course.lessonsList.map((l) => {
                const done = completed.includes(l.id);
                return (
                  <div key={l.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <span className={"h-3 w-3 rounded-full bg-primary"} />
                      <span className="text-sm">{l.title}</span>
                    </div>
                    <Button size="xs" onClick={() => toggleLesson(l.id)}>
                      {done ? "Completed" : "Mark Complete"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

type Lesson = { title: string; duration: string };
type CourseInfo = {
  id: string;
  title: string;
  description: string;
  lessons: number;
  duration: string;
  lessonsList: Lesson[];
};

const COURSE_MAP: Record<string, CourseInfo> = {
  "email-fundamentals": {
    id: "email-fundamentals",
    title: "Email Marketing Fundamentals",
    description: "Pelajari dasar-dasar email marketing dari nol hingga mahir.",
    lessons: 4,
    duration: "40 menit",
    lessonsList: [
      { title: "Pengenalan Email Marketing", duration: "8 menit" },
      { title: "Membangun Lists & Segmentation", duration: "8 menit" },
      { title: "Subject Lines & Content", duration: "12 menit" },
      { title: "Deliverability Basics", duration: "12 menit" },
    ],
  },
  "automation-masterclass": {
    id: "automation-masterclass",
    title: "Email Automation Masterclass",
    description: "Buat workflow email otomatis yang mengkonversi subscriber jadi pelanggan.",
    lessons: 6,
    duration: "1 jam",
    lessonsList: [
      { title: "Intro to Automation", duration: "10 menit" },
      { title: "Trigger & Actions", duration: "12 menit" },
      { title: "Onboarding Series", duration: "15 menit" },
      { title: "Engagement Flows", duration: "13 menit" },
    ],
  },
};

export default function LearnCourse() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const course = COURSE_MAP[courseId ?? ""] ?? null;
  const ready = !!course;

  useEffect(() => {
    let mounted = true;
    if (!user || !course) {
      setLoading(false);
      return;
    }
    // fetch progress for this user/course if exists
    (async () => {
      try {
        const { data, error } = await supabase
          .from("learn_progress")
          .select("progress")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .single();
        if (error) throw error;
        if (typeof data?.progress === "number") setProgress(data.progress);
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user, course, courseId]);

  const updateProgress = async (value: number) => {
    if (!user || !course) return;
    await supabase.from("learn_progress").upsert({ user_id: user.id, course_id: courseId, progress: value, completed: value >= 100 });
    setProgress(value);
  };

  if (!ready || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{course.title}</h1>
            <p className="text-sm text-muted-foreground">{course.description}</p>
          </div>
          <Button onClick={() => navigate('/learn')}>Back</Button>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Progress</CardTitle>
            <CardDescription>Track your learning progress for this course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-2">
              <Button onClick={() => updateProgress(Math.min(100, progress + 10))}>+10%</Button>
              <Button onClick={() => updateProgress(Math.max(0, progress - 10))}>-10%</Button>
              <span className="text-sm text-muted-foreground">Progress: {progress}%</span>
              {progress >= 100 && <CheckCircle2 className="text-green-600" />}
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Materi MVP</h3>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            {course.lessonsList.map((l, idx) => (
              <li key={idx}>{l.title} — {l.duration}</li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}


// MVP LearnCourse: course per-id MVP content
export default function LearnCourse() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // For MVP, we fetch progress from learn_progress by user/course
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user || !courseId) { setProgress(0); setLoading(false); return; }
      try {
        const { data, error } = await supabase
          .from("learn_progress")
          .select("progress")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .single();
        if (data?.progress != null) setProgress(data.progress);
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user, courseId]);

  const updateProgress = async (value: number) => {
    if (!user || !courseId) return;
    await supabase.from("learn_progress").upsert({ user_id: user.id, course_id: courseId, progress: value, completed: value >= 100 });
    setProgress(value);
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Course: {courseId ?? 'Learn'}</h1>
            <p className="text-sm text-muted-foreground">Progress & content MVP</p>
          </div>
          <Button onClick={() => navigate('/learn')}>Back</Button>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Progress</CardTitle>
            <CardDescription>Track your learning progress for this course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-2">
              <Button onClick={() => updateProgress(Math.min(100, progress + 10))}>+10%</Button>
              <Button onClick={() => updateProgress(Math.max(0, progress - 10))}>-10%</Button>
              <span className="text-sm text-muted-foreground">Progress: {progress}%</span>
              {progress >= 100 && <CheckCircle2 className="text-green-600" />}
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold">Materi MVP</h3>
          <p className="text-sm text-muted-foreground">Konten kursus akan ditampilkan di sini (CMS mock untuk MVP).</p>
          <div className="mt-2">
            <Button variant="outline" onClick={() => alert('Demo content: video or article')}>Lihat konten demo</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
