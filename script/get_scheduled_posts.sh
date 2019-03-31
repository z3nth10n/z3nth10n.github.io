#!/bin/bash -ex

IFS="="

schedule_date=""
schedule_post=""

stamp_now=$(date --date=$(date --iso-8601) +%s 2>/dev/null)
stamp_file=""

if [[ -d ~/repo/scheduled-posts ]]; then
    while read -r name value
    do
        if [[ $name == "schedule_date" ]]; then
            schedule_date="$value"
            stamp_file=$(date --date=$value +%s 2>/dev/null)
        elif [[ $name == "schedule_post" ]]; then
            schedule_post="$value"

            # Then do the magic
            delta=$(($stamp_now-$stamp_file))

            if [[ $delta -ge 0 && -d ~/repo/ ]]; then
                echo "Publishing post: $schedule_post"
                mv ~/repo/scheduled-posts/$schedule_post ~/repo/_posts/$schedule_post
            elif [[ ! -d ~/repo/ ]]; then
                echo "You have bad configuration on circle.yml ($schedule_post)"
            fi
        fi
    done < "script/sch.ini"
fi