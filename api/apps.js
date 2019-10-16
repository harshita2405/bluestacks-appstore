import jsdom, { JSDOM } from "jsdom";
import axios from "axios";
import AppModel from "../models/AppModel";

const selectors = {
  parent: ".ImZGtf.mpg5gc",
  pkg: ".wXUyZd a",
  image: ".yNWQ8e.K3IMke.buPxGf img",
  title: ".WsMG1c.nnK0zc",
  company: ".b8cIId.ReQCgd.KoLSrc .KoLSrc",
  rating: ".vU6FJ.p63iDd .pf5lIe div"
};

const fetchPkgFromHref = href => {
  try {
    if (!href) {
      throw new Error("Href missing");
    }
    const query = href.split("?")[1];
    return query.split("=")[1];
  } catch (err) {
    console.log(err.message);
    return "";
  }
};

const fetchRating = ratingString => {
  const regex = /Rated [\d|.|\+]+ stars/g;
  try {
    // Fetch ['Rated 4.3 stars']
    // Split on the basis of space
    // Get index 1
    return ratingString.match(regex)[0].split(" ")[1];
  } catch (err) {
    console.log(err.message);
    return "";
  }
};

const createDocumentArr = parent => {
  // Fetch all the required attributes
  try {
    const pkgHref = parent.querySelector(selectors.pkg).href;
    const pkg = fetchPkgFromHref(pkgHref);
    const image = parent
      .querySelector(selectors.image)
      .getAttribute("data-src");
    const title = parent.querySelector(selectors.title).innerHTML;
    const company = parent.querySelector(selectors.company).innerHTML;
    const ratingString = parent
      .querySelector(selectors.rating)
      .getAttribute("aria-label");
    const rating = fetchRating(ratingString);
    return {
      pkg,
      image,
      title,
      company,
      rating
    };
  } catch (err) {
    console.log(
      `Something went wrong while fetyching app attributes for ${parent}`
    );
    return;
  }
};

const createAppDocumentsArr = dom => {
  const apps = [];
  dom.querySelectorAll(selectors.parent).forEach(parent => {
    try {
      const app = createDocumentArr(parent);
      if (app) {
        apps.push(app);
      }
    } catch (err) {
      console.log(err.message);
    }
  });

  return apps;
};

export const scrapeLatestDOM = async (req, res) => {
  try {
    const appStoreDOM = await axios
      .get("https://play.google.com/store/apps/collection/topselling_free")
      .then(res => {
        if (res.status === 200) {
          return res.data;
        }
        throw new Error("Failed to load url");
      })
      .then(html => {
        const dom = new JSDOM(html);
        return dom.window.document;
      });

    // Remove all the data from DB
    console.log("Removing all the data from DB");
    await AppModel.deleteMany({});

    // Create current DOM document array for apps
    const appsArr = createAppDocumentsArr(appStoreDOM);

    // Create an array of existing apps present in DB with pkg's present in appsArr
    const existingApps = await AppModel.find({
      pkg: {
        $in: appsArr.map(app => app.pkg)
      }
    });
    const existingAppsPkgs = existingApps.map(app => app.pkg);

    // Filter out apps that are already present in DB
    const filteredApps = appsArr.filter(app => {
      console.log(app.pkg + " exists ? " + existingAppsPkgs.includes(app.pkg));
      return !existingAppsPkgs.includes(app.pkg);
    });

    // Insert filtered apps
    console.log("Saving many documents to DB");
    const apps = await AppModel.insertMany(filteredApps);

    return res.json({
      status: {
        code: 0,
        message: "Success"
      },
      apps
    });
  } catch (err) {
    console.log(err.message);
    return res.json({
      status: {
        code: 1,
        message: err.message
      }
    });
  }
};

const detailsSelector = {
  images: ".SgoUSc img",
  description: ".DWPxHb div",
  ratingsCount: ".AYi5wd.TBRnV span",
  additionalInfoHeading: ".hAyfc .BgcNfc",
  additionalInfoDetails: ".hAyfc .htlgb span"
};

const scrapeAppDetails = document => {
  try {
    console.log();
    const imagesNode = document.querySelectorAll(detailsSelector.images);
    const images = [];
    imagesNode.forEach(el => {
      const src = el.getAttribute("src");
      if (src) {
        images.push(src);
      }
    });

    const description = document.querySelector(detailsSelector.description)
      .innerHTML;

    const ratingsCount = document.querySelector(detailsSelector.ratingsCount)
      .innerHTML;

    const additionalInfoHeading = document.querySelectorAll(
      detailsSelector.additionalInfoHeading
    );
    const additionalInfoDetails = document.querySelectorAll(
      detailsSelector.additionalInfoDetails
    );
    const adInfoLen = additionalInfoHeading.length;

    const lastUpdated =
      additionalInfoHeading[0] &&
      additionalInfoHeading[0].innerHTML === "Updated"
        ? additionalInfoDetails[0].innerHTML
        : "";
    const developer =
      additionalInfoHeading[adInfoLen - 1] &&
      additionalInfoHeading[adInfoLen - 1].innerHTML === "Developer"
        ? additionalInfoDetails[adInfoLen - 1].innerHTML
        : "";

    return {
      images,
      description,
      ratingsCount,
      lastUpdated,
      developer
    };
  } catch (err) {
    console.log(err.message);
    throw new Error(err.message);
  }
};

const fetchAppViaPkg = async pkg => {
  console.log("Pkg : " + pkg);
  if (!pkg) {
    throw new Error("Missing package value");
  }
  const app = await AppModel.findOne({ pkg });
  if (!app) {
    throw new Error(`App pkg *${pkg}* not found in collection`);
  }
  if (!app.detais) {
    console.log(`Missing App details for ${pkg}`);
    const document = await axios
      .get(`https://play.google.com/store/apps/details?id=${pkg}`)
      .then(res => {
        if (res.status === 200) {
          return res.data;
        }
        throw new Error("Failed to load url");
      })
      .then(html => {
        const dom = new JSDOM(html);
        return dom.window.document;
      });

    const details = scrapeAppDetails(document);
    if (!details) {
      throw new Error(`Failed to extract details for ${pkg}`);
    }

    console.log(details);

    const app = await AppModel.findOneAndUpdate(
      { pkg },
      { details },
      {
        new: true
      }
    );
    return app;
  }
  return app;
};

export const fetchApps = async (req, res) => {
  try {
    const pkg = req.query && req.query.pkg;
    if (pkg) {
      const app = await fetchAppViaPkg(pkg);
      return res.send({
        status: {
          code: 0,
          message: "Success"
        },
        app
      });
    }
    const apps = await AppModel.find({});
    if (!apps) {
      throw new Error("Apps collection is empty");
    }
    res.send({
      status: {
        code: 0,
        message: "Success"
      },
      apps
    });
  } catch (err) {
    console.log(err.message);
    res.send({
      status: {
        code: 1,
        message: err.message
      }
    });
  }
};

export const fetchApp = async (req, res) => {
  try {
    const pkg = req.params && req.params.pkg;
    if (pkg) {
      const app = await fetchAppViaPkg(pkg);
      return res.send({
        status: {
          code: 0,
          message: "Success"
        },
        app
      });
    }
    throw new Error("Missing package value");
  } catch (err) {
    console.log(err.message);
    res.send({
      status: {
        code: 1,
        message: err.message
      }
    });
  }
};
