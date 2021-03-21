/*******************************************************************************
 * Messagehandler
 * ----------------------------------------------------
 * Protokollierung von Nachrichten für IOBroker.
 * Ermöglicht es Nachrichten global in einer Liste zu erfassen und nach Prioritäten visuell anzuzeigen.
 * ----------------------------------------------------
 * Autor: Github-Name: St0Ma ioBroker-Forum-Name: Tirador 
 * Source:  https://github.com/St0Ma/ioBroker-MessageHandler
 * Support: https://forum.iobroker.net/topic/32207/script-messagehandler-nachrichten-protokollieren-vis
 * ----------------------------------------------------
 * Change Log:
 *  0.9  - Lovelace Datenpunkt "messages.markdown" hinzugefügt.
 *         Damit ist es möglich die "Übersicht aller Nachrichten" als Markdown in Lovelace anzuzeigen.
 *       - Fix Error "setForeignState: Error: The state property "ack" has the wrong type "number" (should be "boolean")"
 * 
 *  0.8  - Fix Telegram chatId Ausgabe
 *  0.7  - Neues Nachrichtenereignis für Pushover, Fix MDCSS Ausgabe (Spaltenbreite)
 *  0.6  - MDCSS 2.5 Unterstützung für Swipe-Gesten, neues Nachrichtenereignis LIGHT
 *  0.5  - Neues Attribut visView: VIS-Viewname auf dem über die Message verlinkt werden kann.
 *  0.4  - Ergänzung, um Nachrichtenereignissse (Telegram und Email)
 *       - Ergänzung, um Nachrichten in VIS zu quittieren.
 *  0.3  - Code Optimierung
 *  0.2  - Initiale Veröffentlichung
 * ---------------------------------------------------- 
 * (c) 2020 by Tirador, MIT License, no warranty, use on your own risc
 ******************************************************************************

 Protokollierung von zentralen Nachrichten.

 Ermöglicht es Nachrichten global in einer Liste zu erfassen und 
 nach Prioritäten visuell in VIS anzuzeigen.
 Es stehen zwei VIS-Ausgaben zur Verfügung:
  - HTML-Tabelle
  - Material Design CSS 2.0 Ausgabe für Uhula.
 
 Nachrichten können damit als Übersicht in VIS verwendet werden, 
 um kompakt die wesentlichen relevanten Informationen darzustellen.

 Beispiele:
 ----------
 - Alarmanlage ausgelöst!
 - Wasseralarm 
 - Erinnerung Fenster lüften!
 - Erinnerung Fenster zu lange geöffnet!
 - Aktuell offene Fenster
 - Aktuell 
 - Aktuell offene Türen
 - Lichter angeschaltet
 - Aktive Steckdosen
 - Post im Briefkasten mit Datum letzter Einwurf
 - Nächster Müllabfuhrtermin mit Information zur Tonne
 - Kühlschrank geöffnet
 - Termine des Tages
 - Termine morgen

*******************************************************************************
 * Installation
*******************************************************************************

 1. Den Expertenmodus im Menüpunkt Skripte aktivieren.
    Das Javascript "MessageGlobal" als globales Script installieren und starten.

 2. Das Javascript "MessageHandler" serverseitiges Script installieren und starten-5 Sek warten-stoppen-starten. 
    Beim 1.Start werden die notwendigen States unter STATE_PATH = '0_userdata.0.messageHandler.' 
    erzeugt. Erst beim 2.Start instanziiert das Script die Event-Handler und läuft dann.

 3. Das Javascript "MessageStateCreator" installieren und starten (optional)

*******************************************************************************
 * Basis-Konfiguration
*******************************************************************************

 Zur Konfiguration sind zwei Schritte erforderlich:

 1. Die Grundkonfiguration erfolgt über die Festlegung von MESSAGE-IDs (Nachrichten-Ids)
  im Javascript "MessageHandler". 

  Optional kann mit den Nachrichten auch ein sogenannten Nachrichtenereignisse ausgelöst 
  werden (z.B. Senden einer Email oder TELEGRAM-Pushnachricht).
  Hierfür muss den Nachrichten ein sogenanntes msgEvent zugeordnet werden, dass über 
  die Konstante MESSAGE_EVENT unten im Skript konfiguriert wird.
  
  Optional kann in der Funktion MessageHandler|doInit() 
  eine Anpassung der KONFIGURATION vorgenommen werden.

 2. Über das Javascript "MessageStateCreator" können Datenpunkte überwacht werden 
   und Nachrichten automatisiert ausgelöst werden. Die Konfiguration erfolgt hierfür im Javascript "MessageStateCreator".
 

*******************************************************************************
 * Definition of MESSAGE-IDs (Nachrichten-Ids)
 ******************************************************************************

 Fehlernachrichten sind die Grundlage der Meldungen, die später aus Skripten ausgelöst werden.
 Eine Fehlernachricht trägt eine eindeutige ID und Eigenschaften, die die Verarbeitung der Nachricht oder das Verhalten der Ausgabe steuern.
 Die Idee ist es, das Verhalten der Steuerung und Ausgabe zu entkoppeln, vom eigentlichen Logging Prozess!

 Die Konfiguration erfolgt über die Konstante MESSAGE_IDS (siehe unten im Skript).
 
 Fehlernachrichten haben die folgenden Eigenschaften:
 
 - Erster Teil (z.B. "MSG_INFO"): Definition der eindeutigen MESSAGE-ID (Nachrichten-ID). Als Konvention sollte diese immer MSG_<ID> tragen.

 - logType: ALL = Protokollierung jeder Nachricht einzeln
            LAST = Protokollierung nur der letzten Nachricht (vorhergehende Nachrichten mit gleicher MESSAGE_ID werden gelöscht).
                   Dies eignet sich beispielsweise für die Protokollierung des letzten Briefkasteneinwurfs, des letzten Anrufs etc.

 - severity: Einstufung der Nachricht in Zustände (Alarm, Fehler, Warnung, Information). 
             Es sind folgende Zuordnungen möglich:
             ALARM = Alarm
             ERROR = Fehler
             WARN  = Warnung
             INFO  = Info

    Über die Severity können separate Vorgaben aller Eigenschaften einer Nachricht gemacht werden (siehe nächsten Abschnitt).
    Somit können Standardeinstellungen auf der Severity-Ebene definiert werden, die für jede Nachricht greifen, 
    sofern Sie in der Nachricht nicht übersteuert werden.

 - priority: Priorität der Nachricht innerhalb aller anderen Nachrichten. Bestimmt die Sortierreihenfolge für die Ausgabe.
             Nachrichten gleicher Priorität werden nach Timestamp sortiert (neueste oben).
             In der Regel wird die Prorität über die Severitys gesteuert und nicht für jede Nachricht separat festgelegt.

 - msgEvent: Definition von Nachrichtenereignissen.  Nachrichtenereignissse werden mit einer Nachricht ausgelöst.
             Es können mit einer Nachricht mehrere Nachrichtenereignisse ausgelöst werden (z.B. Email und Telegram-Pushnachricht).

             Es sind folgende Ereignisse konfigurierbar: 
             - Telegram (TELEGRAM-Adapter ist Voraussetzung)
             - Email (Email-Adapter ist Voraussetzung)
             - Pushover (Pushover-Adapter ist Voraussetzung)
             - LIGHT (für eine Lichtsteuerung)
             Die Konfiguration der Nachrichtenereignisse erfolgt unten im Skript in der Konstante MESSAGE_EVENTS.

 - msgHeader: Kopftext der Nachricht. Hier kann ein Standardtext definiert werden.

 - msgText: Text der Nachricht. im Nachrichtentext sind variable Parameter &1, &2 etc. möglich, die mit der Ausführung der Nachricht ersetzt werden.

 - quit: Die Eigenschaft bestimmt, ob die Nachricht in der VIS-Oberfläche für das Material Design Widget löschbar ist (true).
         Dies ist für alle Meldungen sinnvoll, die nicht "automatisch" durch einen Ablauf wieder zurückgesetzt / entfernt werden.

 - visView: VIS-Viewname auf dem über die Message verlinkt werden kann.

 - mdIcon: Material Design Icon-Name

 - mdIconColor: Material Design Farbcode für das Icon 
 
 - fontColor: HTML-Farbcode für die Schriftfarbe der HTML-Ausgabe (aktuell nicht in der VIS-Ausgabe implementiert)
 
 - backgroundColor: HTML-Farbcode für die Hintergrundfarbe in der HTML-Ausgabe (aktuell nicht in der VIS-Ausgabe implementiert)

*******************************************************************************
 * Definition of MESSAGE_DEFAULTS_BY_SEVERITY (Standardeinstellungen von Nachrichten für SEVERITYs)
 ******************************************************************************

 Über die Severity können separate Vorgaben aller Eigenschaften einer Nachricht gemacht werden.
 Somit können Standardeinstellungen auf der Severity-Ebene definiert werden, die für jede Nachricht greifen, 
 sofern Sie in der Nachrichten-Definition über die Konstante MESSAGE_IDS nicht übersteuert werden.

 Die Konfiguration erfolgt über die Konstante MESSAGE_DEFAULTS_BY_SEVERITY (siehe unten im Skript).
 Es können prinzipiell die gleichen Eigenschaften gesteuert werden, wie für die Nachrichten-Definition selbst.

*******************************************************************************
 * Automatisches Auslösen / Löschen von Nachrichten
*******************************************************************************

 Das automatische Auslösen/Löschen von Nachrichten kann über das zusätzliche Skript
 "MessageStateCreator" erfolgen. Die Dokumentation diesbezüglich ist dort zu finden.

*******************************************************************************
 * Javascript-Funktionen zum Auslösen / Löschen von Nachrichten
*******************************************************************************

 Über das globale Javascript "MessageGlobal" stehen zwei Methoden 
 für das Erzeugen/löschen von Nachrichten zur Verfügung.

 Die Funktion postMessage dient dem Erzeugen von Nachrichten

    postMessage(msgID,  msgText='', countEvents=0, msgHeader='')

 Parameter:
    
    - msgID: eindeutige Nachrichten-ID (definiert in der Konstante MESSAGE_IDS unten)

    - msgText: Nachrichtentext (optional).
              Sofern der Nachrichtentext aus der Nachrichtendefinition stammen 
              soll ist beim Funktionsaufruf undefined als Parameter vorzugeben.

    - countEvents: Information wieviele Ereignisse für die Meldung eingetreten sind.
                   Beispiele:
                    - Anzahl der offenen Fenster
                    - Anzahl der angeschalteten Lichter
                    - Anzahl der Termine des Tages

 Beispiele für das Auslösen von Nachrichten:

    postMessage("HOUSE_ALARM", "Bewegung im Haus"); // Alarm: Bewegung im Haus
    postMessage("OPEN_WINDOW_INFO", "Badezimmer");  // Fenster geöffnet im Badezimmer
    postMessage("WATER_ALARM", "Wasser im Kellerraum."); // Wasseralarm im Kellerraum
    postMessage("LIGHTS_ON_INFO", "Wohnzimmer, Flur, Küche", 5); // 5 Lichter im Flur, Wohnzimmer und Küche sind angeschaltet
    postMessage("DOOR_ISOPEN_INFO", "Haustür"); // Haustür ist geöffnet.

 Die Funktion removeMessage ermöglicht das gezielte entfernen von Nachrichten:

    removeMessage(msgID, msgText='')

 Dies ist nützlich, wenn ein Zustand zurückgenommen werden soll.

 Beispiel:
    
    removeMessage("DOOR_ISOPEN_INFO");

/*******************************************************************************
 * States
*******************************************************************************

Unter dem STATE_PATH (Default STATE_PATH ist '0_userdata.0.messageHandler.') werden die folgenden States erzeugt:
version : Script-Version, wird verwendet um Script-Updates zu erkennen
newMessage : Datenpunkt über den neue Nachrichten / Löschnachrichten ausgelöst werden. 
removeMsgID : Datenpunkt für das einzelne gezielte Löschen von Nachrichten über das VIS Widget

* messages.table        : enthält die table-HTML für ein basic-string (unescaped) Widget
* messages.list         : enthält die list-HTML für ein basic-string (unescaped) Widget
* messages.count        : Anzahl der Log-Zeilen (wenn das Log mit '/:ERROR:|:WARN:/' gefiltert ist, dann ist es die Anzahl der Fehler/Warnungen)
* messages.filter       : Filter, der auch die logCache angewendet wurde im .table/.list zu erzeugen (siehe Filter)
* messages.lastUpdate   : Timestamp des letzten Updates

*******************************************************************************
 * Filter
 ******************************************************************************

 In den filter-States können sowohl strings (Bsp:'ERROR') als auch RegExp-Strings (Bsp:'/WARN|ERROR/') 
 hinterlegt werden. RegExp-Strings werden an den einschließenden  '/' erkannt. Über den ':' kann der Anfang
 eines Feldes mit in den Filter einbezogen werden. 
 Beispiele: 
 '/Fenster|Alarm/' (RegExp) zeigt alle Zeilen an, in denen 'Fenster' oder 'Alarm' in irgendeinem Feld vorkommen
 ':ERROR:' (string) zeigt alle Nachrichten an, mit Typ Fehler
 'Fenster' (string) zeigt alle Nachrichten an, in denen 'Fenster' in irgendeinem Feld vorkommt
 

/*******************************************************************************/


