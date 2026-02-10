import React from 'react';
import './Card.css';

const Card = ({
    children,
    className = '',
    variant = 'default', // default, glass, hover-effect
    padding = 'medium',  // none, small, medium, large
    ...props
}) => {
    const baseClass = 'ui-card';
    const classes = `${baseClass} ${baseClass}-${variant} padding-${padding} ${className}`;

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

export default Card;
