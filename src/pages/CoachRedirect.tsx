import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * Redirects from old /coach/:coachId URLs to new /:coachSlug URLs
 */
const CoachRedirect = () => {
  const { coachId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToSlug = async () => {
      if (!coachId) {
        navigate("/coaches", { replace: true });
        return;
      }

      try {
        // Look up the coach by user_id to get their slug
        const { data, error } = await supabase
          .from("coach_profiles")
          .select("slug")
          .eq("user_id", coachId)
          .single();

        if (error || !data?.slug) {
          // If not found, redirect to coaches directory
          navigate("/coaches", { replace: true });
          return;
        }

        // Redirect to the new slug-based URL
        navigate(`/${data.slug}`, { replace: true });
      } catch {
        navigate("/coaches", { replace: true });
      }
    };

    redirectToSlug();
  }, [coachId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default CoachRedirect;
