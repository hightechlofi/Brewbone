// Socket.io Functionality
var ip = document.location.host;
console.log("server ip: " + ip)
var socket = io.connect(ip);




// Initialze Current Page - Generate List of Devices and Subscribe to Them
InitialzePage = function() {
    console.log("initializing devices...");
    devices = [];
    $("[data-device-type]").each(function(i) {
        // create the device subscribe request data
        device = {
                "deviceType": $(this).data("device-type"),
                "name": $(this).data("device-name"),
                "action": "subscribe",
                "value": null
            }
            // check if the device has been subscribed to
        if (_.findWhere(devices, device) == null) {
            // if not, add it to the devices (history) array
            devices.push(device);
            // the send the subscribe instruction
            socket.emit("action", device);
            console.log("initializing: " + device);
        }
    })
}

InitialzePage();

// Dispatch - route incoming data to controls
function dispatch(data) {

    var selector = "[data-device-type='" + data.type + "'][data-device-name='" + data.name + "'][data-device-arg='" + data.arg + "']"
    console.log("dispatching to: " + selector)
    $(selector).each(function() {
        if (typeof handle[$(this).data("output-type")] === "function") {
            handle[$(this).data("output-type")](this, data.value);
        } else {
            console.log("No handler function for : " + selector);
        }

    });
};

//sample_dispatch_data = {"type":"pump","name":"rims","arg":"flowrate","value":"2.1"}

// Incoming Socket Handlers
socket.on("alert", function(data) {
    console.log(data);
});

socket.on("outputData", function(data) {
    dispatch({
        "type": "output",
        "name": data.name,
        "arg": "state",
        "value": data.state
    });
    dispatch({
        "type": "output",
        "name": data.name,
        "arg": "power",
        "value": data.power
    });
})

socket.on("tempSensorData", function(data) {
    console.log("temp data recieved");
    console.log(data);
    dispatch({
        "type": "tempSensor",
        "name": data.name,
        "arg": "temp",
        "value": data.temp
    });
    dispatch({
        "type": "tempSensor",
        "name": data.name,
        "arg": "timestamp",
        "value": data.timestamp
    });
    dispatch({
        "type": "tempSensor",
        "name": data.name,
        "arg": "chartData",
        "value": {
            temp: data.temp,
            timestamp: data.timestamp
        }
    });


});

socket.on("tempControllerData", function(data) {
    console.log("temp controller data recieved");
    console.log(data);
    dispatch({
        "type": "tempController",
        "name": data.name,
        "arg": "setpoint",
        "value": data.setpoint
    });
    dispatch({
        "type": "tempController",
        "name": data.name,
        "arg": "state",
        "value": data.state
    });
    dispatch({
        "type": "tempController",
        "name": data.name,
        "arg": "power",
        "value": data.power
    });
    dispatch({
        "type": "tempController",
        "name": data.name,
        "arg": "temp",
        "value": data.temp
    });
    dispatch({
        "type": "tempController",
        "name": data.name,
        "arg": "duration",
        "value": data.duration
    });
    dispatch({
        "type": "tempController",
        "name": data.name,
        "arg": "startTime",
        "value": data.startTime
    });
})

socket.on("pumpData", function(data) {
    console.log("pump data recieved");
    console.log(data);
    dispatch({
        "type": "pump",
        "name": data.name,
        "arg": "state",
        "value": data.state
    });
    dispatch({
        "type": "pump",
        "name": data.name,
        "arg": "mode",
        "value": data.mode
    });
    dispatch({
        "type": "pump",
        "name": data.name,
        "arg": "power",
        "value": data.power
    });
    dispatch({
        "type": "pump",
        "name": data.name,
        "arg": "flowrate",
        "value": data.flowrate
    });
    dispatch({
        "type": "pump",
        "name": data.name,
        "arg": "totalizer",
        "value": data.totalizer
    });
})

// Incoming Socket Template
/*socket.on("device", function(data){
    console.log("temp data recieved");
    console.log(data);
    dispatch({"type":"temp_sensor","name":data.name, "arg":"_arg_","value":data.temp});
})*/

