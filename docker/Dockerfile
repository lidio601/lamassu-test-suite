# Selenium + Chrome  + VNC access
# This base image has:
# - Selenium
# - Chrome + chromedriver
# - vnc server enable for debugging
# https://github.com/SeleniumHQ/docker-selenium
FROM selenium/standalone-chrome-debug:latest

MAINTAINER "Fabio Cigliano"

USER root

#
# Configuration
#

ENV LAMASSU_SERVER_BRANCH "dev"
ENV LAMASSU_MACHINE_BRANCH "dev"

# https://localhost:8070/?otp=lamassu
ENV LA_OTP "lamassu"
ENV LM_PAIR "lamassu"

#
# Run bash build script
#

ADD docker/build.sh /build.sh
RUN /build.sh || cat /tmp/build.log

# pre-initialized l-m data dir
ADD ./docker/lamassu-machine /usr/src/lamassu-machine/data

# pre-initialized l-s certs dir
ADD ./docker/lamassu-server /usr/lib/node_modules/lamassu-server/certs

# Copy e2e test scripts to /app
ADD . /app
WORKDIR /app

# Lamassu admin
EXPOSE 8070
EXPOSE 8071

# Lamassu server
EXPOSE 3000

# PostgreSQL
EXPOSE 5432

# Lamassu machine
EXPOSE 8080
EXPOSE 8081

# Selenium
EXPOSE 4444

# xvnc server
# password 'secret'
EXPOSE 5900

# parent image entrypoint
#/opt/bin/entry_point.sh

# add custom entrypoint
ADD docker/entrypoint.sh /entrypoint.sh
ENTRYPOINT /entrypoint.sh
