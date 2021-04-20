# superclusterd

An extremely simple in-memory indexing service suitable for clustering moderately large GeoJSON FeatureCollections hosted on an external url


## Usage

```bash
yarn add @commonknowledge/superclusterd
superclusterd

curl http://localhost:3001/cluster/docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson?bbox=[-39,-97,-50,-40]&zoom=15
```
