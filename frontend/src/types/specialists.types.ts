import {type ReactNode} from "react";

export interface ISpecialistsListModalProps {
    isOpen: boolean;
    onClose: () => void;
    packageName: string;
    includedSpecializations?: string;
}

export interface ISpecialist {
    id: number;
    name: string;
    title: string;
    category: string;
    experienceYears: number;
    description: string;
    imageUrl: string;
    gender: 'male' | 'female';
    availableInPackages: string[];
    icon?: ReactNode;
}

