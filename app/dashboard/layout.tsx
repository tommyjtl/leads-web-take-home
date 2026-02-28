import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 60)"
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="sidebar" />
            <SidebarInset>
                <div className="flex flex-1 flex-col">{children}</div>
            </SidebarInset>
            <Toaster position="bottom-center" />
        </SidebarProvider>
    );
}
