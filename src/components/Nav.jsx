import React from 'react';
import { Link } from 'react-router-dom';

export default function Nav() {
    const navStyle = {
        color: "white",
        textDecoration: "none",
        fontSize: "3vh",
        fontFamily: "verdana"
    }
    const titleStyle = {
        fontSize: "4vh",
        fontFamily: "verdana"
    }
    return (
        <nav >
            <h1 style={titleStyle} >Restaurant App</h1>
            <ul className="nav-links">
                <Link style={navStyle} to="/">
                    <li>Home</li>
                </Link>
                <Link style={navStyle} to="/about">
                    <li>About</li>
                </Link>
            </ul>
        </nav>
    );
}