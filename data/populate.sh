#!/bin/bash

# check for environment variable
if [ -z "$COUCH_URL" ] 
then
  echo "Need to set COUCH_URL in environment"
  echo "  e.g. export COUCH_URL=http://127.0.0.1:5984"
  exit 1
fi

# check that ccurl is installed
hash ccurl 2>/dev/null || { echo >&2 "Need 'ccurl' installed. Try 'sudo npm install -g ccurl'"; exit 1; }

echo "Creating the database"
ccurl -X PUT /geoquiz

echo "Adding the geographic data"
ccurl -X POST -d @us.json /geoquiz/_bulk_docs
ccurl -X POST -d @uk.json /geoquiz/_bulk_docs
ccurl -X POST -d @countries.json /geoquiz/_bulk_docs
ccurl -X POST -d @shippingforecast.json /geoquiz/_bulk_docs

echo "Adding the quizes"
ccurl -X POST -d @quizes.json /geoquiz/_bulk_docs

echo "Adding design docs"
ccurl -X POST -d @design.json /geoquiz/_bulk_docs


