docker run --rm --name "atlas-hbase-solr-build-container" -it \
  -v "$(pwd)/apache-atlas-2.3.0-sources/apache-atlas-sources-2.3.0:/apache-atlas-2.3.0-sources/apache-atlas-sources-2.3.0" \
  maven:3.9.9-eclipse-temurin-17 bash
