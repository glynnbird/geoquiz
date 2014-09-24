# usstatesquiz

A simple web app that renders a quiz where the contestant has to name a group of geographical features. It has 4 individual quizes

* states of the US
* counties of England
* countries of the world
* shipping forecast regions

As the answers are typed, the shapes of the states are presented on a Leaflet map.

The data comes from

* [https://github.com/glynnbird/usstatesgeojson](https://github.com/glynnbird/usstatesgeojson)
* [https://github.com/glynnbird/ukcountiesgeojson](https://github.com/glynnbird/ukcountiesgeojson)
* [https://github.com/glynnbird/countriesgeojson](https://github.com/glynnbird/countriesgeojson)
* [https://github.com/glynnbird/shippingforecastgeojson](https://github.com/glynnbird/shippingforecastgeojson)

## Screenshot
![screenshot](https://github.com/glynnbird/usstatesquiz/raw/master/public/img/s1.png "Screenshot")

## Data Model

There are two types of documents

* type: “Quiz” - stores the name of the quiz, its position on the map and its zoom level
* type: “Feature”  - GeoJSON storing the properties and geometry of a geographical area

### type: “Quiz”

Stores a document for each quiz and some configuration on where the map should be positioned.

```
{
    "_id": "e3f4e3f4e3f4e3f4e3f4",
    "type": "Quiz",
    "name": "English Counties",
    "description": "Identify 27 English Counties,....",
    "latitude": 54.4,
    "longitude": -1.1,
    "zoom": 8
}
```

### type: “Feature”

One document per geographical feature, storing the properties of the place and the coordinates which describe its outline as arrays of coordinates. Each document is a GeoJSON feature, making it easy to render on a map. The “properties.quiz” string denotes which quiz the geographical shape belongs to e.g. “US States”.

```
{
    "_id": "alabama",
    "type": "Feature",
    "properties": {
        "quiz": "US States",
        "name": "Alabama",
        "abbreviation": "AL",
        "capital": "Montgomery",
        ...
    },
    "geometry": { … }
}
```

## Installing

Clone the repository and run:

```
cd geoquiz
npm install
sudo npm install -g ccurl
```

Then import the data into Cloudant/CouchDB:

```
cd data
export COUCH_URL=""http://127.0.0.1:5984"
./populate.sh
```

And run it:

```
cd ..
node app.js
```

And visit the App in your web browser at http://localhost:3000. Alternatively, the App is BlueMix ready. Simply sign up for an account, add a Node.js runtime and a Cloudant service and modify the manifest.yml accordingly.
