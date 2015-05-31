function getQueryParam(variable, default_) {
    var query = location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return default_ || '';
}

function saveOptions() {
    return {
        'radius': $('#radius').val(),
        'units': $('#units').val(),
        'customgroups': $('#customgroups').val(),
        'prerelease': $('#prerelease').is(":checked"),
        'location': $('#location').is(":checked"),
        'events': $('#events').is(":checked"),
        'address': $('#address').val(),
        'lon': $('#lon').val(),
        'lat': $('#lat').val()
    };
}

$(document).ready(function () {
    $.fn.bootstrapSwitch.defaults.size = 'small';
    var geocoder = new google.maps.Geocoder();
    $("#progress").hide();
    $("#units option").filter(function () {
        return $(this).val() == getQueryParam('units', 'km');
    }).prop('selected', true);
    $('#radius').val(parseInt(getQueryParam('radius', '100')));
    $('#customgroups').val(getQueryParam('customgroups', ''));
    $('#prerelease').bootstrapSwitch('state', 'true' === getQueryParam('prerelease', 'false'));
    $('#location').bootstrapSwitch('state', 'true' === getQueryParam('location', 'false'));
    $('#events').bootstrapSwitch('state', 'true' === getQueryParam('events', 'false'));
    if ('false' === getQueryParam('location', 'false')) {
        $('#addressOption').hide();
    }
    $('#lon').val(getQueryParam('lon', '0'));
    $('#lat').val(getQueryParam('lat', '0'));
    $('#address').val(getQueryParam('address', ' '));
    $("#radius").keydown(function (e) {
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 || (e.keyCode == 65 && e.ctrlKey === true) || (e.keyCode == 67 && e.ctrlKey === true) || (e.keyCode == 88 && e.ctrlKey === true) || (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
    $('#cancel').click(function () {
        document.location = getQueryParam('return_to', 'pebblejs://close#');
    });
    $('#location').on('switchChange.bootstrapSwitch', function(event, state) {
        $('#addressOption').slideToggle('1000');
    });
    $('#save').click(function () {

        if ($('#radius').val() == '' || $('#units').val() == '') {
            alert('Invalid radius entered!');
            return;
        }
        $('#options').fadeToggle('1000', function () {
            $('#progress').fadeToggle('1000');
        });

        if ($('#location').prop('checked')) {
            var address = document.getElementById('address').value;
            geocoder.geocode({'address': address}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    $('#progress').fadeToggle('1000');
                    $('#address').val(results[0].formatted_address);
                    $('#lat').val(results[0].geometry.location.lat());
                    $('#lon').val(results[0].geometry.location.lng());
                    document.location = getQueryParam('return_to', 'pebblejs://close#') + encodeURIComponent(JSON.stringify(saveOptions()));
                } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                    alert('Address not found!');
                    $('#progress').fadeToggle('1000', function () {
                        console.log('Fading?!?!?');
                        $('#options').fadeToggle('1000');
                    });
                } else {
                    alert('Invalid address entered!');
                    $('#progress').fadeToggle('1000', function () {
                        $('#options').fadeToggle('1000');
                    });
                }
            });
        } else {
            document.location = getQueryParam('return_to', 'pebblejs://close#') + encodeURIComponent(JSON.stringify(saveOptions()));
        }

    });

});