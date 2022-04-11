import {Feature, Point} from 'geojson'

export interface Viewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface Dimensions {
  width: number
  height: number
}

export interface Cluster<Properties = any> {
  cluster: true;
  cluster_id: number;
  point_count: number;
  features: Array<Properties>
}

export type ClusteredFeature<T> =
  | Feature<Point, T & { cluster?: false }>
  | Feature<Point, Cluster>

type BBox = [[number, number], [number, number]]

export class Superclusterd {
  constructor(serviceUrl: string)

  fetchBBox<T>(url: string, bbox: BBox, zoom: number): Promise<ClusteredFeature<T>[]>
  fetchViewport<T>(url: string, dimensions: Dimensions, viewport: Viewport): Promise<ClusteredFeature<T>[]>
}
