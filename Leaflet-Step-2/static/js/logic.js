// create map layers
var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});


var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.dark",
  accessToken: API_KEY
});

// create map
var myMap = L.map("map", {
  center: [
    37.09, -95.71
  ],
  zoom: 4,
  layers: [satmap, lightmap, darkmap]
});

// add layers
var earthquakes = new L.LayerGroup();
var tectonicplates = new L.LayerGroup();

// set base maps
var baseMaps = {
  "Satellite": satmap,
  "Light Map": lightmap,
  "Dark Map": darkmap
};

// set overlay maps
var overlayMaps = {
  Earthquakes: earthquakes,
  "Tectonic Plates": tectonicplates
};

// add control and pass in layers
L.control.layers(baseMaps, overlayMaps, {
  collapsed: true
}).addTo(myMap);

// retrieve geojson info and set marker size and colors
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function (data) {
  function markerStyle(feature) {
    return {
      opacity: 1,
      fillOpacity: .7,
      fillColor: getColor(feature.properties.mag),
      color: "gray",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "red";
      case magnitude > 4:
        return "orange";
      case magnitude > 3:
        return "yellow";
      case magnitude > 2:
        return "blue";
      case magnitude > 1:
        return "green";
      default:
        return "gray";
    }
  }

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 3;
  }

  // add circles to the earthquake layer and bind popup to each circle
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: markerStyle,
    onEachFeature: function (feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(earthquakes);

  earthquakes.addTo(myMap);

  var legend = L.control({
    position: "bottomright",
    background: "white"
  });

  // add the details to the legend.
  legend.onAdd = function () {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var mags = [0, 1, 2, 3, 4, 5];
    var colors = [
      "gray",
      "green",
      "blue",
      "yellow",
      "orange",
      "red"
    ];

    // add the text and colored square to the legend
    for (var i = 0; i < mags.length; i++) {
      div.innerHTML += "<li style='background: " + colors[i] + "'></li> " +
        mags[i] + (mags[i + 1] ? "&ndash;" + mags[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // add the legend
  legend.addTo(myMap);

  // retrieve geojson info and add to the plates layer
  d3.json("static/json/PB2002_boundaries.json",
    function (platedata) {
      //
      L.geoJson(platedata, {
          color: "silver",
          weight: 2
        })
        .addTo(tectonicplates);

      // add the tectonicplates layer to the map.
      tectonicplates.addTo(myMap);
    });

});