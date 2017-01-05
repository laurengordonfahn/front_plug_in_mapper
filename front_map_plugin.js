var GOOGLE_API_KEY = "yourapikey";
var ADDRESS_REGEX      = /\d+\s+\w+\s+(street|st|road|rd|boulevard|blvd|lane|ln)/ig;
var DEFAULT_CITY_STATE = " San Francisco, CA";

var DEBUG = false;

/* addressVerify takes an string as a parameter and uses regex to verifiy if the string contain's an acceptable address. Returns an array log ['first string that matched', index: num, input: body_string] */

function addressVerify(msg) {
    return msg.match(ADDRESS_REGEX);
}

/* findFirstAddress checks the entire body of a message for the first regex verfied address by calling addressVerify function. Returns only the first address verified if no address the value returned will be undefined */

function findFirstAddress(data) {

    var match = addressVerify(data.message.body);

    dbgj(match);

    if (match) {
        return match[0] + DEFAULT_CITY_STATE;        
    }

}

///Take return value from findFirstAddress and find lat/long if no address returned from findFirstAddress generates map centered on the center of the SF
function handleMessage(data){

    dbg("handleMessage");

    var address=findFirstAddress(data);

    dbg("address = " + address);

    if (address != undefined) {
        $('#container').hide();

        $.get("https://maps.googleapis.com/maps/api/geocode/json",{
            key: GOOGLE_API_KEY,
            address: address
        },showMap);

    }else{
        $('#map').html('');
        $('#container').show();
        $('.message').html('There is not an address associated with this message, wish you were here!');
    }
}

//// getLatLong takes in json, parses json results from Google API to get lat and long

function showMap(response){
    

    if (response["status"] === "OK"){
        var place = response.results[0];
    
        dbgj(place);
    
       var center_point = place.geometry.location;

        dbgj(center_point);
        
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 12,
          center: center_point
        });
    
        var infowindow = new google.maps.InfoWindow();
    
        var marker = new google.maps.Marker({
          position: center_point,
          map: map
        });
    
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent('<div><strong>' + place.formatted_address +'</strong></div>');
            infowindow.open(map, this);
        });

    } else {
        $('#map').html('');
        $('#container').show();
        $('.message').html('The address detected in this message did not register with google maps, our apologies!');
    }
}


Front.on('conversation', function (data) {
    dbg("conversation");
    handleMessage(data);
    // triggered when a conversation is loaded
});

/// dbg runs when DEBUG is set to True and shows a list of activites in the plugin feild in order to have a "console"-like debug tool.
function dbg(message) {
    if(DEBUG) {
        if( $('#debug').size() == 0 ) {
            $(body).insert('<ul id="debug"></ul>');
        }
        $('ul#debug').append('<li>' + message + '</li>');       
    }
}

/// dbgj json represenataion of an object through the dbg mechanism
function dbgj(obj) {
    dbg(JSON.stringify(obj));
}

$(document).ready(function(){
    dbg("running");
});


