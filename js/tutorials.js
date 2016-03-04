/*
*** This tutorial code is Kai's
*** There are many other ones like it, but this one is mine
*/

/* Example from Leaflet Quick Start Guide*/


// This piece sets the initial view of the map upon openning the map

var map = L.map('map').setView(
    [33.35, -84.5718], 5);


//add tile layer...replace project id and accessToken with your own
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			minZoom: 4,
            maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.streets'
		}).addTo(map);


/* Map of GeoJSON data from MegaCities.geojson */


    //Example 2.3 line 22...load the data
    $.ajax("data/AirportDataEdit.geojson", {
        dataType: "json",
        success: function(response){

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
                pointToLayer: function (feature, latlng){

                //create marker options
                    var options = {
                        radius: 8,
                        fillColor: "#0A2869",
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    };

                    var attribute = "CY14_Enplanements";

                    //Step 5: For each feature, determine its value for the selected attribute
                    var attValue = Number(feature.properties[attribute]);

                    // set the radius equal to the proportional radius related to the values
                    options.radius = calcPropRadius(attValue);

                    //create circle marker layer
                    var layer = L.circleMarker(latlng, options);

                    //build popup content string
                    // var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p><p><b>" 
                    // + attribute + ":</b> " + feature.properties[attribute] + ' million' + "</p>";

                    //original popupContent changed to panelContent...Example 2.2 line 1
                    var panelContent = "<p><b>City:</b> " + feature.properties.City + "</p>";

                    //add formatted attribute to panel content string
                    var year = attribute.split("_")[0];
                    attValue = attValue / 1000000;
                    panelContent += "<p><b>Number of passengers in " + year + ":</b> " + attValue + " million</p>";

                    //popup content is now just the city name
                    var popupContent = feature.properties.City;

                    //bind the popup to the circle marker
                    layer.bindPopup(popupContent, {
                        offset: new L.Point(0,-options.radius),
                        closeButton: false
                    });

                    //event listeners to open popup on hover
                    layer.on({
                        mouseover: function(){
                            this.openPopup();
                        },
                        mouseout: function(){
                            this.closePopup();
                        },
                        click: function(){
                            $("#panel").html(panelContent);
                        }
                    });

                    return layer;
                }
            }).addTo(map);


        }
    });

function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 0.00002;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};



//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, map);
        }
    });
};


// as it states, this code places a marker at the specified coordinates

/*
var marker = L.marker([51.5, -0.09]).addTo(map);


// as it states, this code places a circle polygon at the specified coordinates 

var circle = L.circle([51.508, -0.11], 500, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map);


// as it states, this code places a general polygon at the specified coordinates

var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);



// as it states, this code places a general popup bubble upon interactive click

marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

// as it states, this code places a general popup bubble at a specified location
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);



// this code enables the click features on the map
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}


map.on('click', onMapClick);
*/

