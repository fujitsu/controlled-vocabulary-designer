#!/bin/bash

set -e

echo overwrite postgresql.conf ...
sed -i -e"s/max_wal_size = 1GB.*$/max_wal_size = 10GB/" /var/lib/postgresql/data/postgresql.conf
sed -i -e"s/^#checkpoint_timeout = 5min.*$/checkpoint_timeout = 30min/" /var/lib/postgresql/data/postgresql.conf
sed -i -e"s/^#maintenance_work_mem = 64MB.*$/maintenance_work_mem = 512MB/" /var/lib/postgresql/data/postgresql.conf
