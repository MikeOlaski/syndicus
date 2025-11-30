import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { RoleSelection } from "@/components/auth/RoleSelection";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import Header from "@/components/Header";

type UserRole = "subscriber" | "coach" | null;

const Auth = () => {
  const [signupRole, setSignupRole] = useState<UserRole>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSignupRole(role);
  };

  const handleBackToRoleSelection = () => {
    setSignupRole(null);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Syndic.us
            </h1>
            <p className="text-muted-foreground">
              Access expert digital twins or create your own
            </p>
          </div>

          <Card className="p-6">
            {showForgotPassword ? (
              <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
            ) : (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <LoginForm />
                  <button
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-muted-foreground hover:text-foreground mt-4 text-center w-full"
                  >
                    Forgot password?
                  </button>
                </TabsContent>

              <TabsContent value="signup">
                {!signupRole ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Choose your account type to get started
                    </p>
                    <RoleSelection onSelectRole={handleRoleSelect} />
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={handleBackToRoleSelection}
                      className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
                    >
                      ← Back to role selection
                    </button>
                    <SignupForm role={signupRole} />
                  </div>
                )}
              </TabsContent>
              </Tabs>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default Auth;
