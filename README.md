# ioBroker-MessageHandler

Protokollierung von Nachrichten / Ereignissen in ioBroker.

Die Idee ist es, alle relevanten Informationen auf "einen Blick" zu erkennen. 
Wichtige und kritische Ereignisse werden daher in der Liste zentral oben platziert. 
Unwichtigere Informationen eher unten.

Nachrichten können damit als kompakte Darstellung des globalen Systemzustands in VIS/Lovelace verwendet werden.
Zusätzlich gibt es die Möglichkeit mit einer Nachricht Ereignisse zu verknüpfen und beim Erstellen der Narchicht automatisch auszulösen
(Senden einer Email, Telegram-Pushnachricht, Pushover-Nachricht, etc.).

Beispiel-VIS-Ansicht im Material Design:
![Material](https://github.com/St0Ma/ioBroker-MessageHandler/blob/master/vis/demo_messagehandler.gif)

Beispiel-Lovelace-Ansicht:
![Lovelace](https://github.com/St0Ma/ioBroker-MessageHandler/blob/master/vis/lovelace.png)


Beispiele für Nachrichten:
- Alarmanlage ausgelöst!
- Wasseralarm
- Erinnerung Fenster lüften!
- Erinnerung Fenster zu lange geöffnet!
- Aktuell offene Fenster
- Aktuell offene Türen
- Lichter angeschaltet
- Aktive Steckdosen
- Letzter Einwurf Post im Briefkasten
- Nächster Müllabfuhrtermin mit Information zur Tonne
- Ausgabe Temperatur / Luftfeuchte
- DWD Wetterwarnung
- Bewegung erkannt
- Internetverbindung Offline
- Termine des Tages
- Termine morgen
- ...



# Kernfunktionen:

- Ermöglicht es Nachrichten aus Skripten auszulösen und zu entfernen. Dies kann über zwei Wege erfolgen:
   - **Automatisches Erzeugen/Entfernen von Nachrichten** über das Javascript MessageStateCreator.
  
       - Es werden konfigurierte Datenpunkte überwacht und bei konfigurierten Bedingungen Nachrichten erzeugt oder auch entfernt. 
       - Die Textausgabe der Nachrichten kann auch konfiguriert werden und dynamisch erzeugt werden.
       - Nachrichten können erst nach einer Verzögerungszeit ausgelöst werden.
       - Nachrichten können kontinuierlich nach einer Wiederholungszeit ausgelöst werden.
    
   - **Javascript-Funktionen postMessage(..) oder removeMessage(..)** für den Einsatz in eigenen Skripten.
   
- Es können entweder alle Nachrichten eines Nachrichtentyps protokolliert werden oder immer nur die letzte eingetretende Nachricht.

- Nachrichten werden nach Prioritäten visuell in VIS dargestellt. Es stehen zwei VIS-Ausgaben zur Verfügung:
   - einfache HTML-Tabelle (ohne Schnickschnack)
   - Material Design CSS 2.0 Card (Voraussetzung ist die Installation des ["Material Design CSS 2.0"](https://github.com/Uhula/ioBroker-Material-Design-Style)

- Nachrichten können (optional) in VIS global oder auch einzeln quittiert (gelöscht) werden.

- Nachrichten können mit einem VIS-View verknüpft werden. Aus dem VIS Widget kann somit direkt in den View verzweigt werden.

- Swipe Gesten im VIS-Widget (nach rechts ziehen ist VIS-View wechseln, geht auch mit Click/Tap Aktion, nach links ziehen ist Nachricht löschen

- Mit einer Nachricht können ein oder mehrere Ereignisse ausgelöst werden:

  - Senden einer Email
  - Senden einer Telegram-Pushnachricht
  - Senden einer Pushover-Nachricht
  - Nachrichtenereignis LIGHT: Die Light-Severity (mit der höchsten Priorität) unter allen Nachrichten mit dem Nachrichtenereignis LIGHT wird in einen Datenpunkt 0_userdata.0.messageHandler.messages.lightSeverity fortgeschrieben.


- Nachrichtendefinition: Nachrichten sind die Grundlage der Meldungen, die später aus Skripten ausgelöst werden.
    Eine Nachricht trägt eine eindeutige ID und Eigenschaften, die die Verarbeitung der Nachricht oder das Verhalten 
    der Ausgabe steuern. Nachrichten werden über eine Konfigurationsstruktur definiert
    und damit wesentliche Eigenschaften der Nachricht bestimmt, darunter:
    
     - Nachrichtenüberschrift
     - Nachrichtentext
     - Kritikalität (Information, Warnung, Alarm etc.) / Priorität
     - Icon für die VIS Ausgabe
     - Farbe des Icons
     - VIS-View
     - Nachrichtenereignis (Senden eines Telegrams / Email)
        

# Installation

1. Das Javascript ["MessageGlobal"](https://github.com/St0Ma/ioBroker-MessageHandler/raw/master/MessageGlobal.js) als globales Script installieren und starten.

2.  Das Javascript ["MessageHandler"](https://github.com/St0Ma/ioBroker-MessageHandler/raw/master/MessageHandler.js) serverseitiges Script installieren und starten-5 Sek warten-stoppen-starten.
    Beim 1.Start werden die notwendigen States unter STATE_PATH = '0_userdata.0.messageHandler.'
    erzeugt. Erst beim 2.Start instanziiert das Script die Event-Handler und läuft dann.

3. Das Javascript ["MessageStateCreator"](https://github.com/St0Ma/ioBroker-MessageHandler/raw/master/MessageStateCreator.js)  installieren und starten (optional)

4. VIS-Ausgabe (optional)

 - Material Design CSS 2.0 Card: Der Inhalt der ["cardMessages.view"](https://github.com/St0Ma/ioBroker-MessageHandler/raw/master/vis/cardMessages.view) kann in VIS als eigener VIEW importiert werden.
 - HTML-Ausgabe: Der Inhalt der ["cardMessages_html.view"](https://github.com/St0Ma/ioBroker-MessageHandler/raw/master/vis/cardMessages_html.view) kann in VIS als eigener VIEW importiert werden.

5. Lovelace-Ausgabe (optional)

  - Erstellen einer "Markdown-Card" mit dem Inhalt aus dem Datenpunkt {0_userdata.0.messageHandler.messages.markdown}.

# Konfiguration

Zur Konfiguration sind zwei Schritte erforderlich:

1. Die Grundkonfiguration erfolgt über die Festlegung von MESSAGE-IDs (Nachrichten-Ids) in der Konstante MESSAGE_IDS
    im Javascript "MessageHandler".  Optional kann mit den Nachrichten auch ein sogenannten Nachrichtenereignisse ausgelöst 
  werden (z.B. Senden einer Email oder TELEGRAM-Pushnachricht).
  Hierfür muss den Nachrichten ein sogenanntes msgEvent zugeordnet werden, dass über 
  die Konstante MESSAGE_EVENT unten im Skript konfiguriert wird.  Optional kann in der Funktion MessageHandler|doInit() 
  eine Anpassung der KONFIGURATION vorgenommen werden.

2. Über das Javascript "MessageStateCreator" können Datenpunkte überwacht werden
   und Nachrichten automatisiert ausgelöst werden.
   Die Konfiguration erfolgt hierfür im Javascript "MessageStateCreator" über die Konstante MESSAGE_EVENTS.
   Im Javascript selbst sind auch Beispiele enthalten, wie die Konfiguration durchgeführt wird.

# Versionshistorie
 *  0.9  - Lovelace Datenpunkt "messages.markdown" hinzugefügt.
          Damit ist es möglich die "Übersicht aller Nachrichten" als Markdown in Lovelace anzuzeigen.
        - Fix Error "setForeignState: Error: The state property "ack" has the wrong type "number" (should be "boolean")"
 * 0.7  - Integration neues Nachrichtenereignis PUSHOVER, Fix Spaltenbreite in VIS
 * 0.6  - Upgrade auf MDCSS 2.5, Unterstützung Swipe-Gesten, Nachrichtenereignis LIGHT
 * 0.5  - MessageHandler: Neues Attribut visView: VIS-Viewname auf dem über die Message verlinkt werden kann.
        MessageStateCreator: - Erweiterung um Attribute Wartezeit delayTime und Wiederholungszeit repatTime
        Möglichkeit der Zahlenformatierung über Attribute decimals und format
 * 0.4  - Ergänzung, um Nachrichtenereignissse (Telegram und Email)
        - Ergänzung, um Nachrichten in VIS zu quittieren.
 *  0.3  - Code Optimierung
 *  0.2  - Initiale Veröffentlichung
