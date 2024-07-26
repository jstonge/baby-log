duckdb :memory: << EOF
COPY (
  SELECT *
  FROM read_csv('docs/data/Baby Journey.csv')
) TO STDOUT (FORMAT CSV);
EOF