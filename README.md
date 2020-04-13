# ioBroker-MessageHandler

Protokollierung von Nachrichten / Ereignissen in ioBroker.
Nachrichten können damit als kompakte Darstellung des globalen Systemzustands in VIS verwendet werden.

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
- Termine des Tages
- Termine morgen

Die Idee ist es, alle relevanten Informationen auf "einen Blick" zu erkennen. 
Wichtige und kritische Ereignisse werden daher in der Liste zentral oben platziert. 
Unwichtigere Informationen eher unten.


# Kernfunktionen:

- Ermöglicht es Nachrichten aus Skripten auszulösen und zu entfernen. Dies kann über zwei Wege erfolgen:
- Automatisches Erzeugen/Entfernen von Nachrichten über das Javascript MessageStateCreator.
  Es werden konfigurierte Datenpunkte überwacht und bei konfigurierten Bedingungen Nachrichten erzeugt oder auch entfernt. 
  Die Textausgabe der Nachrichten kann auch konfiguriert werden und dynamisch erzeugt werden.
- Aufruf Javascript-Funktionen postMessage(..) oder removeMessage(..)
- Es können entweder alle Nachrichten eines Nachrichtentyps protokolliert werden oder immer nur die letzte eingetretende Nachricht.

- Nachrichten werden nach Prioritäten visuell in VIS dargestellt. Es stehen zwei VIS-Ausgaben zur Verfügung:
  -- einfache HTML-Tabelle (ohne Schnickschnack)
  -- Material Design CSS 2.0 Card für Uhula.

- Nachrichten können (optional) in VIS global quittiert werden.

- Nachrichtendefinition: Nachrichten sind die Grundlage der Meldungen, die später aus Skripten ausgelöst werden.
    Eine Nachricht trägt eine eindeutige ID und Eigenschaften, die die Verarbeitung der Nachricht oder das Verhalten 
    der Ausgabe steuern. Nachrichten werden über eine Konfigurationsstruktur definiert
    und damit wesentliche Eigenschaften der Nachricht bestimmt, darunter:
    
     - Nachrichtenüberschrift
     - Nachrichtentext
     - Kritikalität (Information, Warnung, Alarm etc.) / Priorität
     - Icon für die VIS Ausgabe
     - Farbe des Icons
        

# Installation

1. Das Javascript "MessageGlobal" als globales Script installieren und starten.

2.  Den Javascript "MessageHandler" serverseitiges Script installieren und starten-5 Sek warten-stoppen-starten.
    Beim 1.Start werden die notwendigen States unter STATE_PATH = '0_userdata.0.messageHandler.'
    erzeugt. Erst beim 2.Start instanziiert das Script die Event-Handler und läuft dann.

3. Das Javascript "MessageStateCreator" installieren und starten (optional)

4. VIS-Ausgabe: Für das Material Design CSS von Uhula steht eine eigene Card in Form einer View zur Verfügung.
    Optional gibt es auch eine einfache HTML-Tabellenausgabe als View zur Verfügung.

# Konfiguration

Zur Konfiguration sind zwei Schritte erforderlich:

1. Die Grundkonfiguration erfolgt über die Festlegung von MESSAGE-IDs (Nachrichten-Ids) in der Konstante MESSAGE_IDS
    im Javascript "MessageHandler". 
    Optional kann in der Funktion MessageHandler|doInit() eine Anpassung der KONFIGURATION vorgenommen werden.

2. Über das Javascript "MessageStateCreator" können Datenpunkte überwacht werden
   und Nachrichten automatisiert ausgelöst werden.
   Die Konfiguration erfolgt hierfür im Javascript "MessageStateCreator" über die Konstante MESSAGE_EVENTS.
   Im Javascript selbst sind auch Beispiele enthalten, wie die Konfiguration durchgeführt wird.
