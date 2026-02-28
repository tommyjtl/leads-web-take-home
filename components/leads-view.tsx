"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type VisibilityState,
    type OnChangeFn,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, SlidersHorizontal, ExternalLink, FileText, CircleCheck, Clock, Check } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import type { LeadRecord, LeadSortField, LeadStatusFilter, LeadStatus } from "@/lib/types";
import { LEAD_STATUSES, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from "@/lib/types";
import { getCountryLabel } from "@/lib/countries";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useSubscription } from "@/hooks/use-subscription";
import { DEFAULT_SHORTCUTS, getShortcutLabel } from "@/lib/keyboard-shortcuts";
import { toastService } from "@/lib/toast";

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: LeadRecord["status"] }) {
    return (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
            {status === "REACHED_OUT" ? (
                <CircleCheck className="fill-green-500 dark:fill-green-400 text-white dark:text-black" />
            ) : (
                <Clock />
            )}
            {status === "PENDING" ? "Pending" : "Reached Out"}
        </Badge>
    );
}

// ─── Status Badge Popover ─────────────────────────────────────────────────────

function StatusBadgePopover({
    lead,
    onSuccess,
}: {
    lead: LeadRecord;
    onSuccess: () => void;
}) {
    const mutation = trpc.leads.updateStatus.useMutation({ onSuccess });
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className="cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Change status"
                    disabled={mutation.isPending}
                >
                    <StatusBadge status={lead.status} />
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 p-1">
                <p className="px-2 py-1.5 text-xs text-muted-foreground font-medium">Change status</p>
                {LEAD_STATUSES.map((s) => {
                    const isActive = lead.status === s;
                    return (
                        <button
                            key={s}
                            disabled={isActive || mutation.isPending}
                            onClick={() => {
                                mutation.mutate(
                                    { id: lead.id, status: s },
                                    { onSuccess: () => { setOpen(false); onSuccess(); toastService.leadStatusChanged(s); } },
                                );
                            }}
                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <StatusBadge status={s} />
                            {isActive && <Check className="ml-auto h-3.5 w-3.5 text-muted-foreground" />}
                        </button>
                    );
                })}
            </PopoverContent>
        </Popover>
    );
}

// ─── Row Actions ──────────────────────────────────────────────────────────────

function RowActions({
    lead,
    onSuccess,
}: {
    lead: LeadRecord;
    onSuccess: () => void;
}) {
    const mutation = trpc.leads.updateStatus.useMutation({ onSuccess });

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        disabled
                        onClick={() => {
                            /**
                             * @todo download resume
                             */
                        }}
                    >
                        Download Resume
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Sort Icon ───────────────────────────────────────────────────────────────

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
    if (sorted === "asc") return <ArrowUp className="ml-2 h-3 w-3" />;
    if (sorted === "desc") return <ArrowDown className="ml-2 h-3 w-3" />;
    return <ArrowUpDown className="ml-2 h-3 w-3 opacity-40" />;
}

// ─── Leads Table ─────────────────────────────────────────────────────────────

// Columns that can be hidden, used for the Customize Columns dropdown
const HIDEABLE_COLUMNS: { id: string; label: string }[] = [
    { id: "visaCategories", label: "Visa Categories" },
    { id: "linkedinUrl", label: "LinkedIn / URL" },
    { id: "resume", label: "Resume" },
];

