import React from 'react';
import './IconBox.css';

const IconBox = ({
    children,
    color = 'purple', // purple, blue, pink, green
    size = 'medium',  // small, medium, large
    className = '',
    ...props
}) => {
    const baseClass = 'ui-icon-box';
    const classes = `${baseClass} ${baseClass}-${color} ${baseClass}-${size} ${className}`;

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

export default IconBox;
