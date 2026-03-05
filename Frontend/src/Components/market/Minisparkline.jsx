const MiniSparkline = ({ data = [], isUp = true }) => {
  if (!data || data.length < 2) return null;

  const min    = Math.min(...data);
  const max    = Math.max(...data);
  const range  = max - min || 1;
  const W      = 80;
  const H      = 32;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  }).join(" ");

  const color = isUp ? "#00e5a0" : "#ff4d6d";
  const fill  = isUp ? "rgba(0,229,160,0.08)" : "rgba(255,77,109,0.08)";

  // Close the path for fill
  const fillPath = `M0,${H} L${points.split(" ").map(p => p).join(" L")} L${W},${H} Z`;
  const linePath = `M${points.split(" ").join(" L")}`;

  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      <path d={fillPath} fill={fill} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default MiniSparkline;