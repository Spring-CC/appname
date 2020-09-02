import React from 'react';

fetch('https://api.unsplash.com/photos/random/?count=5&client_id=52d8369eb3e2576a5f5b6423865e074e9c7045761bff1ac5664ff3e0bdb57a1d') 
  .then(response => response.json())
  .then(data => {
    data.forEach(function(image, i) {
      console.log(i)
      // document.querySelector(".carousel__slide:before-" + (i+1)).innerHTML = `
      //   <img src="${image.urls.regular}" alt="">
      // `;
    });
  });

export default function Slider() {
    return (
      <section class="carousel" aria-label="Gallery">
      <ol class="carousel__viewport">
        <li id="carousel__slide1"
            tabindex="0"
            class="carousel__slide">
          <div class="carousel__snapper">
            <a href="#carousel__slide4"
               class="carousel__prev">Go to last slide</a>
            <a href="#carousel__slide2"
               class="carousel__next">Go to next slide</a>
          </div>
        </li>
        <li id="carousel__slide2"
            tabindex="0"
            class="carousel__slide">
          <div class="carousel__snapper"></div>
          <a href="#carousel__slide1"
             class="carousel__prev">Go to previous slide</a>
          <a href="#carousel__slide3"
             class="carousel__next">Go to next slide</a>
        </li>
        <li id="carousel__slide3"
            tabindex="0"
            class="carousel__slide">
          <div class="carousel__snapper"></div>
          <a href="#carousel__slide2"
             class="carousel__prev">Go to previous slide</a>
          <a href="#carousel__slide4"
             class="carousel__next">Go to next slide</a>
        </li>
        <li id="carousel__slide4"
            tabindex="0"
            class="carousel__slide">
          <div class="carousel__snapper"></div>
          <a href="#carousel__slide3"
             class="carousel__prev">Go to previous slide</a>
          <a href="#carousel__slide1"
             class="carousel__next">Go to first slide</a>
        </li>
      </ol>
      <aside class="carousel__navigation">
        <ol class="carousel__navigation-list">
          <li class="carousel__navigation-item">
            <a href="#carousel__slide1"
               class="carousel__navigation-button">Go to slide 1</a>
          </li>
          <li class="carousel__navigation-item">
            <a href="#carousel__slide2"
               class="carousel__navigation-button">Go to slide 2</a>
          </li>
          <li class="carousel__navigation-item">
            <a href="#carousel__slide3"
               class="carousel__navigation-button">Go to slide 3</a>
          </li>
          <li class="carousel__navigation-item">
            <a href="#carousel__slide4"
               class="carousel__navigation-button">Go to slide 4</a>
          </li>
        </ol>
      </aside>
    </section>
    );
}



