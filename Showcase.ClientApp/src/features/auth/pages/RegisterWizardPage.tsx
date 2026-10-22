import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AuthCardLayout } from "../components/AuthCardLayout.tsx";
import { AuthStepTransition } from "../components/AuthStepTransition.tsx";
import { AvatarUploadStep } from "../components/AvatarUploadStep.tsx";
import { BioStep } from "../components/BioStep.tsx";
import { EmailStep } from "../components/EmailStep.tsx";
import { PasswordStep } from "../components/PasswordStep.tsx";
import { PersonalInfoStep } from "../components/PersonalInfoStep.tsx";
import { RegisterMethodStep } from "../components/RegisterMethodStep.tsx";
import { SpecialtyStep } from "../components/SpecialtyStep.tsx";
import { StepIndicator, type StepItem } from "../components/StepIndicator.tsx";
import { UsernameStep } from "../components/UsernameStep.tsx";
import { useRegisterWizard } from "../hooks/useRegisterWizard.ts";

const STANDARD_STEPS: StepItem[] = [
  { number: 1, label: "Handle", sublabel: "Username" },
  { number: 2, label: "Security", sublabel: "Password" },
  { number: 3, label: "Email", sublabel: "Optional" },
  { number: 4, label: "Identity", sublabel: "Name & Title" },
  { number: 5, label: "Specialty", sublabel: "Primary Field" },
  { number: 6, label: "Bio", sublabel: "Statement" },
  { number: 7, label: "Avatar", sublabel: "Profile Photo" },
];

const OAUTH_STEPS: StepItem[] = [
  { number: 1, label: "Handle", sublabel: "Username" },
  { number: 2, label: "Email", sublabel: "Google Email" },
  { number: 3, label: "Identity", sublabel: "Name & Title" },
  { number: 4, label: "Specialty", sublabel: "Primary Field" },
  { number: 5, label: "Bio", sublabel: "Statement" },
  { number: 6, label: "Avatar", sublabel: "Profile Photo" },
];

export const RegisterWizardPage: React.FC = () => {
  const {
    isOAuthMode,
    currentStep,
    setCurrentStep,
    username,
    setUsername,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    email,
    setEmail,
    name,
    setName,
    specialty,
    setSpecialty,
    bio,
    setBio,
    avatarUrl,
    setAvatarUrl,
    setAvatarFile,
    usernameStatus,
    error,
    isLoading,
    handleNextFromUsername,
    handleNextFromPassword,
    handleNextFromEmail,
    handleSkipEmail,
    handleNextFromIdentity,
    handleNextFromSpecialty,
    handleNextFromBio,
    handleCompleteRegistration,
  } = useRegisterWizard();

  const [isMethodSelected, setIsMethodSelected] = useState<boolean>(isOAuthMode);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    if (isOAuthMode) {
      setIsMethodSelected(true);
    }
  }, [isOAuthMode]);

  useEffect(() => {
    if (currentStep > prevStepRef.current) {
      setDirection("forward");
    } else if (currentStep < prevStepRef.current) {
      setDirection("backward");
    }
    prevStepRef.current = currentStep;
  }, [currentStep]);

  const handleSelectStandard = () => {
    setDirection("forward");
    setIsMethodSelected(true);
  };

  const handleBackToMethod = () => {
    setDirection("backward");
    setIsMethodSelected(false);
  };

  const steps = isOAuthMode ? OAUTH_STEPS : STANDARD_STEPS;
  const activeStepKey = !isMethodSelected ? "method" : `step-${currentStep}`;

  return (
    <AuthCardLayout
      title={
        !isMethodSelected
          ? "Create Account"
          : isOAuthMode
          ? "Complete Setup"
          : "Create Account"
      }
      currentStep={isMethodSelected ? currentStep : undefined}
      totalSteps={isMethodSelected ? steps.length : undefined}
      footerContent={
        !isOAuthMode ? (
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              viewTransition
              className="font-gothic font-bold uppercase tracking-wider text-clay hover:underline"
            >
              Sign In
            </Link>
          </p>
        ) : undefined
      }
    >
      {isMethodSelected && (
        <div className="animate-auth-fade-down">
          <StepIndicator currentStep={currentStep} steps={steps} />
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl font-serif text-xs text-red-700 leading-snug"
        >
          {error}
        </div>
      )}

      <AuthStepTransition stepKey={activeStepKey} direction={direction}>
        {!isMethodSelected ? (
          <RegisterMethodStep
            onSelectStandard={handleSelectStandard}
            isLoading={isLoading}
          />
        ) : (
          <>
            {/* Step 1: Username Handle (Both flows) */}
            {currentStep === 1 && (
              <UsernameStep
                username={username}
                setUsername={setUsername}
                usernameStatus={usernameStatus}
                onSubmit={handleNextFromUsername}
                onBack={!isOAuthMode ? handleBackToMethod : undefined}
              />
            )}

            {/* Standard Flow Step 2: Password */}
            {!isOAuthMode && currentStep === 2 && (
              <PasswordStep
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                onBack={() => setCurrentStep(1)}
                onSubmit={handleNextFromPassword}
              />
            )}

            {/* Email Step: Step 2 in OAuth mode, Step 3 in Standard mode */}
            {((isOAuthMode && currentStep === 2) || (!isOAuthMode && currentStep === 3)) && (
              <EmailStep
                email={email}
                setEmail={setEmail}
                onBack={() => setCurrentStep(isOAuthMode ? 1 : 2)}
                onNext={handleNextFromEmail}
                onSkip={handleSkipEmail}
              />
            )}

            {/* Identity Step: Step 3 in OAuth mode, Step 4 in Standard mode */}
            {((isOAuthMode && currentStep === 3) || (!isOAuthMode && currentStep === 4)) && (
              <PersonalInfoStep
                name={name}
                setName={setName}
                onBack={() => setCurrentStep(isOAuthMode ? 2 : 3)}
                onSubmit={handleNextFromIdentity}
              />
            )}

            {/* Specialty Step: Step 4 in OAuth mode, Step 5 in Standard mode */}
            {((isOAuthMode && currentStep === 4) || (!isOAuthMode && currentStep === 5)) && (
              <SpecialtyStep
                specialty={specialty}
                onSpecialtyChange={setSpecialty}
                onBack={() => setCurrentStep(isOAuthMode ? 3 : 4)}
                onNext={handleNextFromSpecialty}
              />
            )}

            {/* Bio Step: Step 5 in OAuth mode, Step 6 in Standard mode */}
            {((isOAuthMode && currentStep === 5) || (!isOAuthMode && currentStep === 6)) && (
              <BioStep
                bio={bio}
                setBio={setBio}
                onBack={() => setCurrentStep(isOAuthMode ? 4 : 5)}
                onNext={handleNextFromBio}
              />
            )}

            {/* Avatar Step: Step 6 in OAuth mode, Step 7 in Standard mode */}
            {((isOAuthMode && currentStep === 6) || (!isOAuthMode && currentStep === 7)) && (
              <AvatarUploadStep
                name={name}
                username={username}
                avatarUrl={avatarUrl}
                onAvatarChange={setAvatarUrl}
                onFileSelect={setAvatarFile}
                onBack={() => setCurrentStep(isOAuthMode ? 5 : 6)}
                onComplete={handleCompleteRegistration}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </AuthStepTransition>
    </AuthCardLayout>
  );
};
