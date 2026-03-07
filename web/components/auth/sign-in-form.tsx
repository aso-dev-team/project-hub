"use client";

import { LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { useSignInMutation } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SignInForm(): JSX.Element {
  const mutation = useSignInMutation();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo123!");

  const errorMessage = useMemo(() => {
    if (mutation.error instanceof Error) {
      return mutation.error.message;
    }

    return "";
  }, [mutation.error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md border-white/70 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Project Hub</CardTitle>
          <CardDescription>
            Cookie 認証でサインインすると、Next.js から ASP.NET Core API へ接続してボードを表示します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate({
                email,
                password,
              });
            }}
          >
            <label className="flex flex-col gap-2 text-sm font-medium">
              Email
              <Input onChange={(event) => setEmail(event.target.value)} value={email} />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Password
              <Input onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
            </label>
            {errorMessage.length > 0 ? (
              <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}
            <Button className="w-full" disabled={mutation.isPending} type="submit">
              {mutation.isPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
              サインイン
            </Button>
            <p className="text-xs text-muted-foreground">
              Demo PAT は <code>pat_demo_readonly_local</code> です。
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
