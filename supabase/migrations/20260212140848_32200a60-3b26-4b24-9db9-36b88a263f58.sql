-- Allow admins to view all feedbacks
CREATE POLICY "Admins can view all feedbacks"
ON public.feedbacks
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));