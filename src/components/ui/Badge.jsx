import React from 'react';
import './Badge.css';

const Badge = ({
    children,
    variant = 'default', // default, outline, glass, success, warning
    hasDot = false,
    className = '',
    ...props
}) => {
    const baseClass = 'ui-badge';
    const classes = `${baseClass} ${baseClass}-${variant} ${className}`;

    return (
        <div className={classes} {...props}>
            {hasDot && <span className="ui-badge-dot"></span>}
            {children}
        </div>
    );
};

export default Badge;
