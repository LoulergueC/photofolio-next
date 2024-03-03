import "./Button.css";
import { Hanken_Grotesk } from "next/font/google";

const fontFamily = Hanken_Grotesk({ subsets: ["latin"] });

export default function Button({ children, prefix, style, fontSize, ...props }: any) {
  return (
    <button {...props} style={{ ...style, fontSize }}>
      {!prefix ? (
        <svg width={fontSize ? `calc(${fontSize} * 14 / 30)` : 14} viewBox="0 0 20 17">
          <path d="M17.8246 7.4299H0V9.29145H17.8246L12.2047 16L13.6589 16.8982L19.4269 10.0128C20.191 9.10064 20.191 7.61838 19.4269 6.70622L13.809 0L12.3548 0.89587L17.8246 7.4299Z"></path>
        </svg>
      ) : (
        <div>{prefix}</div>
      )}
      {children}
    </button>
  );
}
