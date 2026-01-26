"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { helix } from "ldrs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { DepartmentDTO, Role, UserAdminDTO } from "@/types/types";
import { API_BASE } from "@/types/consts";

helix.register();

type CreateUserFormProps = {
    departments: DepartmentDTO[];
    onSuccess: (user: UserAdminDTO) => void;
};

export function CreateUserForm({ departments, onSuccess }: CreateUserFormProps) {
    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [role, setRole] = React.useState<Role>("EMPLOYEE");
    const [departmentId, setDepartmentId] = React.useState(
        departments[0]?.id ?? "",
    );
    const [active, setActive] = React.useState(true);
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName || !lastName || !departmentId) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/admin/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: sessionStorage.getItem("lm_auth") ?? "",
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    role,
                    departmentId,
                    active,
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Failed to create user");
            }

            const created: UserAdminDTO = await res.json();
            toast.success("User created");
            onSuccess(created);
            setFirstName("");
            setLastName("");
            setRole("EMPLOYEE");
            setDepartmentId(departments[0]?.id ?? "");
            setActive(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err?.message ?? "Could not create user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create User</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <div className="grid gap-3 md:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="firstName">First name</FieldLabel>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="John"
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Doe"
                                    required
                                />
                            </Field>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <Field>
                                <FieldLabel>Role</FieldLabel>
                                <Select
                                    value={role}
                                    onValueChange={(value) => setRole(value as Role)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EMPLOYEE">Employee</SelectItem>
                                        <SelectItem value="MANAGER">Manager</SelectItem>
                                        <SelectItem value="HR">HR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel>Department</FieldLabel>
                                <Select
                                    value={departmentId}
                                    onValueChange={(value) => setDepartmentId(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                        <Field>
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <FieldLabel className="mb-0">Active</FieldLabel>
                                <Switch
                                    checked={active}
                                    onCheckedChange={(checked) => setActive(checked)}
                                />
                            </div>
                        </Field>
                        <Field>
                            <Button type="submit" disabled={loading}>
                                {loading && (
                                    <l-helix
                                        size="16"
                                        speed="1.2"
                                        color="#0a0a0a"
                                    ></l-helix>
                                )}
                                {loading ? "Saving..." : "Create user"}
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}