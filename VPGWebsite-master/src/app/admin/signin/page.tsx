import SignInForm from "@/components/admin/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Đăng nhập Admin | VFG Auto",
    description: "Trang đăng nhập quản trị VFG Auto",
};

export default function SignIn() {
    return <SignInForm />;
}
