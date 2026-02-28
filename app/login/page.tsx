import Image from "next/image"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
    return (
        <div className="flex min-h-svh w-full flex-col items-center justify-center gap-8 p-6 md:p-10">
            <Image
                src="/logo.png"
                alt="Alma logo"
                width={120}
                height={0}
                sizes="120px"
                className="h-auto w-[120px] object-contain"
                priority
            />
            <div className="w-full max-w-sm">
                <LoginForm />
            </div>
        </div>
    )
}
