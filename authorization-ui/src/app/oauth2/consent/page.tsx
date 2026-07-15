import type { Metadata } from "next";
import { Suspense } from "react";
import { ConsentForm } from "./ConsentForm";

export const metadata: Metadata = { title: "アクセスの許可" };

export default function ConsentPage() {
  return (
    <Suspense>
      <ConsentForm />
    </Suspense>
  );
}
