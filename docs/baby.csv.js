// # duckdb :memory: << EOF
// # COPY (
// #   SELECT *
// #   FROM read_csv('docs/data/Baby Journey.csv')
// # ) TO STDOUT (FORMAT 'parquet',  COMPRESSION 'gzip');
// # EOF
import {csvFormat} from "d3-dsv";

const features = collection.features.map((f) => ({
  magnitude: f.properties.mag,
  longitude: f.geometry.coordinates[0],
  latitude: f.geometry.coordinates[1]
}));

// Output CSV.
process.stdout.write(csvFormat(features));