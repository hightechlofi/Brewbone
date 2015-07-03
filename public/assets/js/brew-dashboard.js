con
$(document).ready(function() {

console.log("doc ready");
    /* ---------- Init jQuery Knob - disbaled in IE8, IE7, IE6 ---------- */
 /*   if (jQuery.browser.version.substring(0, 2) == "8.") {

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
*/
    /* --------- RIMS Temp Slider ------------- */
/*    console.log("initializing sliders");
    $(".sliderMin").slider({
        range: "min",
        value: 152,
        min: 80,
        max: 200,
        slide: function(event, ui) {
            $(".sliderMinLabel").html(ui.value + "&deg;");
        }
    });

    $(".sliderPump").slider({
        range: "min",
        value: 0,
        min: 0,
        max: 1,
        step: .01
    });

    console.log("glyphButton initialized")

    $(".glyphButton").click(function(){
    	console.log("glyphButton clicked");
    });
*/




});
