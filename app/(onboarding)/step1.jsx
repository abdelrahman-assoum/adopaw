import { useRouter } from "expo-router";

import OnboardingScreen from "../../src/features/onboarding/components/OnboardingScreen";

export default function OnboardingStep1() {
  const router = useRouter();

  const goNext = () => {
    router.push("/step2");
  };

  return (
    <OnboardingScreen currentStep={1} namespace="onboarding" onNext={goNext} />
  );
}
