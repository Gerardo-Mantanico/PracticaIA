
"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    clearPendingTwoFactorEmail,
    getPendingTwoFactorEmail,
    persistAuthSession,
    storeAuthUser,
} from "@/service/auth-storage";
import authService from "@/service/auth.service";
import { getRoleName, resolveDashboardPath } from "@/utils/role";

const resolveRedirectPath = (role: string, callbackUrl: string | null) => {
    if (callbackUrl?.startsWith("/")) {
        return callbackUrl;
    }

    return resolveDashboardPath(role);
};

export default function TwoStepVerification() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setCurrentUser } = useAuth();
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const email = getPendingTwoFactorEmail();

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccess(false);
        setIsLoading(true);

        const callbackUrl = searchParams.get("callbackUrl");
        const rememberMe = searchParams.get("remember") === "1";
        const normalizedCode = code.trim();

        if (!email) {
            setError("Tu sesión de verificación expiró. Inicia sesión nuevamente.");
            setIsLoading(false);
            return;
        }

        if (!/^\d{4,8}$/.test(normalizedCode)) {
            setError("Ingresa un código válido.");
            setIsLoading(false);
            return;
        }

        try {
            const data = await authService.verifyCode(email, normalizedCode);
            const token = String(data?.token || data?.access_token || data?.jwt || "");

            if (!token) {
                setError("No se recibió token de autenticación");
                return;
            }

            persistAuthSession(token, { rememberMe });
            clearPendingTwoFactorEmail();
            if (data.user) {
                storeAuthUser(data.user, { rememberMe });
                setCurrentUser(data.user);
            }

            setSuccess(true);
            router.replace(resolveRedirectPath(getRoleName(data.user?.role ?? data.user?.roleId ?? data.user), callbackUrl));
        } catch {
            setError("Error verifying code. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full">
            {/* Back */}
            <div className="relative py-3 sm:py-5">
                <Link
                    href="/home"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                    <ChevronLeftIcon className="w-5 h-5 mr-1" />
                    Back to home
                </Link>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                {/* Header */}
                <div className="mb-5 sm:mb-8">
                    <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                        Two Step Verification
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enter the verification code we sent to your email.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={(event) => void handleSubmit(event)}>
                    <div className="space-y-6">
                        <div>
                            <Label>
                                Verification Code <span className="text-error-500">*</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-center text-error-500">{error}</p>
                        )}

                        {success && (
                            <p className="text-sm text-center text-success-500">
                                Code verified! Redirecting...
                            </p>
                        )}

                        <div>
                            <Button
                                className="w-full"
                                size="sm"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Verifying..." : "Verify Account"}
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="mt-5">
                    <p className="text-sm text-center text-gray-700 dark:text-gray-400">
                        Remember your password?{" "}
                        <Link
                            href="/signin"
                            className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}









