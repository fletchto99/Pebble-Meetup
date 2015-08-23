function getQueryParam(variable, def) {
    var result = def || '';
    try {
        var obj = JSON.parse(decodeURIComponent(window.location.hash.substr(1)));
        if (variable in obj) {
            result = obj[variable];
        }
    } catch (ignored) {
    }
    return result;
}

$(function () {

    /** external APIs **/
    var geocoder = new google.maps.Geocoder();

    /** conatiners **/
    var customgroupscontainer = document.getElementById('customgroupscontainer');
    var locationcontainer = document.getElementById('locationcontainer');
    var savecontainer = document.getElementById('savecontainer');

    /**inputs **/
    var units = document.getElementById('units');
    var radius = document.getElementById('radius');
    var allevents = document.getElementById('events');
    var prerelease = document.getElementById('prerelease');
    var location = document.getElementById('location');
    var address = document.getElementById('address');
    var lat = document.getElementById('lat');
    var lon = document.getElementById('lon');
    var menubgcolor = document.getElementById('menubgcolor');
    var menutextcolor = document.getElementById('menutextcolor');
    var hmenubgcolor = document.getElementById('hmenubgcolor');
    var hmenutextcolor = document.getElementById('hmenutextcolor');
    var currentversion = document.getElementById('currentversion');
    var savebutton = document.getElementById('savebutton');
    var donatebutton = document.getElementById('donatebutton');

    /** Helper Functions **/
    var getCustomGroupsAsList = function () {
        var children = [];
        [].slice.call(customgroupscontainer.children).forEach(function (child) {
            if (child.classList.contains('item') && !child.classList.contains('add-item')) {
                children.push(child.innerText);
            }
        });
        return children.join(',');
    };

    var addCustomGroupFromString = function (group) {
        var item = createElement({
            elem: 'div',
            className: 'item',
            textContent: group,
            inside: [
                {
                    elem: 'div',
                    className: 'delete-item',
                    onclick: function () {
                        item.parentNode.removeChild(item);
                    }
                }
            ]
        });
        customgroupscontainer.insertBefore(item, customgroupscontainer.lastChild)
    };

    var applyDefaultColor = function (element, color) {
        element.value = '0x' + color;
        element.parentNode.lastChild.firstChild.style.background = '#' + color;
    };

    /** Event Handlers **/
    Slate.tabs.onchange = function (tab, index) {
        if (index > 3) {
            if (savecontainer.classList.contains('open')) {
                savecontainer.classList.remove('open');
            }
        } else {
            if (!savecontainer.classList.contains('open')) {
                savecontainer.classList.add('open');
            }
        }
    };

    /** Add event listeners **/
    donatebutton.addEventListener('click', function () {
        document.location = 'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=3PXVE99RCWGRQ&lc=CA&item_name=Meetup%20for%20Pebble%20by%20Matt%20Langlois&currency_code=CAD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted&return=fletchto99.com/other/pebble/metup/settings.html';
    });

    location.addEventListener('change', function () {
        if (location.checked) {
            if (!locationcontainer.classList.contains('open')) {
                locationcontainer.classList.add('open');
            }
        } else {
            if (locationcontainer.classList.contains('open')) {
                locationcontainer.classList.remove('open');
            }
        }
    });

    address.addEventListener('blur', function () {
        geocoder.geocode({'address': address.value}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                address.value = results[0].formatted_address;
                lat.value = results[0].geometry.location.lat();
                lon.value = results[0].geometry.location.lng();
            } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                alert('Address not found!');
            } else {
                alert('Invalid address entered!');
            }
        });
    });

    savebutton.addEventListener('click', function () {
        document.location = getQueryParam('return_to', 'pebblejs://close#') + encodeURIComponent(JSON.stringify({
                'radius': radius.value,
                'units': units.value,
                'events': allevents.checked ? 1 : 0,
                'customgroups': getCustomGroupsAsList(),
                'prerelease': prerelease.checked ? 1 : 0,
                'location': location.checked ? 1 : 0,
                'address': address.value,
                'lon': lon.value,
                'lat': lat.value,
                'menubgcolor': menubgcolor.value.substr(2),
                'menutextcolor': menutextcolor.value.substr(2),
                'hmenubgcolor': hmenubgcolor.value.substr(2),
                'hmenutextcolor': hmenutextcolor.value.substr(2)
            }));
    });

    /** Set loaded values **/
    units.value = getQueryParam('units', 'km');
    radius.value = getQueryParam('radius', '100');
    allevents.checked = getQueryParam('events', false);
    prerelease.checked = getQueryParam('prereelease', false);
    location.checked = getQueryParam('location');
    address.value = getQueryParam('address', false);
    lat.value = getQueryParam('lat');
    lon.value = getQueryParam('lon');
    applyDefaultColor(menubgcolor, getQueryParam('menubgcolor', 'FFFFFF'));
    applyDefaultColor(menutextcolor, getQueryParam('menutextcolor', '000000'));
    applyDefaultColor(hmenubgcolor, getQueryParam('hmenubgcolor', '000000'));
    applyDefaultColor(hmenutextcolor, getQueryParam('hmenutextcolor', 'FFFFFF'));
    currentversion.textContent = 'Meetup Version: ' + getQueryParam('latestver', 'Unknown!');
    if (getQueryParam('firstrun', false) == false) {
        // alert('Thank you for downloading Meetup!')
    }

    if (location.checked) {
        if (!locationcontainer.classList.contains('open')) {
            locationcontainer.classList.add('open');
        }
    }

    /** Dynamic lists management */
    var groups = getQueryParam('customgroups').split(',');
    if (groups.length > 0) {
        groups.forEach(function (group) {
            if (group.length > 0) {
                addCustomGroupFromString(group);
            }
        });
    }

});


/** Helper functions taken from my other projects **/

/**
 *
 * @param params
 * @returns {Element}
 */
window.createElement = function (params) {
    if (!params) {
        throw Error('No parameters passed to create element');
    }

    if (typeof params === 'string') {
        return document.createElement(params);
    }

    if (params instanceof HTMLElement) {
        throw Error('createElement called with an HTML element as a parameter.');
    }

    var elem = document.createElement(params.elem || 'span');
    params = cloneBasicObject(params);
    delete params.elem;

    // Put this element into a parent
    if (params.putIn) {
        params.putIn.appendChild(elem);
        delete params.putIn;
    }

    // Get array of elements to put into this
    var toGoInside = [];
    if (params.inside) {
        toGoInside = params.inside;
        delete params.inside;
    }

    // Apply HTML attributes
    for (var key in params.attributes) {
        elem.setAttribute(key, params.attributes[key]);
    }
    delete params.attributes;

    // Apply javascript attributes
    for (key in params) {
        elem[key] = params[key];
    }

    // Iterate over putIn array and put them into elem
    for (var i = 0, l = toGoInside.length; i < l; i++) {
        var e = toGoInside[i];
        if (!(e instanceof Element)) {
            e = createElement(e);
        }

        elem.appendChild(e);
    }

    return elem;
};

window.cloneBasicObject = function (obj) {
    if (null === obj || "object" != typeof obj) {
        return obj;
    }

    var copy;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = obj.slice();
        for (var i = 0; i < copy.length; i++) {
            copy[i] = cloneBasicObject(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = obj[attr];
            }
        }
        return copy;
    }
};