// UI Control Dispatch Handlers

handle = [];

handle["html"] = function(el, value) {
    console.log("handling html | value: " + value + " : object : " + el)
    $(el).html(value);
};

handle["slider"] = function(el, value) {
    $(el).slider({
        "value": value
    });
};

handle["switch"] = function(el, value) {
    $(el).prop("checked", value);
};


handle["knob"] = function(el, value) {
    $(el).val(value);
    $(el).trigger("change");
};

handle["tempStat"] = function(el, value) {
    $(el).html(value + '°');
};

handle["sparkline"] = function(el, value) {
    var data = $(el).attr('values').split(",");
    count = data.push(value);
    if (count > 20) {
        data.shift()
    };
    console.log(count + " | " + data);
    $(el).attr('values', data.toString())
    $(el).sparkline(data, {
        width: "90%",
        height: 40,
        lineColor: 'white',
        fillColor: !1,
        spotColor: !1,
        maxSpotColor: !1,
        minSpotColor: !1,
        spotRadius: 2,
        lineWidth: 2
    });
};

var chartColor = "#e4e6eb";;
var dataColor = "#fff"
var tempChartOptions = {
    series: {
        lines: {
            show: true,
            lineWidth: 2,
            fill: false,
        },
        shadowSize: 0
    },
    grid: {
        hoverable: true,
        clickable: true,
        tickColor: dataColor,
        borderColor: dataColor,
        borderWidth: 0,
        backgroundColor: chartColor,
        margin: {
            top: 15,
            bottom: 5,
            left: 8,
            right: 15
        }

    },
    colors: [dataColor],
    colors: [dataColor],
    xaxis: {
        mode: "time",
        tickSize: [2, "second"],
        tickLength: 0,
        tickFormatter: function(v, axis) {
            var date = new Date(v);

            if (date.getSeconds() % 20 == 0) {
                var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
                var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
                var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

                return hours + ":" + minutes + ":" + seconds;
            } else {
                return "";
            }
        },
        axisLabel: "Time",
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: 'Verdana, Arial',
        axisLabelPadding: 10,
        reserveSpace: true,
        font: {
            color: dataColor
        }
    },
    yaxis: {
        min: 0,
        max: 100,
        tickSize: 20,
        tickLength: 0,
        axisLabel: "Temperature",
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: 'Verdana, Arial',
        axisLabelPadding: 15,
        reserveSpace: true,
        font: {
            color: dataColor
        }
    },
};

handle["tempFlotChart"] = function(el, value) {
    c = $(el).data("device-name");

    if (typeof tempData[c] != "undefined") {
        tempData[c].push(value);
        $.plot($(el), {data: tempData[c]}, tempChartOptions);
    }
};

handle["button"] = function(el, value) {
    $(el).data("device-state", value);
    buttonAction($(el));
}

handle["glyphButton"] = function(el, value) {
    $(el).data("device-state", value);
    glyphButtonAction($(el));
}

// Data Input Functionality (actions sent as input to brewbone)
function act(el, value) {
    var action = {
        "deviceType": $(el).data("device-type"),
        "name": $(el).data("device-name"),
        "action": $(el).data("device-arg"),
        "value": value
    }
    console.log(action);
    socket.emit("action", action);
}

$("[data-output-type='slider']").on("slidestop", function(event, ui) {
    console.log("slidestop detected");
    act(this, ui.value);
});

/*-------------- Switch ------------------------- */

$("[data-output-type='switch']").on("change", function(data) {
    act(data.currentTarget, data.currentTarget.checked);
});

/*------------- Glyph Button Action ------------------- */
glyphButtonAction = function(t) {
    var state = t.data("device-state");
    if (state) {
        t.removeClass(t.data("glyph-false"));
        t.addClass(t.data("glyph-true"));
        t.data("device-state", false);

    } else {
        t.removeClass(t.data("glyph-true"));
        t.addClass(t.data("glyph-false"));
        t.data("device-state", true);
    }
}


