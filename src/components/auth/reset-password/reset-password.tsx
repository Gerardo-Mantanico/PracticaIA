"use client";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useState } from "react";
import { useRecoverPassword } from "../../../hooks/auth/useRecoverPassword";
import { useChangePassword } from "../../../hooks/auth/useChangePassword";

const ResetPasswordEmailForm = ({ email, setEmail, onSuccess }: { email: string; setEmail: (v: string) => void; onSuccess: () => void }) => {
    const { recoverPassword, loading, error } = useRecoverPassword();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await recoverPassword(email);
        if (ok) onSuccess();
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Email<span className="text-error-500">*</span>
                </Label>
                <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="dark:bg-dark-900 font-noraml h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-left text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
            </div>
            <div>
                <button
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                    type="submit"
                    disabled={loading}
                >
                    Send Reset Link
                </button>
            </div>
            {error && <div className="text-red-500">{error}</div>}
        </form>
    );
};

const ResetPasswordChangeForm = ({ email }: { email: string }) => {
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [success, setSuccess] = useState(false);
    const { changePassword, loading: loadingChange } = useChangePassword();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const passOk = await changePassword(code, email, newPassword);
        if (passOk) {
            setSuccess(true);
            setTimeout(() => {
                window.location.href = "/signin";
            }, 2000);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Code<span className="text-error-500">*</span>
                </Label>
                <Input
                    type="text"
                    id="code"
                    name="code"
                    placeholder="Enter the code"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    required
                    className="dark:bg-dark-900 font-noraml h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-left text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
            </div>
            <div>
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    New Password<span className="text-error-500">*</span>
                </Label>
                <Input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="dark:bg-dark-900 font-noraml h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-left text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
            </div>
            <div>
                <button
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                    type="submit"
                    disabled={loadingChange}
                >
                    Change Password
                </button>
            </div>
            {success && (
                <div className="text-green-500 text-center font-semibold">Password changed successfully! Redirecting to login...</div>
            )}
        </form>
    );
};

const ResetPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
            <div className="relative py-3 sm:py-5">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                    <ChevronLeftIcon className="w-5 h-5 mr-1" />
                    Back to home
                </Link>
            </div>
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div className="mb-5 sm:mb-8">
                    <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                        Forgot Your Password?
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {step === 1
                            ? "Enter the email address linked to your account, and we’ll send you a link to reset your password."
                            : "Enter the code sent to your email and your new password."}
                    </p>
                </div>
                <div>
                    {step === 1 && (
                        <ResetPasswordEmailForm email={email} setEmail={setEmail} onSuccess={() => setStep(2)} />
                    )}
                    {step === 2 && (
                        <ResetPasswordChangeForm email={email} />
                    )}
                </div>
                <div className="mt-5">
                    <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                        Wait, I remember my password...{" "}
                        <a href="#" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                            Click here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;


