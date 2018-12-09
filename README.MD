# E-Mount Traffic Samples
This repo contains captured message traces from the E-Mount bus. They can be obtained by using the [E-Mount](https://github.com/LexOptical/E-Mount) firmware. To capture traffic refer to the `Config.h` file documenation in that repo.

These trace files are quite messy right now as the firmware is not double buffering the data it returns to the host computer. As such messages are often interupted by clock events. see below.

## File naming
File names act as metadata. camera-manufacturer-focallength-aperture-focusposition

## File format (temporary)
* Messages:
    * Start on a new line with the direction indicator
    * The the message ID byte
    * Message fulltext
    * Timestamp
* Blocks inclosed in square braces are clock line metadata where a captial letter means logical high and lower case means logical low. eg [l:26210322] means the lens to body sync line went low at timestamp 26210322 

## Utilities
Some scripts and utilities are provided in the `utilities` directory. These are written in JS for Node.js