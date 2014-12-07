cloaked-ninja
=============

Reactive mp3 downloader from grooveshark, youtube and soundcloud. Link your soundcloud and dropbox to cloaked-ninja, it will download all your likes to dropbox folder.

Installation
============
#####Virtualenv for node.js (optional)
pip install -r requirements.txt
nodeenv -p

#####Node.js requirements
npm install

#####Usage
This is the early stage of the cloaked-ninja and have only grooveshark url download feature.

1. Run server ``node server.js``
2. Open url ``http://localhost:3142/?f=URL_ENCODED_GROOVESHARK_TRACK_URL``