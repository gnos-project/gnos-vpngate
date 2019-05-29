<p align="center"><img src="https://gnos.in/img/shot/common/gnos-vpngate_0.png"></img></p>

# VPN Gate Linux client for Softether SSL-VPN protocol

Written with `bash` & `node.js` for [GNOS](https://gnos.in).

## Features

- Configurable profiles
- Linux `netns` isolation
- Scrap VPN Gate using `phantomjs`
- SYN Scan to check servers latency
- Filtering & Selection using `jq`
- Supports both `pkexec` & `sudo`
- Softether SSL-VPN protocol
- HTTP & SOCKS4 proxy support
- Managed DHCP: `dhclient`
- Automatic dependency installation (Ubuntu)

## Usage

```
NAME: vpngate
DESC: VPN Gate client for SoftEther VPN-SSL protocol
AUTH: elias@gnos.in
DEPS: SoftEther vpnclient + vpncmd
DEPS: policykit-1 isc-dhcp-client npm jq
FEAT:
  polkit integration
  GUI server selector
  scapping to JSON cache
  jq filtering & selection
  auto $http_proxy support
  HTTP & SOCKS4 proxy support
  netns (Linux network namespaces)
  user profiles with command execution

USAGE:
  vpngate [ OPTS ... ] [ PROFILE_NAME | PROFILE_PATH [ COMMAND [ ARGS ... ] ] ]
  vpngate -d PROFILE_NAME
  vpngate -l
  vpngate -h

ARGS:
  PROFILE_NAME    Profile name, stored in ~/.config/vpngate/
  PROFILE_PATH    Profile path
  COMMAND         Command to execute, or "null"
  ARGS            Command argument

OPTS:
  -d              Disconnect profile
  -l              List active profiles
  -h              Show help
  -r              Force reconnect
  -u              Force cache update
  -p HTTP_PROXY   HTTP proxy:     [http://][user[:password]@]host[:port]
  -s SOCKS_PROXY  SOCKS4 proxy:  [socks://][user[:password]@]host[:port]
  -g              GUI server selector
  -v              Verbose output

PROFILE-FORMAT:  BASH
  cmd            Command to execute
  proxy          HTTP proxy
  socks          SOCKS4 proxy
  filter         [VPN Gate] Server-list filter, jq select syntax
  select         [VPN Gate] Server-list sorter, jq sort_by syntax
  connect        [VPN] Private server, see args: vpnssl-connect -h

```

## Profile configuration

Profiles are stored in `~/.config/vpngate`.

Profiles files are simple `bash` declarations.

### VPN Gate servers

| Variable |       Default        |         Description         |
|----------|----------------------|-----------------------------|
| `filter` | `'true'`             | `jq` `select()` expression  |
| `select` | `'."SYN scan (ms)"'` | `jq` `sort_by()` expression |
| `mirror` | `""`                 | Alternative Scrapping url   |

<!--
Examples:

```
```
-->

### Forced server

`connect` replaces Scrapping/Filtering/Scanning/Selecting.

|  Variable | Default |    Description    |
|-----------|---------|-------------------|
| `connect` | `''`    | Connection string |

```
IP_ADDR TCP_PORT [ USER_NAME PASSWORD [HUB_NAME] ]
```

Default `USER_NAME` is `vpn` with empty `PASSWORD`, default `HUB_NAME` is `vpngate`.

Examples:

```
# Private server
connect='1.1.1.1 443 my_username "s3cr3t" HUB'

# Forced VPN Gate server: NO credentials required
connect='2.2.2.2 443'
```

### Command & Proxies

| Variable | Default  |                    Description                    |
|----------|----------|---------------------------------------------------|
| `cmd`    | `'bash'` | Command to execute, or `"null"` to keep connected |
| `proxy`  | `''`     | HTTP proxy                                        |
| `socks`  | `''`     | SOCKS proxy                                       |

Examples:

```
cmd='curl -sSL https://wtfismyip.com/text'
cmd='firejail firefox'
```

Content is `eval`-ed so you can write complex commands but *beware* of security implications:

```
cmd='true ; echo "Executed as $(id -u) out of isolation [$(ip netns identify $$)]" '
```

Also have fun with quoting:

```
cmd="bash -c 'echo \"quoted   text\"'"
cmd='bash -c '\''echo "quoted   text"'\'
```

### Application defaults overrides

|    Variable    | Default |                          Description                           |
|----------------|---------|----------------------------------------------------------------|
| `cacheSeconds` | `7200`  | Scrapping cache validity in seconds                            |
| `verbose`      | `""`    | Set to `-v` to force verbose output                            |
| `reconnect`    | `""`    | Set to `-r` to force reconnection                              |
| `update`       | `""`    | Set to `-u` to disable cache                                   |
| `gui`          | `""`    | Set to `-g` to enable GUI server selector                      |
| `mirror`       | `""`    | Scrapping url, read <https://bunkerbustervpn.com/vpngate.html> |

## Installation

### Requirements

- Softether `vpnclient`, integrated with `systemd`.
- Softether `vpncmd`, declared in `PATH`.
- Node.js (lts/10), managed by `nvm`.
- OPTIONAL, `yad` for GUI

### Copy scripts

Put files somewhere, for example `/opt/vpngate`.

### Auto dependencies installation

Tested on latest Ubuntu with NPM configured to run `npm install -g` without sudo.

This will call `pkexec` to gain privileges and pull missing dependencies:

```
vpngate -i
```

### Manual dependencies installation

```
sudo apt-get install npm jq isc-dhcp-client yad
sudo npm install -g phantomjs casperjs
sudo mkdir /opt/vpngate/node_modules
sudo chown $(id -u) /opt/vpngate/node_modules
npm install ip local-ipv4-address raw-socket
# sudo chown -hR root:root /opt/vpngate/node_modules
```

### User alias

To manually sudo instead of default auto pkexec use this alias:

```
alias vpngate="sudo --set-home NVM_BIN="$NVM_BIN" /opt/vpngate/vpngate -v"
```

### Root alias

Set `$SUDO_UID` to empty to run command as root, not recommended.

```
alias vpngate="sudo --set-home SUDO_UID= NVM_BIN="$NVM_BIN" /opt/vpngate/vpngate -v"
```

## Internals

### Caches locations

VPN Gate Scrapping cache is kept at
`~/.cache/vpngate/cache.json`

VPN Gate Profile cache at
`~/.cache/vpngate/PROFILE_NAME/vpngate_{filtered,scanned,sorted,selected}.json`

DHCP caches are
`~/.cache/vpngate/PROFILE_NAME/dhclient{-script,.leases}`

### Caches Format
JSON array of objects, named `data`, attributes:

```
  "Country code"                str notnull empty!
  "DDNS hostname"               str null!
  "IP address"                  str notnull notempty
  "ISP hostname"                str null!
  "Cumulative users"            int null!
  "Cumulative transfers (GB)"   int null!
  "Operator"                    str null!
  "Ping (ms)"                   int null!
  "Score"                       int null!
  "SSL-VPN TCP port"            int notnull
  "SYN scan (ms)"               int notnull
  "Throughput (Mbps)"           int null!
  "Uptime (min)"                int null!
  "VPN sessions"                int null!
```
