import React from 'react';
import '../styles/Home.css';
import AliceCarousel from 'react-alice-carousel';
import "react-alice-carousel/lib/alice-carousel.css";
import { Link } from 'react-router-dom';
import data from '../data/restaurants.json';
import { Swipeable } from 'react-swipeable';
import { useHistory } from "react-router-dom";

export default function Home() {
    const linkStyle = {
        fontFamily: "verdana"
    }
    const restaurants = data.filter(restaurant => restaurant.id === "g398515");
    const images = [];
    for (let key in restaurants[0].image_url) {
        images.push(restaurants[0].image_url[key])
    }
    const history = useHistory();
    return (
        <>
            <div className="choice-container">
                <Link className="choice-no" to="/" style={linkStyle}>No</Link>
                <Link className="choice-yes" to="/details" style={linkStyle}>Yes</Link>
            </div>
            <AliceCarousel className="picture-container" autoPlay autoPlayInterval={3000} buttonsDisabled={true}>
                {images.map((image_url, index) => {
                    return (
                        <img src={image_url} className="sliderimg" alt="not loaded" key={index} />
                    );
                })}
            </AliceCarousel>
            <Swipeable onSwipedRight={(e) => history.push('/details')} onSwipedLeft={(e) => history.push('/')}>
                {restaurants.map(restaurant => {
                    return (
                        <div className="restaurant-info" key={restaurant.id}>
                            <div>{restaurant.name}</div>
                            <div>{restaurant.name_kana}</div>
                            <div>{restaurant.category}</div>
                            <div>{restaurant.address}</div>
                            <div>{restaurant.opentime}</div>
                        </div>
                    );
                })}
            </Swipeable>
        </>
    );
}