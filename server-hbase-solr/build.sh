# Check if atlas-hbase-solr-build image exists, if not build it
if [[ "$(docker images -q atlas-hbase-solr-build 2> /dev/null)" == "" ]]; then
    echo "Building atlas-hbase-solr-build image"
    docker buildx build -t atlas-hbase-solr-build --progress plain -f build-hbase-solr/Dockerfile .
fi

docker buildx build -t megaheart2002/atlas-server-hbase-solr --progress plain -f server-hbase-solr/Dockerfile .