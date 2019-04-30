#!/usr/bin/env casperjs

// NAME     VpnGate SSL-VPN servers extractor
// DESC     Outputs valid SSL-VPN peers info as JSON
// AUTH     @
// DEPS     npm install -g phantomjs casperjs
// TEST     phantomjs -v && casperjs --version
// TODO     csv
// WORK     | jq -r '.data | map_values(."IP address" + ":" + (."SSL-VPN TCP port"|tostring) ) []' | tr -d '\r\n []"'

/* BUG: phantomjs logs to sdtout
console.warn = function () {
    require("system").stderr.write(Array.prototype.join.call(arguments, ' ') + '\n');
};
console.error = function () {
    require("system").stderr.write(Array.prototype.join.call(arguments, ' ') + '\n');
};
*/

// INIT
var casper = require('casper').create({
  verbose: true,
  logLevel: 'error',
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
    userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36'
  }
});

var url = casper.cli.get(0);
if (! url) { url='http://www.vpngate.net/en/' ; }

casper.options.onResourceRequested = function(casper, requestData, request) {
  var skip = [
    'www.google-analytics.com',
    'www.googleadservices.com',
    'googleads.g.doubleclick.net',
    'cm.g.doubleclick.net'
  ];
  skip.forEach(function(needle) {
    if (requestData.url.indexOf(needle) > 0) {
      request.abort();
    }
  })
};

// CONS
casper.rowSelector='td#vpngate_inner_contents_td > table#vg_hosts_table_id > tbody > tr';


// FUNC
casper.getCellText=function(row, cell) {
    return casper.evaluate(function(rowSelector, row, cell) {
        return document.querySelectorAll(rowSelector)[row].childNodes[cell].innerText.trim();
    }, this.rowSelector, row, cell);
};

