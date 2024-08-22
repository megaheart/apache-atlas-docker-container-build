# Check if atlas-hbase-solr-build image exists, if not build it
if [[ "$(docker images -q atlas-build 2> /dev/null)" == "" ]]; then
    echo "Building atlas-build image"
    docker buildx build -t atlas-build --progress plain -f build/Dockerfile .
fi

docker buildx build -t megaheart2002/atlas-server --progress plain -f server/Dockerfile .