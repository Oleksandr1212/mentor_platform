import React from 'react';
import './Button.css';
import { Link } from 'react-router-dom';

const Button = ({
    children,
    variant = 'primary', // primary, secondary, outline, ghost, glow
    size = 'medium',     // small, medium, large
    className = '',
    to,
    onClick,
    type = 'button',
    disabled = false,
    fullWidth = false,
    ...props
}) => {
    const baseClass = 'ui-btn';
    const classes = `${baseClass} ${baseClass}-${variant} ${baseClass}-${size} ${fullWidth ? `${baseClass}-full-width` : ''} ${className}`;

    if (to) {
        return (
            <Link to={to} className={classes} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