casper.getCountryCode = function(c) {
    // FROM http://vocab.nic.in/rest.php/country/json
    var vocabJson={"countries":[{"country":{"country_id":"AD","country_name":"ANDORRA"}},{"country":{"country_id":"AE","country_name":"UNITED ARAB EMIRATES"}},{"country":{"country_id":"AF","country_name":"AFGHANISTAN"}},{"country":{"country_id":"AG","country_name":"ANTIGUA AND BARBUDA"}},{"country":{"country_id":"AI","country_name":"ANGUILLA"}},{"country":{"country_id":"AL","country_name":"ALBANIA"}},{"country":{"country_id":"AM","country_name":"ARMENIA"}},{"country":{"country_id":"AN","country_name":"NETHERLANDS ANTILLES"}},{"country":{"country_id":"AO","country_name":"ANGOLA"}},{"country":{"country_id":"AQ","country_name":"ANTARCTICA"}},{"country":{"country_id":"AR","country_name":"ARGENTINA"}},{"country":{"country_id":"AS","country_name":"AMERICAN SAMOA"}},{"country":{"country_id":"AT","country_name":"AUSTRIA"}},{"country":{"country_id":"AU","country_name":"AUSTRALIA"}},{"country":{"country_id":"AW","country_name":"ARUBA"}},{"country":{"country_id":"AX","country_name":"\u00c5LAND ISLANDS"}},{"country":{"country_id":"AZ","country_name":"AZERBAIJAN"}},{"country":{"country_id":"BA","country_name":"BOSNIA AND HERZEGOVINA"}},{"country":{"country_id":"BB","country_name":"BARBADOS"}},{"country":{"country_id":"BD","country_name":"BANGLADESH"}},{"country":{"country_id":"BE","country_name":"BELGIUM"}},{"country":{"country_id":"BF","country_name":"BURKINA FASO"}},{"country":{"country_id":"BG","country_name":"BULGARIA"}},{"country":{"country_id":"BH","country_name":"BAHRAIN"}},{"country":{"country_id":"BI","country_name":"BURUNDI"}},{"country":{"country_id":"BJ","country_name":"BENIN"}},{"country":{"country_id":"BL","country_name":"SAINT BARTH\u00c9LEMY"}},{"country":{"country_id":"BM","country_name":"BERMUDA"}},{"country":{"country_id":"BN","country_name":"BRUNEI DARUSSALAM"}},{"country":{"country_id":"BO","country_name":"BOLIVIA"}},{"country":{"country_id":"BR","country_name":"BRAZIL"}},{"country":{"country_id":"BS","country_name":"BAHAMAS"}},{"country":{"country_id":"BT","country_name":"BHUTAN"}},{"country":{"country_id":"BV","country_name":"BOUVET ISLAND"}},{"country":{"country_id":"BW","country_name":"BOTSWANA"}},{"country":{"country_id":"BY","country_name":"BELARUS"}},{"country":{"country_id":"BZ","country_name":"BELIZE"}},{"country":{"country_id":"CA","country_name":"CANADA"}},{"country":{"country_id":"CC","country_name":"COCOS (KEELING) ISLANDS"}},{"country":{"country_id":"CD","country_name":"CONGO, THE DEMOCRATIC REPUBLIC OF THE"}},{"country":{"country_id":"CF","country_name":"CENTRAL AFRICAN REPUBLIC"}},{"country":{"country_id":"CG","country_name":"CONGO"}},{"country":{"country_id":"CH","country_name":"SWITZERLAND"}},{"country":{"country_id":"CI","country_name":"C\u00d4TE D'IVOIRE"}},{"country":{"country_id":"CK","country_name":"COOK ISLANDS"}},{"country":{"country_id":"CL","country_name":"CHILE"}},{"country":{"country_id":"CM","country_name":"CAMEROON"}},{"country":{"country_id":"CN","country_name":"CHINA"}},{"country":{"country_id":"CO","country_name":"COLOMBIA"}},{"country":{"country_id":"CR","country_name":"COSTA RICA"}},{"country":{"country_id":"CU","country_name":"CUBA"}},{"country":{"country_id":"CV","country_name":"CAPE VERDE"}},{"country":{"country_id":"CX","country_name":"CHRISTMAS ISLAND"}},{"country":{"country_id":"CY","country_name":"CYPRUS"}},{"country":{"country_id":"CZ","country_name":"CZECH REPUBLIC"}},{"country":{"country_id":"DE","country_name":"GERMANY"}},{"country":{"country_id":"DJ","country_name":"DJIBOUTI"}},{"country":{"country_id":"DK","country_name":"DENMARK"}},{"country":{"country_id":"DM","country_name":"DOMINICA"}},{"country":{"country_id":"DO","country_name":"DOMINICAN REPUBLIC"}},{"country":{"country_id":"DZ","country_name":"ALGERIA"}},{"country":{"country_id":"EC","country_name":"ECUADOR"}},{"country":{"country_id":"EE","country_name":"ESTONIA"}},{"country":{"country_id":"EG","country_name":"EGYPT"}},{"country":{"country_id":"EH","country_name":"WESTERN SAHARA"}},{"country":{"country_id":"ER","country_name":"ERITREA"}},{"country":{"country_id":"ES","country_name":"SPAIN"}},{"country":{"country_id":"ET","country_name":"ETHIOPIA"}},{"country":{"country_id":"FI","country_name":"FINLAND"}},{"country":{"country_id":"FJ","country_name":"FIJI"}},{"country":{"country_id":"FK","country_name":"FALKLAND ISLANDS (MALVINAS)"}},{"country":{"country_id":"FM","country_name":"MICRONESIA, FEDERATED STATES OF"}},{"country":{"country_id":"FO","country_name":"FAROE ISLANDS"}},{"country":{"country_id":"FR","country_name":"FRANCE"}},{"country":{"country_id":"GA","country_name":"GABON"}},{"country":{"country_id":"GB","country_name":"UNITED KINGDOM"}},{"country":{"country_id":"GD","country_name":"GRENADA"}},{"country":{"country_id":"GE","country_name":"GEORGIA"}},{"country":{"country_id":"GF","country_name":"FRENCH GUIANA"}},{"country":{"country_id":"GG","country_name":"GUERNSEY"}},{"country":{"country_id":"GH","country_name":"GHANA"}},{"country":{"country_id":"GI","country_name":"GIBRALTAR"}},{"country":{"country_id":"GL","country_name":"GREENLAND"}},{"country":{"country_id":"GM","country_name":"GAMBIA"}},{"country":{"country_id":"GN","country_name":"GUINEA"}},{"country":{"country_id":"GP","country_name":"GUADELOUPE"}},{"country":{"country_id":"GQ","country_name":"EQUATORIAL GUINEA"}},{"country":{"country_id":"GR","country_name":"GREECE"}},{"country":{"country_id":"GS","country_name":"SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS"}},{"country":{"country_id":"GT","country_name":"GUATEMALA"}},{"country":{"country_id":"GU","country_name":"GUAM"}},{"country":{"country_id":"GW","country_name":"GUINEA-BISSAU"}},{"country":{"country_id":"GY","country_name":"GUYANA"}},{"country":{"country_id":"HK","country_name":"HONG KONG"}},{"country":{"country_id":"HM","country_name":"HEARD ISLAND AND MCDONALD ISLANDS"}},{"country":{"country_id":"HN","country_name":"HONDURAS"}},{"country":{"country_id":"HR","country_name":"CROATIA"}},{"country":{"country_id":"HT","country_name":"HAITI"}},{"country":{"country_id":"HU","country_name":"HUNGARY"}},{"country":{"country_id":"ID","country_name":"INDONESIA"}},{"country":{"country_id":"IE","country_name":"IRELAND"}},{"country":{"country_id":"IL","country_name":"ISRAEL"}},{"country":{"country_id":"IM","country_name":"ISLE OF MAN"}},{"country":{"country_id":"IO","country_name":"BRITISH INDIAN OCEAN TERRITORY"}},{"country":{"country_id":"IQ","country_name":"IRAQ"}},{"country":{"country_id":"IR","country_name":"IRAN, ISLAMIC REPUBLIC OF"}},{"country":{"country_id":"IS","country_name":"ICELAND"}},{"country":{"country_id":"IT","country_name":"ITALY"}},{"country":{"country_id":"JE","country_name":"JERSEY"}},{"country":{"country_id":"JM","country_name":"JAMAICA"}},{"country":{"country_id":"JO","country_name":"JORDAN"}},{"country":{"country_id":"JP","country_name":"JAPAN"}},{"country":{"country_id":"KE","country_name":"KENYA"}},{"country":{"country_id":"KG","country_name":"KYRGYZSTAN"}},{"country":{"country_id":"KH","country_name":"CAMBODIA"}},{"country":{"country_id":"KI","country_name":"KIRIBATI"}},{"country":{"country_id":"KM","country_name":"COMOROS"}},{"country":{"country_id":"KN","country_name":"SAINT KITTS AND NEVIS"}},{"country":{"country_id":"KP","country_name":"KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF"}},{"country":{"country_id":"KR","country_name":"KOREA, REPUBLIC OF"}},{"country":{"country_id":"KW","country_name":"KUWAIT"}},{"country":{"country_id":"KY","country_name":"CAYMAN ISLANDS"}},{"country":{"country_id":"KZ","country_name":"KAZAKHSTAN"}},{"country":{"country_id":"LA","country_name":"LAO PEOPLE'S DEMOCRATIC REPUBLIC"}},{"country":{"country_id":"LB","country_name":"LEBANON"}},{"country":{"country_id":"LC","country_name":"SAINT LUCIA"}},{"country":{"country_id":"LI","country_name":"LIECHTENSTEIN"}},{"country":{"country_id":"LK","country_name":"SRI LANKA"}},{"country":{"country_id":"LR","country_name":"LIBERIA"}},{"country":{"country_id":"LS","country_name":"LESOTHO"}},{"country":{"country_id":"LT","country_name":"LITHUANIA"}},{"country":{"country_id":"LU","country_name":"LUXEMBOURG"}},{"country":{"country_id":"LV","country_name":"LATVIA"}},{"country":{"country_id":"LY","country_name":"LIBYAN ARAB JAMAHIRIYA"}},{"country":{"country_id":"MA","country_name":"MOROCCO"}},{"country":{"country_id":"MC","country_name":"MONACO"}},{"country":{"country_id":"MD","country_name":"MOLDOVA, REPUBLIC OF"}},{"country":{"country_id":"ME","country_name":"MONTENEGRO"}},{"country":{"country_id":"MF","country_name":"SAINT MARTIN"}},{"country":{"country_id":"MG","country_name":"MADAGASCAR"}},{"country":{"country_id":"MH","country_name":"MARSHALL ISLANDS"}},{"country":{"country_id":"MK","country_name":"MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF"}},{"country":{"country_id":"ML","country_name":"MALI"}},{"country":{"country_id":"MM","country_name":"MYANMAR"}},{"country":{"country_id":"MN","country_name":"MONGOLIA"}},{"country":{"country_id":"MO","country_name":"MACAO"}},{"country":{"country_id":"MP","country_name":"NORTHERN MARIANA ISLANDS"}},{"country":{"country_id":"MQ","country_name":"MARTINIQUE"}},{"country":{"country_id":"MR","country_name":"MAURITANIA"}},{"country":{"country_id":"MS","country_name":"MONTSERRAT"}},{"country":{"country_id":"MT","country_name":"MALTA"}},{"country":{"country_id":"MU","country_name":"MAURITIUS"}},{"country":{"country_id":"MV","country_name":"MALDIVES"}},{"country":{"country_id":"MW","country_name":"MALAWI"}},{"country":{"country_id":"MX","country_name":"MEXICO"}},{"country":{"country_id":"MY","country_name":"MALAYSIA"}},{"country":{"country_id":"MZ","country_name":"MOZAMBIQUE"}},{"country":{"country_id":"NA","country_name":"NAMIBIA"}},{"country":{"country_id":"NC","country_name":"NEW CALEDONIA"}},{"country":{"country_id":"NE","country_name":"NIGER"}},{"country":{"country_id":"NF","country_name":"NORFOLK ISLAND"}},{"country":{"country_id":"NG","country_name":"NIGERIA"}},{"country":{"country_id":"NI","country_name":"NICARAGUA"}},{"country":{"country_id":"NL","country_name":"NETHERLANDS"}},{"country":{"country_id":"NO","country_name":"NORWAY"}},{"country":{"country_id":"NP","country_name":"NEPAL"}},{"country":{"country_id":"NR","country_name":"NAURU"}},{"country":{"country_id":"NU","country_name":"NIUE"}},{"country":{"country_id":"NZ","country_name":"NEW ZEALAND"}},{"country":{"country_id":"OM","country_name":"OMAN"}},{"country":{"country_id":"PA","country_name":"PANAMA"}},{"country":{"country_id":"PE","country_name":"PERU"}},{"country":{"country_id":"PF","country_name":"FRENCH POLYNESIA"}},{"country":{"country_id":"PG","country_name":"PAPUA NEW GUINEA"}},{"country":{"country_id":"PH","country_name":"PHILIPPINES"}},{"country":{"country_id":"PK","country_name":"PAKISTAN"}},{"country":{"country_id":"PL","country_name":"POLAND"}},{"country":{"country_id":"PM","country_name":"SAINT PIERRE AND MIQUELON"}},{"country":{"country_id":"PN","country_name":"PITCAIRN"}},{"country":{"country_id":"PR","country_name":"PUERTO RICO"}},{"country":{"country_id":"PS","country_name":"PALESTINIAN TERRITORY, OCCUPIED"}},{"country":{"country_id":"PT","country_name":"PORTUGAL"}},{"country":{"country_id":"PW","country_name":"PALAU"}},{"country":{"country_id":"PY","country_name":"PARAGUAY"}},{"country":{"country_id":"QA","country_name":"QATAR"}},{"country":{"country_id":"RE","country_name":"REUNION"}},{"country":{"country_id":"RO","country_name":"ROMANIA"}},{"country":{"country_id":"RS","country_name":"SERBIA"}},{"country":{"country_id":"RU","country_name":"RUSSIAN FEDERATION"}},{"country":{"country_id":"RW","country_name":"RWANDA"}},{"country":{"country_id":"SA","country_name":"SAUDI ARABIA"}},{"country":{"country_id":"SB","country_name":"SOLOMON ISLANDS"}},{"country":{"country_id":"SC","country_name":"SEYCHELLES"}},{"country":{"country_id":"SD","country_name":"SUDAN"}},{"country":{"country_id":"SE","country_name":"SWEDEN"}},{"country":{"country_id":"SG","country_name":"SINGAPORE"}},{"country":{"country_id":"SH","country_name":"SAINT HELENA"}},{"country":{"country_id":"SI","country_name":"SLOVENIA"}},{"country":{"country_id":"SJ","country_name":"SVALBARD AND JAN MAYEN"}},{"country":{"country_id":"SK","country_name":"SLOVAKIA"}},{"country":{"country_id":"SL","country_name":"SIERRA LEONE"}},{"country":{"country_id":"SM","country_name":"SAN MARINO"}},{"country":{"country_id":"SN","country_name":"SENEGAL"}},{"country":{"country_id":"SO","country_name":"SOMALIA"}},{"country":{"country_id":"SR","country_name":"SURINAME"}},{"country":{"country_id":"ST","country_name":"SAO TOME AND PRINCIPE"}},{"country":{"country_id":"SV","country_name":"EL SALVADOR"}},{"country":{"country_id":"SY","country_name":"SYRIAN ARAB REPUBLIC"}},{"country":{"country_id":"SZ","country_name":"SWAZILAND"}},{"country":{"country_id":"TC","country_name":"TURKS AND CAICOS ISLANDS"}},{"country":{"country_id":"TD","country_name":"CHAD"}},{"country":{"country_id":"TF","country_name":"FRENCH SOUTHERN TERRITORIES"}},{"country":{"country_id":"TG","country_name":"TOGO"}},{"country":{"country_id":"TH","country_name":"THAILAND"}},{"country":{"country_id":"TJ","country_name":"TAJIKISTAN"}},{"country":{"country_id":"TK","country_name":"TOKELAU"}},{"country":{"country_id":"TL","country_name":"TIMOR-LESTE"}},{"country":{"country_id":"TM","country_name":"TURKMENISTAN"}},{"country":{"country_id":"TN","country_name":"TUNISIA"}},{"country":{"country_id":"TO","country_name":"TONGA"}},{"country":{"country_id":"TR","country_name":"TURKEY"}},{"country":{"country_id":"TT","country_name":"TRINIDAD AND TOBAGO"}},{"country":{"country_id":"TV","country_name":"TUVALU"}},{"country":{"country_id":"TW","country_name":"TAIWAN, PROVINCE OF CHINA"}},{"country":{"country_id":"TZ","country_name":"TANZANIA, UNITED REPUBLIC OF"}},{"country":{"country_id":"UA","country_name":"UKRAINE"}},{"country":{"country_id":"UG","country_name":"UGANDA"}},{"country":{"country_id":"UM","country_name":"UNITED STATES MINOR OUTLYING ISLANDS"}},{"country":{"country_id":"US","country_name":"UNITED STATES"}},{"country":{"country_id":"UY","country_name":"URUGUAY"}},{"country":{"country_id":"UZ","country_name":"UZBEKISTAN"}},{"country":{"country_id":"VA","country_name":"HOLY SEE (VATICAN CITY STATE)"}},{"country":{"country_id":"VC","country_name":"SAINT VINCENT AND THE GRENADINES"}},{"country":{"country_id":"VE","country_name":"VENEZUELA"}},{"country":{"country_id":"VG","country_name":"VIRGIN ISLANDS, BRITISH"}},{"country":{"country_id":"VI","country_name":"VIRGIN ISLANDS, U.S."}},{"country":{"country_id":"VN","country_name":"VIET NAM"}},{"country":{"country_id":"VU","country_name":"VANUATU"}},{"country":{"country_id":"WF","country_name":"WALLIS AND FUTUNA"}},{"country":{"country_id":"WS","country_name":"SAMOA"}},{"country":{"country_id":"YE","country_name":"YEMEN"}},{"country":{"country_id":"YT","country_name":"MAYOTTE"}},{"country":{"country_id":"ZA","country_name":"SOUTH AFRICA"}},{"country":{"country_id":"ZM","country_name":"ZAMBIA"}},{"country":{"country_id":"ZW","country_name":"ZIMBABWE"}},{"country":{"country_id":"IN","country_name":"INDIA"}}]};

    var p=c.replace(/[^A-z]/g, "").toLowerCase();

    var m=vocabJson.countries.filter(function (o) {
        return o.country.country_name.replace(/[^A-z]/g, "").toLowerCase() === p ;
    });

    try {
        return m[0].country.country_id ;
    } catch (e) {}
    return "";
};

