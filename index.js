import WebMercatorViewport from "@math.gl/web-mercator";
import fetch from 'cross-fetch'

export class Superclusterd {
  constructor(serviceUrl) {
    this._serviceUrl = serviceUrl
  }

  async fetchBBox(url, bbox, zoom) {
    const bboxString = JSON.stringify(
      bbox.map((x) => round(x, 4))
    );
    const clusterQuery = `?bbox=${bboxString}&zoom=${Math.round(zoom)}`;

    const projectedUrl =
      this._serviceUrl +
      "/cluster/" +
      encodeURIComponent(url) +
      clusterQuery;

    const res = await fetch(projectedUrl)
    if (!res.ok) {
      throw Error(`Error while fetching clusters: ${res.statusText}`)
    }

    return res.json()
  }

  async fetchViewport(url, dimensions, viewport) {
    const projection = new WebMercatorViewport({
      width: dimensions.width,
      height: dimensions.height,
      latitude: viewport.latitude,
      longitude: viewport.longitude,
      zoom: viewport.zoom,
    });

    const bounds = projection.getBounds();
    const bbox = [...bounds[0], ...bounds[1]]

    return this.fetchBBox(url, bbox, projection.zoom)
  }
}

const round = (x, precision) => {
  const factor = 10 ** precision;
  return Math.round(factor * x) / factor;
};
