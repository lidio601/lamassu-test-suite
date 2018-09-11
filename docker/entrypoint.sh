#!/usr/bin/env bash

# Start database
service postgresql start

# Create l-a access token
sudo -u postgres psql --db lamassu -c "INSERT INTO one_time_passes VALUES ('${LA_OTP}', 'admin', DEFAULT);"

# Start supervisor
service supervisor start

# parent image entrypoint
su seluser -c /opt/bin/entry_point.sh
