import React from 'react';
import Card from './Card';
import IconBox from './IconBox';

const StatCard = ({ label, value, icon: Icon, color, className = '' }) => {
    return (
        <Card variant="glass" className={`stat-card ${className}`}>
            <div className="stat-icon-wrapper">
                <IconBox color={color} size="medium">
                    <Icon size={24} />
                </IconBox>
            </div>
            <div className="stat-info">
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
            </div>
        </Card>
    );
};

export default StatCard;
