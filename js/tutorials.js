/*
*** This tutorial code is Kai's
*** There are many other ones like it, but this one is mine
*/

/* Example from Leaflet Quick Start Guide*/


// This piece sets the initial view of the map upon openning the map

var northWest = L.latLng(60.000, -130.000),
    southEast = L.latLng(20.000, -60.000),
    bounds = L.latLngBounds(northWest, southEast);

var map = L.map('map').setView(
    [33.35, -84.5718], 5).setMaxBounds(bounds);

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    minZoom: 3
}).addTo(map);

/*
//add tile layer...replace project id and accessToken with your own
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			minZoom: 4,
            maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.streets'
		}).addTo(map);
*/

/* Map of GeoJSON data from MegaCities.geojson */


//Example 2.3 line 22...load the data
$.ajax("data/AirportDataEdit.geojson", {
    dataType: "json",
    success: function(response){

    //create an attributes array
    var attributes = processData(response);

    createPropSymbols(response, map, attributes);

    createSequenceControls(map, attributes); 

        }
});

function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 0.00005;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

function createPropSymbols (data, map, attributes) {

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {

            return pointToLayer(feature, latlng, attributes);

        }
    }).addTo(map);

};

function pointToLayer (feature, latlng, attributes) {

    var attribute = attributes[0];


    var options = {
            radius: 8,
            fillColor: "#0A2869",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        // var attribute = "CY14_Enplanements";
            
            //Step 5: For each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);

            // set the radius equal to the proportional radius related to the values
            options.radius = calcPropRadius(attValue);        

            //create circle marker layer
            var layer = L.circleMarker(latlng, options);

            // initiate an instance of panel text
            var panelContent;

            //build popup content string
            // var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p><p><b>" 
            // + attribute + ":</b> " + feature.properties[attribute] + ' million' + "</p>";

            //original popupContent changed to panelContent...Example 2.2 line 1
            panelContent += "<p><b>City:</b> " + feature.properties.City + "</p>";

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
};

/*
function pointToLayer(feature, latlng, attributes){

    //Step 4: Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    //check
    console.log(attribute);

};
*/

//Create a slider bar for temporal data functionality 
function createSequenceControls(map, attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');

    $('#panel').append('<button class="skip" id="reverse" title="Back">Back</button>' );
    $('#panel').append('<button class="skip" id="forward" title="Next">Next</button>');

    //set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });

    /*
    //replace inter. buttons with icons
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');
    */

    //Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
            $('.range-slider').val(index);
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
            $('.range-slider').val(index);
        }
        
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
        $('.range-slider').val(index);
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();

        //Step 9: pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);

    });



};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.City + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        };
    });
};


//Above Example 3.8...Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Enplanements") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};


