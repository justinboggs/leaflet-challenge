var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
});


var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
});

var myMap = L.map("map", {
    center: [
        37.09, -95.71
    ],
    zoom: 4,
    layers: [darkmap, lightmap]
});

var earthquakes = new L.LayerGroup();
var tectonicplates = new L.LayerGroup();

var baseMaps = {
    "Dark Map": darkmap,
    "Light Map": lightmap
};

var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": tectonicplates
};

L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
}).addTo(myMap);

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function (data) {
    function markerStyle(feature) {
        return {
            opacity: 1,
            fillOpacity: .7,
            fillColor: getColor(feature.properties.mag),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.7
        };
    }

    function getColor(magnitude) {
        switch (true) {
            case magnitude > 5:
                return "#7C878C";
            case magnitude > 4:
                return "#536878";
            case magnitude > 3:
                return "#9F9F9F";
            case magnitude > 2:
                return "#8E8982";
            case magnitude > 1:
                return "#000776";
            default:
                return "#070B47";
        }
    }

    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }

        return magnitude * 4;
    }

    L.geoJson(data, {
        // We turn each feature into a circleMarker on the map.
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: markerStyle,
        // We create a popup for each marker to display the magnitude and location of
        // the earthquake after the marker has been created and styled
        onEachFeature: function (feature, layer) {
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
        // We add the data to the earthquake layer instead of directly to the map.
    }).addTo(earthquakes);

    earthquakes.addTo(myMap);

    var legend = L.control({
        position: "bottomright",
        background: "white"
    });

    // Then we add all the details for our legend
    legend.onAdd = function () {
        var div = L
            .DomUtil
            .create("div", "info legend");

        var mags = [0, 1, 2, 3, 4, 5];
        var colors = [
            "#7C878C",
            "#536878",
            "#9F9F9F",
            "#8E8982",
            "#000776",
            "#070B47"
        ];

        // Loop through our intervals and generate a label with a colored square for each interval.
        for (var i = 0; i < mags.length; i++) {
            div.innerHTML += "<li style='background: " + colors[i] + "'></i> " +
                mags[i] + (mags[i + 1] ? "&ndash;" + mags[i + 1] + "<br>" : "+");
        }
        return div;
    };

    // We add our legend to the map.
    legend.addTo(myMap);

    d3.json("static/json/PB2002_boundaries.json",
        function (platedata) {
            // Adding our geoJSON data, along with style information, to the tectonicplates
            // layer.
            L.geoJson(platedata, {
                    color: "orange",
                    weight: 2
                })
                .addTo(tectonicplates);

            // Then add the tectonicplates layer to the map.
            tectonicplates.addTo(myMap);
        });

});