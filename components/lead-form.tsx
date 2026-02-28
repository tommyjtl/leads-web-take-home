"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    FileUser,
    Plane,
    MessageSquare,
    CheckCircle2,
    Paperclip,
} from "lucide-react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { trpc } from "@/lib/trpc/client";
import {
    leadSubmitSchema,
    type LeadSubmitInput,
    VISA_CATEGORIES,
    type VisaCategory,
} from "@/lib/types";
import { getCountryOptions } from "@/lib/countries";

// ─── Section Header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
    caption?: React.ReactNode;
}

function SectionHeader({ icon, title, caption }: SectionHeaderProps) {
    return (
        <div className="flex flex-col items-center gap-4 text-center mb-8 max-w-3xl mx-auto w-full">
            <div className="w-[80px] h-[80px] rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                {icon}
            </div>
            <h2 className="text-3xl font-bold text-stone-900 leading-tight">
                {title}
            </h2>
            {caption && <p className="text-stone-500 text-base max-w-md">{caption}</p>}
        </div>
    );
}

// ─── Confirmation Screen ──────────────────────────────────────────────────────

function Confirmation() {
    return (
        <div className="max-w-3xl mx-auto px-6 pb-24">
            <div className="flex flex-col items-center justify-center gap-6 py-24 px-6 text-center">
                <SectionHeader
                    icon={<CheckCircle2 className="w-10 h-10 text-green-500" strokeWidth={1.5} />}
                    title="Thank you"
                    caption={
                        <>
                            Your information was submitted to our team of immigration attorneys. Expect an email from{" "} <Link href="mailto:hello@tryalma.ai" className="font-medium text-stone-700 underline underline-offset-2 hover:text-stone-900">hello@tryalma.ai</Link>.
                        </>
                    }
                />
                <Button
                    variant="default"
                    className="bg-black text-white hover:bg-stone-800 px-8 py-3 rounded-full text-base font-semibold"
                    onClick={() => window.location.reload()}
                >
                    Go Back to Homepage
                </Button>
            </div>
        </div>
    );
}

// ─── Lead Form ────────────────────────────────────────────────────────────────

