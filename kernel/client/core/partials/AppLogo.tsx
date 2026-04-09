import { FC } from "react";
import Image from "next/image";
import AppIcon from "@/core/images/logo.png";

type Scale = "small" | "medium" | "large";

interface ScaleAttrs {
  logoHeight: number;
  textFontSize: string;
  textMarginTop: string;
};

const scales: {[key in Scale]: ScaleAttrs} = {
  small: {
    logoHeight: 17,
    textFontSize: "1.12rem",
    textMarginTop: "0.15rem",
  },
  medium: {
    logoHeight: 22,
    textFontSize: "1.3rem",
    textMarginTop: "0.3rem",
  },
  large: {
    logoHeight: 32,
    textFontSize: "1.8rem",
    textMarginTop: "0.4rem",
  },
};

interface AppLogoProps {
  scale?: Scale;
  className?: string;
  textClassName?: string;
};

const AppLogo: FC<AppLogoProps> = ({
  scale = "small",
  className = "",
  textClassName = "text-slate-900",
}) => (
  <div className={`flex items-center justify-center gap-2 ${className}`}>
    <Image 
      height={scales[scale].logoHeight} 
      src={AppIcon} 
      alt="Application Icon" 
    />

    <span
      className={`leading-none tracking-wider font-semibold ${textClassName}`}
      style={{
        marginTop: scales[scale].textMarginTop, 
        fontSize: scales[scale].textFontSize
      }}
    >
      LEAP360
    </span>
  </div>
);

export default AppLogo;
