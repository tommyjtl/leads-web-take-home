import { Settings } from "lucide-react";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6 p-6 lg:p-8">
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Settings</h1>
            </div>
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Settings />
                    </EmptyMedia>
                    <EmptyTitle>No settings yet</EmptyTitle>
                    <EmptyDescription>
                        Settings and configuration options will appear here.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent />
            </Empty>
        </div>
    );
}
