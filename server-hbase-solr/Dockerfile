FROM atlas-hbase-solr-build AS build
WORKDIR /apache-atlas-2.3.0-sources/apache-atlas-sources-2.3.0/distro/target/
# Extract file apache-atlas-2.3.0-server.tar.gz to /app/
RUN mkdir /app && tar -xvf apache-atlas-2.3.0-server.tar.gz -C /app

FROM eclipse-temurin:8-jdk-focal AS server
# install python and venv
RUN apt-get update && apt-get install -y python3 python3-venv
RUN ln -s /usr/bin/python3 /usr/bin/python
# Create virtual environment
# RUN python3 -m venv /venv
# Activate the virtual environment
# RUN /venv/bin/pip install --upgrade pip
# Copy the extracted files from the build stage
COPY --from=build /app/apache-atlas-2.3.0/ /app/
WORKDIR /app
ENV MANAGE_LOCAL_HBASE=true
ENV MANAGE_LOCAL_SOLR=true
EXPOSE 21000
EXPOSE 21050
# CMD [ "/app/bin/atlas_start.py && while true; do sleep 1000; done" ]
# forever loop in sh
CMD ["sh", "-c", "while true; do sleep 1000; done"]