import { useState, useMemo, useEffect } from "react";
import debounce from "lodash.debounce";

export const useClusteredMapData = (
  supercluster,
  dimensions,
  viewport,
  url,
) => {
  const [state, setState] = useState();
  const fireUpdate = useDebounced(fetchViewport, setState, 500);

  useEffect(() => {
    fireUpdate({
      supercluster,
      dimensions,
      viewport,
      url,
    });
  }, [
    url,
    supercluster,
    dimensions.width,
    dimensions.height,
    viewport.latitude,
    viewport.longitude,
    viewport.zoom,
  ]);

  return state;
};

const fetchViewport = ({ supercluster, dimensions, viewport, url }) =>
  supercluster.fetchViewport(url, dimensions, viewport);

const useDebounced = (fn, onComplete, delay) => {
  return useMemo(() => {
    return debounce((...args) => fn(...args).then(onComplete), delay)
  }, [])
};
