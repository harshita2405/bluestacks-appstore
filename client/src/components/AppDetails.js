import React from "react";
import { fetchApp } from "../api/apps";
import "../css/appDetails.css";
import "../css/index.css";

class AppDetails extends React.Component {
  constructor() {
    super();
    this.state = {
      status: "Pending",
      pkg: "",
      app: {},
      readMoreContent: "Read more",
      descriptionClass: "small"
    };
  }

  fetchQueryInJSON = locationSearch => {
    const obj = {};
    try {
      locationSearch
        .split("?")[1]
        .split("&")
        .forEach(val => {
          const splitVal = val.split("=");
          obj[splitVal[0]] = splitVal[1];
        });
    } catch (err) {
      console.log(err.message);
    }
    return obj;
  };

  async componentDidMount() {
    try {
      const query = this.fetchQueryInJSON(this.props.location.search);
      const data = await fetchApp(query.pkg || "");
      console.log(data);
      if (data && data.status && data.status.code === 0) {
        if (data.app) {
          this.setState({
            status: "Resolved",
            app: data.app
          });
        } else {
          throw new Error("App not found in response");
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

  renderImageSlider = () => {
    const {
      details: { images }
    } = this.state.app;
    return images.map(src => {
      return <img src={src} alt='app-detail-img' />;
    });
  };

  clickReadMore = () => {
    if (this.state.descriptionClass === "") {
      this.setState({
        descriptionClass: "small",
        readMoreContent: "Read more"
      });
    } else {
      this.setState({
        descriptionClass: "",
        readMoreContent: "Read less"
      });
    }
  };

  renderApp = () => {
    const {
      image,
      title,
      company,
      rating,
      details: { description, lastUpdated, developer, ratingsCount }
    } = this.state.app;
    return (
      <div className='details-wrapper'>
        <div className='info flex'>
          <div className='image-wrapper'>
            <img src={image} alt='app-icon' />
          </div>
          <div className='details'>
            <div className='title'>{title}</div>
            <div className='company'>{company}</div>
            <div className='rating'>Rating: {rating}</div>
          </div>
        </div>
        <button className='green-btn install-btn'>Install</button>
        <div className='image-slider'>{this.renderImageSlider()}</div>
        <div
          className={`description ${this.state.descriptionClass}`}
          dangerouslySetInnerHTML={{ __html: description }}
        />
        <div className='read-more-wrapper'>
          <button className='read-more' onClick={this.clickReadMore}>
            {this.state.readMoreContent}
          </button>
        </div>
        <hr />
        <div className='footer-wrapper'>
          <div className=''>
            <div>Last Updated</div>
            <div>{lastUpdated}</div>
          </div>
          <div className=''>
            <div>Ratings Count</div>
            <div>{ratingsCount}</div>
          </div>
          <div className=''>
            <div>Developers</div>
            <div dangerouslySetInnerHTML={{ __html: developer }} />
          </div>
        </div>
      </div>
    );
  };
  render() {
    if (this.state.status === "Pending") {
      return <div>Loading</div>;
    } else if (this.state.status === "Rejected") {
      return <div>Something went wrong ! Please try again later</div>;
    } else {
      return <div>{this.renderApp()}</div>;
    }
  }
}

export default AppDetails;
