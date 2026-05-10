import { View } from "react-native";
import { Text } from "react-native-paper";

const RTL_RE = /[֐-׿؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;

// Splits a line into plain/bold segments based on **bold** markers
function parseBold(line, textStyle, boldStyle) {
  const segments = [];
  const re = /\*\*(.*?)\*\*/g;
  let last = 0;
  let m;
  let k = 0;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) {
      segments.push(
        <Text key={k++} style={textStyle}>
          {line.slice(last, m.index)}
        </Text>
      );
    }
    segments.push(
      <Text key={k++} style={boldStyle}>
        {m[1]}
      </Text>
    );
    last = m.index + m[0].length;
  }
  if (last < line.length) {
    segments.push(
      <Text key={k++} style={textStyle}>
        {line.slice(last)}
      </Text>
    );
  }
  return segments;
}

export default function FormattedText({ text, textStyle, boldStyle }) {
  if (!text) return null;

  const textIsRTL = RTL_RE.test(text);
  const dirStyle = textIsRTL
    ? { textAlign: "right", writingDirection: "rtl" }
    : { textAlign: "left", writingDirection: "ltr" };

  // Merge direction into base styles so every Text node is consistent
  const tStyle = [textStyle, dirStyle];
  const bStyle = [boldStyle, dirStyle];
  const listRowDir = textIsRTL ? "row-reverse" : "row";

  const lines = text.replace(/\r/g, "").split("\n");
  const nodes = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    // Empty line — small gap
    if (!line) {
      nodes.push(<View key={i} style={{ height: 5 }} />);
      i++;
      continue;
    }

    // Heading ##
    if (line.startsWith("## ")) {
      nodes.push(
        <Text key={i} style={bStyle}>
          {parseBold(line.slice(3), tStyle, bStyle)}
        </Text>
      );
      i++;
      continue;
    }

    // Bullet point (- or * or •)
    if (/^[-*•]\s/.test(line)) {
      nodes.push(
        <View key={i} style={{ flexDirection: listRowDir, gap: 6, alignItems: "flex-start", marginBottom: 2 }}>
          <Text style={[textStyle, dirStyle, { lineHeight: textStyle?.lineHeight ?? 22 }]}>{"•"}</Text>
          <Text style={[textStyle, dirStyle, { flex: 1 }]}>
            {parseBold(line.slice(2), tStyle, bStyle)}
          </Text>
        </View>
      );
      i++;
      continue;
    }

    // Numbered list
    const nm = line.match(/^(\d+)\.\s(.+)/);
    if (nm) {
      nodes.push(
        <View key={i} style={{ flexDirection: listRowDir, gap: 6, alignItems: "flex-start", marginBottom: 2 }}>
          <Text style={[boldStyle, dirStyle, { minWidth: 18 }]}>{nm[1]}.</Text>
          <Text style={[textStyle, dirStyle, { flex: 1 }]}>
            {parseBold(nm[2], tStyle, bStyle)}
          </Text>
        </View>
      );
      i++;
      continue;
    }

    // Regular paragraph
    nodes.push(
      <Text key={i} style={tStyle}>
        {parseBold(line, tStyle, bStyle)}
      </Text>
    );
    i++;
  }

  return <View style={{ gap: 3 }}>{nodes}</View>;
}
