#!/usr/bin/env node

const app = require("express")();
const Supercluster = require("supercluster");
const fetch = require("cross-fetch");
const LRU = require("lru-cache");
const { Mutex } = require("async-mutex");

const CACHE_TTL = Number(process.env.CACHE_TTL || 5000);
const ALLOWED_URLS = process.env.ALLOWED_URLS
  ? JSON.parse(process.env.ALLOWED_URLS).map((pattern) => new RegExp(pattern))
  : undefined;
const PORT = Number(process.env.PORT || 3001);
const LOCALHOST_REWRITE = (
  process.env.LOCALHOST_REWRITE || "host.docker.internal"
).split(";");

const indexMap = new LRU();

app.get("/cluster/*", async (req, res) => {
  try {
    const source = req.params[0];
    const { bbox, zoom } = req.query;

    if (!bbox || !zoom) {
      return res.sendStatus(400);
    }

    if (ALLOWED_URLS) {
      const ok = ALLOWED_URLS.some((x) => x.test(source));
      if (!ok) {
        return res.sendStatus(401);
      }
    }

    const cluster = getData(source);

    await cluster.load({ refetch: false });

    const data = cluster.get(JSON.parse(bbox), Math.round(Number(zoom)));

    // Stale-while-revalidate so that we keep requests from the frontend nice and snappy
    cluster.load({ refetch: true }).catch((error) => {
      console.error("Failed to refetch data:", error);
    });

    if (!data) {
      return res.sendStatus(404);
    }

    res.set("content-type", "application/json");
    res.set("access-control-allow-origin", "*");
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log("superclusterd is running on port " + PORT);
});

const getData = (source) => {
  let index = indexMap.get(source);

  if (!index) {
    index = new Index(source);
    indexMap.set(source, index);
  }

  return index;
};

class Index {
  constructor(url) {
    this.url = url;
    this.lock = new Mutex();
  }

  get(bbox, zoom) {
    if (!this.index) {
      return;
    }

    return this.index.getClusters(bbox, zoom);
  }

  async load({ refetch } = {}) {
    if (!this.needsFetch({ refetch })) {
      return;
    }

    return this.lock.runExclusive(async () => {
      if (!this.needsFetch({ refetch })) {
        return;
      }

      const { url, headers } = this.getDatasource();

      const res = await fetch(url, { headers });
      if (!res.ok) {
        return;
      }

      const index = new Supercluster();
      const { features } = await res.json();

      this.lastFetch = Date.now();
      index.load(features);

      this.index = index;
    });
  }

  needsFetch({ refetch = false }) {
    if (!this.index) {
      return true;
    }

    if (refetch && this.lastFetch + CACHE_TTL > Date.now()) {
      return true;
    }

    return false;
  }

  getDatasource() {
    if (process.env.NODE_ENV !== "production") {
      let host = this.url.split("/")[0];

      // Support running in a separate development container to the datasource (with vhosts) by rewriting the host
      // header to localhost.
      const rewrite = LOCALHOST_REWRITE.find((x) => host.startsWith(x));

      if (rewrite) {
        host = host.replace(rewrite, "localhost");
      }

      // Support local http datasources in development.
      const protocol = host.startsWith("localhost:") ? "http://" : "https://";
      return {
        url: protocol + this.url,
        headers: { host },
      };
    } else {
      return {
        url: "https://" + this.url,
        headers: {},
      };
    }
  }
}
