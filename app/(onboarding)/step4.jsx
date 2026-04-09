import { useRouter } from "expo-router";
import OnboardingScreen from "../../src/features/onboarding/components/OnboardingScreen";

export default function OnboardingStep4() {
  const router = useRouter();

  const goNext = () => {
    router.push("/get-started");
  };

  const goBack = () => {
    router.back();
  };
  return (
    <OnboardingScreen
      currentStep={4}
      namespace="onboarding"
      onNext={goNext}
      onPrev={goBack}
    />
  );
}