casper.normalizeString = function(s) {
    return typeof s != 'undefined' ? s.replace(/[^\x00-\x7F]/g, "") : null ;
};
casper.normalizeFloat = function(f) {
    return typeof f != 'undefined' ? parseFloat( f.replace(/[^\d\.]/g,''), 2 ) : null ;
};
casper.normalizeInt = function(i) {
    return typeof i != 'undefined' ? parseInt( i.replace(/[^\d\.]/g,''), 10 ) : null ;
};
casper.renderJSON = function(o) {
    return this.echo('{"data":'+JSON.stringify(o, null, '  ')+'}');
};
casper.dbg = function(s) {
    require("system").stderr.write('DEBUG:' + s + '\n');
};


// MAIN
casper.start(url);
    
// wait checkboxes
casper.then(function() {
    this.waitForSelector('#C_L2TP',function() {
        // this.echo("# got checkbox C_L2TP");
        this.click('#C_L2TP');
    });
});
casper.then(function() {
    this.waitForSelector('#C_OpenVPN',function() {
        // this.echo("# got checkbox C_OpenVPN");
        this.click('#C_OpenVPN');
    });
});
casper.then(function() {
    this.waitForSelector('#C_SSTP',function() {
        // this.echo("# got checkbox C_SSTP");
        this.click('#C_SSTP');
    });
});
// wait for submit button
casper.then(function() {
    this.waitForSelector('#Button3',function() {
        // this.echo("# got button Button3");
        this.click('#Button3');
    });
});
// wait for table
casper.then(function() {
    this.waitForSelector(this.rowSelector, function() {
        // this.echo("# got data table");
    });
});

