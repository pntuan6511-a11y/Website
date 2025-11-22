"use client";
import Checkbox from "@/components/admin/form/Checkbox";
import Input from "@/components/admin/form/InputField";
import Label from "@/components/admin/form/Label";
import Button from "@/components/admin/ui/Button";
import Link from "next/link";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// Import icons from admin icons directory
import { EyeIcon, EyeCloseIcon, ChevronLeftIcon } from "@/components/admin/icons";

export default function SignInForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                username: username,
                password: password,
                redirect: false,
            });

            if (result?.error) {
                setError("Tên đăng nhập hoặc mật khẩu không đúng");
            } else {
                router.push("/admin");
                router.refresh();
            }
        } catch (err) {
            setError("Đã xảy ra lỗi. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full">
            <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                    Quay về trang chủ
                </Link>
            </div>
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-3xl dark:text-white/90 sm:text-4xl">
                            Đăng nhập Admin
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Nhập tên đăng nhập và mật khẩu để đăng nhập!
                        </p>
                    </div>
                    <div>
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <form action="#" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-6">
                                <div>
                                    <Label>
                                        Tên đăng nhập <span className="text-red-500">*</span>{" "}
                                    </Label>
                                    <Input
                                        placeholder="admin"
                                        type="text"
                                        name="username"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <Label>
                                        Mật khẩu <span className="text-red-500">*</span>{" "}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Nhập mật khẩu"
                                            name="password"
                                            required
                                            disabled={isLoading}
                                        />
                                        <span
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                        >
                                            {showPassword ? (
                                                <EyeIcon className="fill-gray-500 dark:fill-gray-400 w-5 h-5" />
                                            ) : (
                                                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 w-5 h-5" />
                                            )}
                                        </span>
                                    </div>
                                </div>
                                {/* <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Checkbox checked={isChecked} onChange={setIsChecked} />
                                        <span className="block font-normal text-gray-700 text-sm dark:text-gray-400">
                                            Duy trì đăng nhập
                                        </span>
                                    </div>
                                </div> */}
                                <div>
                                    <Button
                                        className="w-full"
                                        size="sm"
                                        type="button"
                                        disabled={isLoading}
                                        onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                                            const form = (e.target as HTMLButtonElement).closest('form');
                                            if (form) {
                                                const formData = new FormData(form);
                                                const username = formData.get("username") as string;
                                                const password = formData.get("password") as string;

                                                if (!username || !password) {
                                                    setError("Vui lòng nhập đầy đủ thông tin");
                                                    return;
                                                }

                                                setError("");
                                                setIsLoading(true);

                                                try {
                                                    const result = await signIn("credentials", {
                                                        username: username,
                                                        password: password,
                                                        redirect: false,
                                                    });

                                                    if (result?.error) {
                                                        setError("Tên đăng nhập hoặc mật khẩu không đúng");
                                                    } else {
                                                        router.push("/admin");
                                                        router.refresh();
                                                    }
                                                } catch (err) {
                                                    setError("Đã xảy ra lỗi. Vui lòng thử lại.");
                                                } finally {
                                                    setIsLoading(false);
                                                }
                                            }
                                        }}
                                    >
                                        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
