#!/bin/bash -ex

IFS="="

schedule_date=""
schedule_post=""

while read -r name value
do
    if [[ $name == "schedule_date" ]]; then
        schedule_date="$value"
    elif [[ $name == "schedule_post" ]]; then
        schedule_post="$value"

        # Then do the magic
        if [[ $schedule_date == "$(date +%Y-%m-%d)" && -d ~/repo/ ]]; then
            echo "Publishing post: $schedule_post"
            mv ~/repo/scheduled-posts/$schedule_post ~/repo/_posts/$schedule_post
        elif [[ ! -d ~/repo/ ]]; then
            echo "You have bad configuration on circle.yml ($schedule_post)"
        fi
    fi
done < "script/sch.ini"