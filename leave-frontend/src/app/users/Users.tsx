"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { UserAdminDTO, Role, DepartmentDTO } from "@/types/types";
import { API_BASE } from "@/types/consts";
import { CreateUserForm } from "@/components/create-user-form";
import { EditUserForm } from "@/components/edit-user-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Filters = {
    search: string;
    role: Role | "ALL";
    departmentId: string | "ALL";
};

export default function Users() {
    const [users, setUsers] = React.useState<UserAdminDTO[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [filters, setFilters] = React.useState<Filters>({
        search: "",
        role: "ALL",
        departmentId: "ALL",
    });

    const [createOpen, setCreateOpen] = React.useState(false);
    const [editOpen, setEditOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<UserAdminDTO | null>(
        null,
    );

    React.useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/admin/users`, {
                    headers: {
                        Authorization: sessionStorage.getItem("lm_auth") ?? "",
                    },
                });
                if (!res.ok) {
                    throw new Error("Failed to load users");
                }
                const data: UserAdminDTO[] = await res.json();
                setUsers(data);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                toast.error(err?.message ?? "Failed to load users");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const departments: DepartmentDTO[] = React.useMemo(() => {
        const map = new Map<string, DepartmentDTO>();
        for (const u of users) {
            if (!map.has(u.departmentId)) {
                map.set(u.departmentId, {
                    id: u.departmentId,
                    name: u.departmentName,
                });
            }
        }
        return Array.from(map.values()).sort((a, b) =>
            a.name.localeCompare(b.name),
        );
    }, [users]);

    const filtered = React.useMemo(() => {
        return users.filter((u) => {
            if (filters.role !== "ALL" && u.role !== filters.role) return false;
            if (
                filters.departmentId !== "ALL" &&
                u.departmentId !== filters.departmentId
            )
                return false;
            if (filters.search) {
                const q = filters.search.toLowerCase();
                const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
                if (
                    !fullName.includes(q) &&
                    !u.employeeCode.toLowerCase().includes(q)
                ) {
                    return false;
                }
            }
            return true;
        });
    }, [users, filters]);

    return (
        <div className="flex flex-col gap-4 p-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Users</h1>
                <Button onClick={() => setCreateOpen(true)}>Add user</Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <Input
                    placeholder="Search name, code..."
                    value={filters.search}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, search: e.target.value }))
                    }
                    className="max-w-xs"
                />
                <Select
                    value={filters.role}
                    onValueChange={(value) =>
                        setFilters((f) => ({
                            ...f,
                            role: value as Filters["role"],
                        }))
                    }
                >
                    <SelectTrigger className="border rounded px-2 py-1 text-sm">
                        <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All roles</SelectItem>
                        <SelectItem value="EMPLOYEE">Employee</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={filters.departmentId}
                    onValueChange={(value) =>
                        setFilters((f) => ({
                            ...f,
                            departmentId: value as Filters["departmentId"],
                        }))
                    }
                >
                    <SelectTrigger className="border rounded px-2 py-1 text-sm">
                        <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All departments</SelectItem>
                        {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                                {d.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Departments & users */}
            {loading ? (
                <p className="text-sm text-muted-foreground">Loading users...</p>
            ) : (
                <Accordion type="multiple" className="space-y-2">
                    {departments.map((dept) => {
                        const deptUsers = filtered.filter((u) => u.departmentId === dept.id);
                        if (deptUsers.length === 0) return null;

                        return (
                            <AccordionItem key={dept.id} value={dept.id}>
                                <AccordionTrigger>
                                    <div className="flex w-full items-center justify-between">
                                        <span>{dept.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {deptUsers.length} users
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <ul className="divide-y rounded-md border">
                                        {deptUsers.map((u) => (
                                            <li
                                                key={u.id}
                                                className="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-muted"
                                                onClick={() => {
                                                    setSelectedUser(u);
                                                    setEditOpen(true);
                                                }}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {u.firstName} {u.lastName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {u.employeeCode}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{u.role}</Badge>
                                                    {!u.active && (
                                                        <Badge variant="destructive">Inactive</Badge>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            )}

            {/* Create dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create user</DialogTitle>
                    </DialogHeader>
                    <CreateUserForm
                        departments={departments}
                        onSuccess={(created) => {
                            setUsers((prev) => [...prev, created]);
                            setCreateOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit user</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <EditUserForm
                            user={selectedUser}
                            departments={departments}
                            onSuccess={(updated) => {
                                setUsers((prev) =>
                                    prev.map((u) => (u.id === updated.id ? updated : u)),
                                );
                                setEditOpen(false);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}