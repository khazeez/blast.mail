import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";

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
