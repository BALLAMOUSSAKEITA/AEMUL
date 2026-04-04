"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface Props {
  value: string;
  height?: number;
  width?: number;
}

export function BarcodeDisplay({ value, height = 40, width = 1.5 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        height,
        width,
        displayValue: true,
        fontSize: 12,
        margin: 5,
        background: "transparent",
      });
    }
  }, [value, height, width]);

  return <svg ref={svgRef} />;
}
