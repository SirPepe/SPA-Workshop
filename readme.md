Single Page Application Workshop
================================

Vorbereitungen
--------------

1. Node.js installieren
2. Ruby installieren
3. Optional: Github-App für Mac oder Windows installieren

Dann:

    sudo gem install compass
    sudo npm install -g yo generator-polymer

Installation der Vorlage
------------------------

    git clone https://github.com/SirPepe/SPA-Workshop.git
    cd SPA-Workshop
    npm install

Server starten
--------------
    cd SPA-Workshop
    node server/index.js

App erstellen
-------------

    yo polymer
    grunt build
    grunt serve

Erstellen eines neuen Polymer-Elements
--------------------------------------

    TODO