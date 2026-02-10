import React from 'react';
import Button from './Button';

const SectionHeader = ({ title, actionLabel, onAction, className = '' }) => {
    return (
        <div className={`section-header ${className}`}>
            <h3>{title}</h3>
            {actionLabel && (
                <Button variant="ghost" size="small" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default SectionHeader;
