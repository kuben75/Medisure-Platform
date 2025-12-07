import React from "react";

type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
    variant?: "primary" | "secondary" | "outline" | "danger"
}

export default function Button({variant = "primary", className, children, ...rest}: ButtonProps) {
    const baseStyles = "py-4 px-6 text-[14px] md:text-[16px] rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:cursor-pointer";
    const variantStyles = {
        primary: "bg-[#4E61F6] text-[#E4E7FE] hover:bg-[#3B4EDC]",
        secondary: "bg-white text-[#232C6F] hover:bg-[#C1C7F9]",
        outline: "bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#4E61F6]",
        danger: "bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
    }
    return (
       <button className={`${baseStyles} ${variantStyles[variant]} ${className || " "}`}
           {...rest}
       >
           {children}
       </button>
    )
}