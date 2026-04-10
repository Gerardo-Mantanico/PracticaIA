import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

const ChangePassword = () => {

    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
            {/* Back to home */}
            <div className="relative py-3 sm:py-5">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                    <ChevronLeftIcon className="w-5 h-5 mr-1" />
                    Back to home
                </Link>
            </div>

            {/* Contenido centrado */}
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div className="mb-5 sm:mb-8">
                    <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md"> Forgot Your Password? </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400"> Enter the email address linked to your account, and we’ll send you a link to reset your password. </p>
                </div>
                <div>
                    <form>
                        <div className="space-y-5 gap-5">
                            <div className="space-y-4">
                                <div>
                                    <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> Code<span className="text-error-500">*</span></Label>
                                    <Input type="number" id="code" name="code" placeholder="Enter your code" className="dark:bg-dark-900 font-noraml h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-left text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                                </div>
                            </div>
                            <div className="space-y-10">
                                <div>
                                    <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> Email<span className="text-error-500">*</span></Label>
                                    <Input type="email" id="email" name="email" placeholder="Enter your email" className="dark:bg-dark-900 font-noraml h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-left text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                                </div>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> New Passoword<span className="text-error-500">*</span></Label>
                                    <Input
                                        placeholder="Enter your password"
                                        name="password"
                                    />
                                </div>
                                <div>
                                    <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"> Send Reset Link </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;


