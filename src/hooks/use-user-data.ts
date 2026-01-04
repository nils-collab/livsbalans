"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  getScores,
  getCauses,
  getGoals,
  getTasks,
  getQuestions,
  getUserProfile,
  User,
} from "@/lib/api";
import { DimensionKey } from "@/types/dimensions";
import { DimensionTask } from "@/lib/api";

export interface UserData {
  scores: Record<DimensionKey, number>;
  causes: Record<DimensionKey, string>;
  goals: Record<DimensionKey, string>;
  tasks: Record<DimensionKey, DimensionTask[]>;
  questions: Record<DimensionKey, string>;
  profile: { is_admin: boolean | null } | null;
}

export interface UseUserDataOptions {
  includeQuestions?: boolean;
}

export function useUserData(options: UseUserDataOptions = {}) {
  const { includeQuestions = false } = options;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<UserData | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);

      // Load user data in parallel
      const promises: Promise<unknown>[] = [
        getScores(),
        getCauses(),
        getGoals(),
        getTasks(),
      ];

      if (includeQuestions) {
        promises.push(getQuestions(), getUserProfile());
      }

      const results = await Promise.all(promises);

      const scoresData = results[0] as Record<DimensionKey, number>;
      const causesData = results[1] as Record<DimensionKey, string>;
      const goalsData = results[2] as Record<DimensionKey, string>;
      const tasksData = results[3] as Record<DimensionKey, DimensionTask[]>;
      const questionsData = includeQuestions
        ? (results[4] as Record<DimensionKey, string>)
        : {};
      const profile = includeQuestions
        ? (results[5] as { is_admin: boolean | null } | null)
        : null;

      setData({
        scores: scoresData,
        causes: causesData,
        goals: goalsData,
        tasks: tasksData,
        questions: questionsData as Record<DimensionKey, string>,
        profile,
      });

      setLoading(false);
    });
  }, [router, includeQuestions]);

  return { loading, user, data };
}

