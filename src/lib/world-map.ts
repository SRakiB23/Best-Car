import { geoEquirectangular, geoPath } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import topology from "world-atlas/countries-110m.json";

export const mapSize = { width: 440, height: 232 };

export type CountryShape = {
  isoNumericCode: string;
  name: string;
  path: string;
};

type CountryProperties = { name: string };

export function getCountryShapes(): CountryShape[] {
  const world = topology as unknown as Topology;
  const collection = feature(world, world.objects.countries) as unknown as {
    features: Feature<Geometry, CountryProperties>[];
  };

  const features = collection.features.filter(
    (item) => item.properties.name !== "Antarctica",
  );

  const projection = geoEquirectangular().fitSize([mapSize.width, mapSize.height], {
    type: "FeatureCollection",
    features,
  });

  const toPath = geoPath(projection);

  return features.map((item) => ({
    isoNumericCode: String(item.id).padStart(3, "0"),
    name: item.properties.name,
    path: toPath(item) ?? "",
  }));
}
