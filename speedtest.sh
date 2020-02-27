#!/bin/bash

source $HOME/services/functions.sh

# Threshold in Mb/s
threshold=40

result=$(speedtest-csv --sep , 2>&1)

if [[ $? != 0 ]]; then
	log_output "Error running speedtest: $result" "$HOME/services/speedtest-tool"
	exit
fi

download=$(echo $result | awk -F , '{print int($8)}')
upload=$(echo $result | awk -F , '{print int($9)}')

echo $result >> $HOME/speedtest.csv

if ((download <= threshold)); then
	log_output "Speed threshold below required, download = $download, upload: $upload." "$HOME/services/speedtest-tool"
	curl -s -X POST -H "Content-Type: application/json" -d "{\"value1\":\"$download\",\"value2\":\"$upload\"}" \
		 "https://maker.ifttt.com/trigger/speed_dropped/with/key/$1"
fi
