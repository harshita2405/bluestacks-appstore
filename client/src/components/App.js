import React from "react";
import { BrowserRouter, Route, Redirect } from "react-router-dom";
import Header from "./Header";
import Home from "./Home";
import AppDetails from "./AppDetails";

const App = () => {
  return (
    <div className='app'>
      <BrowserRouter>
        <Header />
        <Route path='/' exact component={Home} />
        <Route path='/appDetails' exact component={AppDetails} />
        <Redirect to='/' />
      </BrowserRouter>
    </div>
  );
};

export default App;
