#!/usr/bin/env bash
set -e

export LOG_FILE=/tmp/build.log

decho () {
  echo `date +"%H:%M:%S"` $1
  echo `date +"%H:%M:%S"` $1 >> $LOG_FILE
}

#
#
#

decho "install all the required deps"
apt-get -qqy update &>>$LOG_FILE
apt-get -qqy --no-install-recommends install \
    git \
    net-tools \
    build-essential cmake libgtk2.0-dev pkg-config libavcodec-dev \
    libavformat-dev libswscale-dev libpcsclite-dev libasound2-dev &>>$LOG_FILE

decho "install postgresql"
# otherwise l-s install script has some issues
# in initializing the schema
set +e
apt-get -qqy --no-install-recommends install \
    postgresql postgresql-contrib postgresql-server-dev-9.5 libpq-dev &>>$LOG_FILE
set -e

decho "allow postgres connection from the outside"
echo "host all all 0.0.0.0/0 trust" >> /etc/postgresql/9.5/main/pg_hba.conf
echo "listen_addresses = '*'" >> /etc/postgresql/9.5/main/postgresql.conf

service postgresql start

decho "prepare lamassu server"
curl -sS https://raw.githubusercontent.com/lamassu/lamassu-install/${LAMASSU_SERVER_BRANCH}/install \
    | grep -v "swapon" \
    | grep -v "\$BACKUP_CMD >> \$LOG_FILE" \
    | grep -v "ufw" \
    | grep -v "crontab" \
    | grep -v "swapoff" \
    | bash

# hack into config and supervisor tasks
perl -i -pe 's/(command=.*)(lamassu-server)/$1lamassu-server --mockSms/g' /etc/supervisor/conf.d/lamassu-server.conf
perl -i -pe 's/(command=.*)(lamassu-admin-server)/$1lamassu-admin-server --dev/g' /etc/supervisor/conf.d/lamassu-admin-server.conf
perl -i -pe 's/\"hostname\": \".*\",/\"hostname\": \"localhost\",/g' /etc/lamassu/lamassu.json

decho "prepare lamassu machine"
cd /usr/src
git clone \
    --single-branch \
    --branch ${LAMASSU_MACHINE_BRANCH} \
    "https://github.com/lamassu/lamassu-machine.git" lamassu-machine &>>$LOG_FILE
cd lamassu-machine/
npm install &>>$LOG_FILE
bash ./setup.sh &>>$LOG_FILE
npm run build &>>$LOG_FILE
decho "prepare l-m UI HTTP server"
chown -Rf seluser: ui/ &>>$LOG_FILE
npm install -g http-server &>>$LOG_FILE
ln -s /usr/src/lamassu-machine/node_modules \
    /usr/src/lamassu-machine/ui/node_modules &>>$LOG_FILE
decho "setup supervisor/lamassu-machine"
echo -e "\
[program:lamassu-machine]\n\
command=/usr/src/lamassu-machine/bin/lamassu-machine \
    --mockBillValidator \
    --mockBillDispenser \
    --mockCam \
    --mockPair \"${LM_PAIR}\"\
    --host 0.0.0.0 \
\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/supervisor/lamassu-machine.err.log\n\
stdout_logfile=/var/log/supervisor/lamassu-machine.out.log\n\
environment=HOME=\"/root\"\n\
\n\
[program:lamassu-machine-ui]\n\
command=/usr/bin/http-server -p 8081 /usr/src/lamassu-machine/ui \
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/supervisor/lamassu-machine-ui.err.log\n\
stdout_logfile=/var/log/supervisor/lamassu-machine-ui.out.log\n\
environment=HOME=\"/root\"\n\
\n" > /etc/supervisor/conf.d/lamassu-machine.conf

