import { useMemo, useState } from "react";
import * as d3 from "d3";

const MARGIN_X = 150;
const MARGIN_Y = 50;
const INFLEXION_PADDING = 20;

const colors = [
  "#028dfd",
  "#9934ff",
  "#ff8f34",
  "#be2c2c",
  "#a53253",
  "#69b3a2",
];

export const DonutChart = ({ width, height, data,total }) => {
  const radius = Math.min(width - 2 * MARGIN_X, height - 2 * MARGIN_Y) / 2;
  const innerRadius = radius / 2;

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const pie = useMemo(() => {
    const pieGenerator = d3.pie().value(d => d.value).padAngle(0.05);
    return pieGenerator(data);
  }, [data]);

  const arcGenerator = d3.arc().cornerRadius(10);

  const handleMouseOver = index => setHoveredIndex(index);
  const handleMouseOut = () => setHoveredIndex(null);

  const shapes = pie.map((grp, i) => {
    const isHovered = hoveredIndex === i;

    const sliceInfo = {
      innerRadius: isHovered ? innerRadius * 1.1 : innerRadius,
      outerRadius: isHovered ? radius * 1.1 : radius,
      startAngle: grp.startAngle,
      endAngle: grp.endAngle,
      padAngle: 0.05,
    };

    const centroid = arcGenerator.centroid(sliceInfo);
    const slicePath = arcGenerator(sliceInfo);

    const inflexionInfo = {
      innerRadius: radius + INFLEXION_PADDING,
      outerRadius: radius + INFLEXION_PADDING,
      startAngle: grp.startAngle,
      endAngle: grp.endAngle,
    };
    const inflexionPoint = arcGenerator.centroid(inflexionInfo);
    const isRightLabel = inflexionPoint[0] > 0;
    const labelPosX = inflexionPoint[0] + 50 * (isRightLabel ? 1 : -1);
    const textAnchor = isRightLabel ? "start" : "end";

    const name = grp.data.name;
    const value = `(${((grp.value/total)*100).toFixed(2)})%)`;

    return (
      <g
        key={i}
        onMouseOver={() => handleMouseOver(i)}
        onMouseOut={handleMouseOut}
        style={{
          cursor: "pointer",
          transition: "transform 0.3s ease-out",
          transform: isHovered ? "scale(1.035)" : "scale(1)",
        }}
      >
        <path d={slicePath} fill={colors[i]} />
        <circle cx={centroid[0]} cy={centroid[1]} r={2} fill="white" />
        <line
          x1={centroid[0]}
          y1={centroid[1]}
          x2={inflexionPoint[0]}
          y2={inflexionPoint[1]}
          stroke="black"
          fill="black"
        />
        <line
          x1={inflexionPoint[0]}
          y1={inflexionPoint[1]}
          x2={labelPosX}
          y2={inflexionPoint[1]}
          stroke="black"
          fill="black"
        />
        <text
          x={labelPosX + (isRightLabel ? 2 : -2)}
          y={inflexionPoint[1] - 8}
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fontSize={14}
          fill="black"
        >
          {name}
        </text>
        <text
          x={labelPosX + (isRightLabel ? 2 : -2)}
          y={inflexionPoint[1] + 8}
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fontSize={12}
          fill="black"
        >
          {value}
        </text>
      </g>
    );
  });

  return (
    <svg
      width={width}
      height={height}
      style={{ display: "inline-block", marginTop: 0 }}
    >
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        {shapes}
      </g>
    </svg>
  );
};
