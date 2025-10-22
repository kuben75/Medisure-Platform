import React from "react";

type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
    variant?: "primary" | "secondary" | "outline";
}

export default function Button({variant = "primary", className, children, ...rest}: ButtonProps) {
    const baseStyles = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-center hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4E61F6]";
    const variantStyles = {
        primary: "bg-[#4E61F6] text-[#E4E7FE] hover:bg-[#3B4EDC]",
        secondary: "bg-[#E4E7FE] text-[#232C6F] hover:bg-[#C1C7F9]",
        outline: "bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#4E61F6]"
    }
    return (
       <button className={`${baseStyles} ${variantStyles[variant]} ${className || " "}`}
           {...rest}
       >
           {children}
       </button>
    )
}