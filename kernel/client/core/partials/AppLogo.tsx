import { FC } from "react";
import Image from "next/image";
import AppIcon from "@/core/images/logo.png";

type Scale = "small" | "medium";

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
};

interface AppLogoProps { scale?: Scale; };

const AppLogo: FC<AppLogoProps> = ({ scale = "small" }) => (
  <div className="flex gap-2 items-center justify-center"> {/* Increased gap from 0.3rem to 2 (0.5rem) */}
    <Image 
      height={scales[scale].logoHeight} 
      src={AppIcon} 
      alt="Application Icon" 
    />

    <span
      className="leading-0 text-[#333]-700 tracking-wider"
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
