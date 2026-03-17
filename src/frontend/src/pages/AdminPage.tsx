import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Principal } from "@icp-sdk/core/principal";
import { useQuery } from "@tanstack/react-query";
import { Database, Loader2, Shield, UserCog } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { useActor } from "../hooks/useActor";

export default function AdminPage() {
  const { actor, isFetching } = useActor();
  const [principalId, setPrincipalId] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.user);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });

  const handleAssignRole = async () => {
    if (!actor || !principalId.trim()) {
      toast.error("Please enter a valid Principal ID");
      return;
    }
    try {
      const principal = Principal.fromText(principalId.trim());
      setIsAssigning(true);
      await actor.assignCallerUserRole(principal, selectedRole);
      toast.success(`Role "${selectedRole}" assigned successfully!`);
      setPrincipalId("");
    } catch (_err) {
      toast.error(
        "Failed to assign role. Check the Principal ID and try again.",
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const handleInitializeData = async () => {
    if (!actor) return;
    try {
      setIsInitializing(true);
      await actor.initializeData();
      toast.success(
        "App data initialized successfully! Vendors and products are now live.",
      );
    } catch (_err) {
      toast.error("Failed to initialize data. Please try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  if (isCheckingAdmin || isFetching) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="admin.loading_state"
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            Checking permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh] px-4"
        data-ocid="admin.error_state"
      >
        <Card className="max-w-sm w-full text-center border-destructive/20">
          <CardHeader>
            <Shield className="w-12 h-12 text-destructive mx-auto mb-2" />
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You don't have admin privileges to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground font-display">
            Admin Panel
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage roles & app data
          </p>
        </div>
      </div>

      {/* Section 1: Assign Role */}
      <Card data-ocid="admin.panel">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Assign User Role</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Enter a user's Principal ID to assign them a role in the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="principal-id" className="text-sm font-medium">
              User Principal ID
            </Label>
            <Input
              id="principal-id"
              data-ocid="admin.principal.input"
              placeholder="e.g. aaaaa-aa or 2vxsx-fae..."
              value={principalId}
              onChange={(e) => setPrincipalId(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role-select" className="text-sm font-medium">
              Role
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(val) => setSelectedRole(val as UserRole)}
            >
              <SelectTrigger data-ocid="admin.role.select" id="role-select">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.admin}>🛡️ Admin</SelectItem>
                <SelectItem value={UserRole.user}>👤 User</SelectItem>
                <SelectItem value={UserRole.guest}>🙋 Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <p className="font-semibold mb-1">ℹ️ How to find a Principal ID:</p>
            <p>
              The user must log in to the app first, then copy their Principal
              ID from their <strong>Profile page</strong>.
            </p>
          </div>

          <Button
            data-ocid="admin.assign_role.primary_button"
            className="w-full"
            onClick={handleAssignRole}
            disabled={isAssigning || !principalId.trim()}
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Role"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Section 2: App Management */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">App Management</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Seed vendors and products with sample data for Namma Nayakanahatti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            data-ocid="admin.initialize.primary_button"
            variant="outline"
            className="w-full border-primary/30 text-primary hover:bg-primary/5"
            onClick={handleInitializeData}
            disabled={isInitializing}
          >
            {isInitializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              "🌿 Initialize App Data"
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This will load all sample vendors and products into the app.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