// count rows
casper.then(function() {
    var rows = casper.evaluate(function(rowSelector) {
        return document.querySelectorAll(rowSelector);
    }, this.rowSelector);
    length = rows.length;
    // this.echo("# table length: " + length);
});

// parse rows
casper.then(function() {

    var entries=0;
    var a=[];
    for (var row = 0; row < length; row++) {

        var o={}
        var r;

        // Ignore header rows
        var hclass=casper.evaluate(function(rowSelector, row) {
            return document.querySelectorAll(rowSelector)[row].childNodes[1].className;
        }, this.rowSelector, row);
        if (hclass=='vg_table_header') continue;


        // Country + (Physical location)
        r=/^(.*)(\n\((.*)\))?/;
        m=this.getCellText(row, 1).match( r );
        // this.echo("Country                      "+m[1]);
        // // UNSED
        // // this.echo("Physical location            "+m[3]);
        var c=this.normalizeString(m[1]);
        // o["Country"]=c;
        o["Country code"]=casper.getCountryCode(c);


        // DDNS hostname + IP Address + (ISP hostname)
        r=/^(.*)\n(.*)(\n\((.*)\))?/;
        m=this.getCellText(row, 2).match(r);
        // this.echo("DDNS hostname                "+m[1]);
        // this.echo("IP address                   "+m[2]);
        // this.echo("ISP hostname                 "+m[4]);
        o["DDNS hostname"]=this.normalizeString(m[1]);
        o["IP address"]=this.normalizeString(m[2]);
        o["ISP hostname"]=this.normalizeString(m[4]);


        // VPN sessions + Uptime + Cumulative users
        r=/^([\d\,.]+) sessions\n([\d\,.]+) (.*)\nTotal ([\d\,.]+) users/;
        m=this.getCellText(row, 3).match(r);
        // this.echo("VPN sessions                 "+m[1]);
        // this.echo("Uptime value                 "+m[2]);
        // this.echo("Uptime unit                  "+m[3]);
        // this.echo("Cumulative users             "+m[4]);
        o["VPN sessions"]=this.normalizeInt(m[1]);

        // Uptime calculator
        // o["Uptime value"]=this.normalizeInt(m[2]);
        // o["Uptime unit"]=this.normalizeString(m[3]);
        var uval=this.normalizeInt(m[2]);
        var uuni=this.normalizeString(m[3]);
        if ( ( uval !== null)  && uuni ) {
            // o["Uptime"]=uval+" "+uuni;
            switch (uuni) {
              case 'months':o["Uptime (min)"]=uval*60*24*30;break;
              case 'days':  o["Uptime (min)"]=uval*60*24;   break;
              case 'hours': o["Uptime (min)"]=uval*60;      break;
              default:      o["Uptime (min)"]=uval;         break; // mins
            }
        }
        else {
            // o["Uptime"]=null;
            o["Uptime (min)"]=null;
        }

        o["Cumulative users"]=this.normalizeInt(m[4]);

        // Throughput + Ping + "" + Cumulative transfers + Logging policy
        r=/^([\d\,.]+) Mbps\nPing: (([\d\,.]+) ms|\-)\n\n([\d\,.]+) GB\n/;
        // UNUSED Logging policy:\n([\d\,.]+) (.*)/;
        m=this.getCellText(row, 4).match(r);
        // this.echo("Throughput (Mbps)            "+m[1]);
        // this.echo("Ping (ms)                    "+m[3]);
        // this.echo("Cumulative transfers (GB)    "+m[4]);
        // // UNUSED
        // // this.echo("Logging policy value         "+m[6]);
        // // this.echo("Logging policy unit          "+m[7]);
        o["Cumulative transfers (GB)"]=this.normalizeFloat(m[4]);
        o["Throughput (Mbps)"]=this.normalizeFloat(m[1]);
        o["Ping (ms)"]=this.normalizeInt(m[3]);

        // [SSL-VPN]: "Connect guide" + TCP? + UDP?
        r=/\nConnect guide(\nTCP: (\d+))?(\nUDP: (Supported))?/;
        m=this.getCellText(row, 5).match(r);
        // this.echo("SSL-VPN TCP port                "+m[2]);
        // this.echo("SSL-VPN UDP support             "+m[4]);
        // o["SSL-VPN UDP support"]=m[4] ? true : false ;
        o["SSL-VPN TCP port"]=this.normalizeInt(m[2]);

        // [L2TP/IPsec]: NOT IMPLEMENTED (UDP 500,4500)

        // [OpenVPN]:    NOT IMPLEMENTED
        
        // [MS-SSTP]:    NOT IMPLEMENTED

        // name + (Operator's message)
        r=/^(.*)(\n\((.*)\))?/;
        m=this.getCellText(row, 9).match(r);
        // this.echo("Operator name                "+m[1]);
        // // UNSED
        // // this.echo("Operator message             "+m[2]);
        o["Operator"]=this.normalizeString(m[1]).replace(/^By /g, "").replace(/'s owner/g, "");

        // Score
        r=/^([\d\,.]+)/;
        m=this.getCellText(row, 10).match(r);
        // this.echo("Score                        "+m[1]);
        o["Score"]=this.normalizeInt(m[1]);


        // CHECK IP:PORT
        if (! o["IP address"] || ! o["SSL-VPN TCP port"] ) { continue; }

        // LOOP
        a.push(o);
        entries++;
        // this.renderJSON(o);
    }
    this.renderJSON(a);
    // this.echo("# "+entries+" entries found");
});

casper.run();
