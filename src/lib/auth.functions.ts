import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const signUp = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; password: string; name: string; grade: number }) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
        grade: z.number().min(1).max(4),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { error, data: authData } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          grade: data.grade,
        },
      },
    });

    if (error) throw new Error(error.message);
    return { user: authData.user };
  });

export const signIn = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; password: string }) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { error, data: authData } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw new Error(error.message);
    return { user: authData.user, session: authData.session };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return { success: true };
});
