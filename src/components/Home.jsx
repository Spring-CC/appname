import React from 'react';
import '../styles/Home.css';
import AliceCarousel from 'react-alice-carousel';
import "react-alice-carousel/lib/alice-carousel.css";
import { Link } from 'react-router-dom';
import image1 from '../img/1.jpg'
import image2 from '../img/2.jpeg'
import image3 from '../img/3.jpg'
import image4 from '../img/4.jpg'

export default function Home() {
    const linkStyle = {
        fontFamily: "verdana"
    }
    return (
        <>
            <div className="choice-container">
                <Link className="choice-no" to="/" style={linkStyle}>No</Link>
                <Link className="choice-yes" to="/details" style={linkStyle}>Yes</Link>
            </div>
            <div className="picture-container">
                <AliceCarousel autoPlay autoPlayInterval="3000" buttonsDisabled={true}>
                    <img src={image1} className="sliderimg" alt="not loaded" />
                    <img src={image2} className="sliderimg" alt="not loaded" />
                    <img src={image3} className="sliderimg" alt="not loaded" />
                    <img src={image4} className="sliderimg" alt="not loaded" />
                </AliceCarousel>
            </div>
        </>
    );
}