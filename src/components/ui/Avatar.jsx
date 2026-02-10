import React from 'react';
import './Avatar.css';

const Avatar = ({
    src,
    alt = 'User Avatar',
    size = 'medium', // small, medium, large, xlarge
    borderColor = 'default', // default, primary
    className = '',
    ...props
}) => {
    const baseClass = 'ui-avatar';
    const classes = `${baseClass} ${baseClass}-${size} border-${borderColor} ${className}`;

    return (
        <div className={classes} {...props}>
            <div
                className="ui-avatar-img"
                style={{ backgroundImage: `url(${src})` }}
                role="img"
                aria-label={alt}
            />
        </div>
    );
};

export default Avatar;
