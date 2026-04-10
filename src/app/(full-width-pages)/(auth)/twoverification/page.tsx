import { Suspense } from "react";
import TwoStepVerification from "@/components/auth/twoverification/TwoStepVerification";

export default function TwoStepVerificationPage() {
  return (
    <Suspense fallback={null}>
      <TwoStepVerification />
    </Suspense>
  );
}