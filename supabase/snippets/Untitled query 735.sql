   drop policy "Users can view own presets" on public.presets;
   drop policy "Users can insert own presets" on public.presets;
   drop policy "Users can update own presets" on public.presets;
   drop policy "Users can delete own presets" on public.presets;
   
   create policy "Users can view own presets" on public.presets for select using ((select auth.uid()) = user_id);
   create policy "Users can insert own presets" on public.presets for insert with check ((select auth.uid()) = user_id);
   create policy "Users can update own presets" on public.presets for update using ((select auth.uid()) = user_id);
   create policy "Users can delete own presets" on public.presets for delete using ((select auth.uid()) = user_id);