export function LeadForm() {
    const [submitted, setSubmitted] = useState(false);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [resumeFileError, setResumeFileError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const submitMutation = trpc.leads.submit.useMutation({
        onSuccess: () => setSubmitted(true),
    });

    const form = useForm<LeadSubmitInput>({
        resolver: zodResolver(leadSubmitSchema),
        mode: "onTouched",
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            country: "",
            linkedinUrl: "",
            visaCategories: [],
            additionalInfo: "",
        },

    });

    const handleSubmit = async (values: LeadSubmitInput) => {
        setUploadError(null);

        if (!resumeFile) {
            setResumeFileError("Resume is required");
            const el = document.getElementById("resume-upload-section");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        setResumeFileError(null);

        let resumePath: string | undefined;
        let resumeOriginalName: string | undefined;

        if (resumeFile) {
            setIsUploading(true);
            try {
                const fd = new FormData();
                fd.append("file", resumeFile);
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                if (!res.ok) {
                    const body = await res.json();
                    throw new Error(body.error ?? "Upload failed");
                }
                const data = await res.json();
                resumePath = data.path;
                resumeOriginalName = data.originalName;
            } catch (err) {
                const isNetworkError =
                    err instanceof TypeError &&
                    /failed to fetch|network ?request failed|load failed/i.test(err.message);
                setUploadError(
                    isNetworkError
                        ? "Network error — please check your connection and try again."
                        : err instanceof Error
                            ? err.message
                            : "Upload failed"
                );
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        submitMutation.mutate({
            ...values,
            resumePath: resumePath ?? undefined,
            resumeOriginalName: resumeOriginalName ?? undefined,
        });
    };

    if (submitted) return <Confirmation />;

    const isBusy = isUploading || submitMutation.isPending;

    const scrollToFirstError = () => {
        const firstError = document.querySelector(
            "[aria-invalid='true'], [data-invalid='true']"
        ) as HTMLElement | null;
        if (firstError) {
            firstError.scrollIntoView({ behavior: "smooth", block: "center" });
            firstError.focus({ preventScroll: true });
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit, scrollToFirstError)}
                className="max-w-3xl mx-auto px-6 pb-24 space-y-14"
            >
                {/* ── Section 1: Personal information ───────────────────────────── */}
                <section>
                    <SectionHeader
                        icon={<FileUser className="w-10 h-10" strokeWidth={1.5} />}
                        title="Want to understand your visa options?"
                        caption="Submit the form below and our team of experienced attorneys will eview your information and send a preliminary assessment of you case based on your goals"
                    />

                    <div className="space-y-4">
                        {/* First / Last Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Jane" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Email / Country of Citizenship */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="jane@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }: { field: ControllerRenderProps<LeadSubmitInput, "country"> }) => (
                                    <FormItem>
                                        <FormLabel>Country of Citizenship</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select your country" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-60">
                                                {getCountryOptions().map(({ value, label }) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* LinkedIn / Profile URL */}
                        <FormField
                            control={form.control}
                            name="linkedinUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>LinkedIn / Personal Website URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://linkedin.com/in/janedoe"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Resume / CV Upload */}
                        <div id="resume-upload-section" className="space-y-1.5">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Resume / CV
                            </label>
                            <label
                                htmlFor="cv-upload"
                                className="flex items-center gap-3 cursor-pointer rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm hover:bg-stone-50 transition-colors"
                            >
                                <Paperclip className="w-4 h-4 text-stone-500 shrink-0" />
                                <span className="text-stone-500 truncate">
                                    {resumeFile ? resumeFile.name : "Upload PDF (max 10 MB)"}
                                </span>
                            </label>
                            <input
                                id="cv-upload"
                                type="file"
                                accept=".pdf,application/pdf"
                                className="sr-only"
                                onChange={(e) => {
                                    setUploadError(null);
                                    setResumeFileError(null);
                                    setResumeFile(e.target.files?.[0] ?? null);
                                }}
                            />
                            {uploadError && (
                                <p className="text-sm text-red-500">{uploadError}</p>
                            )}
                            {resumeFileError && (
                                <p className="text-sm text-red-500">{resumeFileError}</p>
                            )}
                        </div>
                    </div>
                </section>

                <Separator />

                {/* ── Section 2: Visa categories ──────────────────────────────────── */}
                <section>
                    <SectionHeader
                        icon={<Plane className="w-10 h-10" strokeWidth={1.5} />}
                        title="Visa categories of interest?"
                        caption="Select all that apply."
                    />

                    <FormField
                        control={form.control}
                        name="visaCategories"
                        render={() => (
                            <FormItem>
                                <div className="flex flex-col gap-3">
                                    {VISA_CATEGORIES.map((category) => (
                                        <FormField
                                            key={category}
                                            control={form.control}
                                            name="visaCategories"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <label className="flex items-center gap-3 rounded-md border px-4 py-3 shadow-sm cursor-pointer select-none transition-colors hover:bg-stone-50">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(
                                                                    category as VisaCategory
                                                                )}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([
                                                                            ...(field.value ?? []),
                                                                            category,
                                                                        ])
                                                                        : field.onChange(
                                                                            (field.value ?? []).filter(
                                                                                (v: string) => v !== category
                                                                            )
                                                                        );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <span className="text-sm font-medium">
                                                            {category}
                                                        </span>
                                                    </label>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </section>

                <Separator />

                {/* ── Section 3: How can we help ──────────────────────────────────── */}
                <section>
                    <SectionHeader
                        icon={<MessageSquare className="w-10 h-10" strokeWidth={1.5} />}
                        title="How can we help you?"
                    />

                    <FormField
                        control={form.control}
                        name="additionalInfo"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        placeholder={`- What is your current status and when does it expire?\n- What is your past immigration history?\n- Are you looking for long-term permanent residency or short-term employment visa or both? \n- Are there any timeline considerations?`}
                                        className="resize-y min-h-[150px] max-h-[300px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </section>

                {/* ── Submit ─────────────────────────────────────────────────────── */}
                {submitMutation.isError && (
                    <p className="text-sm text-red-500 text-center">
                        {submitMutation.error.message}
                    </p>
                )}

                <div className="flex justify-center">
                    <Button
                        type="submit"
                        disabled={isBusy}
                        className="bg-black text-white hover:bg-stone-800 px-10 py-3 rounded-full text-base font-semibold"
                    >
                        {isBusy ? "Submitting…" : "Submit"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
