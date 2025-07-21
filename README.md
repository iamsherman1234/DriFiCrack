# DriFiCrack
_DriFiCrack is for only Android Rooted_

DriFiCrack is a **brute-force** tool to crack Wi-Fi passwords on WPA2/WPA3 
protected networks using brute force techniques. DriFiCrack is designed for educational purposes only, and should only be used on networks 
that are authorized or have explicit permission to test. 

DriFiCrack must be run as **root**. This is required by the suite 
of programs it uses.

## Feature
- Brute-force password cracking for Wi-Fi **( WPA2/WPA3 )**
- Wifi network scanning to display information such as SSID, Frequency, etc.
- Structured output with colors for clearer results
- Supports password list file for automatic cracking

## Required Programs

* [__Termux__](https://f-droid.org/packages/com.termux/). Android does not have a terminal like Linux in general, so the Termux application is needed to run programs.
* [__Git__](https://git-scm.com/downloads). Required to clone this repository
* [__Nodejs__](https://nodejs.org). DriFiCrack is a Javascript script and requires Nodejs to run for terminal.
* __Root Permission__. Allow root access on Termux so it can run as root.

* Standard android command.
  * tsu, cmd wifi, and whoami

## Install & Execution
Run the commands below:

`apt update && apt upgrade -y`

`apt install nodejs git tsu coreutils -y`

`git clone https://github.com/ZeltNamizake/DriFiCrack`

`cd DriFiCrack && tsu`

`chmod +x drificrack`

`./drificrack --help`

## Licensing
DriFiCrack is licensed under the MIT License. See the LICENSE file for more information.
