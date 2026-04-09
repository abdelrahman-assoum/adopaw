import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import OnboardingScreen from "../../src/features/onboarding/components/OnboardingScreen";

export default function GetStarted() {
  const router = useRouter();

  const goNext = async () => {
    await AsyncStorage.setItem("alreadyLaunched", "true");
    router.push("/login");
  };

  return (
    <OnboardingScreen
      currentStep={5}
      namespace="onboarding"
      onNext={goNext}
      buttonTextKey="finish"
    />
  );
}
