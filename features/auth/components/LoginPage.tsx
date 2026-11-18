import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LoginForm } from "./LoginForm";
import { LoginShowcase } from "./LoginShowcase";

export function LoginPage() {
  return (
    <div className="relative min-h-dvh bg-background lg:grid lg:grid-cols-[1fr_1.1fr] lg:gap-4 lg:p-4">
      <div className="relative flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:min-h-0">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full py-1 pr-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft
              className="size-4 transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            Volver al inicio
          </Link>
          <ThemeToggle />
        </header>

        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <div className="animate-enter">
            <Link
              href="/"
              aria-label="Maminco inicio"
              className="inline-flex items-center gap-2.5"
            >
              <Image
                src="/maminco-logo-128.png"
                alt=""
                width={44}
                height={44}
                priority
                className="size-11 rounded-xl shadow-elevated"
              />
              <span className="text-xl font-semibold tracking-tight">
                Maminco
              </span>
            </Link>
          </div>

          <div
            className="animate-enter mt-10"
            style={{ ["--enter-delay" as string]: "60ms" }}
          >
            <h1 className="text-balance font-display text-4xl font-normal uppercase leading-[1.05] tracking-[0.005em] sm:text-5xl">
              Bienvenido de nuevo
            </h1>
            <p className="mt-2 text-muted-foreground">
              Ingresa con las credenciales que te dio tu restaurante.
            </p>
          </div>

          <div
            className="animate-enter mt-8"
            style={{ ["--enter-delay" as string]: "120ms" }}
          >
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </main>
      </div>

      <aside className="hidden lg:block" aria-hidden="true">
        <LoginShowcase />
      </aside>
    </div>
  );
}