const MESSAGE_IDS = {

        //---------------------------------------------
        // ALARM-Meldungen
        //---------------------------------------------

        // Alarmanlage
        HOUSE_ALARM_ACTIVE: {msgEvent: [''], logType: 'LAST',  severity: 'ALARM',  msgHeader: "Alarm im Haus", msgText: "", quit: true, visView: 'pageSicherheit', mdIcon: 'notification_important', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Wasseralarm
        WATER_ALARM: {msgEvent: [''], logType: 'LAST',  severity: 'ALARM',  msgHeader: "Wasseralarm", msgText: "", quit: true, visView: 'pageSicherheit', mdIcon: 'waves', mdIconColor: '', fontColor: '', backgroundColor: ''},

        //Internet Down
        INTERNET_DOWN: {msgEvent: [''], logType: 'All',  severity: 'ALARM',  msgHeader: "Internetverbindung Offline", msgText: "", quit: true, mdIcon: 'error', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Offener Gefrierschrank
        FREEZER_DOOR_ISOPEN_INFO: {msgEvent: [''], logType: 'LAST',  severity: 'ALARM',  msgHeader: "Gefrierschrank geöffnet", msgText: "Bitte Gefrierschrank schließen", quit: true, mdIcon: 'ac_unit', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Offener Kühlschrank
        FRIDGE_DOOR_ISOPEN_INFO: {msgEvent: [''], logType: 'LAST',  severity: 'ALARM',  msgHeader: "Kühlschrank Garage offen", msgText: "Bitte Kühlschrank schließen", quit: true, mdIcon: 'ac_unit', mdIconColor: '', fontColor: '', backgroundColor: ''},

        //---------------------------------------------
        // WARN-Meldungen
        //---------------------------------------------

        // Offene Fenster Gesamt
        WINDOW_ISOPEN_INFO: {msgEvent: [''], logType: 'LAST',  severity: 'WARN',  msgHeader: "Fenster geöffnet", msgText: "Bitte Fenster schließen", quit: false, visView: 'pageSicherheit',  mdIcon: 'tab', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Fenster länger als x Minuten geöffnet
        WINDOW_ISLONGEROPEN_GARAGE: {msgEvent: [''], logType: 'LAST',  severity: 'WARN',  msgHeader: "Garage", msgText: "Bitte Fenster schließen", quit: false, mdIcon: 'tab', mdIconColor: '', fontColor: '', backgroundColor: ''},
        WINDOW_ISLONGEROPEN_HAUS: {msgEvent: [''], logType: 'LAST',  severity: 'WARN',  msgHeader: "Haustür", msgText: "Bitte Fenster schließen", quit: false, mdIcon: 'tab', mdIconColor: '', fontColor: '', backgroundColor: ''},
    
        // Offene Türen
        DOOR_ISOPEN_INFO: {msgEvent: [''], logType: 'LAST',  severity: 'WARN',  msgHeader: "Fenster geöffnet", msgText: "Bitte Fenster schließen", quit: false, mdIcon: 'meeting_room', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Termine des Tages
        CALENDAR_EVENTS_TODAY: {msgEvent: [''], logType: 'LAST',  severity: 'WARN',  msgHeader: "Heutige Termine", msgText: "", quit: false, mdIcon: 'date_range',  mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Termine von Morgen
        CALENDAR_EVENTS_TOMORROW: {msgEvent: [''], logType: 'LAST',  severity: 'WARN',  msgHeader: "Morgige Termine", msgText: "", quit: false, mdIcon: 'date_range', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Deutscher Wetter Dienst Warnung
        DWD_WARN: {msgEvent: [''], logType: 'LAST',  severity: 'WARN',  msgHeader: "Wetterwarnung", msgText: "", quit: true, visView: 'pageKlima', mdIcon: 'alert-octagon', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Batterie Warnung
        BATTERIE_Warning: {msgEvent: [''], logType: 'LAST',  severity: 'WARN',  msgHeader: "Batterie", msgText: "Bitte Batterie wechseln", quit: false, mdIcon: 'battery_unknown', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Zigbee Warnung
        DECONZ_Warning: {msgEvent: [''], logType: 'LAST',  severity: 'WARN',  msgHeader: "Zigbee", msgText: "Bitte Batterie wechseln", quit: false, mdIcon: 'wifi', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Erinnerung Fenster lüften!
        RAUMKLIMA_INFO: {msgEvent: [''], logType: 'LAST',  severity: 'WARN',  msgHeader: "Lüftungserinnerung", msgText: "Bitte Fenster öffnen", quit: false, mdIcon: 'opacity', mdIconColor: '', fontColor: '', backgroundColor: ''},

         // Batterieüberwachung
        BATTERIE_WARN: {msgEvent: [''], logType: 'LAST',  severity: 'WARN', priority: 300, msgHeader: "Batterie", msgText: "", quit: true, mdIcon: 'battery-unknown', mdIconColor: '', fontColor: '', backgroundColor: ''},


        //---------------------------------------------
        // INFO-Meldungen
        //---------------------------------------------

        // Status Alarmanlage
        HOUSE_ALARM_STATUS: {msgEvent: [''], logType: 'LAST',  severity: 'INFO',  msgHeader: "Alarmanlage", msgText: "", quit: false, visView: 'pageSicherheit', mdIcon: 'security', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Offene Fenster
        WINDOW_ISCLOSED_INFO: {msgEvent: [''], logType: 'LAST',  severity: 'INFO',  msgHeader: "Fenster sind zu", msgText: "", quit: false, mdIcon: 'tab', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Erinnerung Fenster lüften!
        OPEN_WINDOW_INFO: {msgEvent: [''], logType: 'LAST',  severity: 'INFO',  msgHeader: "Lüftungserinnerung", msgText: "Bitte Fenster öffnen", quit: false, mdIcon: 'opacity', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Angeschaltete Lichter
        LIGHTS_ON_INFO: {msgEvent: [''], logType: 'LAST',  severity: 'INFO',  msgHeader: "Licht angeschaltet", msgText: "", quit: false, visView: 'pageLichter', mdIcon: 'highlight', mdIconColor: '', fontColor: '', backgroundColor: ''},
        
        // Aktiv Steckdosen
        PLUGS_ON_INFO: {msgEvent: [''], logType: 'LAST',  severity: 'INFO',  msgHeader: "Steckdosen angeschaltet", msgText: "", quit: false, visView: '',mdIcon: '', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Post im Briefkasten
        LAST_POSTENTRACE_INFO: {msgEvent: ['PUSHOVER_NORMAL', 'LIGHT'], logType: 'LAST',  severity: 'INFO',  msgHeader: "Briefkasten", msgText: "Neue Post im Briefkasten!", mdIcon: 'email-variant', quit: true, mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Müllabfuhr-Termine
        NEXT_GARBAGE_INFO: {msgEvent: [''], logType: 'LAST',  severity: 'INFO',  msgHeader: "Müll", msgText: "Tonne: &1, am &2 ", quit: true, visView: '', mdIcon: 'delete',  mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Anwesende Personen
        PERSONS_AVAILABLE_INFO: {msgEvent: [''], logType: 'LAST',  severity: 'INFO',  msgHeader: "Anwesende Personen", msgText: "", quit: false, visView: '', mdIcon: 'account', mdIconColor: '', fontColor: '', backgroundColor: ''},

        //Kamera Bewegung erkannt
        CAMERA_MOTION: {logType: 'All',  severity: 'INFO',  msgHeader: "Bewegung erkannt", msgText: "", quit: true, visView: '', mdIcon: 'camera_alt', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Verpasster Anruf (des Tages)
        MISSED_CALLS: {msgEvent: [''], logType: 'LAST',  severity: 'INFO',  msgHeader: "Verpasste Anrufe", msgText: "", quit: true, visView: 'pageKommunikation', mdIcon: 'call-missed', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Verpasster Anruf (des Tages)
        LAST_CALL: {msgEvent: [''], logType: 'LAST',  severity: 'INFO',  msgHeader: "Letzter Anruf", msgText: "", quit: true, visView: 'pageKommunikation', mdIcon: 'call-received', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Corono-Statistic 
        CORONA_STATS_CASES: {msgEvent: [''], logType: 'LAST',  severity: 'INFO', priority: 500, msgHeader: "SARS-coV-2", msgText: "", quit: false, visView: '', mdIcon: 'biohazard', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Temperatur
        TEMPERATURE_INFO: {msgEvent: [''], logType: 'LAST',  severity: 'INFO',  msgHeader: "Temperaturen", msgText: "", mdIcon: 'temperature-celsius', quit: false, visView: 'pageKlima', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Sonos
        SONOS_INFO: {msgEvent: [''], logType: 'LAST',  severity: 'INFO',  msgHeader: "Sonos Küche", msgText: "", mdIcon: 'surround-sound', quit: false, visView: 'pageMultimedia', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Logitech Harmony Info
        HARMONY_INFO: {msgEvent: [''], logType: 'LAST',  severity: 'INFO',  msgHeader: "Wohnzimmer Multimedia", msgText: "", mdIcon: 'play-network-outline', quit: false, visView: 'pageMultimedia', mdIconColor: '', fontColor: '', backgroundColor: ''},

        //Spritpreis-Info
        TANK_INFO: {logType: 'LAST',  severity: 'INFO', priority: 400, msgHeader: "Spritpreis", msgText: "", quit: true, mdIcon: 'gas-station', mdIconColor: '', fontColor: '', backgroundColor: ''},

       //Update ioBroker
        UPDATE_INFO: {logType: 'LAST',  severity: 'INFO',  msgHeader: "Update ioBroker", msgText: "", quit: true, mdIcon: 'cached', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Gäste WLAN
        GUEST_WIFI: {msgEvent: [''], logType: 'LAST',  severity: 'INFO',  msgHeader: "WLAN", msgText: "", quit: false, mdIcon: 'wifi', mdIconColor: '', fontColor: '', backgroundColor: ''},

        // Batterieüberwachung
        BATTERIE_INFO: {msgEvent: [''], logType: 'LAST',  severity: 'INFO', priority: 300, msgHeader: "Batterie", msgText: "", quit: true, mdIcon: 'battery-unknown', mdIconColor: '', fontColor: '', backgroundColor: ''},

};

//-----------------------------------------------------------------------
// Sofern in den MESSAGE_IDS nicht alle Attribute vorgegeben sind, 
// greifen die nachfolgenden Standardattribute für 
// die in den MESSAGE_IDS genutzten SEVERITYs 
// Standardmäßig sind dies: INFO, WARN, ERROR und ALARM
//-----------------------------------------------------------------------

const MESSAGE_DEFAULTS_BY_SEVERITY = {
    INFO: {msgEvent: [''], logType: 'ALL',  severity: 'INFO',  priority: 1000, msgHeader: "", msgText: "", quit: false, mdIcon: 'info', mdIconColor: 'mdui-blue', iconColorHtml: '#2E9AFE', fontColor: '', backgroundColor: 'mdui-blue-bg'},
    WARN: {msgEvent: ['LIGHT'], logType: 'ALL',  severity: 'WARN',  priority: 2000, msgHeader: "", msgText: "", quit: false, mdIcon: 'warning', mdIconColor: 'mdui-amber', iconColorHtml: '#FF8000', fontColor: '', backgroundColor: 'mdui-amber-bg'},
    ERROR: {msgEvent: ['LIGHT', 'PUSHOVER_NORMAL'], logType: 'ALL',  severity: 'ERROR', priority: 3000, msgHeader: "", msgText: "", quit: false, mdIcon: 'error', mdIconColor: 'mdui-orange', iconColorHtml: '#FE2E2E',fontColor: '', backgroundColor: 'mdui-orange-bg'},
    ALARM: {msgEvent: ['EMAIL','LIGHT', 'PUSHOVER_EMERGENCY'], logType: 'ALL',  severity: 'ALARM', priority: 4000, msgHeader: "", msgText: "", quit: false, mdIcon: 'error', mdIconColor: 'mdui-red', iconColorHtml: '#FE2E2E', fontColor: '', backgroundColor: 'mdui-red-bg'}
};

//-----------------------------------------------------------------------
// Definition von Nachrichtenereignissen:
// - Telegram (TELEGRAM-Adapter ist Voraussetzung)
// - Email (Email-Adapter ist Voraussetzung)
// - LIGHT (Dieses Nachrichtenereignis ermöglicht eine Lichtsteuerung in Abhängigkeit 
//          der SEVERITY (Info, Warning, Error, Alarm) aller Nachrichten denen das Nachrichtenereignis LIGHT zugeordnet ist.)
// Nachrichtenereignissse werden mit einer Nachricht ausgelöst
//-----------------------------------------------------------------------

const MESSAGE_EVENTS = {
	
    //----------------------
	// Telegram-Konfiguration
    //----------------------
	// - serviceName: 'TELEGRAM' (dieser Wert ist fix und steuert die Skriptlogik)
	// - telegramInstanz: 'telegram.0'
	// - telegramUser: optionale Vorgabe eines Benutzers. Sofern nicht vorgegeben, wird diese Einstellung vom Adapter übernommen.
	// - telegramChatId: optionale Vorgabe einer ChatID. Sofern nicht vorgegeben, wird diese Einstellung vom Adapter übernommen.
	//
    
	TELEGRAM: {serviceName: 'TELEGRAM', telegramInstance: 'telegram.0', telegramUser: '', telegramChatId: '', maxChar: 4000},
	

    //----------------------
	// Pushover-Konfiguration
    //----------------------
	// - serviceName: 'PUSHOVER' (dieser Wert ist fix und steuert die Skriptlogik)
	// - pushoverInstanz: 'pushover.0'
	// - pushoverDevice: optionale Vorgabe eines bestimmten Geräts
    // - pushoverSound: optionale Vorgabe eines Sounds siehe: https://pushover.net/api#sounds
    //                  Sofern nicht definiert, wird kein Sound ausgegeben ("none")
	// - pushoverPriority: Priorität der Nachricht (siehe: https://pushover.net/api#priority
    //                     Lowest Priority (-2)
    //                     Low Priority (-1)
    //                     Normal Priority (0)
    //                     High Priority (1)
    //                     Emergency Priority (2) - Parameter retry und expire sind vorzugeben!
    // - pushoverRetry: The retry parameter specifies how often (in seconds) the Pushover servers will send the same notification to the user.
    //                  Bitte die Hinweise unter https://pushover.net/api#priority beachten!
    // - pushoverExpire: The expire parameter specifies how many seconds your notification will continue to be retried for (every retry seconds).
    //                   Bitte die Hinweise unter https://pushover.net/api#priority beachten!
    
    PUSHOVER_NORMAL: {serviceName: 'PUSHOVER', pushoverInstance: 'pushover.0', pushoverDevice: '', pushoverSound: '', pushoverPriority:0, pushoverRetry: 0 , pushoverExpire: 0, maxChar: 4000},
    PUSHOVER_EMERGENCY: {serviceName: 'PUSHOVER', pushoverInstance: 'pushover.0', pushoverDevice: '', pushoverSound: '', pushoverPriority:2, pushoverRetry: 0 , pushoverExpire: 3600, maxChar: 4000},


    // LoveLace - Benachrichtungen, die direkt im Lovelace Nachrichtensystem ausgegeben werden (experimentell)
    LOVELACE: {serviceName: 'LOVELACE', lovelaceInstance: 'lovelace.0',  maxChar: 4000},


	//----------------------
    // Email-Konfiguration
    //----------------------
	// - serviceName: 'EMAIL' (dieser Wert ist fix und steuert die Skriptlogik)
	// - emailInstance: Vorgabe der Email-Instance (in der Regel ist dies 'email.0').
	// - emailFrom: optionale Vorgabe einer abweichenden Absenderadresse. Sofern nicht vorgegeben, wird diese Einstellung vom Adapter übernommen.
	// - emailTo: optionale Vorgabe von Zieladressen. Sofern nicht vorgegeben, wird diese Einstellung vom Adapter übernommen.
	
    EMAIL: {serviceName: 'EMAIL', emailInstance: 'email.0', emailFrom: '', emailTo: [''] },

    //----------------------    
    // Nachrichtenereignis LIGHT
    // 
    // Dieses Nachrichtenereignis ermöglicht eine Lichtsteuerung in Abhängigkeit der SEVERITY (Info, Warning, Error, Alarm).
    // Beispielsweise können in einem weiteren Skript in Abhängigkeit der SEVERITY Lampen in verschiedenen Farben geschaltet werden:
    // Severity INFO : Blaues Licht
    // Severity Warning: Oranges Licht
    // Severity ERROR: Pinkes Licht
    // Severity ALARM: Rotes Licht
    //
    // Dieses Skript ermittelt aus allen erzeugten Nachrichten 
    // bei denen das Nachrichtenereignis LIGHT definiert ist die maximale Severity.
    // Die maximale Light-Severity wird in einen Datenpunkt 
    // 0_userdata.0.messageHandler.messages.lightSeverity fortgeschrieben.
    // 
    //----------------------
    // - serviceName: 'LIGHTSEVERITY' (dieser Wert ist fix und steuert die Skriptlogik)
    //  

    LIGHT: {serviceName: "LIGHTSEVERITY" },

    //----------------------    
    // Steuerung Datenpunkt (experimentell)
    //----------------------
    // - serviceName: 'ACTION' (dieser Wert ist fix und steuert die Skriptlogik)
    // - setDP: Array von Datenpunkten, die mit der Aktion geschaltet werden sollen.
    //          Im Array sind jeweils die Attribute
    //          dp: Datenpunkt
    //          val: zu setzender Wert im Datenpunkt
    //          zu definieren.
    //  
    // Beispiel Licht Orange Schalten

    LIGHTWARN: {serviceName: "ACTION", 
                            setDP: [ {dp: 'deconz.0.Lights.3.xy', val: [0.6115, 0.3684]},
                                        {dp: 'deconz.0.Lights.3.level', val: 100},
                                        {dp: 'deconz.0.Lights.3.transitiontime', val: 5000},
                                        {dp: 'deconz.0.Lights.3.on', val: true}, 
                                      ]
                },


    // Beispiel Licht Rot Schalten
    LIGHTALARM: {serviceName: "ACTION", 
                            setDP: [ {dp: 'deconz.0.Lights.3.xy', val: [0.7285,0.2707]},
                                        {dp: 'deconz.0.Lights.3.level', val: 100},
                                        {dp: 'deconz.0.Lights.3.transitiontime', val: 5000},
                                        {dp: 'deconz.0.Lights.3.on', val: true}, 
                                      ]
               },

    

};


// ------------------------------------------------------------------------------------- 
// MessageHandler
// ------------------------------------------------------------------------------------- 

class MessageHandler {

    constructor() {
      this.init();
      // beim 1.Start nur die States erzeugen
      if ( !this.existState("version") || (this.getState('version').val!=this.VERSION) ) {
          for (let s=0; s<this.states.length; s++) { this.createState( this.states[s].id ); }
          this.logWarn('first script start, create states for version '+this.VERSION+', please wait 5 seconds and start script again');
          setTimeout( setState, 3000, this.STATE_PATH + 'version', this.VERSION );
      }
      else this.installed = true; 
    }
    
    //
    init() {
        // const
        this.DEBUG      = false;
        this.VERSION    = '0.6/2020-04-25';
        this.NAME       = 'MessageHandler';

		// -----------------------  
		// optional: KONFIGURATION
		// -----------------------  

        // state-Pfad unter dem die States angelegt werden  
		this.STATE_PATH = '0_userdata.0.messageHandler.';
						   
        // Anzahl der Nachrichten für die Ausgabe in VIS
		this.MAX_TABLE_ROWS  = 9999999;  

		// siehe: https://github.com/ioBroker/ioBroker.javascript/blob/master/docs/en/javascript.md#formatdate
		this.DATE_FORMAT     = 'W DD.MM.YYYY hh:mm';

		// -----------------------  
		// ENDE KONFIGURATION
		// -----------------------  
        
        // var
        this.installed = false;
        this.states = [];
        this.subscribers = [];
        this.schedulers = [];
		this.messageList = []; // JSON MessageList in Memory
        this.lightSeverity = undefined;
       
        // init der states
        this.states.push( { id:'version',     common:{name:'installed script-version', write:false, type: 'string', def:this.VERSION} } );
		//this.states.push( { id:'updatePressed',common:{name:'update button pressed', write:true, type:'boolean', def:'false', role:'button' }} );
		this.states.push( { id:'newMessage',     common:{name:'newMessage', write:false, type: 'string', def:""} } );
		this.states.push( { id:'messages.json',     common:{name:'messages as JSON', write:false, type: 'string', def:JSON.stringify(this.messageList)} } );
        this.states.push( { id:'messages.table',      common:{name:'messages as table', write:false, type: 'string', role:'html', def:'' }} );
        this.states.push( { id:'messages.markdown',      common:{name:'messages as markdown', write:false, type: 'string', role:'html', def:'' }} );
        this.states.push( { id:'messages.list',       common:{name:'messages as list', write:false, type: 'string', role:'html', def:'' }} );
        this.states.push( { id:'messages.count',      common:{name:'messages count', write:false, type:'number', def:0 }} );
        this.states.push( { id:'messages.filter',     common:{name:'messages filter', write:true, type: 'string', def:''}} );
        this.states.push( { id:'messages.lastUpdate', common:{name:'messages last update', write:false, type: 'number', def:0 }} );
        this.states.push( { id:'messages.lastClear',  common:{name:'messages last clear', write:false, type: 'number', def:0  }} );
        this.states.push( { id:'messages.clearPressed',common:{name:'messages clear table/list', write:true, type:'boolean', def:false, role:'button' }} );
		this.states.push( { id:'removeMsgID', common:{name:'Entfernen einer Nachricht über msgID', write:true, type:'string', def:'' }} );
        this.states.push( { id:'messages.lightSeverity',     common:{name:'maximal light Severity', write:true, type: 'string', def:''}} );
        //-----------------------------------------------------------------------
        // Definition der Feldattribute, die aus der Nachrichtendefinition vererbt werden für die Ausgabe in VIS/HTML
        // Im Regelfall ist an dieser Systemeinstellung nichts zu ändern.
        //-----------------------------------------------------------------------

        this.MESSAGE_FIELDS_OUTPUT = [
            "msgID", "msgHeader", "msgText", "countEvents",  "firstDate", "lastDate",
            "logType",  "severity", "priority", "quit", "visView", "msgEvent", "mdIcon", "mdIconColor", "fontColor", "backgroundColor", "iconColorHtml"
        ];

        //-----------------------------------------------------------------------
        // Definition der Feldattribute, die in der JSON-Datenstruktur gespeichert werden
        // Hinweis: Alle Felder die nicht in der Liste sind, werden nicht gesichert!
        // Im Regelfall ist an dieser Systemeinstellung nichts zu ändern.
        //-----------------------------------------------------------------------

        this.MESSAGE_FIELDS_DATA = [
            "msgID", "msgHeader", "msgText", "countEvents",  "firstDate", "lastDate"
        ];
    }
    
    // start the script/class
    start() {
        if (!this.installed) {
            this.logWarn('cant start, states for version '+this.VERSION+' missed, please start script again');
            return;
        } 
        if (this.doStart())
            this.log('script started');
    }
    
    // stop the script/class
    stop() {
        if (this.doStop()) {
            this.log('script stopped');
            for (let i=0; i<this.subscribers.length; i++) if (this.subscribers[i] !== undefined) unsubscribe( this.subscribers[i] );
            this.subscribers = [];
            for (let i=0; i<this.schedulers.length; i++) if (this.schedulers[i] !== undefined) clearSchedule( this.schedulers[i] );
            this.schedulers = [];
        }
    }
    

	// start the script/class
    doStart() {
        // JSON Array lesen
		this.messageList = [];
		try {
			this.messageList = JSON.parse(this.getState('messages.json').val);
            // log("MessageList :" + JSON.stringify(this.messageList));
		} catch (ex) {
            this.logError("can not read old JSON Format for messageList!");
			this.messageList = [];
		}
	
		// subscriber erzeugen
        this.subscribers.push( on( {id: this.STATE_PATH+'newMessage', change: 'any'}, obj => { this.onNewMessage(obj) } ));
		this.subscribers.push( on( this.STATE_PATH+'messages.clearPressed', obj => { this.onClearPressed(obj) } ));
        this.subscribers.push( on( new RegExp( this.STATE_PATH+'*.filter' ), obj => { this.onFilter(obj) } ));
		this.subscribers.push( on( this.STATE_PATH+'removeMsgID', obj => { this.removeMsgID(obj) } ));
		this.setStateDelayed ('removeMsgID', '', 2000);
		
        this.onBuildHTML();
        
        return true;
    }
    
	doStop() { return true; }
	
	
	removeMsgID(obj) {
        
        if(this.DEBUG) log("removeMsgID()");

        let instanceID = obj.state.val.toString();

        if (instanceID=='') return;

        //Filtern alle quittierbaren Nachrichten
        for (var i = 0; i < this.messageList.length; i++) { 
            this.messageList[i] = this.setAttributesInMessage(this.messageList[i], this.MESSAGE_FIELDS_OUTPUT);
        }     

        var indexMsg = 0;
        while(indexMsg != -1) {
            indexMsg = this.messageList.findIndex(function(a){ return (a.quit == true && a.lastDate == instanceID)});
            if (indexMsg != -1) {
                if(this.DEBUG) log("Nachricht wurde bereits protokolliert!");
                
                this.messageList.splice(indexMsg,1);
            }
        }   
        
        // Fortschreiben Nachricht in Datenstruktur
        for (var i = 0; i < this.messageList.length; i++) { 
            this.messageList[i] = this.setAttributesInMessage(this.messageList[i], this.MESSAGE_FIELDS_DATA);
        }   
        
        this.setState('messages.json', JSON.stringify(this.messageList));
        //this.setState('messages.lastClear', +new Date()  );
        //this.setState('messages.count', 0);
        //this.setState('messages.clearPressed', false);

        this.onBuildHTML();

    
    }
    
    onClearPressed(obj) {
        
        if(this.DEBUG) log("onClearPressed()");

        if (obj.state.val===true) {

            //Filtern alle quittierbaren Nachrichten
            for (var i = 0; i < this.messageList.length; i++) { 
                this.messageList[i] = this.setAttributesInMessage(this.messageList[i], this.MESSAGE_FIELDS_OUTPUT);
            }     

            var indexMsg = 0;
            while(indexMsg != -1) {
                indexMsg = this.messageList.findIndex(function(a){ return (a.quit == true)});
                if (indexMsg != -1) {
                    if(this.DEBUG) log("Nachricht wurde bereits protokolliert!");
                    
                    this.messageList.splice(indexMsg,1);
                }
            }   
            
            // Fortschreiben Nachricht in Datenstruktur
            for (var i = 0; i < this.messageList.length; i++) { 
                this.messageList[i] = this.setAttributesInMessage(this.messageList[i], this.MESSAGE_FIELDS_DATA);
            }   
            
            this.setState('messages.json', JSON.stringify(this.messageList));
            this.setState('messages.lastClear', +new Date()  );
            this.setState('messages.count', 0);
            this.setState('messages.clearPressed', false);

            
            this.onBuildHTML();

        }
    }
    
    // filter, sort events
    onFilter(obj) {
      this.onBuildHTML();
    }
    
    // Ical table hat sich geändert
    onNewMessage(obj) {
        // if (!obj.newState.ack && obj.newState.val) {
            if(this.DEBUG) this.log('onNewMessage()');
			
			var jsonMsg = JSON.parse(this.getState('newMessage').val);
			
            this.newMessage(jsonMsg);

        //}        
    }

    newMessage(jsonMsg) {
         
        if(this.DEBUG) {
            log("newMessage(jsonMsg) " + JSON.stringify(jsonMsg));
        } 

        let msgType = jsonMsg.msgType;

        //---------------------------------------------------------
        // Vererbe Informationen aus definierter Nachricht oder Defaults
        //---------------------------------------------------------

        jsonMsg = this.setAttributesInMessage(jsonMsg, this.MESSAGE_FIELDS_OUTPUT);
        
        // Set DateTime 	
        jsonMsg.firstDate = +new Date();  // first creation of this messageID
        jsonMsg.lastDate = +new Date();  // last log of this messageID
        
        if(this.DEBUG) {
            log("newMessage(jsonMsg) - After setting values OUTPUT: " + JSON.stringify(jsonMsg));
        } 
        
        // Sofern die Nachricht nur einmal geloggt wird, prüfe ob die Nachricht bereits in der Liste ist.
        // Ist dies der Fall werden die vorhandenen Nachrichten entfernt!
        
        if(msgType == "INSERT" ) {

            if(jsonMsg.logType == "LAST") {
                var indexMsg = 0;
                while(indexMsg != -1) {
                    indexMsg = this.messageList.findIndex(function(a){ return (a.msgID == jsonMsg.msgID)});
                    if (indexMsg != -1) {
                        if(this.DEBUG) log("Nachricht wurde bereits protokolliert!");
                        
                        this.messageList.splice(indexMsg,1);
                    }
                }
            }
            
			// Auslösen Nachrichtenereignis (sofern definiert)
			this.msgEvent(jsonMsg);
		
            // Entfernen aller nicht relevanter Felder im JSON zur Speicherung in der Liste
            jsonMsg = this.setAttributesInMessage(jsonMsg, this.MESSAGE_FIELDS_DATA);

            if(this.DEBUG) {
                log("newMessage(jsonMsg) - After setting values DATA: " + JSON.stringify(jsonMsg));
            } 

            // Einfügen Nachricht in die Liste
            this.messageList.push(jsonMsg); 

            // Fortschreiben Nachricht in Datenstruktur
            this.setState('messages.json', JSON.stringify(this.messageList));

            // Build HTML
            this.onBuildHTML();
            
        } else if(msgType == "DELETE") {

            // Entfernen Nachrichten mit gleicher msgID in Liste
            var indexMsg = 0;
            while(indexMsg != -1) {
                indexMsg = this.messageList.findIndex(function(a){ return (a.msgID == jsonMsg.msgID)});
                if (indexMsg != -1) {
                    if(this.DEBUG) log("Nachricht wird entfernt!");
                    
                    this.messageList.splice(indexMsg,1);
                }
            }

            // Fortschreiben Nachricht in Datenstruktur
            this.setState('messages.json', JSON.stringify(this.messageList));

            // Build HTML
            this.onBuildHTML();
        }
    }


    /*
     Aufbereitung einer Nachricht für Ausgabe in VIS / Speicherung
     Es werden nur die Felder in der Nachricht aufbereitet, die in messageFields vorhanden sind
     */
    setAttributesInMessage(inputJsonMsg, messageFields) {

        if(this.DEBUG) log("setAttributesInMessage - input: " + JSON.stringify(inputJsonMsg));

        let jsonMsg = {};

        for (let msgField of messageFields) {

            let msgFieldVal = msgField.valueOf()
            //log("msgField:" + msgField + " Value: " + inputJsonMsg[msgFieldVal]);
            if(inputJsonMsg[msgFieldVal] !== undefined) {
                jsonMsg[msgFieldVal] =inputJsonMsg[msgFieldVal].valueOf();
                //log("set JsonMsg[msgField]" + JSON.stringify(jsonMsg));
            } else  {
                //if(this.DEBUG) log("Attribute:" + msgField + " Value: '' ");
                jsonMsg[msgFieldVal] ='';
            }
        }

        //log("setAttributesInMessage - 2: " + JSON.stringify(jsonMsg));

        for(let defMsgId in MESSAGE_IDS) {    
            //log("msgId:" + defMsgId + " Value: " + jsonMsg['msgID'].valueOf() + " ValueOF:" + defMsgId.valueOf());
            if(jsonMsg['msgID'].valueOf() == defMsgId.valueOf()) {
                // log("Found Defined MSG-ID" + defMsgId);

                for(let attr in MESSAGE_IDS[defMsgId.valueOf()]) {
                    if(messageFields.includes(attr)) {
                        // log("attr:" + attr + " MESSAGE_IDS: " + MESSAGE_IDS[defMsgId][attr] + "jsonMsg[attr]:" + jsonMsg[attr.valueOf()] );
                        if(MESSAGE_IDS[defMsgId][attr] != "" && jsonMsg[attr] == '') {
                            // if(this.DEBUG) log("Attribute:" + attr + " Value: "+ MESSAGE_IDS[defMsgId][attr] );
                            jsonMsg[attr.valueOf()] = MESSAGE_IDS[defMsgId][attr].valueOf();
                        }
                    }
                }
            }
        }

        //---------------------------------------------------------
        // Vererbe sonstige Informationen aus DEFAULT Nachricht
        //---------------------------------------------------------
            
        for(let defSeverity in MESSAGE_DEFAULTS_BY_SEVERITY) {    
            if(jsonMsg['severity'] == defSeverity) {
                //if(this.DEBUG) log("Found Default Severity" + defSeverity);

                for(let attr in MESSAGE_DEFAULTS_BY_SEVERITY[defSeverity]) {
                   if(messageFields.includes(attr)) {
                        if(MESSAGE_DEFAULTS_BY_SEVERITY[defSeverity][attr] != "" && jsonMsg[attr] == "") {
                            //if(this.DEBUG) log("Attribute:" + attr + " Value: "+ MESSAGE_DEFAULTS_BY_SEVERITY[defSeverity][attr] );
                            jsonMsg[attr] = MESSAGE_DEFAULTS_BY_SEVERITY[defSeverity][attr];
                        }
                    }
                }
            }
        }
        

        if(this.DEBUG) log("setAttributesInMessage - output" + JSON.stringify(jsonMsg));
        return jsonMsg;
    }
        
    onBuildHTML() { try {
            
        let json = [];
        let jsonMsg = {};

        let curDateTime = new Date();

        this.lightSeverity = undefined;

		for (var i = 0; i < this.messageList.length ; i++) {

            //---------------------------------------------------------
            // Vererbe Informationen aus definierter Nachricht oder Defaults
            //---------------------------------------------------------

            jsonMsg = this.setAttributesInMessage(this.messageList[i], this.MESSAGE_FIELDS_OUTPUT);

            // Formatierung Datum / Zeit
            jsonMsg.lastDateTime = formatDate(jsonMsg.lastDate, "SS:mm");    			

            // Formatierung Datum / Zeit
            let msgDateTime = new Date(jsonMsg.lastDate);
            if(this.isSameDay(msgDateTime, curDateTime)) {
                jsonMsg.lastDateDay = "Heute";
            } else if(this.isYesterday(curDateTime, msgDateTime)) {
                jsonMsg.lastDateDay = "Gestern";
            } else if(this.isSameMonth(msgDateTime, curDateTime)) {
                jsonMsg.lastDateDay = formatDate(jsonMsg.lastDate, "TT.");    
            } else {
                jsonMsg.lastDateDay = formatDate(jsonMsg.lastDate, "TT.MM.YY");    
            }

            jsonMsg.showCount = jsonMsg.countEvents > 0 ? "flex" : "none";
            jsonMsg.countEventsMarkdown = jsonMsg.countEvents > 0 ? "*" + jsonMsg.countEvents +"*" : "";

            // Swipe Delete
            jsonMsg.mduiSwipeDelete = jsonMsg.quit ? 
			    `mdui-swipe-left?dist:64;background:red;icon:delete;text:Löschen;action:setValue(`+this.STATE_PATH+`removeMsgID,` + jsonMsg.lastDate + `)` : "";

            // Delete Button (Nur für "No Swipe"-Geräte)
            jsonMsg.mduiNoSwipeDelete = jsonMsg.quit ? 
			    `<div class='mdui-navitem mdui-show-notouch mdui-center
                           mdui-tooltip?text:Löschen+des+Eintrags 
                           mdui-click?action:setValue(` + this.STATE_PATH+`removeMsgID,`  + jsonMsg.lastDate + `)' style='flex:0 0.9em;' >
					  <i class='mdui-icon'>clear</i>
				</div>` : "";


            // Swipe Change View
            jsonMsg.mduiSwipeChangeView = "";
            if(this.clearStr(jsonMsg.visView)) {
                jsonMsg.mduiSwipeChangeView = 
                    `mdui-swipe-right?dist:64;background:blue;icon:exit_to_app;action:changeView(` + jsonMsg.visView +`)`; 
            } 
                                // Sending simple Markdown, because Markdown V2 does not support Unicode Characters?
            jsonMsg.msgTextMD =  this.clearStr(jsonMsg.msgText);
            jsonMsg.msgTextMD =  this.htmlToMarkdown(jsonMsg.msgTextMD);
            jsonMsg.msgTextMD = this.removeMarkdown(jsonMsg.msgTextMD, null);
            
            
            jsonMsg.msgHeaderMD =  this.clearStr(jsonMsg.msgHeader);


            // Touch/Click Change View
            jsonMsg.mduiClickChangeView=  "";
            if(this.clearStr(jsonMsg.visView)) {
                jsonMsg.mduiClickChangeView = 
                    `mdui-tooltip?text:View+aufrufen mdui-click?action:changeView(` + jsonMsg.visView +`)`; 

            } 


            // No Swipe Change View Button
            jsonMsg.mduiNoSwipeChangeView =  "";
            if(this.clearStr(jsonMsg.visView)) {
                jsonMsg.mduiNoSwipeChangeView = 
                    `<div class='mdui-navitem mdui-show-notouch mdui-center
                            mdui-tooltip?text:View+aufrufen 
                            mdui-click?action:changeView(` + jsonMsg.visView + `)' style='flex:0 0.9em;' >
                        <i class='mdui-icon'>exit_to_app</i>
                    </div>`;
            } 

            // Font color
            jsonMsg.fontColor = this.getFontColor( '#000000'); 

            if(this.DEBUG) {
                log("onBuildHTML(jsonMsg) Message Values: " + JSON.stringify(jsonMsg));
            } 
            
            // Auslösen Nachrichtenereignis LIGHTSEVERITY 
            // führt zur Neubestimmung in jedem HTML Aufbau (d.h. bei Skriptstart / Entfernen und einfügen von nachrichten)
        	this.msgEvent(jsonMsg, 'LIGHTSEVERITY');

            json.push( jsonMsg );
        }   


        this.setState('messages.lightSeverity', this.clearStr(this.lightSeverity));  

        //-----------------------------------------------
        // Sort Messages
        // First after priority ERROR -> WARNING -> DEBUG -> INFO
        // Then Sort Timestamps in priorities
        //-----------------------------------------------

        // FIXME Sortieren vor Einfügen in der Liste (damit wird nur ein Element sortiert!)
        json.sort(this.compareNodesTimestampsAfterPriority.bind(this)); 

            
        // build table/list HTML
        let filter = '';
        let ts = 0;
        let idState = 'messages';
        
        if (this.existState(idState+'.filter')) filter = this.getState(idState+'.filter').val;
        if (this.existState(idState+'.lastClear')) ts = this.getState(idState+'.lastClear').val;

        this.convertJSON2HTML(json, idState, filter);
        this.convertJSON2Markdown(json, idState, filter);
      
    } catch(err) { this.logError( 'onBuildHTML: '+err.message ); }  }
    
	/**
	 * Convert JSON 2 HTML for Material Design Widget Listview / Listtable
	 */
	convertJSON2HTML(json, idState, filter) {

		const tmpTable = {
		header : 
		`<tr>
            <th style='text-align:left;'>Nachricht</th>
            <th style='text-align:left;'>Anzahl</th>
            <th style='text-align:left;'>Zeit</th>
		</tr>`,
		row : 
		`<tr>
		    <td>
                <span style="font-weight: bold;">{msgHeader}</span>
                <br/>
                {msgText}
            </td>
		    <td><div style="display:{showCount}; align-items: center;justify-content: center;width:20px;border-radius:1em;">{countEvents}</div></td>
		    <td>
                <span style="font-size:0.9em; margin:4px; opacity:.8; text-align:right;">{lastDateDay}</span>
                <br/>
                <span style="font-size:0.9em; margin:4px; opacity:.8; text-align:right;">{lastDateTime}</span>
            </td>
		</tr>`
		}


		const tmpList = {
		row : 
		`<div class="mdui-listitem {mduiClickChangeView} {mduiSwipeDelete} {mduiSwipeChangeView}" style="display:flex;" >
            <div class="mdui-icon {mdIconColor} mdui-center" style='width:32px; flex:1 0 2.5em;'>{mdIcon}&nbsp;</div>
            <div style='width:calc(100% - 125px); flex:1 1 auto; display:flex; flex-wrap:wrap;'>
                <div class='mdui-label' style='flex:1 0 100%;'>{msgHeader} </div> 
                <div class='mdui-subtitle' style='padding-right:0.5em;word-wrap:break-word;' >{msgText}</div>
            </div>           

            <div class="mdui-subtitle mdui-center" style="width:40px;">            
                <div class="{backgroundColor} mdui-center" style="display:{showCount}; align-items: center; justify-content: center; border-radius:1em;">&nbsp;{countEvents}&nbsp;</div>
            </div>

            <div class="mdui-subtitle mdui-center" style="width:40px;">            
                <div class='mdui-label' style='font-size:0.9em; margin:4px; opacity:.8; text-align:center;'>{lastDateDay}<br/>{lastDateTime}</div>                 
            </div>
            <div class="mdui-subtitle mdui-show-notouch" style="width:20px;">
                {mduiNoSwipeChangeView}
                {mduiNoSwipeDelete}
            </div>  
		</div>`}

		// build htmlTable and htmlList
		let htmlTable  = "<table><thead>"+tmpTable.header+"</thead><tbody>";
		let htmlList  = "";
		let entry, tr;
		let count = 0;

		// filter as regex?
		if ( filter!==undefined && typeof filter == 'string' && filter.startsWith('/') && filter.endsWith('/') && (filter.length>=2) )  {
			filter = new RegExp(filter.substr(1,filter.length-2), 'i');
		}

		for (var i = 0; i < json.length && count < this.MAX_TABLE_ROWS; i++) { 
			entry = json[i];

			if (this.fitsFilter(':'+entry.severity + ':' + entry.datetime + ':' + entry.msgHeader + ':' + entry.msgText + ':',filter)) {

				tr = tmpTable.row;   
				for (let [key, value] of Object.entries(entry)) {
                    var replace = '{'+key+'}';
                    var re = new RegExp(replace,"g");
                    tr = tr.replace(re, value);
                }
				htmlTable+=tr;
				tr = tmpList.row;    
				for (let [key, value] of Object.entries(entry)) {
                    var replace = '{'+key+'}';
                    var re = new RegExp(replace,"g");
                    tr = tr.replace(re, value);
                }
				htmlList+=tr;
				count++;
			}
		
		}
		htmlTable+="</body></table>";    
	    this.setState(idState+'.table', htmlTable);  
		this.setState(idState+'.list', htmlList);  
		this.setState(idState+'.count', count);  
		this.setState(idState+'.lastUpdate', +new Date());   
	}

	/**
	 * Convert JSON 2 MARKDOWN for Lovelace
	 */
	convertJSON2Markdown(json, idState, filter) {

		const tmpTable = {
		header : 
		`>\n| Symbol                                                       | Beschreibung                                                 | Anzahl |             Zeit |
| :----------------------------------------------------------- | :----------------------------------------------------------- | :----: | ---------------: |\n`,
		
        // Example
        // | <font color="#FF0000"> <ha-icon icon="mdi:security" style="font-color:red"></font></ha-icon> | **Lüftungserinnerung** <br />Bitte lüften in den folgenden Räumen:["Bad","Arbeitszimmer","Erik","Wohnzimmer"] |  *5*   | Heute<br />15:15 |
        row : 
		`| <font color="{iconColorHtml}"> <ha-icon icon="mdi:{mdIcon}"></font></ha-icon> | **{msgHeaderMD}** <br />{msgTextMD}|  {countEventsMarkdown}  | {lastDateDay}<br />{lastDateTime} |\n`
		}


		// build htmlTable and htmlList
		let htmlTable  = tmpTable.header;
		let htmlList  = "";
		let entry, tr;
		let count = 0;

		// filter as regex?
		if ( filter!==undefined && typeof filter == 'string' && filter.startsWith('/') && filter.endsWith('/') && (filter.length>=2) )  {
			filter = new RegExp(filter.substr(1,filter.length-2), 'i');
		}

		for (var i = 0; i < json.length && count < this.MAX_TABLE_ROWS; i++) { 
			entry = json[i];

			if (this.fitsFilter(':'+entry.severity + ':' + entry.datetime + ':' + entry.msgHeader + ':' + entry.msgText + ':',filter)) {

				tr = tmpTable.row;   
				for (let [key, value] of Object.entries(entry)) {
                    var replace = '{'+key+'}';
                    var re = new RegExp(replace,"g");
                    tr = tr.replace(re, value);
                }
				htmlTable+=tr;

				count++;
			}
		
		}
		
	    this.setState(idState+'.markdown', htmlTable);  
		
		
	}

    

    compareNodesTimestampsAfterPriority (a, b) {
        var aSize = a.priority == undefined ? 0 : a.priority;
        var bSize = b.priority == undefined ? 0 : b.priority;
        var aLow = a.lastDate;
        var bLow = b.lastDate;

        if(aSize == bSize) {
            return (aLow < bLow) ? 1 : (aLow > bLow) ? -1 : 0;
        } else {
            return (aSize < bSize) ? 1 : -1;
        }
    }    

    isSameDay(d1,d2) {
        return (d1.getDate()==d2.getDate()) && (d1.getMonth()==d2.getMonth()) && (d1.getFullYear()==d2.getFullYear());
        //  return (formatDate(d1, "TT.MM.YY") ==formatDate(d2, "TT.MM.YY")) ;
    }

    isYesterday(d1,d2) {

        let d = new Date(d1);
        //d.setHours(0,0,0);
        d.setDate(d.getDate()-1);
        return (this.isSameDay(d, d2)) ;
    }

    isSameMonth(d1,d2) {
        return (formatDate(d1, "MM.YY") ==formatDate(d2, "MM.YY")) ;
    }

    //------------------------------------------------------------------------------
    // --------------------- helper functions 
    //------------------------------------------------------------------------------

    logDebug(msg) { if (this.DEBUG) console.log('['+this.NAME+'] '+msg); }
    log(msg) { console.log('['+this.NAME+'] '+msg); }
    logWarn(msg) { console.warn('['+this.NAME+'] '+msg); }
    logError(msg) { console.error('['+this.NAME+'] '+msg); }
    
    // über den $-Operator nachsehen, ob der state bereits vorhanden ist
    // getState().notExists geht auch, erzeugt aber Warnmeldungen!
    existState(id) {
        return ( $(this.STATE_PATH+id).length==0?false:true);
    }

    // über den $-Operator nachsehen, ob der state bereits vorhanden ist
    // getState().notExists geht auch, erzeugt aber Warnmeldungen!
    existGlobalState(id) {
        return ( $(id).length==0?false:true);
    }
    
    // wrapper, adds statepath to state-ID
    getState(id) {
        //this.log("getState(" + this.STATE_PATH + id + ")");
        return getState(this.STATE_PATH + id);
    }
    
    // like setState(), but adds statepath to state_ID and checks if state exists, when not, creates it
    setState(id,value) {
        //this.log("setState(id, value): id + " + id + " val" + value);
        if ( !this.existState(id) ) this.createState(id,value,undefined);
        else setState( this.STATE_PATH + id, value);
    }
	
	// like setStateDelayed(), but adds statepath to state_ID and checks if state exists, when not, creates it
    setStateDelayed(id,value,delay) {
        if ( !this.existState(id) ) this.createState(id,value,undefined);
        else setStateDelayed( this.STATE_PATH + id, value, false, delay);
    }
    
    // like cresteState(), but adds statepath to state_ID and checks if state exists, when not, creates it
    createState(id,value,common) {
        if ( !this.existState(id) ) {
            if (common===undefined) {
                // id im states-Array suchen
                for (var i=0; i<this.states.length; i++) { 
                    if (this.states[i].id==id) {
                        if (this.states[i].hasOwnProperty('common'))
                            common = this.states[i].common;
                       break;
                    }   
                }
            }
            if ( (typeof value === 'undefined') && (common.hasOwnProperty('def'))) value = common.def;
            // unter "0_userdata.0"
            let obj = {};
            obj.type = 'state';
            obj.native = {};
            obj.common = common;
            setObject(this.STATE_PATH + id, obj, (err) => {
                    if (err) {
                        this.log('cant write object for state "' + this.STATE_PATH + id + '": ' + err);
                    } else { 
                        this.log('state "' + this.STATE_PATH + id + '" created');
                    }
            });
    
            setTimeout( setState, 3000, this.STATE_PATH + id, value );
        }
    }
    
    // true, if str contains filter string or regexp 
    fitsFilter(str, filter) {
        if ( (filter===undefined) || !filter || (filter=='') )
            return true;
        if ( filter instanceof RegExp )  {
            if (str.match( filter ) != null) return true;
        } else if (typeof filter == 'string') {
            if(str.includes(filter)) return true;
        }
        return false;        
    }
    
    //
    escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    }

    /**
     * Liefert sauberes String zurück: also '' anstelle von null, false, etc.
     * @param {any}       inputVal
     * @return {string}   Return string
     */
    clearInt(inputVal){
        return (String(inputVal) !== 'undefined') ? inputVal : 0;
    }


    /**
     * Liefert sauberes String zurück: also '' anstelle von null, false, etc.
     * @param {any}       inputVal
     * @return {string}   Return string
     */
    clearStr(inputVal){
        return (String(inputVal) !== 'undefined') ? String(inputVal) : '';
    }

    /**
     * Checks if Array or String is not undefined, null or empty.
     * 08-Sep-2019: added check for [ and ] to also catch arrays with empty strings.
     * @param inputVar - Input Array or String, Number, etc.
     * @return true if it is undefined/null/empty, false if it contains value(s)
     * Array or String containing just whitespaces or >'< or >"< or >[< or >]< is considered empty
     */
    isLikeEmpty(inputVar) {
        if (typeof inputVar !== 'undefined' && inputVar !== null) {
            let strTemp = JSON.stringify(inputVar);
            strTemp = strTemp.replace(/\s+/g, ''); // remove all whitespaces
            strTemp = strTemp.replace(/\"+/g, "");  // remove all >"<
            strTemp = strTemp.replace(/\'+/g, "");  // remove all >'<
            strTemp = strTemp.replace(/\[+/g, "");  // remove all >[<
            strTemp = strTemp.replace(/\]+/g, "");  // remove all >]<
            if (strTemp !== '') {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }
    
    // wandelt eine Farbe im hex-Format (#000000) in ein RGB-Array[2] um
    hexToRGB(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result 
            ? [parseInt(result[1],16),parseInt(result[2],16),parseInt(result[3],16)]
            : [0,0,0];
    };
    
    // Helligkeit berechnen
    getLuminance(r, g, b) {
        var a = [r, g, b].map(function (v) {
            v /= 255;
            return v <= 0.03928
                ? v / 12.92
                : Math.pow( (v + 0.055) / 1.055, 2.4 );
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }
    
    // Kontrast berechnen
    getContrast(rgb1, rgb2) {
        var l1 = this.getLuminance(rgb1[0], rgb1[1], rgb1[2]) + 0.05;
        var l2 = this.getLuminance(rgb2[0], rgb2[1], rgb2[2]) + 0.05;
        if ( l1 > l2 ) return l1 / l2 
        else return l2 / l1;
    }
    
    // liefert die fontColor auf Basis der backgroundColor durch Berechnung
    // des Kontrasts
    getFontColor(backgroundColor) {
        if ( this.getContrast(this.hexToRGB(backgroundColor),this.hexToRGB("#000000")) < 6 ) 
            return "#ffffff";
        else
            return "#000000";
    }
	
	
	/**************************************************************************
	* Senden der Nachricht über die verschiedenen Pushdienste
	/* ************************************************************************* */

	msgEvent(jsonMsg, service=undefined) {
        
        if(this.isLikeEmpty(jsonMsg.msgEvent)) {
            return;
        }

        // We are allowing multiple events for one msgEvent.
        // msgEvent: ['TELEGRAM', 'EMAIL'],
        let msgEventArray = [];
        if (typeof jsonMsg.msgEvent == 'string') {
            // If we just have one sensor as string
            msgEventArray.push(jsonMsg.msgEvent);
        } else {
            msgEventArray = jsonMsg.msgEvent;
        }

        for (const msgEvent of msgEventArray) {
            this.sendMessage(msgEvent, jsonMsg, service);
        }
	}
	
    // Senden eines Nachrichtenereignisses
	sendMessage(msgEvent, jsonMsg, service) {

        // Getting msgEvents Service Data

        for(let defMsgEvent in MESSAGE_EVENTS) {    
            if(defMsgEvent == msgEvent) {
                
                let serviceName = this.clearStr(MESSAGE_EVENTS[defMsgEvent]['serviceName']);

                //----------------------------------------------------------
                // TELEGRAM 
                // {serviceName: 'TELEGRAM', telegramInstance: 'telegram.0', telegramUser: '', telegramChatId: '', maxChar: 4000},
                //----------------------------------------------------------

                if(serviceName == 'TELEGRAM' && service == undefined) {

                    // Format TELEGRAM Message                    
                    // Sending simple Markdown, because Markdown V2 does not support Unicode Characters?
                    let telegramMsg = "*" + this.clearStr(jsonMsg.severity) + "*: " + this.clearStr(jsonMsg.msgHeader) + "\n" + this.clearStr(jsonMsg.msgText);
                    telegramMsg=this.htmlToText(telegramMsg);
                    
                    let telegramInstance = this.clearStr(MESSAGE_EVENTS[defMsgEvent]['telegramInstance']);
                    if (this.isLikeEmpty(telegramInstance) ) {
                        this.logError("[" + defMsgEvent + "] Konfiguration Telegram ist unvollständig: telegramInstance ist nicht definiert!");
                        return;
                    }

                    let telegramUser = this.clearStr(MESSAGE_EVENTS[defMsgEvent]['telegramUser']);

                    if (telegramUser.length > 0) {
                        sendTo(telegramInstance, {user: telegramUser, text: telegramMsg, parse_mode: 'Markdown'}   );
                    }

                    let telegramChatId = this.clearStr(MESSAGE_EVENTS[defMsgEvent]['telegramChatId']);

                    if (telegramChatId.length > 0) {
                        sendTo(telegramInstance, {chatId: telegramChatId, text: telegramMsg, parse_mode: 'Markdown'}   );
                    }

                    if (!(telegramUser.length > 0 || telegramChatId.length > 0)) {
                        if(this.DEBUG) this.log("sendTo(" + telegramInstance + ", {text:" + telegramMsg + ", parse_mode: 'Markdown'});");
                        sendTo(telegramInstance, {text: telegramMsg, parse_mode: 'Markdown'}   );
                    }

                //----------------------------------------------------------
                // LOVELACE 
                // {serviceName: 'LOVELACE', lovelaceInstance: 'lovelace.0',  maxChar: 4000},
                //----------------------------------------------------------

                } else if(serviceName == 'LOVELACE' && (service == undefined || service == 'LOVELACE')) {


                    // Format LOVELACE Message                    
                    // Sending simple Markdown, because Markdown V2 does not support Unicode Characters?
                    let msgHeader = "*" + this.clearStr(jsonMsg.severity) + "*: " + this.clearStr(jsonMsg.msgHeader) 
                    msgHeader=this.htmlToText(msgHeader);

                    let icon = 
                    'content: |\n' +
                    '  <ha-icon icon=\"mdi:home-assistant\"></ha-icon>\n' +
                    'type: markdown';

                    let msgText = this.clearStr(jsonMsg.msgText);
                    msgText=this.htmlToText(msgText);
                    
                    let lovelaceInstance = this.clearStr(MESSAGE_EVENTS[defMsgEvent]['lovelaceInstance']);
                    if (this.isLikeEmpty(lovelaceInstance) ) {
                        this.logError("[" + defMsgEvent + "] Konfiguration LOVELACE ist unvollständig: lovelaceInstance ist nicht definiert!");
                        return;
                    }
                    
                    if(jsonMsg.logType == "LAST") { 
                        sendTo(lovelaceInstance, 'send', {message: msgText, title: msgHeader, notification_id: jsonMsg.msgID}); // full version

                    } 
                    
              

                //----------------------------------------------------------
                // PUSHOVER
                // {serviceName: 'PUSHOVER', pushoverInstance: 'pushover.0', pushoverDevice: '', pushoverSound: '', pushoverPriority:0, maxChar: 4000},
                //----------------------------------------------------------

                } else if(serviceName == 'PUSHOVER' && service == undefined) {

                    // Format PUSHOVER Message                    
                    let pushoverMsgHeader = "</b>" + this.clearStr(jsonMsg.severity) + "</b>: " + this.clearStr(jsonMsg.msgHeader);
                    pushoverMsgHeader=this.htmlToText(pushoverMsgHeader);

                    let pushoverMsgText = this.htmlToText(this.clearStr(jsonMsg.msgText));

                    let pushoverInstance = this.clearStr(MESSAGE_EVENTS[defMsgEvent]['pushoverInstance']);
                    if (this.isLikeEmpty(pushoverInstance) ) {
                        this.logError("[" + defMsgEvent + "] Konfiguration Pushover ist unvollständig: pushoverInstance ist nicht definiert!");
                        return;
                    }

                    let pushoverDevice = this.clearStr(MESSAGE_EVENTS[defMsgEvent]['pushoverDevice']);

                    let pushoverSound = this.clearStr(MESSAGE_EVENTS[defMsgEvent]['pushoverSound']);
                    if (pushoverSound.length == 0) {
                        pushoverSound = "none";
                    }

                    let pushoverPriority = this.clearInt(MESSAGE_EVENTS[defMsgEvent]['pushoverPriority']);
                    let pushoverRetry = this.clearInt(MESSAGE_EVENTS[defMsgEvent]['pushoverRetry']);
                    let pushoverExpire = this.clearInt(MESSAGE_EVENTS[defMsgEvent]['pushoverExpire']);

                    if(this.DEBUG) this.log("sendTo(" + pushoverInstance + ", {title:" + pushoverMsgHeader 
                                                                         + ", message:" + pushoverMsgText 
                                                                         + ", device:" + pushoverDevice 
                                                                         + ", priority:" + pushoverPriority 
                                                                         + ", retry:" + pushoverRetry 
                                                                         + ", expire:" + pushoverExpire 
                                                                         + ", sound:" + pushoverSound 
                                                                         + ", html: 1});");
                    
                    sendTo(pushoverInstance, {title: pushoverMsgHeader, 
                                                message: pushoverMsgText, 
                                                device: pushoverDevice,
                                                priority: pushoverPriority, 
                                                sound: pushoverSound,
                                                retry: pushoverRetry,
                                                expire: pushoverExpire,
                                                html: 1}   );

            
                //----------------------------------------------------------
                // EMAIL
                // EMAIL: {serviceName: 'EMAIL', emailInstance: 'email.0', emailFrom: '', emailTo: [''] },
                //----------------------------------------------------------

                } else if(serviceName == 'EMAIL' && service == undefined)  {

                    let emailSubject = this.htmlToText(this.clearStr(jsonMsg.severity) + ": " + this.clearStr(jsonMsg.msgHeader));
                    let emailText = this.htmlToText(this.clearStr(jsonMsg.severity) + ": " + this.clearStr(jsonMsg.msgHeader) + "<br><br>" + this.clearStr(jsonMsg.msgText));

                    let emailInstance = this.clearStr(MESSAGE_EVENTS[defMsgEvent]['emailInstance']);
                    let emailFrom = this.clearStr(MESSAGE_EVENTS[defMsgEvent]['emailFrom']);
                    let emailTo = this.clearStr(MESSAGE_EVENTS[defMsgEvent]['emailTo']);

                    if(emailTo.length > 0) {
                        for (let a = 0; a < emailTo.length; a++) {
                            
                            let context =  {
                                    text: emailText,
                                    to: emailTo[a],
                                    subject: emailSubject,
                                    from: emailFrom
                                    //attachments:[{path: '/tuer/alarm1.jpg', cid: "file1"},]
                            };

                            sendTo("email", "send", context);
                            this.log("sendTo(email, send, " + JSON.stringify(context) + ');');
                        }
                    } else {
                        let context =  {
                                text: emailText,
                                subject: emailSubject,
                                from: emailFrom
                                //attachments:[{path: '/tuer/alarm1.jpg', cid: "file1"},]
                        };

                        sendTo("email", "send", context);
                        this.log("sendTo(email, send, " + JSON.stringify(context) + ');');
                    }
                
                } else if(serviceName == 'ACTION' && service == undefined)  {

                    /*
                    serviceName: "ACTION", 
                            action: [ {dp: 'deconz.0.Lights.3.xy', val: '0.6115,0.3684'},
                                        {dp: 'deconz.0.Lights.3.level', val: 100},
                                        {dp: 'deconz.0.Lights.3.transitiontime', val: 5000},
                                        {dp: 'deconz.0.Lights.3.on', val: true}, 
                                      ]
                    },
                    */
                    let setDP = MESSAGE_EVENTS[defMsgEvent]['setDP'];
 

                    for (const MSGTEXT_KEY of setDP) {
                        let dp = this.clearStr(MSGTEXT_KEY.dp);                    
                        let val = MSGTEXT_KEY.val;                                            
                        
                        if( ! this.isLikeEmpty(dp) && ! this.isLikeEmpty(val)) { 
                            if(! this.existGlobalState(dp)) {
                                this.logError('msgID: [' + jsonMsg.msgID + '] Attribut: [action: dp] Datenpunkt: [' + dp + '] existiert nicht! Bitte Script-Konfiguration überprüfen.');
                            } else {
                                this.log('msgID: [' + jsonMsg.msgID + '] setState("' + dp + '", "' +  val + '");');
                                setState(dp, val);
                            }
                        } 
                                
                    }
                    
                } else if(serviceName == 'LIGHTSEVERITY' && (service == undefined || service == 'LIGHTSEVERITY'))  {
                    
                    if(this.lightSeverity == undefined) {
                        this.lightSeverity = jsonMsg.severity;
                         //this.log("Setze Light Severity auf: " + this.lightSeverity);
                    } else {
                        let msgPriority = MESSAGE_DEFAULTS_BY_SEVERITY[jsonMsg.severity].priority;
                        let curLightPriority = MESSAGE_DEFAULTS_BY_SEVERITY[this.lightSeverity].priority;
                        
                        if(msgPriority >= curLightPriority) {
                            this.lightSeverity = jsonMsg.severity;
                            //this.log("Setze Light Severity auf: " + this.lightSeverity);
                        }
                    }       

                } else {
                    if(service == undefined)
                        this.logError("Nachrichtenereignis: [" + msgEvent + "] - Der Servicename [" + serviceName + "] ist nicht implementiert." );
                }

            }
        }

	}

    //Helper Convert HTML to Text
    htmlToText(text) {
        text = text.replace("</br>", "\n");
        text = text.replace("<br>", "\n");
        text = text.replace(/<\/?[^>]+>/ig, " "); // Remove all HTML-Tags!!!
        return text;
    }

        //Helper Convert HTML to Text
    htmlToMarkdown(text) {
        text = text.replace("</br>", "<br />");
        text = text.replace("<br>", "<br />");
        //text = text.replace(/<\/?[^>]+>/ig, " "); // Remove all HTML-Tags!!!
        return text;
    }

    removeMarkdown(md, options) {
        options = options || {};
        options.listUnicodeChar = options.hasOwnProperty('listUnicodeChar') ? options.listUnicodeChar : false;
        options.stripListLeaders = options.hasOwnProperty('stripListLeaders') ? options.stripListLeaders : true;
        options.gfm = options.hasOwnProperty('gfm') ? options.gfm : true;
        options.useImgAltText = options.hasOwnProperty('useImgAltText') ? options.useImgAltText : true;

        var output = md || '';

        // Remove horizontal rules (stripListHeaders conflict with this rule, which is why it has been moved to the top)
        output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*$/gm, '');

        try {
            if (options.stripListLeaders) {
            if (options.listUnicodeChar)
                output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, options.listUnicodeChar + ' $1');
            else
                output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, '$1');
            }
            if (options.gfm) {
            output = output
                // Header
                .replace(/\n={2,}/g, '\n')
                // Fenced codeblocks
                .replace(/~{3}.*\n/g, '')
                // Strikethrough
                .replace(/~~/g, '')
                // Fenced codeblocks
                .replace(/`{3}.*\n/g, '');
            }
            output = output
            // Remove HTML tags
           // .replace(/<[^>]*>/g, '')
            // Remove setext-style headers
            .replace(/^[=\-]{2,}\s*$/g, '')
            // Remove footnotes?
            .replace(/\[\^.+?\](\: .*?$)?/g, '')
            .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
            // Remove images
            .replace(/\!\[(.*?)\][\[\(].*?[\]\)]/g, options.useImgAltText ? '$1' : '')
            // Remove inline links
            .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1')
            // Remove blockquotes
            .replace(/^\s{0,3}>\s?/g, '')
            // Remove reference-style links?
            .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
            // Remove atx-style headers
            .replace(/^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/gm, '$1$2$3')
            // Remove emphasis (repeat the line to remove double emphasis)
            .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')
            .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')
            // Remove code blocks
            .replace(/(`{3,})(.*?)\1/gm, '$2')
            // Remove inline code
            .replace(/`(.+?)`/g, '$1')
            // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
            .replace(/\n{2,}/g, '\n\n');
        } catch(e) {
            console.error(e);
            return md;
        }
        return output;
    };

	
    test() {
        
        // ------------------------------------------------------------------
        // Beispiele - Senden einer Nachricht
        // postMessage(msgID,  msgText='', countEvents=0, msgHeader='')
        // ------------------------------------------------------------------

        //postMessage("HOUSE_ALARM", "Bewegung im Haus", 50500); // Alarm: Bewegung im Haus
        // postMessage("OPEN_WINDOW_INFO", "Badezimmer");  // Fenster geöffnet im Badezimmer
        // postMessage("WATER_ALARM", "Wasser im Kellerraum."); // Wasseralarm im Kellerraum
        
        //postMessage("WATER_ALARM", "Wasser im Kellerraum."); // Wasseralarm im Kellerraum
       /*
        postMessage("LIGHTS_ON_INFO", "Wohnzimmer, Flur, Küche", 5); // 5 Lichter im Flur, Wohnzimmer und Küche sind angeschaltet
        postMessage("DOOR_ISOPEN_INFO", "Haustür", 1); // Haustür ist geöffnet.
        postMessage("WINDOW_ISOPEN_INFO", "Küche", 2); // 1 Fenster geöffnet
        postMessage("OPEN_WINDOW_INFO", "Küche, Wohnzimmer", 2); // 3 Fenster geöffnet
        postMessage("NEXT_GARBAGE_INFO", "Morgen Gelbe Tonne", 1); // Nächste Müllabholung
        postMessage("LAST_POSTENTRACE_INFO"); // Neuer Posteinwurf Briefkasten
        postMessage("CALENDAR_EVENTS_TODAY", "13:30 Ingo Bingo"); // Heutige Termine
    */

        // ------------------------------------------------------------------
        // Entfernen von Nachrichten
        // ------------------------------------------------------------------

       // removeMessage("HOUSE_ALARM");  // Alarm im Haus
       // removeMessage("WATER_ALARM");    // Wasseralarm
      //  removeMessage("OPEN_WINDOW_INFO");  // Fenster ist offen
        
        //postMessage("HOUSE_ALARM", "Bewegung im Haus"); // Alarm: Bewegung im Haus
        /*
        postMessage("OPEN_WINDOW_INFO", "Badezimmer");  // Fenster geöffnet im Badezimmer
        postMessage("WATER_ALARM", "Wasser im Kellerraum."); // Wasseralarm im Kellerraum
        */

    }   
}   
    
// create instance and start
var messageHandler = new MessageHandler( );
messageHandler.start();

if(messageHandler.installed) {
    // Testfunktion zum Auslösen / Entfernen von Nachrichten
    // im Normalbetrieb ist die folgende Zeile auszukommentieren!
     messageHandler.test();
}

//--------------------------------------------------------
// HTML neu erzeugen bei Tageswechsel
// (um Heute, gestern etc. neu zu bestimmen und anzuzeigen)
//--------------------------------------------------------

schedule({
  hour: 0, minute: 1
}, function() {
    messageHandler.onBuildHTML();
});

// on script stop, stop instance too
onStop(function () { 
	messageHandler.stop(); 
}, 1000 );
    
    
