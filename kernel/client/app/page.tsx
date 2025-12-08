"use client";

import { FC, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLogo from "@/core/partials/AppLogo";
import Login from "@/core/auth/page/views/LoginView";
import { authStore } from "@/core/auth/store/authStore";

const Page: FC = () => {
  const router = useRouter();

  useEffect(() => {
    if (authStore.isAuthenticated()) {
      router.replace('/schools');
    }
  }, [router]);

  return (
    <main className="flex h-full items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col w-full max-w-[24rem] px-6 sm:px-8 pt-10 pb-8 rounded-md bg-white">
        <AppLogo />
        <Login />
      </div>
    </main>
  );
};

export default Page;
