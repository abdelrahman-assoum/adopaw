import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslationLoader } from "../../src/localization/hooks/useTranslationLoader";
import AppButton from "../../src/shared/components/ui/AppButton/AppButton";
import GetStarted from "./get-started";
import OnboardingStep1 from "./step1";
import OnboardingStep2 from "./step2";
import OnboardingStep3 from "./step3";
import OnboardingStep4 from "./step4";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OnboardingPager() {
  const pagerRef = useRef(null);
  const [page, setPage] = useState(0);
  const insets = useSafeAreaInsets();
  const { colors, dark } = useTheme();
  const { t } = useTranslationLoader("onboarding");
  const router = useRouter();

  const steps = [
    <OnboardingStep1 key={1} currentStep={1} />,
    <OnboardingStep2 key={2} currentStep={2} />,
    <OnboardingStep3 key={3} currentStep={3} />,
    <OnboardingStep4 key={4} currentStep={4} />,
    <GetStarted key={5} currentStep={5} />,
  ];

  const goToNext = async () => {
    if (page < steps.length - 1) {
      pagerRef.current?.setPage(page + 1);
    } else {
      // ✅ Replace navigation on last step
      await AsyncStorage.setItem("alreadyLaunched", "true");
      router.replace("/login");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        ref={pagerRef}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {steps.map((StepComponent, index) => (
          <View key={index} style={{ flex: 1 }}>
            {StepComponent}
          </View>
        ))}
      </PagerView>

      {/* Overlay navigation container at the bottom */}
      <View
        style={[
          styles.navigationContainer,
          {
            paddingBottom: insets.bottom + 32,
            paddingTop: 16,
            paddingHorizontal: 24,
          },
        ]}
      >
        {/* ✅ Hide dots on the last page */}
        {page < steps.length - 1 && (
          <View style={styles.dots}>
            {Array.from({ length: steps.length - 1 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === page ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        )}

        {/* Next / Get Started Button */}
        <AppButton
          onPress={goToNext}
          text={t(page === steps.length - 1 ? "finish" : "next")}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    gap: 20,
    flexDirection: "column",
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    flex: 2,
    columnGap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeDot: {
    backgroundColor: "#FF6B6B",
  },
  inactiveDot: {
    backgroundColor: "#ccc",
  },
});
