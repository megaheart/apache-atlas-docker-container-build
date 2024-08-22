FROM atlas-hbase-solr-build AS build
WORKDIR /apache-atlas-2.3.0-sources/apache-atlas-sources-2.3.0/distro/target/
# Extract file apache-atlas-2.3.0-server.tar.gz to /app/
RUN mkdir /app && tar -xvf apache-atlas-2.3.0-server.tar.gz -C /app

FROM eclipse-temurin:8-jre-alpine AS server
COPY --from=build /app/apache-atlas-2.3.0/ /app/
WORKDIR /app
ENV MANAGE_LOCAL_HBASE=true
ENV MANAGE_LOCAL_SOLR=true
CMD [ "bin/atlas_start.py" ]
# forever loop in sh
# CMD ["sh", "-c", "while true; do sleep 1000; done"]