function LeadsTable({
    data,
    sorting,
    onSortingChange,
    onStatusChange,
    columnVisibility,
    onColumnVisibilityChange,
}: {
    data: LeadRecord[];
    sorting: SortingState;
    onSortingChange: (s: SortingState) => void;
    onStatusChange: () => void;
    columnVisibility: VisibilityState;
    onColumnVisibilityChange: OnChangeFn<VisibilityState>;
}) {

    const columns: ColumnDef<LeadRecord>[] = [
        {
            id: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="-ml-1 h-8 px-3"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <SortIcon sorted={column.getIsSorted()} />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-medium pl-2 pr-10">
                    {row.original.firstName} {row.original.lastName}
                </div>
            ),
            enableHiding: false,
        },
        {
            id: "submitted",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="-ml-3 h-8 px-3"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Submitted
                    <SortIcon sorted={column.getIsSorted()} />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-stone-500 text-sm">
                    {format(new Date(row.original.createdAt), "MMMM d, yyyy, h:mm a")}
                </span>
            ),
            enableHiding: false,
        },
        {
            id: "status",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="-ml-3 h-8 px-3"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Status
                    <SortIcon sorted={column.getIsSorted()} />
                </Button>
            ),
            cell: ({ row }) => (
                <StatusBadgePopover lead={row.original} onSuccess={onStatusChange} />
            ),
            enableHiding: false,
        },
        {
            id: "country",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="-ml-3 h-8 px-3"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Country
                    <SortIcon sorted={column.getIsSorted()} />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-sm">{getCountryLabel(row.original.country)}</span>
            ),
            enableHiding: false,
        },
        {
            id: "visaCategories",
            accessorKey: "visaCategories",
            header: "Visa Categories",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {(Array.isArray(row.original.visaCategories)
                        ? row.original.visaCategories
                        : JSON.parse(row.original.visaCategories as unknown as string) as string[]
                    ).map((v) => (
                        <Badge key={v} variant="outline" className="text-muted-foreground px-1.5 text-xs">
                            {v}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            id: "linkedinUrl",
            accessorKey: "linkedinUrl",
            header: "LinkedIn / URL",
            cell: ({ row }) => {
                const url = row.original.linkedinUrl;
                const label = url.toLowerCase().includes("linkedin") ? "LinkedIn" : "Website";
                return (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                    >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        {label}
                    </a>
                );
            },
        },
        {
            id: "resume",
            accessorKey: "resumePath",
            header: "Resume",
            cell: ({ row }) =>
                row.original.resumePath ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="inline-flex">
                                <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" disabled>
                                    <FileText className="h-3 w-3" />
                                    Preview
                                </Button>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>Feature not implemented</TooltipContent>
                    </Tooltip>
                ) : (
                    <span className="text-stone-400 text-sm">—</span>
                ),
        },
        {
            id: "action",
            header: () => <div className="text-right" />,
            cell: ({ row }) => (
                <div className="text-right">
                    <RowActions lead={row.original} onSuccess={onStatusChange} />
                </div>
            ),
            enableHiding: false,
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnVisibilityChange: onColumnVisibilityChange,
        onSortingChange: (updater) => {
            const next =
                typeof updater === "function" ? updater(sorting) : updater;
            onSortingChange(next);
        },
        manualSorting: true,
        state: { sorting, columnVisibility },
    });

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                    {table.getHeaderGroups().map((hg) => (
                        <TableRow key={hg.id}>
                            {hg.headers.map((h) => (
                                <TableHead key={h.id}>
                                    {h.isPlaceholder
                                        ? null
                                        : flexRender(h.column.columnDef.header, h.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                    {table.getRowModel().rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-10 text-stone-400">
                                No leads found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
    page,
    totalPages,
    totalCount,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: {
    page: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (p: number) => void;
    onPageSizeChange: (size: number) => void;
}) {
    // Wire keyboard shortcuts defined in lib/keyboard-shortcuts.ts
    useKeyboardShortcuts({
        "pagination.prevPage": page > 1 ? () => onPageChange(page - 1) : undefined,
        "pagination.nextPage": page < totalPages ? () => onPageChange(page + 1) : undefined,
        "pagination.firstPage": page > 1 ? () => onPageChange(1) : undefined,
        "pagination.lastPage": page < totalPages ? () => onPageChange(totalPages) : undefined,
    });

    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex items-center justify-between">
                {/* Left: rows per page */}
                <div className="hidden items-center gap-3 lg:flex">
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
                    >
                        <SelectTrigger className="w-18 h-8" id="rows-per-page">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Label htmlFor="rows-per-page" className="text-sm font-medium whitespace-nowrap">
                        Rows per page
                    </Label>
                </div>

                {/* Right: navigation */}
                <div className="flex items-center gap-2 ml-auto">
                    {/* First page */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => onPageChange(1)}
                                disabled={page <= 1}
                            >
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="flex items-center gap-1.5">
                            <span>{DEFAULT_SHORTCUTS["pagination.firstPage"].description}</span>
                            <KbdGroup>
                                {getShortcutLabel(DEFAULT_SHORTCUTS["pagination.firstPage"])
                                    .split(" ")
                                    .map((k) => <Kbd key={k}>{k}</Kbd>)}
                            </KbdGroup>
                        </TooltipContent>
                    </Tooltip>

                    {/* Previous page */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => onPageChange(page - 1)}
                                disabled={page <= 1}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="flex items-center gap-1.5">
                            <span>{DEFAULT_SHORTCUTS["pagination.prevPage"].description}</span>
                            <KbdGroup>
                                {getShortcutLabel(DEFAULT_SHORTCUTS["pagination.prevPage"])
                                    .split(" ")
                                    .map((k) => <Kbd key={k}>{k}</Kbd>)}
                            </KbdGroup>
                        </TooltipContent>
                    </Tooltip>

                    <span className="px-2 text-sm font-medium whitespace-nowrap">
                        Page {page} of {totalPages}
                    </span>

                    {/* Next page */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => onPageChange(page + 1)}
                                disabled={page >= totalPages}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="flex items-center gap-1.5">
                            <span>{DEFAULT_SHORTCUTS["pagination.nextPage"].description}</span>
                            <KbdGroup>
                                {getShortcutLabel(DEFAULT_SHORTCUTS["pagination.nextPage"])
                                    .split(" ")
                                    .map((k) => <Kbd key={k}>{k}</Kbd>)}
                            </KbdGroup>
                        </TooltipContent>
                    </Tooltip>

                    {/* Last page */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => onPageChange(totalPages)}
                                disabled={page >= totalPages}
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="flex items-center gap-1.5">
                            <span>{DEFAULT_SHORTCUTS["pagination.lastPage"].description}</span>
                            <KbdGroup>
                                {getShortcutLabel(DEFAULT_SHORTCUTS["pagination.lastPage"])
                                    .split(" ")
                                    .map((k) => <Kbd key={k}>{k}</Kbd>)}
                            </KbdGroup>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
}

// ─── Leads View (main export) ─────────────────────────────────────────────────

// Map TanStack column id → API sortBy field
const SORT_FIELD_MAP: Record<string, LeadSortField> = {
    name: "name",
    submitted: "createdAt",
    status: "status",
    country: "country",
};

export function LeadsView() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<LeadStatusFilter>("ALL");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        visaCategories: false,
        linkedinUrl: false,
        resume: false,
    });

    // Debounce search input
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const sortEntry = sorting[0];
    const queryInput = useMemo(() => ({
        search: debouncedSearch || undefined,
        status:
            statusFilter === "ALL"
                ? undefined
                : (statusFilter as LeadStatus),
        page,
        pageSize,
        sortBy: sortEntry ? SORT_FIELD_MAP[sortEntry.id] : undefined,
        sortOrder: sortEntry ? (sortEntry.desc ? "desc" : "asc") as "asc" | "desc" : undefined,
    }), [debouncedSearch, statusFilter, page, pageSize, sortEntry]);

    const { data, isLoading, refetch } = trpc.leads.list.useQuery(queryInput);

    // ── SSE subscription for real-time delta updates ──────────────────────────
    useSubscription((event) => {
        if (event.type === "lead.created" || event.type === "lead.updated") {
            void refetch();
        }
    });

    const handleStatusChange = useCallback(() => {
        void refetch();
    }, [refetch]);

    const totalPages = data?.totalPages ?? 1;
    const totalCount = data?.total ?? 0;
    const leads = (data?.items ?? []) as LeadRecord[];

    return (
        <div className="flex flex-col gap-6 p-6 lg:p-8">
            {/* Page title */}
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Leads</h1>
            </div>

            {/* Search + filter */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select
                    value={isLoading ? "" : statusFilter}
                    disabled={isLoading}
                    onValueChange={(v) => {
                        setStatusFilter(v as LeadStatusFilter);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder={isLoading ? "Loading…" : "Filter by status"} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All statuses</SelectItem>
                        {LEAD_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                                {s === "PENDING" ? "Pending" : "Reached Out"}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input
                        placeholder="Search by name, email, or country…"
                        className="pl-9"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9">
                            <SlidersHorizontal className="h-4 w-4" />
                            <span className="hidden lg:inline">Show more columns</span>
                            <span className="lg:hidden">Columns</span>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        {HIDEABLE_COLUMNS.map(({ id, label }) => (
                            <DropdownMenuCheckboxItem
                                key={id}
                                className="capitalize"
                                checked={columnVisibility[id] !== false}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({ ...prev, [id]: !!value }))
                                }
                            >
                                {label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Data table */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-md" />
                    ))}
                </div>
            ) : (
                <>
                    <LeadsTable
                        data={leads}
                        sorting={sorting}
                        onSortingChange={(s) => { setSorting(s); setPage(1); }}
                        onStatusChange={handleStatusChange}
                        columnVisibility={columnVisibility}
                        onColumnVisibilityChange={setColumnVisibility}
                    />
                    <Pagination
                        page={page}
                        totalPages={Math.max(1, totalPages)}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                    />
                </>
            )}
        </div>
    );
}
