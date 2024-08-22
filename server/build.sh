# Check if atlas-hbase-solr-build image exists, if not build it
if [[ "$(docker images -q atlas-hbase-solr-build 2> /dev/null)" == "" ]]; then
    echo "Building atlas-hbase-solr-build image"
    docker buildx build -t atlas-hbase-solr-build --progress plain ../build
fi

docker buildx build -t atlas-server --progress plain .