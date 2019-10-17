import React, { Component } from "react";
import { Link } from "react-router-dom";
import { fetchAllApps } from "../api/apps";
import "../css/home.css";

class Home extends Component {
  constructor() {
    super();
    this.state = {
      status: "Pending",
      apps: []
    };
  }

  async componentDidMount() {
    try {
      const data = await fetchAllApps();
      console.log(data);
      if (data && data.status && data.status.code === 0) {
        console.log(data.apps.length);
        if (data.apps.length > 0) {
          this.setState({
            status: "Resolved",
            apps: data.apps
          });
        } else {
          throw new Error("Apps not found in response");
        }
      } else {
        throw new Error(data.status.message);
      }
    } catch (err) {
      console.log(err.message);
      this.setState({
        status: "Rejected"
      });
    }
  }

  renderApps = () => {
    return this.state.apps.map(app => {
      return (
        <div className='link'>
          <Link to={`/appDetails?pkg=${app.pkg}`}>
            <div key={app.pkg} className='app-box'>
              <div className='image-wrapper'>
                <img src={app.image} />
              </div>
              <p className='title'>{app.title}</p>
              <p className='company'>{app.company}</p>
              <p className='rating'>Rating: {app.rating}</p>
            </div>
          </Link>
        </div>
      );
    });
  };

  render() {
    if (this.state.status === "Pending") {
      return <div>Loading</div>;
    } else if (this.state.status === "Rejected") {
      return <div>Something went wrong ! Please try again later</div>;
    } else {
      return (
        <div className='grid-wrapper'>
          <div className='grid'>{this.renderApps()}</div>
        </div>
      );
    }
  }
}

export default Home;
