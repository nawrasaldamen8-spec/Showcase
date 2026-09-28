import React from "react";
import { Link } from "react-router-dom";
import { AuthCardLayout } from "../components/AuthCardLayout.tsx";
import { AvatarUploadStep } from "../components/AvatarUploadStep.tsx";
import { CredentialsStep } from "../components/CredentialsStep.tsx";
import { PersonalInfoStep } from "../components/PersonalInfoStep.tsx";
import { StepIndicator, type StepItem } from "../components/StepIndicator.tsx";
import { useRegisterWizard } from "../hooks/useRegisterWizard.ts";

const WIZARD_STEPS: StepItem[] = [
  { number: 1, label: "Credentials", sublabel: "Account Access" },
  { number: 2, label: "Personal", sublabel: "Name & Bio" },
  { number: 3, label: "Avatar", sublabel: "Profile Image" },
];

export const RegisterWizardPage: React.FC = () => {
  const {
    currentStep,
    setCurrentStep,
    username,
    setUsername,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    name,
    setName,
    email,
    setEmail,
    bio,
    setBio,
    avatarUrl,
    setAvatarUrl,
    usernameStatus,
    error,
    isLoading,
    handleNextFromStep1,
    handleNextFromStep2,
    handleCompleteRegistration,
  } = useRegisterWizard();

  return (
    <AuthCardLayout
      title="Create Creator Account"
      subtitle="Join the curated platform for architectural portfolios and career milestones."
      badge="Onboarding Wizard"
      footerContent={
        <p>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-gothic font-bold uppercase tracking-wider text-clay hover:underline"
          >
            Sign In
          </Link>
        </p>
      }
    >
      <StepIndicator currentStep={currentStep} steps={WIZARD_STEPS} />

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl font-serif text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Account Credentials (Username & Passwords) */}
      {currentStep === 1 && (
        <CredentialsStep
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          usernameStatus={usernameStatus}
          onSubmit={handleNextFromStep1}
        />
      )}

      {/* Step 2: Personal Information (Name, Optional Email, Bio) */}
      {currentStep === 2 && (
        <PersonalInfoStep
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          bio={bio}
          setBio={setBio}
          onBack={() => setCurrentStep(1)}
          onSubmit={handleNextFromStep2}
        />
      )}

      {/* Step 3: Avatar (Optional) */}
      {currentStep === 3 && (
        <AvatarUploadStep
          name={name}
          username={username}
          avatarUrl={avatarUrl}
          onAvatarChange={setAvatarUrl}
          onComplete={() => handleCompleteRegistration(avatarUrl)}
          onSkip={() => handleCompleteRegistration("")}
          onBack={() => setCurrentStep(2)}
          isLoading={isLoading}
        />
      )}
    </AuthCardLayout>
  );
};
