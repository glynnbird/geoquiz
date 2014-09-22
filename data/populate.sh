#!/bin/bash

echo "Creating the database"
ccurl -X PUT /geoquiz

echo "Adding the geographic data"
ccurl -X POST -d @us.json /geoquiz/_bulk_docs
ccurl -X POST -d @uk.json /geoquiz/_bulk_docs


echo "Adding the quizes"
ccurl -X POST -d @quizes.json /geoquiz/_bulk_docs

echo "Adding design docs"
ccurl -X POST -d @design.json /geoquiz/_bulk_docs


