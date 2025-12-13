-- Create prompt_templates table
CREATE TABLE public.prompt_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  prompt TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage all templates"
ON public.prompt_templates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Coaches can view active templates
CREATE POLICY "Coaches can view active templates"
ON public.prompt_templates
FOR SELECT
TO authenticated
USING (
  is_active = true AND
  public.has_role(auth.uid(), 'coach')
);

-- Trigger for updated_at
CREATE TRIGGER update_prompt_templates_updated_at
BEFORE UPDATE ON public.prompt_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial system templates
INSERT INTO public.prompt_templates (name, description, category, prompt, icon, is_system) VALUES
(
  'Content Strategy',
  'Generate a comprehensive content strategy tailored to your niche and audience',
  'Strategy',
  'Create a comprehensive content strategy for my coaching business. Include: 1) Content pillars (3-5 main themes), 2) Content calendar framework for 30 days, 3) Platform-specific recommendations, 4) Engagement tactics, 5) Key metrics to track. Consider my expertise in {{specialization}} and target audience.',
  'LayoutDashboard',
  true
),
(
  'Ideal Customer Profile (ICP)',
  'Define your ideal customer profile with detailed demographics and psychographics',
  'Strategy',
  'Help me create a detailed Ideal Customer Profile (ICP) for my coaching practice. Include: 1) Demographics (age, location, income, job title), 2) Psychographics (values, fears, aspirations), 3) Pain points and challenges, 4) Goals and desired outcomes, 5) Where they spend time online, 6) Objections they might have. Focus on my specialization in {{specialization}}.',
  'UserCheck',
  true
),
(
  'Blog Post Generator',
  'Generate engaging blog post ideas and outlines for your coaching topics',
  'Content',
  'Generate 5 blog post ideas for my coaching business with full outlines. For each post include: 1) Compelling headline, 2) Hook/introduction, 3) 5-7 main points with brief descriptions, 4) Call-to-action, 5) SEO keywords to target. Focus on topics related to {{specialization}} that would resonate with my target audience.',
  'FileText',
  true
),
(
  'YouTube Video Production List',
  'Create a list of YouTube video ideas with scripts and production notes',
  'Content',
  'Create a YouTube content plan with 10 video ideas for my coaching channel. For each video include: 1) Title and thumbnail concept, 2) Hook (first 30 seconds), 3) Main talking points, 4) B-roll suggestions, 5) Call-to-action, 6) Estimated video length. Videos should showcase my expertise in {{specialization}} and provide value to potential clients.',
  'Video',
  true
),
(
  'Pillar Article Framework',
  'Create comprehensive pillar content that establishes thought leadership',
  'Content',
  'Help me create a pillar article framework on a key topic in {{specialization}}. Include: 1) Main topic and angle, 2) Comprehensive outline (2000+ words structure), 3) Key statistics or research to include, 4) Internal linking opportunities, 5) Lead magnet tie-in, 6) Social media snippets to promote it. This should be cornerstone content that establishes authority.',
  'BookOpen',
  true
),
(
  'Lead Magnet Creator',
  'Design compelling lead magnets to grow your email list',
  'Marketing',
  'Design 3 lead magnet concepts for my coaching business. For each include: 1) Type (checklist, ebook, template, quiz, etc.), 2) Title and subtitle, 3) Key contents/chapters, 4) Landing page headline, 5) Email sequence outline (5 emails), 6) How it connects to my paid offerings. Focus on solving problems related to {{specialization}}.',
  'Gift',
  true
),
(
  'Social Media Post Bundle',
  'Generate a week of engaging social media posts',
  'Content',
  'Create a week of social media content (7 days) for my coaching business. Include: 1) LinkedIn posts (professional insights), 2) Instagram captions with hashtags, 3) Twitter/X threads, 4) Engagement prompts and questions. Mix educational content, personal stories, and promotional posts. Theme around {{specialization}}.',
  'Share2',
  true
),
(
  'Email Newsletter Template',
  'Create an engaging email newsletter structure',
  'Marketing',
  'Design an email newsletter template and 4 sample newsletters for my coaching business. Include: 1) Subject line formulas, 2) Opening hook structure, 3) Main content section, 4) Personal story section, 5) Call-to-action, 6) P.S. line ideas. Newsletters should provide value while nurturing leads toward my {{specialization}} coaching services.',
  'Mail',
  true
);