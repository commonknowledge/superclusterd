export interface Viewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface Dimensions {
  width: number
  height: number
}

export interface Cluster {
  cluster: true;
  cluster_id: number;
  point_count: number;
}

type Clusterable<T> =
  | Cluster
  | (T & {
      cluster: false;
    });

type BBox = [[number, number], [number, number]]
type BBox = [[number, number], [number, number]]

export class Superclusterd {
  constructor(serviceUrl: string)

  fetchBBox<T>(url: string, bbox: BBox, zoom: number): Promise<Clusterable<T>>
  fetchViewport<T>(url: string, dimensions: Dimensions, viewport: Viewport): Promise<Clusterable<T>>
}
