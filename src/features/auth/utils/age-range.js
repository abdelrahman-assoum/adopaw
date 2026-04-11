export function formatAgeRange(ageRange) {
  function convertValue(value) {
    if (value < 1) {
      // value less than 1 year → convert to months
      return {
        value: Math.round(value * 12),
        unit: "months",
      };
    } else if (value % 1 !== 0) {
      // decimal value ≥ 1 → convert to months (value * 12)
      return {
        value: Math.round(value * 12),
        unit: "months",
      };
    } else {
      // whole number → keep as years
      return {
        value: value,
        unit: "years",
      };
    }
  }

  const min = convertValue(ageRange[0]);
  const max = convertValue(ageRange[1]);

  return {
    min: {
      value: min.value,
      unit: min.unit,
    },
    max: {
      value: max.value ,
      unit: max.unit,
    },
  };
}
