FROM maven:3.9.9-eclipse-temurin-8 AS build
COPY ./apache-atlas-2.3.0-sources/apache-atlas-sources-2.3.0/ /apache-atlas-2.3.0-sources/apache-atlas-sources-2.3.0
WORKDIR /apache-atlas-2.3.0-sources/apache-atlas-sources-2.3.0
ENV MAVEN_OPTS="-Xms2g -Xmx2g"
RUN mvn dependency:resolve -Dmaven.wagon.http.ssl.insecure=false
# Build atlas only
# RUN mvn clean -DskipTests install 
# Packaging atlas
# RUN mvn clean -DskipTests package -Pdist 
# Packaging atlas with embedded hbase and solr
RUN mvn clean -DskipTests package -Dmaven.wagon.http.ssl.insecure=true -Pdist,embedded-hbase-solr
# Sleep forever
CMD ["bash","-c", "while true; do sleep 1000; done"]