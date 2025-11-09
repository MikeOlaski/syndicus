import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { RoleSelection } from "@/components/auth/RoleSelection";

type UserRole = "subscriber" | "coach" | null;

const Auth = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Syndic.us
          </h1>
          <p className="text-muted-foreground">
            {!selectedRole && "Choose your path to get started"}
            {selectedRole === "subscriber" && "Access expert digital twins"}
            {selectedRole === "coach" && "Create your digital twin"}
          </p>
        </div>

        {!selectedRole ? (
          <RoleSelection onSelectRole={handleRoleSelect} />
        ) : (
          <Card className="p-6">
            <button
              onClick={handleBackToRoleSelection}
              className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
            >
              ← Back to role selection
            </button>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm role={selectedRole} />
              </TabsContent>

              <TabsContent value="signup">
                <SignupForm role={selectedRole} />
              </TabsContent>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Auth;
