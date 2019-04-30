#!/usr/bin/env node
// DESC     Evented SYN-scanner
// FEAT     JSON-workflow
// FEAT     timed out 
// DEPS     npm install raw-socket ip local-ipv4-address
// DEPS     apt install net-tools
// TODO     timeout from process.argv[3] with default


// DEPS
var localIpV4Address = require("local-ipv4-address");
var raw = require("raw-socket");
var ip = require('ip');
var fs = require('fs');
var util = require('util');


// CONST
var timeout=2000;
var outputColumnName="SYN scan (ms)";
var inputIpColumnName="IP address";
var inputTcpColumnName="SSL-VPN TCP port";


// INIT: input JSON
try {
    var a=JSON.parse( fs.readFileSync(process.argv[2]) );
  } catch (err) {
    console.log(err);
    process.exit();
}


// INIT: raw SOCKET
try {

    var socket = raw.createSocket({
        protocol: raw.Protocol.TCP, // See http://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml
        addressFamily: raw.AddressFamily.IPv4
    });

    socket.setOption(
        raw.SocketLevel.IPPROTO_IP,
        raw.SocketOption.IP_HDRINCL,
        new Buffer ([0x00, 0x00, 0x00, 0x01]),
        4
    );

    socket.setMaxListeners(0);

  } catch (err) {
    console.log(err)
    process.exit();
}


// MAIN
localIpV4Address().then(ipAddress => {
    a.data.forEach(function (val, index, array) {
      send(socket, ipAddress, 0, val[inputIpColumnName], val[inputTcpColumnName], a.data[index]);
    });
  });


// POST
setTimeout(function() {

  socket.close();
  var b=[];

  // filter in time replies
  a.data.forEach(function (val, index, array) {
    if (val[outputColumnName]<timeout) b.push(val);
  });

  // UNUSED sort by latency
  // b.sort(function(a, b){
  //   return ( a[outputColumnName] > b[outputColumnName] ) ? 1 : ( (b[outputColumnName] > a[outputColumnName] ) ? -1 : 0);
  // });

  // JSON output
  process.stdout.write('{"data":'+JSON.stringify(b, null, '  ')+'}');
  process.exit();

}, timeout);


// send() adapted FROM: https://gist.github.com/maxvyaznikov/46fd265427ce3d59484c
function send(socket, src_ip, src_port, dst_ip, dst_port, obj) {

    var ipBuffer = new Buffer([
        0x45,                   // IP: Version (0x45 is IPv4)
        0x00,                   // IP: Differentiated Services Field
        0x00,0x2c,              // IP: Total Length
        0x00,0x00,              // IP: Identification
        0x40,                   // IP: Flags (0x20 Don't Fragment)
        0x00,                   // IP: Fragment Offset
        0x40,                   // IP: TTL (0x40 is 64)
        0x06,                   // IP: protocol (ICMP=1, IGMP=2, TCP=6, UDP=17, static value)
        0x00,0x00,              // IP: checksum for IP part of this packet
        0x00,0x00,0x00,0x00,    // IP: ip src
        0x00,0x00,0x00,0x00,    // IP: ip dst
    ]);

    ipBuffer.writeUInt16BE(parseInt(Math.random()*0xffff), 4); // IP: set identification
    ip.toBuffer(src_ip, ipBuffer, 12); // IP: save ip src (src_ip var) into the buffer
    ip.toBuffer(dst_ip, ipBuffer, 16); // IP: save ip dst (dst_ip var) into the buffer
    
    raw.writeChecksum(ipBuffer, 10, raw.createChecksum(ipBuffer));

    var tcpBuffer = new Buffer([
        0x00,0x00,              // TCP: src port (should be random)
        0x00,0x00,              // TCP: dst port (should be the port you want to scan)
        0x00,0x00,0x00,0x00,    // TCP: sequence number (should be random)
        0x00,0x00,0x00,0x00,    // TCP: acquitment number (must be null because WE are intiating the SYN, static value)
        0x00,0x02,              // TCP: header length (data offset) && flags (fin=1,syn=2,rst=4,psh=8,ack=16,urg=32, static value)
        0x72,0x10,              // TCP: window
        0x00,0x00,              // TCP: checksum for TCP part of this packet)
        0x00,0x00,              // TCP: ptr urgent
        0x02,0x04,              // TCP: options
        0x05,0xb4,              // TCP: padding (mss=1460, static value)
        0x04,0x02,              // TCP: SACK Permitted (4) Option
        0x08,0x0a,              // TCP: TSval, Length
            0x01,0x75,0xdd,0xe8,// value
            0x00,0x00,0x00,0x00,// TSecr
        0x01,                   // TCP: NOP
        0x03,0x03,0x07          // TCP: Window scale
    ]);

    tcpBuffer.writeUInt32BE(parseInt(Math.random()*0xffffffff), 4); // TCP: create random sequence number
    tcpBuffer.writeUInt8(tcpBuffer.length << 2, 12); // TCP: write Header Length
    tcpBuffer.writeUInt16BE(src_port, 0); // TCP: save src port (src_port var) into the buffer
    tcpBuffer.writeUInt16BE(dst_port, 2); // TCP: save dst port (port var) into the buffer

    var pseudoBuffer = new Buffer([
        0x00,0x00,0x00,0x00,    // IP: ip src
        0x00,0x00,0x00,0x00,    // IP: ip dst
        0x00,
        0x06, // IP: protocol (ICMP=1, IGMP=2, TCP=6, UDP=17, static value)
        (tcpBuffer.length >> 8) & 0xff, tcpBuffer.length & 0xff
    ]);
    ip.toBuffer(src_ip, pseudoBuffer, 0); // IP: save ip src (src_ip var) into the buffer
    ip.toBuffer(dst_ip, pseudoBuffer, 4); // IP: save ip dst (dst_ip var) into the buffer
    pseudoBuffer = Buffer.concat([pseudoBuffer, tcpBuffer]);

    raw.writeChecksum(tcpBuffer, 16, raw.createChecksum(pseudoBuffer));


    socket.on("message", function(buffer, source) {
        var port = buffer[0x14] * 0x100 + buffer[0x15];
        if (source == dst_ip && port == dst_port) {
            obj[outputColumnName]=new Date()-obj[outputColumnName];
        }
    });

    var buffer = Buffer.concat([ipBuffer, tcpBuffer]);

    socket.send(buffer, 0, buffer.length, dst_ip, function(){obj[outputColumnName]=new Date()}, null);
    // DOC: socket.send(tcpBuffer, 0, tcpBuffer.length, dst_ip, beforeSend, afterSend);
}