/*------------- Knob Action ------------------- */
knobAction = function(v) {
    console.log("change event fired");
    console.log(v);
    var that = $(this)[0].$[0];
    act(that, v);
}

/*-- button action -- */
buttonAction = function(t) {
    console.log("button action");
    var state = t.data("device-state");
    if (state) {
        t.removeClass("btn-primary");
        t.addClass("btn-danger");
    } else {
        t.removeClass("btn-danger");
        t.addClass("btn-primary");
    }

    t.data("device-state", !state);
}

$(document).ready(function() {
    console.log("doc ready");

    /*----------- Init flot charts ----------------- */
    var tempData = new Array();

    $(".tempFlotChart").each(function() {
        if (typeof tempData[$(this).data("device-name")] === "undefined") {
            tempData[$(this).data("device-name")] = new Array();
        }
        $.plot($(this), {
            data: tempData[$(this).data("device-name")]
        }, tempChartOptions);
    })



    /* ---------- Init jQuery Knob - disbaled in IE8, IE7, IE6 ---------- */
    if (jQuery.browser.version.substring(0, 2) == "8.") {

        //disable jQuery Knob

    } else {

        if (retina()) {

            $(".knobControl").knob({
                'width': 240,
                'height': 240,
                'bgColor': 'rgba(255,255,255,0.5)',
                'fgColor': 'rgba(255,255,255,0.9)',
                'thickness': 0.2,
                'tickColorizeValues': true,
                'change': knobAction
            });
            $(".knobDisplay").knob({
                'width': 240,
                'height': 240,
                'bgColor': 'rgba(255,255,255,0.5)',
                'fgColor': 'rgba(255,255,255,0.9)',
                'thickness': 0.2,
                'tickColorizeValues': true,
                'change': knobAction
            });
            $(".tempCircle").knob({
                'width': 240,
                'height': 240,
                'thickness': 0.2
            });


            //only firefox sux in this case
            if (jQuery.browser.mozilla) {
                $(".circleStat").css('MozTransform', 'scale(0.5,0.5)');
                $(".knobControl").css('MozTransform', 'scale(0.999,0.999)');
                $(".knobControl").css('margin-top', '20px');
                $(".circleStat").css('margin-top', '-60px').css('margin-left', '-36px');
            } else {
                $(".circleStat").css('zoom', 0.5);
                $(".knobControl").css('zoom', 0.999);
            }

        } else {

            $(".knobControl").knob({
                'width': 120,
                'height': 120,
                'bgColor': 'rgba(255,255,255,0.5)',
                'fgColor': 'rgba(255,255,255,0.9)',
                'thickness': 0.2,
                'tickColorizeValues': true,
                'change': knobAction
            });

            $(".tempCircle").knob({
                'width': 120,
                'height': 120,
                'thickness': 0.2
            });


        }

        $(".circleStatsItemBox").each(function() {

            var value = $(this).find(".value > .number").html();
            var unit = $(this).find(".value > .unit").html();
            var percent = $(this).find("input").val() / 100;

            countSpeed = 2300 * percent;

            endValue = value * percent;

            $(this).find(".count > .unit").html(unit);
            $(this).find(".count > .number").countTo({

                from: 0,
                to: endValue,
                speed: countSpeed,
                refreshInterval: 50,
                onComplete: function(value) {
                    console.debug(this);
                }

            });

        });

    }

    /* --------- RIMS Temp Slider ------------- */



    /* --------- Glyph Button ------------- */

    $(".glyphButton").click(function(e) {
        console.log("glyphButton clicked: " + e.target.id)
        var t = $(e.target);
        var state = t.data("device-state");
        glyphButtonAction(t);

        act(t, state);
    });

    /* --------- btnOnOff ------------- */

    $(".btnOnOff").click(function(e) {
        var t = $(e.target);
        var state = t.data("device-state");
        buttonAction(t);
        act(t, state);
    });



});
