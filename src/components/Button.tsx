import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'about' | 'danger';
    page: 'main' | 'about';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    page = 'main',
    size = 'medium',
    disabled = false,
    type = 'button',
    className = ''
}) => {
    const baseClasses = 'button';
    const variantClasses = `button--${variant}`;
    const pageClasses = `button--${page}`;
    const sizeClasses = `button--${size}`;
    const disabledClasses = disabled ? 'button--disabled' : '';

    const allClasses = [baseClasses, variantClasses, pageClasses, sizeClasses, disabledClasses, className]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type={type}
            className={allClasses}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;