import React from "react";

interface NameBubbleProps {
  initials: string;
  bgColor: string;
  hideName?: boolean;
  allNames?: string;
}

const NameBubble: React.FC<NameBubbleProps> = ({ initials, bgColor, hideName = false, allNames = "" }) => {
  const containerStyle = {
    display: "flex",
    alignItems: "center",
  };

  const bubbleStyle = {
    backgroundColor: bgColor,
    borderRadius: "50%",
    width: "23px",
    height: "23px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "12px",
  };

  const nameStyle = {
    marginLeft: "5px",
  };
  
  return (
    <div style={containerStyle} title={allNames}>
      <div style={bubbleStyle}>{initials}</div>
      {!hideName && allNames && (
        <span title={allNames} style={nameStyle}>
          {allNames}
        </span>
      )}
    </div>
  );
};

export default NameBubble; 