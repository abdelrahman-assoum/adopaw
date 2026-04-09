import { ImageBackground, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslationLoader } from "../../../localization/hooks/useTranslationLoader";
import Heading from "../../../shared/components/ui/Heading/Heading";

export default function OnboardingScreen({
  namespace = "onboarding",
  currentStep,
}) {
  const insets = useSafeAreaInsets();
  const { dark } = useTheme();
  const { t } = useTranslationLoader(namespace);

  const step = currentStep === 5 ? "getStarted" : `step${currentStep}`;
  const imageMap = {
    step1: {
      light: require("../../../assets/images/step1-light.png"),
      dark: require("../../../assets/images/step1-dark.png"),
    },
    step2: {
      light: require("../../../assets/images/step2-light.png"),
      dark: require("../../../assets/images/step2-dark.png"),
    },
    step3: {
      light: require("../../../assets/images/step3-light.png"),
      dark: require("../../../assets/images/step3-dark.png"),
    },
    step4: {
      light: require("../../../assets/images/step4-light.png"),
      dark: require("../../../assets/images/step4-dark.png"),
    },
    getStarted: {
      light: require("../../../assets/images/get-started.png"),
      dark: require("../../../assets/images/get-started.png"),
    },
  };

  const image = imageMap[step]?.[dark ? "dark" : "light"];

  if (!image) {
    console.warn(`Missing image for step "${step}"`);
    return null;
  }

  return (
    <ImageBackground
      source={image}
      style={styles.imageBackground}
      resizeMode="cover"
    >
      <View
        style={[
          styles.contentContainer,
          {
            paddingBottom: insets.bottom + 32,
            paddingTop: insets.top,
            paddingHorizontal: 24,
            marginBottom: currentStep === 5 ? 60 : 100,
          },
        ]}
      >
        <Heading
          title={t(`${step}.title`)}
          description={t(`${step}.description`)}
          align="center"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    textAlign: "center",
    height: "fit-content",
    marginBottom: 88,
  },
});
