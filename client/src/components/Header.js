import React from "react";
import { Link } from "react-router-dom";
import "../css/header.css";

const Header = () => {
  return (
    <div className='header'>
      <Link to='/'>
        <img
          className='logo'
          src='https://www.gstatic.com/android/market_images/web/play_prism_hlock_2x.png'
        />
      </Link>
    </div>
  );
};

export default Header;
