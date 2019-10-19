import axios from "axios";
import * as _ from "lodash";

const localhostServer = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://bluestacks-appstore.herokuapp.com"
      : "http://localhost:5000"
});

export const fetchAllApps = _.memoize(async () => {
  return await localhostServer
    .get("/apps.json")
    .then(res => {
      console.log(res.data);
      return res.data;
    })
    .catch(err => err.message);
});

export const fetchApp = async pkg => {
  return await localhostServer
    .get(`/apps.json?pkg=${pkg}`)
    .then(res => res.data)
    .catch(err => err.message);
};

export const fetchLatestApps = async pkg => {
  return await localhostServer
    .post("/apps.json")
    .then(res => res.data)
    .catch(err => err.message);
};
