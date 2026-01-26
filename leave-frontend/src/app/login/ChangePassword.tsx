import * as React from "react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { User } from "@/types/types";
import { helix } from "ldrs";
import { API_BASE } from "@/types/consts";

helix.register();

type ChangePasswordProps = React.ComponentProps<"div"> & {
    user: User;
    authHeader: string;
    onPasswordChanged: () => void;
};

export default function ChangePassword({
    className,
    user,
    authHeader,
    onPasswordChanged,
    ...props
}: ChangePasswordProps) {
    const [oldPassword, setOldPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const validatePassword = (pwd: string) => {
        if (pwd.length < 8) {
            return "Password must be at least 8 characters";
        }
        if (!/[A-Z]/.test(pwd)) {
            return "Password must contain at least one uppercase letter";
        }
        if (!/[a-z]/.test(pwd)) {
            return "Password must contain at least one lowercase letter";
        }
        if (!/[0-9]/.test(pwd)) {
            return "Password must contain at least one digit";
        }
        if (!/[^A-Za-z0-9]/.test(pwd)) {
            return "Password must contain at least one special character";
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!oldPassword) {
            toast.error("Old password is required");
            return;
        }

        const validationError = validatePassword(newPassword);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New password and confirmation do not match");
            return;
        }

        if (newPassword === oldPassword) {
            toast.error("New password must be different from old password");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                }),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                const message =
                    errorBody?.message ||
                    errorBody?.error ||
                    "Failed to change password";
                throw new Error(message);
            }

            toast.success("Password changed! Logging out for security...");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

            onPasswordChanged();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("flex min-h-svh w-full items-center justify-center p-6 md:p-10", className)} {...props}>
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                            Update the password for your account ({user.employeeCode})
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="oldPassword">Old password</FieldLabel>
                                    <Input
                                        id="oldPassword"
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="confirmPassword">
                                        Confirm new password
                                    </FieldLabel>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
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
                                        {loading ? "Updating..." : "Change password"}
                                    </Button>
                                </Field>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}