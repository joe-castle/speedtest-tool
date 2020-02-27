#!/bin/bash

source $HOME/services/functions.sh

log_output "$(speedtest-csv --sep , >> $HOME/speedtest.csv | echo Speedtet Run)" "$HOME/services/speedtest-tool"
