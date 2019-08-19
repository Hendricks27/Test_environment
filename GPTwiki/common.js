var curl = window.location.href.split("/");
var pagename = curl[curl.length-1];
var paraFromPage = [];

if ( pagename.startsWith("TG") ){
    checkElement();
}

function checkElement() {
    var pot = document.getElementsByClassName("mw-parser-output");
    var msl = pot[0].getElementsByTagName("p");
    var msele = msl[msl.length - 1];

    var elestring = "";
    var lastprecscan = "";
    for (var i in msele.innerText.split("\n")){

        var sth = msele.innerText.split("\n")[i];
        if (sth == ""){
            continue
        }
        var scandetails = sth.split(";");
        var precscan = scandetails[3];
        if (precscan != lastprecscan && 0) {
            paraFromPage.push({title: "Scan: "+precscan, scan: precscan, annotations: 0});
            lastprecscan = precscan;
        }
        var title = "";
        if (scandetails.length == 2) {
            title = "Scan: "+scandetails[0]+" ("+scandetails[1]+")";
        } else {
            title = "Scan: "+scandetails[0]+" ("+scandetails[1]+" @ "+scandetails[2]+" min, m/z "+scandetails[4]+")";
        }
        paraFromPage.push({title: title, scan: scandetails[0], annotations: 1});
    }

    msele.innerHTML = "";
}

if (!( Object.keys(paraFromPage).length === 0 && paraFromPage.constructor === Object)){
    injectResources();
}


function injectResources() {

    var external_resources = [
        "https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js",
        "https://cdn.jsdelivr.net/gh/glygen-glycan-data/JSWidgets/MS_Viewer/spectrum-parsers.js",
        "https://cdn.jsdelivr.net/gh/glygen-glycan-data/JSWidgets/MS_Viewer/MSV.js",
        "https://cdn.jsdelivr.net/gh/glygen-glycan-data/JSWidgets/MS_Viewer/util.js"
    ];

    var js_status = {};
    for (var i in external_resources){
        var jsurl = external_resources[i];
        js_status[jsurl] = false;
        getScript(jsurl, sync1);
    }

    jQuery.ajaxSetup({cache: true});
    function getScript(url, func) {
        jQuery.getScript(url, function () {
            js_status[url] = true;
            func();
        });
    }

    $("head").append("<link rel='stylesheet' href='https://cdn.jsdelivr.net/gh/glygen-glycan-data/JSWidgets/MS_Viewer/spectrum-viewer.css' type='text/css'>");

    function sync1() {

        var flag = true;
        for (var i in js_status){
            if (!js_status[i]){
                flag = false;
            }
        }
        if (flag){
            // console.log("loading partial complete");
            getD3TIP();
        }
    }

    function getD3TIP() {
        getScript("https://labratrevenge.com/d3-tip/javascripts/d3.tip.v0.6.3.js", sync2);
    }

    function sync2() {
        // console.log("loading complete");
        loadSVG();
    }
}

function loadSVG() {
    // console.log("Start drawing");

    var pot = document.getElementsByClassName("mw-parser-output")[0];
    var chromatographContainer = document.createElement("div");
    chromatographContainer.setAttribute("class", "specpane0");
    pot.appendChild(chromatographContainer);

    var msContainer = document.createElement("div");
    msContainer.setAttribute("class", "specpanel");
    pot.appendChild(msContainer);

    var peptideAcc = document.getElementById("msv_para").getAttribute("data-peptide");
    var charger = document.getElementById("msv_para").getAttribute("data-z1");
    var pmz = document.getElementById("msv_para").getAttribute("data-mz1");
    var spectra_folder = document.getElementById("msv_para").getAttribute("data-spectra");

    var param0 = {
        spectra: "",
        format: "json",
        graphtype: "chromatogram"
    };
    param0["spectra"] = "https://edwardslab.bmcb.georgetown.edu/~nedwards/dropbox/pBYmLSkGeq/"+spectra_folder+"/" + peptideAcc + "." + charger + '.json';
    param0["width"] = pot.clientWidth * 0.995;
    msmsv.showLabelledSpectrum('specpane0','chrom', param0);
    msmsv.addTitles('specpane0', ["XIC: m/z "+pmz], 1, "h3");

    var titles = [];

    var params = {
        spectra: "",
        format: "json",
        scan: "",
        annotations: ""
    };

    // Delete
    // params.spectra = "MS_24_UO1_HCD20_5X25_EThcd_nondplserum_neutry3.mgf";

    params["width"] = pot.clientWidth * 0.995;
    for (var i in paraFromPage) {
        var sc = paraFromPage[i]["scan"];
        var title = paraFromPage[i]["title"];

        params["scan"] = sc;
        //params["spectra"] = "https://cdn.jsdelivr.net/gh/glygen-glycan-data/JSWidgets/MS_Viewer/MS_24_UO1_HCD20_5X25_EThcd_nondplserum_neutry3/" + sc + '.json';
        params["spectra"] = "https://edwardslab.bmcb.georgetown.edu/~nedwards/dropbox/pBYmLSkGeq/" + spectra_folder + "/" + sc + '.json';

        if (paraFromPage[i]["annotations"] == 1) {
            params["annotations"] = "https://edwardslab.bmcb.georgetown.edu/~nedwards/dropbox/pBYmLSkGeq/annotations/" + peptideAcc + "." + charger + ".json";
        } else {
            delete params["annotations"];
        }
        // console.log(params);
        msmsv.showLabelledSpectrum('specpanel','spec'+sc, params);
        titles.push(title);
    }


    msmsv.addTitles('specpanel', titles, 2, "h3");
}

console.log(100);
