import React from "react";
import { Text, View } from "react-native";

const parseStyledText = (text, boldColor = "#000") => {
  // Jika teks null atau undefined, kembalikan array kosong
  if (!text) return [];

  const lines = text.split("\n");
  const result = [];

  lines.forEach((line, lineIndex) => {
    const isNumbered = /^\d+\.\s/.test(line);
    const prefix = isNumbered ? (line.match(/^\d+\./)?.[0] || "") + " " : "";
    let content = isNumbered ? line.replace(/^\d+\.\s/, "") : line;

    const parts = content.split(/(\*\*|_)/g);

    let isBold = false;
    let isItalic = false;

    if (isNumbered) {
      result.push(
        <Text key={`line-${lineIndex}-prefix`} style={{ fontSize: 14, lineHeight: 22 }}>
          {prefix}
        </Text>
      );
    }

    const lineContent = [];
    parts.forEach((part, idx) => {
      if (part === "**") {
        isBold = !isBold;
      } else if (part === "_") {
        isItalic = !isItalic;
      } else if (part) {
        lineContent.push(
          <Text
            key={`part-${idx}`}
            style={{
              fontWeight: isBold ? "bold" : "normal",
              fontStyle: isItalic ? "italic" : "normal",
              color: isBold ? boldColor : undefined,
            }}>
            {part}
          </Text>
        );
      }
    });

    if (lineContent.length > 0) {
      result.push(
        <Text key={`line-content-${lineIndex}`} style={{ fontSize: 14, lineHeight: 22 }}>
          {lineContent}
        </Text>
      );
    }

    if (lineIndex < lines.length - 1) {
      result.push(<Text key={`br-${lineIndex}`}>{"\n"}</Text>);
    }
  });

  return result;
};

export default function StyledDescription({ description, style, boldColor }) {
  if (!description) return null;

  return (
    <View style={style}>
      <Text>{parseStyledText(description, boldColor)}</Text>
    </View>
  );
}
