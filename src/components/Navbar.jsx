import React from 'react';
import { User, Briefcase } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ activePersona, onPersonaChange, showSwitcher = true }) => {
    return (
        <nav className="global-navbar">
            <div className="navbar-logo">
                <span className="logo-text">Nablon.AI</span>
            </div>

            {showSwitcher && (
                <div className="persona-switcher">
                    <button
                        className={`persona-btn ${activePersona === 'admin' ? 'active' : ''}`}
                        onClick={() => onPersonaChange('admin')}
                    >
                        <Briefcase size={16} />
                        <span>Product Owner</span>
                    </button>
                    <div className="switcher-divider"></div>
                    <button
                        className={`persona-btn ${activePersona === 'user' ? 'active' : ''}`}
                        onClick={() => onPersonaChange('user')}
                    >
                        <User size={16} />
                        <span>End User</span>
                    </button>
                </div>
            )}

            <div className="navbar-actions">
                {/* Placeholder for additional global actions */}
            </div>
        </nav>
    );
};

export default Navbar;