decho "create a basic user_config"
sudo -u postgres psql --db lamassu -c "INSERT INTO user_config \
    VALUES (2, 'config', \
    '{\
        \"config\":[\
            {\"fieldLocator\":{\"fieldScope\":{\"crypto\":\"BTC\",\"machine\":\"global\"},\"code\":\"ticker\",\"fieldType\":\"account\",\"fieldClass\":\"ticker\"},\"fieldValue\":{\"fieldType\":\"account\",\"value\":\"mock-ticker\"}},\
            {\"fieldLocator\":{\"fieldScope\":{\"crypto\":\"BTC\",\"machine\":\"global\"},\"code\":\"wallet\",\"fieldType\":\"account\",\"fieldClass\":\"wallet\"},\"fieldValue\":{\"fieldType\":\"account\",\"value\":\"mock-wallet\"}},\
            {\"fieldLocator\":{\"fieldScope\":{\"crypto\":\"BTC\",\"machine\":\"global\"},\"code\":\"exchange\",\"fieldType\":\"account\",\"fieldClass\":\"exchange\"},\"fieldValue\":{\"fieldType\":\"account\",\"value\":\"mock-exchange\"}},\
            {\"fieldLocator\":{\"fieldScope\":{\"crypto\":\"BTC\",\"machine\":\"global\"},\"code\":\"zeroConf\",\"fieldType\":\"account\",\"fieldClass\":\"zeroConf\"},\"fieldValue\":{\"fieldType\":\"account\",\"value\":\"mock-zero-conf\"}},\
            {\"fieldLocator\":{\"fieldScope\":{\"crypto\":\"global\",\"machine\":\"global\"},\"code\":\"cashInCommission\",\"fieldType\":\"percentage\",\"fieldClass\":null},\"fieldValue\":{\"fieldType\":\"percentage\",\"value\":1}},\
            {\"fieldLocator\":{\"fieldScope\":{\"crypto\":\"global\",\"machine\":\"lamassu\"},\"code\":\"machineName\",\"fieldType\":\"string\",\"fieldClass\":null},\"fieldValue\":{\"fieldType\":\"string\",\"value\":\"test\"}},\
            {\"fieldLocator\":{\"fieldScope\":{\"crypto\":\"global\",\"machine\":\"lamassu\"},\"code\":\"machineLocation\",\"fieldType\":\"string\",\"fieldClass\":null},\"fieldValue\":{\"fieldType\":\"string\",\"value\":\"test\"}},\
            {\"fieldLocator\":{\"fieldScope\":{\"crypto\":\"global\",\"machine\":\"global\"},\"code\":\"fiatCurrency\",\"fieldType\":\"fiatCurrency\",\"fieldClass\":null},\"fieldValue\":{\"fieldType\":\"fiatCurrency\",\"value\":\"EUR\"}},\
            {\"fieldLocator\":{\"fieldScope\":{\"crypto\":\"global\",\"machine\":\"global\"},\"code\":\"country\",\"fieldType\":\"country\",\"fieldClass\":null},\"fieldValue\":{\"fieldType\":\"country\",\"value\":\"GB\"}},\
            {\"fieldLocator\":{\"fieldScope\":{\"crypto\":\"global\",\"machine\":\"global\"},\"code\":\"machineLanguages\",\"fieldType\":\"language\",\"fieldClass\":null},\"fieldValue\":{\"fieldType\":\"language\",\"value\":[\"en-US\"]}},\
            {\"fieldLocator\":{\"fieldScope\":{\"crypto\":\"global\",\"machine\":\"global\"},\"code\":\"cryptoCurrencies\",\"fieldType\":\"cryptoCurrency\",\"fieldClass\":null},\"fieldValue\":{\"fieldType\":\"cryptoCurrency\",\"value\":[\"BTC\"]}}\
    ]}', DEFAULT, true);" &>>$LOG_FILE

decho "create l-m instance paired with l-s"
sudo -u postgres psql --db lamassu -c "INSERT INTO devices \
        (device_id, cashbox, cassette1, cassette2, paired, \
        display, created, user_config_id, name, last_online, \
        location) VALUES (\
        '${LM_PAIR}', \
        0, 1000, 1000, \
        true, true, DEFAULT, 2, 'test', DEFAULT, '{}');" &>>$LOG_FILE

service postgresql stop

decho "clean apt cache folder to reduce image size"
rm -rfv /var/lib/apt/lists/* /var/cache/apt/* &>>$LOG_FILE

decho "build.sh ends"
