"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "react-hot-toast"
import type { LeaveRequest, UserTeam } from "@/types/types"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    IconCircleCheckFilled,
    IconCircleXFilled,
    IconClockHour4,
} from "@tabler/icons-react"
import { API_BASE } from "@/types/consts"

type ApprovalAction = "approve" | "reject";

export default function Team() {
    const [team, setTeam] = useState<UserTeam[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingAction, setPendingAction] = useState<{
        requestId: string;
        action: ApprovalAction;
    } | null>(null);
    const [actionComment, setActionComment] = useState("");
    const [selectedMember, setSelectedMember] = useState<UserTeam | null>(null);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const authToken = typeof window !== "undefined" ? sessionStorage.getItem("lm_auth") : null;
    const userJson = typeof window !== "undefined" ? sessionStorage.getItem("lm_user") : null;
    const currentUser = userJson ? JSON.parse(userJson) as { id: string; role: "EMPLOYEE" | "MANAGER" | "HR" } : null;
    const canViewMember = (member: UserTeam) => {
        if (!currentUser) return false;
        if (currentUser.role === "EMPLOYEE") return false;
        if (currentUser.role === "HR") return true;
        // MANAGER:
        if (member.role === "HR") return false;
        if (member.role === "MANAGER" && member.id !== currentUser.id) return false;
        return true;
    };

    const loadMemberRequests = (employeeId: string) => {
        if (!authToken) {
            toast.error("Please log in");
            return;
        }
        setRequestsLoading(true);
        fetch(`${API_BASE}/leaves?employeeId=${employeeId}`, {
            headers: { Authorization: authToken },
        })
            .then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.error || "Failed to load leave requests");
                }
                return res.json();
            })
            .then((data: LeaveRequest[]) => setRequests(data))
            .catch((err) => toast.error(err.message))
            .finally(() => setRequestsLoading(false));
    };

    const handleClickMember = (member: UserTeam) => {
        if (!canViewMember(member)) return;
        setSelectedMember(member);
        loadMemberRequests(member.id);
    };

    const handleApprove = (requestId: string, comment: string) => {
        if (!authToken) return;
        fetch(`${API_BASE}/leaves/${requestId}/approve`, {
            method: "POST",
            headers: {
                Authorization: authToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ comment: comment || null }),
        })
            .then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.error || "Failed to approve request");
                }
                toast.success("Request approved");
                setPendingAction(null);
                setActionComment("");
                if (selectedMember) loadMemberRequests(selectedMember.id);
            })
            .catch((err) => toast.error(err.message));
    };

    const handleReject = (requestId: string, comment: string) => {
        if (!authToken) return;
        fetch(`${API_BASE}/leaves/${requestId}/reject`, {
            method: "POST",
            headers: {
                Authorization: authToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ comment: comment || null }),
        })
            .then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.error || "Failed to reject request");
                }
                toast.success("Request rejected");
                setPendingAction(null);
                setActionComment("");
                if (selectedMember) loadMemberRequests(selectedMember.id);
            })
            .catch((err) => toast.error(err.message));
    };

    useEffect(() => {
        if (!authToken) {
            toast.error("Please log in");
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(false);
            return;
        }

        fetch(`${API_BASE}/users/team`, {
            headers: { Authorization: authToken },
        })
            .then(async (res) => {
                if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch team");
                return res.json();
            })
            .then((data: UserTeam[]) => {
                setTeam(data.map((u) => ({ ...u, fullName: `${u.firstName} ${u.lastName}` })));
            })
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    }, [authToken]);

    const hrMembers = team.filter((m) => m.role === "HR");
    const managers = team.filter((m) => m.role === "MANAGER");
    const employees = team.filter((m) => m.role === "EMPLOYEE");

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold">My Team</h1>

            {/* HR block (only if exists) */}
            {hrMembers.length > 0 && (
                <section>
                    <h2 className="text-xl font-semibold mb-4">HR</h2>
                    <div className="flex flex-wrap gap-4">
                        {hrMembers.map((member) => (
                            <Card
                                key={member.id}
                                className={`w-full sm:w-80 ${canViewMember(member) ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}`}
                                onClick={() => canViewMember(member) && handleClickMember(member)}
                            >
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage
                                            src={`/avatars/${member.employeeCode}.jpg`}
                                            alt={member.fullName}
                                        />
                                        <AvatarFallback className="bg-linear-to-br from-primary to-secondary text-primary-foreground text-lg font-bold">
                                            {member.firstName[0]}
                                            {member.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1">
                                        <CardTitle className="text-lg leading-none">
                                            {member.fullName}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="secondary" className="mb-2">
                                        HR
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Manager block */}
            {managers.length > 0 && (
                <section>
                    <h2 className="text-xl font-semibold mb-4">Manager</h2>
                    <div className="flex flex-wrap gap-4">
                        {managers.map((member) => (
                            <Card
                                key={member.id}
                                className={`w-full sm:w-80 ${canViewMember(member) ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}`}
                                onClick={() => canViewMember(member) && handleClickMember(member)}
                            >
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage
                                            src={`/avatars/${member.employeeCode}.jpg`}
                                            alt={member.fullName}
                                        />
                                        <AvatarFallback className="bg-linear-to-br from-primary to-secondary text-primary-foreground text-lg font-bold">
                                            {member.firstName[0]}
                                            {member.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1">
                                        <CardTitle className="text-lg leading-none">
                                            {member.fullName}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="secondary" className="mb-2">
                                        Manager
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Employees block */}
            {employees.length > 0 && (
                <section>
                    <h2 className="text-xl font-semibold mb-4">Employees</h2>
                    <div className="flex flex-wrap gap-4">
                        {employees.map((member) => (
                            <Card
                                key={member.id}
                                className={`w-full sm:w-80 ${canViewMember(member) ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}`}
                                onClick={() => canViewMember(member) && handleClickMember(member)}
                            >
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage
                                            src={`/avatars/${member.employeeCode}.jpg`}
                                            alt={member.fullName}
                                        />
                                        <AvatarFallback className="bg-linear-to-br from-primary to-secondary text-primary-foreground text-lg font-bold">
                                            {member.firstName[0]}
                                            {member.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1">
                                        <CardTitle className="text-lg leading-none">
                                            {member.fullName}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="outline" className="mb-2">
                                        Employee
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            <Dialog open={!!selectedMember}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedMember(null);
                        setActionComment("");
                    }
                }}>
                <DialogContent className="w-11/12 sm:w-4/5 sm:max-w-none">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedMember
                                ? `Leave requests for ${selectedMember.fullName} (${selectedMember.employeeCode})`
                                : "Leave requests"}
                        </DialogTitle>
                    </DialogHeader>

                    {requestsLoading ? (
                        <div className="py-6 flex justify-center">
                            <Skeleton className="h-8 w-48" />
                        </div>
                    ) : requests.length === 0 ? (
                        <p className="py-4 text-sm text-muted-foreground">No leave requests found.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Request #</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">{req.requestNumber}</TableCell>
                                        <TableCell>{req.leaveTypeName}</TableCell>
                                        <TableCell>
                                            {req.startDate} – {req.endDate}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    req.status === "Approved"
                                                        ? "secondary"
                                                        : req.status === "Rejected"
                                                            ? "destructive"
                                                            : "outline"
                                                }
                                                className="flex items-center gap-1"
                                            >
                                                {req.status === "Approved" && (
                                                    <IconCircleCheckFilled className="h-4 w-4 text-green-500 dark:text-green-400" />
                                                )}
                                                {req.status === "Rejected" && (
                                                    <IconCircleXFilled className="h-4 w-4 text-red-500 dark:text-red-400" />
                                                )}
                                                {req.status === "Pending" && (
                                                    <IconClockHour4 className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                                )}
                                                <span>{req.status}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {currentUser &&
                                                currentUser.role !== "EMPLOYEE" &&
                                                req.status === "Pending" && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setPendingAction({ requestId: req.id, action: "approve" });
                                                                setActionComment("");
                                                            }}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => {
                                                                setPendingAction({ requestId: req.id, action: "reject" });
                                                                setActionComment("");
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedMember(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog
                open={!!pendingAction}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingAction(null);
                        setActionComment("");
                    }
                }}
            >
                <DialogContent className="w-11/12 sm:w-2/3 max-w-none">
                    <DialogHeader>
                        <DialogTitle>
                            {pendingAction?.action === "approve"
                                ? "Approve leave request"
                                : "Reject leave request"}
                        </DialogTitle>
                    </DialogHeader>

                    <p className="text-sm text-muted-foreground mb-3">
                        {pendingAction?.action === "approve"
                            ? "Do you want to approve this request? You may leave an optional comment."
                            : "Do you want to reject this request? You may leave a comment explaining why."}
                    </p>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Comment (optional)</label>
                        <Textarea
                            placeholder="Write a short comment..."
                            value={actionComment}
                            onChange={(e) => setActionComment(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setPendingAction(null);
                                setActionComment("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={pendingAction?.action === "approve" ? "default" : "destructive"}
                            onClick={() => {
                                if (!pendingAction) return;
                                if (pendingAction.action === "approve") {
                                    handleApprove(pendingAction.requestId, actionComment);
                                } else {
                                    handleReject(pendingAction.requestId, actionComment);
                                }
                            }}
                        >
                            {pendingAction?.action === "approve" ? "Approve" : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
