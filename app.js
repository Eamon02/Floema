/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
require("dotenv").config();

const fetch = require("node-fetch");
const path = require("path");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

const Prismic = require("@prismicio/client");
const PrismicHelper = require("@prismicio/helpers");

// Initialize the prismic.io api
const initApi = (req) => {
  return Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req,
    fetch,
  });
};

const handleLinkResolver = (doc) => {
  // Define the url depending on the document type
  //   if (doc.type === 'page') {
  //     return '/page/' + doc.uid;
  //   } else if (doc.type === 'blog_post') {
  //     return '/blog/' + doc.uid;
  //   }

  // Default to homepage
  return "/";
};

// Middleware to inject prismic context
app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: handleLinkResolver,
  };
  res.locals.PrismicHelper = PrismicHelper;

  next();
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.locals.basedir = app.get("views");

const handleRequest = async (api) => {
  const [about, meta, home, { results: collections }] = await Promise.all([
    api.getSingle("meta"),
    api.getSingle("home"),
    api.getSingle("about"),
    api.query(Prismic.Predicates.at("document.type", "collection"), {
      fetchLinks: "product.image",
    }),
  ]);

  const assets = [];

  home.data.gallery.forEach((item) => {
    assets.push(item.image.url);
  });

  about.data.gallery.forEach((item) => {
    assets.push(item.image.url);
  });

  about.data.body.forEach((section) => {
    if (section.slice_type === "gallery") {
      section.items.forEach((item) => {
        assets.push(item.image.url);
      });
    }
  });

  collections.forEach((collection) => {
    collection.data.products.forEach((item) => {
      assets.push(item.products_product.data.image.url);
    });
  });

  return {
    assets,
    meta,
    home,
    collections,
    about,
  };
};

app.get("/", (req, res) => {
  res.render("pages/home");
});

app.get("/about", (req, res) => {
  res.render("pages/about");
});

app.get("/detail/:id", (req, res) => {
  res.render("pages/detail");
});

app.get("/collections", (req, res) => {
  res.render("pages/collections");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
