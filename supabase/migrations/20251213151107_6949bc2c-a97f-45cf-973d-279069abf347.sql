-- Update the get_subscription_limits function with new limits
CREATE OR REPLACE FUNCTION public.get_subscription_limits(user_tier subscriber_tier)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  SELECT CASE user_tier
    WHEN 'free' THEN jsonb_build_object(
      'max_coaches', 3,
      'max_syndic8_groups', 1,
      'max_coaches_per_group', 2,
      'daily_messages', 5,
      'modality', 'text'
    )
    WHEN 'plus' THEN jsonb_build_object(
      'max_coaches', 5,
      'max_syndic8_groups', 1,
      'max_coaches_per_group', 8,
      'daily_messages', 50,
      'modality', 'text'
    )
    WHEN 'prime' THEN jsonb_build_object(
      'max_coaches', 17,
      'max_syndic8_groups', 2,
      'max_coaches_per_group', 8,
      'daily_messages', 999,
      'modality', 'all'
    )
    ELSE jsonb_build_object(
      'max_coaches', 3,
      'max_syndic8_groups', 1,
      'max_coaches_per_group', 2,
      'daily_messages', 5,
      'modality', 'text'
    )
  END;
$function$;