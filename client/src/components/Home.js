import React, { Component } from "react";
import { Link } from "react-router-dom";
import { fetchAllApps, fetchLatestApps } from "../api/apps";
import "../css/home.css";
import "../css/index.css";

class Home extends Component {
  constructor() {
    super();
    this.state = {
      status: "Pending",
      apps: [],
      alertMessage: "",
      fetchLatestAppsDisabled: false
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
    return this.state.apps.map((app, index) => {
      return (
        <div key={index} className='link'>
          <Link to={`/appDetails?pkg=${app.pkg}`}>
            <div key={app.pkg} className='app-box'>
              <div className='image-wrapper'>
                <img src={app.image} alt='app icon' />
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

  hideAlert = () => {
    setTimeout(() => {
      this.setState({
        alertMessage: ""
      });
    }, 3000);
  };

  fetchLatestApps = async () => {
    this.setState({
      fetchLatestAppsDisabled: true
    });
    try {
      const data = await fetchLatestApps();
      console.log(data);
      if (data && data.status && data.status.code === 0) {
        if (data.apps.length > 0) {
          this.setState({
            status: "Resolved",
            apps: [...this.state.apps, ...data.apps],
            fetchLatestAppsDisabled: false
          });
        } else {
          this.setState({
            alertMessage: "Nothing to update !",
            fetchLatestAppsDisabled: false
          });
          this.hideAlert();
        }
      } else {
        throw new Error(data.status.message);
      }
    } catch (err) {
      console.log(err.message);
      this.setState({
        alertMessage: "Something went wrong ! Pl try again later",
        fetchLatestAppsDisabled: false
      });
      this.hideAlert();
    }
  };

  render() {
    if (this.state.status === "Pending") {
      return <div>Loading</div>;
    } else if (this.state.status === "Rejected") {
      return <div>Something went wrong ! Please try again later</div>;
    } else {
      return (
        <div className='grid-wrapper'>
          <div className='fetch-latest-btn-wrapper'>
            <button
              className='green-btn fetch-latest-btn'
              disabled={this.state.fetchLatestAppsDisabled}
              onClick={this.fetchLatestApps}
            >
              Click to fetch latest apps
            </button>
            <div className='alert-message'>{this.state.alertMessage}</div>
          </div>
          <div className='grid'>{this.renderApps()}</div>
        </div>
      );
    }
  }
}

export default Home;
