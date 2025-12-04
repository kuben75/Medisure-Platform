import React from "react";

export interface ISpecialistsListModalProps {
    isOpen: boolean;
    onClose: () => void;
    packageName: string;
    limit: number;
}

export interface ISpecialist {
    name: string;
    category: string;
    icon: React.ReactNode;
}