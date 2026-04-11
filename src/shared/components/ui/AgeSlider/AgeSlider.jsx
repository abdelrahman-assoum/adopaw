import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { Text, useTheme } from "react-native-paper";
import { useTranslationLoader } from "../../../../localization/hooks/useTranslationLoader";

// Generate age options
function generateAgeOptions() {
  const options = [];
    options.push(Number((1 / 12).toFixed(3)));

  // 0 to 12 months by 2 months (≈0.166 years)
  for (let m = 2; m < 12; m += 2) {
    options.push(Number((m / 12).toFixed(3)));
  }

  // 1.5 to 15 years by 0.5 years
  for (let y = 1; y <= 15; y += 0.5) {
    options.push(Number(y.toFixed(1)));
  }

  return options;
}

const ageOptions = generateAgeOptions();

// const RangeSlider = ({ valueMin = 0, valueMax = 15, onRangeChange }) => {
//   const { colors } = useTheme();
//   const { t } = useTranslationLoader("common");

//   const [rangeIndexes, setRangeIndexes] = useState([
//     ageOptions.findIndex((v) => v >= valueMin),
//     ageOptions.findIndex((v) => v >= valueMax),
//   ]);

//   useEffect(() => {
//     setRangeIndexes([
//       ageOptions.findIndex((v) => v >= valueMin),
//       ageOptions.findIndex((v) => v >= valueMax),
//     ]);
//   }, [valueMin, valueMax]);

//   const handleValuesChange = (values) => {
//     setRangeIndexes(values);
//     onRangeChange?.(ageOptions[values[0]], ageOptions[values[1]]);
//   };

//   const formatAge = (value) => {
//     const isMonth = value < 1;
//     const count = isMonth
//       ? Math.round(value * 12)
//       : parseFloat(value.toFixed(1));
//     const key = isMonth
//       ? count === 1
//         ? "months"
//         : "months_plural"
//       : Number.isInteger(value)
//         ? count === 1
//           ? "years"
//           : "years_plural"
//         : "years_decimal";

//     return `${t(`age.${key}`, { count })}`;
//   };

//  const CustomMarker = ({ currentValue }) => {
//    const ageValue = ageOptions[currentValue];
//    return (
//      <View style={styles.markerWrapper}>
//        <View style={[styles.thumb, { backgroundColor: colors.primary }]} />
//        <Text style={styles.markerLabel}>{formatAge(ageValue)}</Text>
//      </View>
//    );
//  };

//   return (
//     <View style={styles.container}>
//       {/* <Text style={[styles.label, { color: colors.onSurface }]}>
//         {t("age.selected")}: {formatAge(ageOptions[rangeIndexes[0]])} -{" "}
//         {formatAge(ageOptions[rangeIndexes[1]])}
//       </Text> */}

//       <MultiSlider
//         values={rangeIndexes}
//         min={0}
//         max={ageOptions.length - 1}
//         step={1}
//         sliderLength={300}
//         onValuesChange={handleValuesChange}
//         selectedStyle={{ backgroundColor: colors.primary }}
//         unselectedStyle={{ backgroundColor: colors.disabled }}
//         customMarker={CustomMarker}
//         containerStyle={{ alignSelf: "center" }}
//       />
//     </View>
//   );
// };



const RangeSlider = ({ valueMin = 0, valueMax = 15, onRangeChange }) => {
  const { colors } = useTheme();
  const { t } = useTranslationLoader("common");
  
  const [rangeIndexes, setRangeIndexes] = useState([
    ageOptions.findIndex((v) => v >= valueMin),
    ageOptions.findIndex((v) => v >= valueMax),
  ]);
  
  useEffect(() => {
    setRangeIndexes([
      ageOptions.findIndex((v) => v >= valueMin),
      ageOptions.findIndex((v) => v >= valueMax),
    ]);
  }, [valueMin, valueMax]);
  
  const handleValuesChange = (values) => {
    setRangeIndexes(values);
    onRangeChange?.(ageOptions[values[0]], ageOptions[values[1]]);
  };
  
  const formatAge = (value) => {
    const isMonth = value < 1;
    const count = isMonth
    ? Math.round(value * 12)
    : parseFloat(value.toFixed(1));
    const key = isMonth
    ? count === 1
    ? "months"
    : "months_plural"
    : Number.isInteger(value)
    ? count === 1
    ? "years"
    : "years_plural"
    : "years_decimal";
    
    return `${t(`age.${key}`, { count })}`;
  };
  
  const CustomMarker = ({ currentValue }) => {
    const ageValue = ageOptions[currentValue];
    return (
      <View style={styles.markerWrapper}>
        <View style={[styles.thumb, { backgroundColor: colors.primary }]} />
        <Text style={[styles.markerLabel, {color: colors.text}]}>{formatAge(ageValue)}</Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <MultiSlider
        values={rangeIndexes}
        min={0}
        max={ageOptions.length - 1}
        step={1}
        sliderLength={300}
        onValuesChange={handleValuesChange}
        selectedStyle={{ backgroundColor: colors.primary }}
        unselectedStyle={{ backgroundColor: colors.disabled }}
        customMarker={CustomMarker}
        containerStyle={{ alignSelf: "center" }}
        />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  markerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: 60, // enough space to show label
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    zIndex: 2,
  },
  markerLabel: {
    position: "absolute",
    top: 48, // position label below the thumb
    fontSize: 12,
    textAlign: "center",
    zIndex: 1,
  },
});
export default RangeSlider;
