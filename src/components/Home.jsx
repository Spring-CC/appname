import React from 'react';
import '../styles/Home.css';
import AliceCarousel from 'react-alice-carousel';
import "react-alice-carousel/lib/alice-carousel.css";
import { Link, useHistory } from 'react-router-dom';
import { Swipeable } from 'react-swipeable';
import { useSelector, useDispatch } from "react-redux";
import { increment } from "../actions";
import data from '../data/restaurants.json';

export default function Home() {

    const history = useHistory();

    const index = useSelector(state => state);
    const dispatch = useDispatch();

    const linkStyle = {
        fontFamily: "verdana"
    }

    const restaurants = data.filter((restaurant, idx) => idx === index);
    const images = [];
    for (let key in restaurants[0].image_url) {
        if (restaurants[0].image_url[key] !== "") {
            images.push(restaurants[0].image_url[key]);
        }
    }

    return (
        <>
            <div className="choice-container">
                <Link className="choice-no" to="/" style={linkStyle} onClick={() => dispatch(increment())}>No</Link>
                <Link className="choice-yes" to="/details" style={linkStyle}>Yes</Link>
            </div>
            <AliceCarousel className="picture-container" autoPlay autoPlayInterval={3000} buttonsDisabled={true}>
                {images.map((image_url, index) => {
                    return <img src={image_url} className="sliderimg" alt="not loaded" key={index} />
                })}
            </AliceCarousel>
            <Swipeable onSwipedRight={() => history.push('/details')} onSwipedLeft={() => history.push('/')}>
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