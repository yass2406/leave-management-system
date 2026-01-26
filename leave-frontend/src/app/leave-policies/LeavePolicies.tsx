import * as React from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import type { LeaveType } from "@/types/types";
import { API_BASE } from "@/types/consts";

export function LeavePolicies() {
    const [leaveTypes, setLeaveTypes] = React.useState<LeaveType[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<LeaveType | null>(null);
    const lmAuth = sessionStorage.getItem("lm_auth");
    if (!lmAuth) return;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const fetchLeaveTypes = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API_BASE}/leave-types`,
                {
                    headers: {
                        Authorization: lmAuth,
                    },
                }
            );
            if (!res.ok) {
                throw new Error("Failed to load leave types");
            }
            const data = (await res.json()) as LeaveType[];
            setLeaveTypes(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to load leave types");
        } finally {
            setLoading(false);
        }
    }, [lmAuth]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
        fetchLeaveTypes();
    }, [fetchLeaveTypes]);

    const handleSave = async (values: Partial<LeaveType>) => {
        try {
            const isEdit = !!editing?.id;
            const url = isEdit
                ? `${API_BASE}/leave-types/${editing!.id}`
                : `${API_BASE}/leave-types`;

            const res = await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: lmAuth,
                },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? "Save failed");
            }

            toast.success("Leave type saved");
            setDialogOpen(false);
            setEditing(null);
            fetchLeaveTypes();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err?.message ?? "Save failed");
        }
    };

    const toggleActive = async (lt: LeaveType) => {
        try {
            const res = await fetch(
                `${API_BASE}/leave-types/${lt.id}/toggle-active`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: lmAuth,
                    },
                }
            );
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? "Failed to update status");
            }
            toast.success("Status updated");
            fetchLeaveTypes();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to update status");
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Leave policies</CardTitle>
                <Button
                    onClick={() => {
                        setEditing(null);
                        setDialogOpen(true);
                    }}
                >
                    New leave type
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="py-4 text-sm text-muted-foreground">
                        Loading leave types...
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Max days/year</TableHead>
                                <TableHead>Paid</TableHead>
                                <TableHead>Requires approval</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaveTypes.map((lt) => (
                                <TableRow key={lt.id}>
                                    <TableCell className="font-mono text-xs">
                                        {lt.code}
                                    </TableCell>
                                    <TableCell>{lt.name}</TableCell>
                                    <TableCell className="text-right">
                                        {lt.maxDaysPerYear}
                                    </TableCell>
                                    <TableCell>{lt.isPaid ? "Yes" : "No"}</TableCell>
                                    <TableCell>
                                        {lt.requiresApproval ? "Yes" : "No"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <span
                                                className="inline-block h-4 w-4 rounded border"
                                                style={{ backgroundColor: lt.color }}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {lt.color}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={
                                                lt.active
                                                    ? "text-green-600 text-xs font-medium"
                                                    : "text-red-600 text-xs font-medium"
                                            }
                                        >
                                            {lt.active ? "Active" : "Disabled"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditing(lt);
                                                setDialogOpen(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => toggleActive(lt)}
                                        >
                                            {lt.active ? "Disable" : "Enable"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {leaveTypes.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-4 text-center text-sm text-muted-foreground">
                                        No leave types defined yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? "Edit leave type" : "New leave type"}
                        </DialogTitle>
                    </DialogHeader>
                    <LeaveTypeForm
                        initial={editing}
                        onSubmit={handleSave}
                        onCancel={() => {
                            setDialogOpen(false);
                            setEditing(null);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
}

type LeaveTypeFormProps = {
    initial: LeaveType | null;
    onSubmit: (values: Partial<LeaveType>) => void;
    onCancel: () => void;
};

function LeaveTypeForm({ initial, onSubmit, onCancel }: LeaveTypeFormProps) {
    const [code, setCode] = React.useState(initial?.code ?? "");
    const [name, setName] = React.useState(initial?.name ?? "");
    const [maxDays, setMaxDays] = React.useState<number>(
        initial?.maxDaysPerYear ?? 25
    );
    const [isPaid, setIsPaid] = React.useState<boolean>(
        initial?.isPaid ?? true
    );
    const [requiresApproval, setRequiresApproval] = React.useState<boolean>(
        initial?.requiresApproval ?? true
    );
    const [color, setColor] = React.useState(initial?.color ?? "#3498db");

    const isEdit = !!initial;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }
        if (!isEdit && !code.trim()) {
            toast.error("Code is required");
            return;
        }

        onSubmit({
            code: isEdit ? undefined : code.toUpperCase(),
            name: name.trim(),
            maxDaysPerYear: maxDays,
            isPaid,
            requiresApproval,
            color,
        });
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
                <Label htmlFor="code">Code</Label>
                <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    disabled={isEdit}
                    placeholder="ANNUAL, SICK, UNPAID..."
                    required={!isEdit}
                />
                <p className="text-xs text-muted-foreground">
                    Code must be unique and is used internally (e.g. ANNUAL, SICK).
                </p>
            </div>

            <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Annual leave"
                    required
                />
            </div>

            <div className="space-y-1">
                <Label htmlFor="maxDays">Max days per year</Label>
                <Input
                    id="maxDays"
                    type="number"
                    min={0}
                    max={365}
                    value={maxDays}
                    onChange={(e) => setMaxDays(Number(e.target.value) || 0)}
                    required
                />
            </div>

            <div className="flex items-center justify-between">
                <Label htmlFor="isPaid">Paid</Label>
                <Switch
                    id="isPaid"
                    checked={isPaid}
                    onCheckedChange={(v) => setIsPaid(v)}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label htmlFor="requiresApproval">Requires approval</Label>
                <Switch
                    id="requiresApproval"
                    checked={requiresApproval}
                    onCheckedChange={(v) => setRequiresApproval(v)}
                />
            </div>

            <div className="space-y-1">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="color"
                        type="color"
                        className="w-16 p-1"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    />
                    <Input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="flex-1"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    Save
                </Button>
            </div>
        </form>
    );
}
