/*******************************************************************************
 * MessageStateCreator
 * ----------------------------------------------------
 * Ermöglicht die Überwachung von Datenpunkten und das Auslösen von Nachrichten
 * mit dem MessageHandler-Nachrichtensystem.
 * ----------------------------------------------------
 * Autor: Github-Name: St0Ma ioBroker-Forum-Name: Tirador 
 * Source:  https://github.com/St0Ma/ioBroker-MessageHandler
 * Support: https://forum.iobroker.net/topic/32207/script-messagehandler-nachrichten-protokollieren-vis
 * ----------------------------------------------------
 * Change Log:
 *  0.7  - Ergänzung zur Formatierung von Zeitstempel Datenpunkten (Idee von BoehserWolf) 
 *  0.6  - Minor fix DWD
 *  0.5  - Erweiterung um Attribute Wartezeit delayTime und Wiederholungszeit repatTime
 *         Möglichkeit der Zahlenformatierung über Attribute decimals und format
 *  0.4  - Subscriptions nur noch für jeden Datenpunkt einmal, Fehlerausgabe bei fehlerhaften Trigger-DP
 *  0.3  - few code improvements
 *  0.2  - Initial Release
 * ---------------------------------------------------- 
 * (c) 2020 by Tirador, MIT License, no warranty, use on your own risc
 ******************************************************************************


*******************************************************************************
 * Installation
*******************************************************************************

 1. Das Javascript "MessageGlobal" als globales Script installieren und starten.

 2. Den Javascript "MessageHandler" serverseitiges Script installieren und starten-5 Sek warten-stoppen-starten. 
 Beim 1.Start werden die notwendigen States unter STATE_PATH = '0_userdata.0.messageHandler.' 
 erzeugt. Erst beim 2.Start instanziiert das Script die Event-Handler und läuft dann.

 3. Das Javascript "MessageStateCreator" installieren und starten.

*******************************************************************************
 * Basis-Konfiguration
*******************************************************************************

Optional kann in der Funktion MessageHandler|doInit() eine Anpassung der KONFIGURATION vorgenommen werdne.

Zur Konfiguration sind zwei Schritte erforderlich:

1. Die Grundkonfiguration erfolgt über die Festlegung von MESSAGE-IDs (Nachrichten-Ids)
  im Javascript "MessageHandler".

2. Über das Javascript "MessageStateCreator" können Datenpunkte überwacht werden 
   und Nachrichten automatisiert ausgelöst werden. Die Konfiguration erfolgt hierfür im Javascript "MessageStateCreator".

/*******************************************************************************/

// ------------------------------------------------------------------------------------- 
// Konfiguration der zu überwachenden Datenpunkte mit Konfiguration der Nachrichten (MSG-IDs)
// ------------------------------------------------------------------------------------- 

/////////////////////
// Hier die einzelnen Nachrichten anlegen und einstellen.
// Die Konfiguration ist vor dem Skriptstart an die eigenenen Datenpunkte anzupassen!
// nicht benötigte/vorhandene Konfigurationen sind auszukommentieren / zu löschen
// Im ersten Beispiel ist alles im Detail beschrieben.
/////////////////////

const MESSAGE_EVENTS = [

    
    // Anzahl geöffneter Fenster mit Räumen
    // Datenpunkte basieren auf Pitinis Fensterskript
    // GITHUB: https://github.com/Pittini/iobroker-Batterienauswertung
    // Forum IOBroker: https://forum.iobroker.net/topic/31676/vorlage-generische-batteriestands%C3%BCberwachung-vis-ausgabe
    {
		
		// msgID: Eindeutige msgID, die im Javascript "MessageHandler" definiert ist.
		//        Über die msgID erfolgt die Steuerung der 
		//        Priorität, Loglevel (INFO, WARNING, ALARM, ERROR),
		//        die Vorgabe des Icons, der Iconfarbe, ob eine Nachricht nur einmal geloggt wird uvm.
		
        msgID: 'WINDOW_ISOPEN_INFO', 
		
		// Datenpunkte, die als Trigger überwacht werden (auf die bei Veränderung von Werten reagiert wird).
		// Es kann ein Datenpunkt in der Notation '' angegeben werden, oder mehrere wie folgt im Beispiel in der Notation ['', '',...] 
		
        triggerDP: ['javascript.0.FensterUeberwachung.RoomsWithOpenWindows'],
		

		// postMsg: Nachricht nur erzeugen, wenn ein vorgegebener Datenpunkt einer bestimmten Bedingung entspricht.
		//          Im Beispiel müssen die Anzahl der geöffneten Fenster größer als 0 sein,
		//          damit die Nachricht "Fenster geöffnet" ausgelöst wird.
		//          
		//       dp: Datenpunkt dessen Wert der Bedingung entsprichen muss
		//       comp: Vergleichsoperator. Es sind folgende Operatoren erlaubt:
		//             == gleich
		//             != ungleich
		//             >= größer gleich
		//             <= kleiner gleich
		//             >  größer
		//             <  kleiner
		//       val: Wert
		//       
		//       Die Nachricht wird erzeugt, wenn die Bedingung "dp comp val" eintritt.
		//
		//       delayTime: Verzögerungszeit in Sekunden für die Auslösung der Nachricht. 
		//                  In der Logik wird initial geprüft, ob die Bedingung gilt und erneut nach der Delay-Zeit.
		//                  Erst wenn nach der Delay-Zeit auch die Bedingung der Nachricht gilt, wird die Nachricht erzeugt.
		//
		//                  Am Beispiel des Fenstersensors: die Nachricht soll erst ausgelöst werden, 
		//                  wenn das Fenster länger als 60*20 Sekunden (d.h. 20 Minuten) offen ist. 
		// 					In der Praxis macht das Setzen des Delays nur für einzelne Sensoren Sinn 
		//                  (und keine States, die gemeinsame Zustände (z.B. Gruppen von Fenstern abbilden)!)
		//
		//       repeatTime: Wiederholungszeit in Sekunden. Prüft im Intervall in Sekunden, ob die Bedingung der Nachricht gilt.
        //                   Die Nachricht wird frühestens nach der ersten konkreten Auslösung wiederholt.
        //                   Wenn eine Delay-Zeit vorgegeben ist, beginnt die Wiederholungszeit nach der Delay-Zeit 
        //                   (sofern die Bedingung der Nachricht weiterhin gilt).
        //                   Sofern Zwischenzeitlich der Datenpunkt erneut getriggert wird, wird ein bereits ausgelöster Timer
        //                   zur Wiederholung erneut gestartet.
		
        postMsgDP: {dp:'javascript.0.FensterUeberwachung.WindowsOpen', comp: '>', val:0, delayTime:0, repeatTime:0}, 
		
		
		// removeMsgDP: Nachricht entfernen, wenn ein vorgegebener Datenpunkt einer bestimmten Bedingung entspricht.
		//          Im Beispiel wird die Nachricht "Fenster geöffnet" entfernt, 
		//          wenn die Anzahl der geöffneten Fenster gleich 0 ist.
		//
		//       dp: Datenpunkt dessen Wert der Bedingung entsprichen muss
		//       comp: Vergleichsoperator. Es sind folgende Operatoren erlaubt:
		//             == gleich
		//             != ungleich
		//             >= größer gleich
		//             <= kleiner gleich
		//             >  größer
		//             <  kleiner
		//       val: Wert
		//       Die Nachricht wird entfernt, wenn die Bedingung "dp comp val" eintritt.
				
        removeMsgDP: {dp:'javascript.0.FensterUeberwachung.WindowsOpen', comp: '==', val:0}, // Nachricht enfernen, wenn die Bedingung eintritt
		
		// msgText_<Nr> : Diese Attribute bestimmen die Ausgabe des Nachrichtentextes.
		// 
		//                Es kann ein statischer Text ausgegeben werden durch das Attribut text:
		//                Beispiel: 
		//                msgText_1: {text: 'Fenster ist geöffnet'},
		//        
		//                Der Wert eines Datenpunkts kann in die Fehlernachricht mit ausgegeben werden.
		//                Beispiel: 
		//                msgText_2: {dp: 'javascript.0.FensterUeberwachung.RoomsWithOpenWindows'},
        //
        //                In Datenpunkten mit Zahlen kann eine Aufbereitung der Zahl vorgenommen werden 
        //                über die Attribute format und decimals:
        //                Beispiel:
        //                msgText_2: {dp: 'deconz.0.Sensors.18.temperature', format:'"##,#"', decimals:1},
        //
        //                Eine Aufbereitung von Datumsfeldern / Zeitstempeln in Datenpunkten kann 
        //                über eine vorgegebene Notation im Attribut "formatDate" erfolgen.
        //                Die möglichen Notationen sind hier einsehbar:
        //                https://github.com/ioBroker/ioBroker.javascript/blob/master/docs/en/javascript.md#formatdate
        //
        //                Beispiel: Ausgabe des Datenpunkts mit einer Begin-Zeit im Format "TT.MM.YY SS:mm":
        //                msgText_3: {dp: 'dwd.0.warning.begin', formatDate:'TT.MM.YY SS:mm'},
        //                
        //                Die Attribute im einzelnen:
        //                format: '#.###,##' // Ausgabe mit 1000er Trennzeichen Punkt und Komma
        //                decimals: Ausabe mit vorgegebenen Nachkommastellen
		// 
		//                Es können beliebig viele msgText_ Attribute (mit fortlaufender Nummer) 
		//                eingefügt werden (msgText_1, msgText_2, msgText_3, usw.).
		//                Der Nachrichtentext ergibt sich aus der Konkatenation aller einzelner Bausteine.
		
        msgText_1: {text: ''},
        msgText_2: {dp: 'javascript.0.FensterUeberwachung.RoomsWithOpenWindows'},
		
		
		// countEventsDP: Information wieviele Ereignisse für die Meldung eingetreten sind.
		//                Dieses Element ist optional.
		//                Die Anzahl wird über den vorgegebenen Datenpunkt ermittelt.
		// 
        //                Beispiele: Für das Beispiel werden die Anzahl der offenen Fenster ausgegeben.
		
        countEventsDP: 'javascript.0.FensterUeberwachung.WindowsOpen'
    },
    
    // Eigene Nachricht, wenn alle Fenster geschlossen sind (Nur INFO)
    // Datenpunkte basieren auf Pitinis Fensterskript
    // GITHUB: https://github.com/Pittini/iobroker-Batterienauswertung
    // Forum IOBroker: https://forum.iobroker.net/topic/31676/vorlage-generische-batteriestands%C3%BCberwachung-vis-ausgabe
    {
        msgID: 'WINDOW_ISCLOSED_INFO', 
        
        triggerDP: ['javascript.0.FensterUeberwachung.RoomsWithOpenWindows', 'javascript.0.FensterUeberwachung.WindowsOpen'], // , 'javascript.0.FensterUeberwachung.WindowsOpen'
        postMsgDP: {dp:'javascript.0.FensterUeberwachung.WindowsOpen', comp: '==', val:0},
        removeMsgDP: {dp:'javascript.0.FensterUeberwachung.WindowsOpen', comp: '>', val:0}, // Nachricht enfernen, wenn die Bedingung eintritt
        msgText_1: {text: ''},
        msgText_2: {dp: 'javascript.0.FensterUeberwachung.RoomsWithOpenWindows'},
        countEventsDP: 'javascript.0.FensterUeberwachung.WindowsOpen'
    },

    // Nachrichten für länger geöffnete Fenster
    {
        msgID: 'WINDOW_ISLONGEROPEN_GARAGE', 
        triggerDP: ['javascript.0.FensterUeberwachung.Garage.RoomOpenCount'],
        postMsgDP: {dp:'javascript.0.FensterUeberwachung.Garage.RoomOpenCount', comp: '==', val: true, delayTime: 9000, repeatTime:0},  
        removeMsgDP: {dp:'javascript.0.FensterUeberwachung.Garage.RoomOpenCount', comp: '!=', val: true}, // Nachricht enfernen, wenn die Bedingung eintritt
        msgText_1: {text: 'Fenster Garage länger als 15 Minuten geöffnet'},
        countEventsDP: 'javascript.0.FensterUeberwachung.Garage.RoomOpenWindowCount'
    },

    // Nachrichten für länger geöffnete Fenster
    {
        msgID: 'WINDOW_ISLONGEROPEN_HAUS', 
        triggerDP: ['javascript.0.FensterUeberwachung.Haus.RoomOpenCount'],
        postMsgDP: {dp:'javascript.0.FensterUeberwachung.Haus.RoomOpenCount', comp: '==', val: true, delayTime: 9000, repeatTime:0},  
        removeMsgDP: {dp:'javascript.0.FensterUeberwachung.Haus.RoomOpenCount', comp: '!=', val: true}, // Nachricht enfernen, wenn die Bedingung eintritt
        msgText_1: {text: 'Fenster Haus länger als 15 Minuten geöffnet'},
        countEventsDP: 'javascript.0.FensterUeberwachung.Haus.RoomOpenWindowCount'
    },


    // Raumklima - Lüftungserinnerung
    // Unterstützung durch Raumklima-Skript / Absolute Feuchte berechnen
    // https://forum.iobroker.net/topic/2313/skript-absolute-feuchte-berechnen
    {
        msgID: 'RAUMKLIMA_INFO', 
        triggerDP: ['javascript.0.Raumklima.Lüften_Liste'],
        postMsgDP: {dp:'javascript.0.Raumklima.Lüften', comp: '==', val: true},  
        removeMsgDP: {dp:'javascript.0.Raumklima.Lüften', comp: '!=', val: true}, // Nachricht enfernen, wenn die Bedingung eintritt
        msgText_1: {text: 'Bitte lüften in den folgenden Räumen:'},
        msgText_2: {dp: 'javascript.0.Raumklima.Lüften_Liste'},
        countEventsDP: 'javascript.0.Raumklima.Lüften_Anzahl'
    },




    // Letzter Briefkasteneinwurf
    // Eine Nachricht wird nur ausgelöst, wenn der Sensor aktiviert wird
    {
        msgID: 'LAST_POSTENTRACE_INFO',
        triggerDP: 'deconz.0.Sensors.00158d0002ca119d.open',
        postMsgDP: {dp:'deconz.0.Sensors.00158d0002ca119d.open', comp: '==', val:true},
        msgText_1: {text: ''},
        countEventsDP: ''
    },    

    // Anzahl anwesender Personen mit Personenangabe
    // An- und Abwesenheitserkennung über TR-064-Community-Adapter (von Mic) 
    // (Quelle: https://github.com/Mic-M/iobroker.presence-script-for-tr-064-community-adapter)
    {
        msgID: 'PERSONS_AVAILABLE_INFO', 
        triggerDP: '0_userdata.0.Anwesenheit.Status.presentPersonsString',
        postMsgDP: {dp:'0_userdata.0.Anwesenheit.Status.allPresentPersonsCount'},
        msgText_1: {dp: '0_userdata.0.Anwesenheit.Status.presentPersonsString'},
        countEventsDP: '0_userdata.0.Anwesenheit.Status.allPresentPersonsCount'
    },

    /*
    // Verpasste Anrufe (des Tages)
    // Über TR-064-Community-Adapter
    {
        msgID: 'MISSED_CALLS', 
        triggerDP: 'tr-064.0.calllists.missed.count',
        postMsgDP: {dp:'tr-064.0.calllists.missed.count'},
        msgText_1: {text: 'Anzahl verpasster Anrufe: '},
        msgText_2: {dp: 'tr-064.0.calllists.missed.count'},
        countEventsDP: 'tr-064.0.calllists.missed.count'
    } ,
    */

    // letzter Anruf (des Tages)
    // Über TR-064-Community-Adapter
    {
        msgID: 'LAST_CALL', 
        triggerDP: 'tr-064.0.callmonitor.lastCall.callerName',
        postMsgDP: {dp:'tr-064.0.callmonitor.lastCall.callerName'},
        msgText_1: {text: 'Anrufer: '},
        msgText_2: {dp: 'tr-064.0.callmonitor.lastCall.callerName'},
        msgText_3: {text: '</br>Angerufen: '},
        msgText_4: {dp: 'tr-064.0.callmonitor.lastCall.calleeName'},
        countEventsDP: ''
    } ,


    // Status Alarmanlage
    // über Skript von andreaskos
    // https://forum.iobroker.net/topic/32885/umfassendes-alarmanlagen-skript/3
    {
        msgID: 'HOUSE_ALARM_STATUS', 
        triggerDP: ['javascript.0.Alarmanlage.Output.StatusText'],
        postMsgDP: {dp:'javascript.0.Alarmanlage.Output.Alarm', comp: '==', val: false},  
        removeMsgDP: {dp:'javascript.0.Alarmanlage.Output.Alarm', comp: '==', val: true}, 
        msgText_1: {text: 'Aktiv: '},
        msgText_2: {dp: 'javascript.0.Alarmanlage.Output.StatusText'},
        msgText_3: {text: '<br>'},
        msgText_4: {text: 'Status: '},        
        msgText_5: {dp: 'javascript.0.Alarmanlage.Output.AlarmText'}
    },


    // Status Alarmanlage
    // über Skript von andreaskos
    // https://forum.iobroker.net/topic/32885/umfassendes-alarmanlagen-skript/3
    {
        msgID: 'HOUSE_ALARM_ACTIVE', 
        triggerDP: ['javascript.0.Alarmanlage.Output.Alarm'],
        postMsgDP: {dp:'javascript.0.Alarmanlage.Output.Alarm', comp: '==', val: true},  
        removeMsgDP: {dp:'javascript.0.Alarmanlage.Output.Alarm', comp: '==', val: false}, 
        msgText_1: {text: 'Melder: '},
        msgText_2: {dp: 'javascript.0.Alarmanlage.Output.AlarmingDetector'},
        msgText_3: {text: '<br>'},
        msgText_4: {text: 'Status: '},        
        msgText_5: {dp: 'javascript.0.Alarmanlage.Output.AlarmText'},
        msgText_6: {text: '<br>'},
        msgText_7: {text: 'Aktiv: '},
        msgText_8: {dp: 'javascript.0.Alarmanlage.Output.StatusText'}
    },


    // SONOS_INFO
    // über SONOS-Adapter
    /*
    {
        msgID: 'SONOS_INFO', 
        triggerDP: ['sonos.0.root.192_168_178_44.current_artist', 'sonos.0.root.192_168_178_44.state'],
        msgText_1: {text: '<img src=\''},
        msgText_2: {dp: 'http://iobroker:8082/sonos.0.root.192_168_178_44.current_cover'},
        msgText_3: {text: '\' height=\'50%\' width=\'50%\'></img>'},
        msgText_5: {text: '</br>Künstler: '},
        msgText_6: {dp: 'sonos.0.root.192_168_178_44.current_artist'},
        msgText_7: {text: '</br>Album: '},
        msgText_8: {dp: 'sonos.0.root.192_168_178_44.current_album'}
    },
    */

    // Corona-Statistics
    // über Corona-Adapter
    /*
    {
        msgID: 'CORONA_STATS_CASES', 
        triggerDP: ['coronavirus-statistics.0.Germany.cases', 'coronavirus-statistics.0.Germany.deaths'],
        postMsgDP: {dp:'coronavirus-statistics.0.Germany.cases', format:'"#.###"', decimals:0},
        msgText_1: {text: '☣ Bestätigt: '},
        msgText_2: {dp: 'coronavirus-statistics.0.Germany.cases', format:'"#.###"', decimals:0},
        msgText_3: {text: '</br>♱ Tote: '},
        msgText_4: {dp: 'coronavirus-statistics.0.Germany.deaths', format:'"#.###"', decimals:0},
        countEvents: 'coronavirus-statistics.0.Germany.deaths'
    },
    */

    // Temperatur-Information
    // Außen und Innentemperatur über eigene Sensoren
    {
        msgID: 'TEMPERATURE_INFO', 
        triggerDP: ['deconz.0.Sensors.00158d0002c8cbb1.temperature', 'deconz.0.Sensors.00158d0002b53550.temperature'],
        postMsgDP: {dp:'deconz.0.Sensors.18.temperature'},
        msgText_1: {text: '🌐 '},
        msgText_2: {dp: 'deconz.0.Sensors.00158d0002c8cbb1.temperature', format:'"##,#"', decimals:1},
        msgText_3: {text: ' °C'},
        msgText_5: {text: ' 🏠 '},
        msgText_6: {dp: 'deconz.0.Sensors.00158d0002b53550.temperature', format:'"##,#"', decimals:1},
        msgText_7: {text: ' °C'},
        countEvents: ''
    },

    // Müllabholung - Nächster Mülltermin
    // über Adapter trashschedule
    {
        msgID: 'NEXT_GARBAGE_INFO', 
        triggerDP: ['trashschedule.0.next.daysleft', 'trashschedule.0.next.types'],
        postMsgDP: {dp:'trashschedule.0.next.daysleft'},
        msgText_1: {text: ''},
        msgText_2: {dp: 'trashschedule.0.next.types'},
        msgText_3: {text: ' in '},
        msgText_4: {dp: 'trashschedule.0.next.daysleft'},
        msgText_5: {text: ' Tage(n)'},
        countEvents: 'trashschedule.0.next.daysleft'
    },

    // Batterieüberwachung - Evtl. nächste Batterie zu wechseln 
    // GITHUB: https://github.com/Pittini/iobroker-Batterienauswertung
    // Forum ioBroker: https://forum.iobroker.net/topic/31676/vorlage-generische-batteriestandsüberwachung-vis-ausgabe
    {
        msgID: 'BATTERIE_INFO', 
        triggerDP: ['javascript.0.BatterieUeberwachung.NextExpectedLowBatt'],
        postMsgDP: {dp:'javascript.0.BatterieUeberwachung.NextExpectedLowBatt', comp: '!=', val:''},
        removeMsgDP: {dp:'javascript.0.BatterieUeberwachung.NextExpectedLowBatt', comp: '==', val:''},
        msgText_1: {text: ''},
        msgText_2: {dp: 'javascript.0.BatterieUeberwachung.NextExpectedLowBatt'},
        countEventsDP: ''
    },

    // Batterieüberwachung - Evtl. nächste Batterie zu wechseln 
    // GITHUB: https://github.com/Pittini/iobroker-Batterienauswertung
    // Forum ioBroker: https://forum.iobroker.net/topic/31676/vorlage-generische-batteriestandsüberwachung-vis-ausgabe
    {
        msgID: 'BATTERIE_WARN', 
        triggerDP: ['javascript.0.BatterieUeberwachung.LastMessage'],
        postMsgDP: {dp:'javascript.0.BatterieUeberwachung.LastMessage', comp: '!=', val:''},
        removeMsgDP: {dp:'javascript.0.BatterieUeberwachung.LastMessage', comp: '==', val:''},
        msgText_1: {text: ''},
        msgText_2: {dp: 'javascript.0.BatterieUeberwachung.LastMessage'},
        countEventsDP: ''
    },

    // Gefrierschrank geöffnet
    // über eigenen Sensor
    {
        msgID: 'FREEZER_DOOR_ISOPEN_INFO', 
        triggerDP: 'deconz.0.Sensors.00158d00044fb533.open',
        postMsgDP: {dp:'deconz.0.Sensors.00158d00044fb533.open', comp: '==', val:true, delayTime: 60, repeatTime: 600},
        removeMsgDP: {dp:'deconz.0.Sensors.00158d00044fb533.open', comp: '==', val:false}, 
        msgText_1: {text: ''},
    },

    // Kühlschrank geöffnet
    // über eigenen Sensor
    /*
    {
        msgID: 'FRIDGE_DOOR_ISOPEN_INFO', 
        triggerDP: 'deconz.0.Sensors.57.open',
        postMsgDP: {dp:'deconz.0.Sensors.57.open', comp: '==', val:true, delayTime: 90, repeatTime: 3600},
        removeMsgDP: {dp:'deconz.0.Sensors.57.open', comp: '==', val:true}, 
        msgText_1: {text: ''},
    },
    */
    

    // DWD Wetterwarnung 
    // Über DWD-Adapter, erfordert die Konfiguration von 3 Meldungen im Adapter
    {
        msgID: 'DWD_WARN_1', 
        triggerDP: 'dwd.0.warning.severity',
        postMsgDP: {dp:'dwd.0.warning.severity', comp: '!=', val:0, delayTime: 10},
        removeMsgDP: {dp:'dwd.0.warning.severity', comp: '==', val:0},
        msgText_1: {dp: 'dwd.0.warning.headline'},
        msgText_2: {text: '<br>Beginn: '},
        msgText_3: {dp: 'dwd.0.warning.begin', formatDate:'TT.MM.YY SS:mm'},
        msgText_4: {text: '<br>Ende  : '},
        msgText_5: {dp: 'dwd.0.warning.end', formatDate:'TT.MM.YY SS:mm'},
        msgText_6: {text: '<br>'},
        msgText_7: {dp: 'dwd.0.warning.description'},
        countEventsDP: ''
    },

    
    // Wassersensor Werkzeugraum
    // über eigenen Sensor
    {
        msgID: 'WATER_ALARM', 
        triggerDP: 'deconz.0.Sensors.00158d0002411912.water',
        postMsgDP: {dp:'deconz.0.Sensors.00158d0002411912.water', comp: '==', val:true},
        //removeMsgDP: {dp:'deconz.0.Sensors.00158d0002411912.water', comp: '==', val:false}, // Nachricht wird zur Sicherheit nicht entfernt, falls der Sensor toggelt!
        msgText_1: {text: 'Wasseralarm im Werkzeugraum!'},
        countEventsDP: ''
    },

    // Wassersensor Waschraum
    // über eigenen Sensor
    {
        msgID: 'WATER_ALARM', 
        triggerDP: 'deconz.0.Sensors.00158d0002788119.water',
        postMsgDP: {dp:'deconz.0.Sensors.00158d0002788119.water', comp: '==', val:true},
        //removeMsgDP: {dp:'deconz.0.Sensors.00158d0002788119.water', comp: '==', val:false}, // Nachricht wird zur Sicherheit nicht entfernt, falls der Sensor toggelt!
        msgText_1: {text: 'Wasseralarm im Waschraum!'},
        countEventsDP: ''
    },

    // Wassersensor Küche
    // über eigenen Sensor
    {
        msgID: 'WATER_ALARM', 
        triggerDP: 'deconz.0.Sensors.00158d000278817b.water',
        postMsgDP: {dp:'deconz.0.Sensors.00158d000278817b.water', comp: '==', val:true},
        //removeMsgDP: {dp:'deconz.0.Sensors.00158d000278817b.water', comp: '==', val:false}, // Nachricht wird zur Sicherheit nicht entfernt, falls der Sensor toggelt!
        msgText_1: {text: 'Wasseralarm in der Küche!'},
        countEventsDP: ''
    },


    // Wassersensor großer Kellerraum
    // über eigenen Sensor
    {
        msgID: 'WATER_ALARM', 
        triggerDP: 'deconz.0.Sensors.00158d0002788124.water',
        postMsgDP: {dp:'deconz.0.Sensors.00158d0002788124.water', comp: '==', val:true},
        //removeMsgDP: {dp:'deconz.0.Sensors.00158d0002788124.water', comp: '==', val:false}, // Nachricht wird zur Sicherheit nicht entfernt, falls der Sensor toggelt!
        msgText_1: {text: 'Wasseralarm im großen Kellerraum!'},
        countEventsDP: ''
    },


    // Logitech Harmony
    // Über Harmony-Adapter
    {
        msgID: 'HARMONY_INFO', 
        triggerDP: 'harmony.0.Harmonyhub.activities.currentActivity',
        postMsgDP: {dp:'harmony.0.Harmonyhub.activities.currentActivity', comp: '!=', val:'PowerOff'},
        removeMsgDP: {dp:'harmony.0.Harmonyhub.activities.currentActivity', comp: '==', val:'PowerOff'}, // Nachricht wird zur Sicherheit nicht entfernt, falls der Sensor toggelt!
        msgText_1: {text: 'Aktivität: '},
        msgText_2: {dp: 'harmony.0.Harmonyhub.activities.currentActivity'},
        countEventsDP: ''
    },
    

    // Spritpreis-Info 
    // über tankerkoenig-Adapter
    {
        msgID: 'TANK_INFO', 
        triggerDP:  ['tankerkoenig.0.stations.cheapest.e5.feed','tankerkoenig.0.stations.cheapest.diesel.feed'],
        postMsgDP: {dp:'tankerkoenig.0.stations.cheapest.e5.feed', comp: '>', val:0},
        removeMsgDP: {dp:'tankerkoenig.0.stations.cheapest.e5.feed', comp: '==', val:0},
        msgText_1: {text: 'DIESEL: '},
        msgText_2: {dp: 'tankerkoenig.0.stations.cheapest.diesel.name'},
        msgText_3: {text: ': '},
        msgText_4: {dp: 'tankerkoenig.0.stations.cheapest.diesel.feed', format:'"#.##"', decimals:2},
        msgText_5: {text: ' €'},
        msgText_6: {text: '</br>SUPER:'},
        msgText_7: {dp: 'tankerkoenig.0.stations.cheapest.e5.name'},
        msgText_8: {text: ': '},
        msgText_9: {dp: 'tankerkoenig.0.stations.cheapest.e5.feed', format:'"#.##"', decimals:2},
        msgText_10: {text: ' €'},
        countEventsDP: ''
    },    


    // Update ioBroker
    // über Admin-Adapter
    {
        msgID: 'UPDATE_INFO', 
        triggerDP: 'admin.0.info.updatesList',
        postMsgDP: {dp:'admin.0.info.updatesNumber', comp: '>', val:0},
        removeMsgDP: {dp:'admin.0.info.updatesNumber', comp: '==', val:0},
        msgText_1: {text: 'Adapter: '},
        msgText_2: {dp: 'admin.0.info.updatesList'},
        msgText_3: {text: '. Bitte aktualisieren.'},
        countEventsDP: 'admin.0.info.updatesNumber'
    },

    // Deconz Warnung, wenn Verbindung ausgefallen im Adapter
    // über Deconz-Adapter
    {
        msgID: 'DECONZ_Warning', 
        triggerDP: 'deconz.0.info.connection',
        postMsgDP: {dp:'deconz.0.info.connection', comp: '==', val:false},
        removeMsgDP: {dp:'deconz.0.info.connection', comp: '==', val:true},
        msgText_1: {text: 'Zigbee offline! Deconz-Adapter nicht verbunden!'}
    },
    
    /*
    // Gäste WLAN
    // über tr.064-Adapter
    {
        msgID: 'GUEST_WIFI', 
        triggerDP: 'tr-064.0.states.wlanGuest',
        postMsgDP: {dp:'tr-064.0.states.wlanGuest', comp: '==', val:true},
        removeMsgDP: {dp:'tr-064.0.states.wlanGuest', comp: '==', val:false},
        msgText_1: {text: 'Gäste WLAN eingeschalten'},
        msgText_2: {dp: 'javascript.0.QR-Code.Gast'},
        countEventsDP: ''
    },


    // Internetverbindung Down Fritz!Box
    // Prüfung über UPNP-Adapter 
    // Github: https://github.com/Jey-Cee/ioBroker.upnp
    // ioBroker-Forum: https://forum.iobroker.net/topic/14802/tutorial-vis-fritzbox-status-up-downloadanzeige

    {
       msgID: 'INTERNET_DOWN', 
       triggerDP: 'upnp.0.WANDevice_-_FRITZ!Box_6490_Cable_(kdg).WANDevice.WANCommonInterfaceConfig.GetCommonLinkProperties.NewPhysicalLinkStatus',
       postMsgDP: {dp:'upnp.0.WANDevice_-_FRITZ!Box_6490_Cable_(kdg).WANDevice.WANCommonInterfaceConfig.GetCommonLinkProperties.NewPhysicalLinkStatus', comp: '==', val:'Down'},
       //removeMsgDP: {dp:'upnp.0.WANDevice_-_FRITZ!Box_6490_Cable_(kdg).WANDevice.WANCommonInterfaceConfig.GetCommonLinkProperties.NewPhysicalLinkStatus', comp: '==', val:'Up'}, 
       msgText_1: {text: 'Keine Internetverbindung'},
       countEventsDP: ''
    },
    */
 ];

// ------------------------------------------------------------------------------------- 
// Ab hier keine Konfiguration mehr durchführen!!!
// ------------------------------------------------------------------------------------- 

// ------------------------------------------------------------------------------------- 
// MessageStateCreator
// ------------------------------------------------------------------------------------- 

class MessageStateCreator {
	


    constructor() {
      this.init();
    }
    
    //
    init() {
        // const
        this.DEBUG      = false;
        this.VERSION    = '0.2/2020-04-04';
        this.NAME       = 'MessageStateCreator';
        this.so         = this;

        /****************************************************************************
         * Global variables and constants
         ****************************************************************************/

        this.G_DelayTimers = []; // Delay Timers
        this.G_RepeatTimers = []; // Repeat Timers


        // var
        this.installed = false;
        this.subscribers = [];
        this.schedulers = [];

    }
    
    // start the script/class
    start() {

        if(!this.validate()) {
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
 		
        let triggerDPArray = [];
        let createMsgDPArray = [];
		
		let id = 0;
		
        for(const MsgConf of MESSAGE_EVENTS) {
			
			// Vergabe eindeutiger Id zur Laufzeit für Timer
			// 
			MsgConf.id = id++;
			
			// initialize Timer
		
			this.G_DelayTimers[MsgConf.id] = new myTimer();
            this.G_RepeatTimers[MsgConf.id] = new myTimer();
            
			
            let first = true;
            // We are allowing multiple trigger for one msgID.
            // triggerDP: [{dp: 'javascript.0.FensterUeberwachung.RoomsWithOpenWindows'}, {dp:'javascript.0.FensterUeberwachung.WindowsOpen'}],
            // Ein Datenpunkt kann mehrfach als Trigger in verschiedenen MSGs auftreten, 
            // daher wird der Trigger nur einmal angelegt, pro Datenpunkt
           
            if (typeof MsgConf.triggerDP == 'string') {
                // If we just have one sensor as string
                if(!triggerDPArray.includes(MsgConf.triggerDP)) {
                    triggerDPArray.push(MsgConf.triggerDP);
                    createMsgDPArray.push(MsgConf.triggerDP);
                }
            } else {
                for (let key in MsgConf.triggerDP) {
                    if(!triggerDPArray.includes(MsgConf.triggerDP[key])) {
                        triggerDPArray.push(MsgConf.triggerDP[key]);
                        if(first) {
                            createMsgDPArray.push(MsgConf.triggerDP[key]);
                            first = false;
                        }
                    }
                }
                
            }  
        }
        
        // Mit Skriptstart die Nachrichten auslösen
        for (const msgDP of createMsgDPArray) {
            this.createMessage(msgDP);
        }

        // subscriber erzeugen                    
        for (const triggerDP of triggerDPArray) {
            this.subscribers.push( on( triggerDP, obj => { this.onChangeDP(obj) } ));
        }

        return true;
    }
    
	doStop() { return true; }

    // newMessage
    onChangeDP(obj) {

        if(this.DEBUG) {
            this.log("New Value from state:" + obj.id);
        }

        this.createMessage(obj.id);
    }  

	/*
    / Prüfung auf plausible Konfiguration
	*/
    validate() {
		
		/*
		msgID: 'WINDOW_ISOPEN_INFO', 
        triggerDP: ['javascript.0.FensterUeberwachung.RoomsWithOpenWindows', 'javascript.0.FensterUeberwachung.WindowsOpen'],
        postMsgDP: {dp:'javascript.0.FensterUeberwachung.WindowsOpen', comp: '>', val:0}, // Nachricht erzeugen, wenn der DP geändert wird und der Bedingung entspricht
        removeMsgDP: {dp:'javascript.0.FensterUeberwachung.WindowsOpen', comp: '==', val:0}, // Nachricht enfernen, wenn die Bedingung eintritt
        msgText_1: {text: ''},
        msgText_2: {dp: 'javascript.0.FensterUeberwachung.RoomsWithOpenWindows'},
        countEventsDP: 'javascript.0.FensterUeberwachung.WindowsOpen'
		*/
		
        let errorCount = 0;

        if (this.DEBUG) log('[DEBUG] ' + 'VALIDIERUNG *** START: Prüfung der Script-Konfiguration ***');

        for(const MsgConf of MESSAGE_EVENTS) {

			//-----------------------------------------------------
			// 1. Prüfe, ob msgID vorhanden ist
			// Beispiel: msgID: 'WINDOW_ISOPEN_INFO'
			//-----------------------------------------------------
			
			if (this.isLikeEmpty(MsgConf.msgID)) {
                this.logError('Attribut "msgID" wurde nicht gesetzt in Script-Konfiguration. Bitte Script-Konfiguration überprüfen.'); 
				errorCount++;
            }
            
			//-----------------------------------------------------			
			// 2. Prüfe, ob triggerDP vorhanden ist		
			// Beispiel: triggerDP: ['javascript.0.FensterUeberwachung.RoomsWithOpenWindows', 'javascript.0.FensterUeberwachung.WindowsOpen'],
			//-----------------------------------------------------
			
            if (this.isLikeEmpty(MsgConf.triggerDP)) {
                this.logError('msgID: [' + MsgConf.msgID + '] Attribut: [triggerDP] wurde nicht gesetzt in Script-Konfiguration! Bitte Script-Konfiguration überprüfen.');
                errorCount++;
            }

            // We are allowing multiple trigger for one msgID.
            // triggerDP: ['javascript.0.FensterUeberwachung.RoomsWithOpenWindows', 'javascript.0.FensterUeberwachung.WindowsOpen'],
            let triggerDPArray = [];
            if (typeof MsgConf.triggerDP == 'string') {
                // If we just have one sensor as string
                triggerDPArray.push(MsgConf.triggerDP);
            } else {
                triggerDPArray = MsgConf.triggerDP;
            }

			// Erweiterte Prüfung, ob die trigger-Datenpunkte vorhanden sind
            for (const triggerDP of triggerDPArray) {
				if( !this.isLikeEmpty(triggerDP)) { 
					if(!this.existState(triggerDP)) {
                        this.logError('msgID: [' + MsgConf.msgID + '] Attribut: [triggerDP] Datenpunkt: [' + triggerDP + '] existiert nicht! Bitte Script-Konfiguration überprüfen.');
						errorCount++;
					}
				}
			}
			
			//-----------------------------------------------------
			// 3. Prüfe, ob postMsgDP vorhanden ist			
			// Beispiel: postMsgDP: {dp:'javascript.0.FensterUeberwachung.WindowsOpen', comp: '>', val:0}, // Nachricht erzeugen, wenn der DP geändert wird und der Bedingung entspricht
			//-----------------------------------------------------
			
			errorCount += this.checkField(MsgConf, 'postMsgDP');

              
	  		//-----------------------------------------------------
			// 4. Prüfe, ob msgText vorhanden ist			
			// Beispiel:
			// msgText_1: {text: ''},
			// msgText_2: {dp: 'javascript.0.FensterUeberwachung.RoomsWithOpenWindows'},

			//-----------------------------------------------------

            let msgText = '';
                    

            let MSGTEXT_KEYS = (Object.keys(MsgConf).filter(str => str.includes('msgText_'))); // gibt alle Keys mit 'msgText_' als Array zurück, also z.B. ['msgText_1','msgText_2']

            if (this.isLikeEmpty(MSGTEXT_KEYS)) {
				this.logWarn('msgID: [' + MsgConf.msgID + '] Es wurde kein Nachrichtentext definiert (msgText_1, etc.). Bitte Script-Konfiguration überprüfen.');
				errorCount++;
            } else {

                for (const MSGTEXT_KEY of MSGTEXT_KEYS) {
					let dp = MsgConf[MSGTEXT_KEY].dp;                    
					
					if( ! this.isLikeEmpty(dp)) { 
						if(! this.existState(dp)) {
                            this.logError('msgID: [' + MsgConf.msgID + '] Attribut: [' + MSGTEXT_KEY + '] Datenpunkt: [' + dp + '] existiert nicht! Bitte Script-Konfiguration überprüfen.');
						}
					} 
                            
					let text = MsgConf[MSGTEXT_KEY].text;                    
					if( this.isLikeEmpty(text)  ) {
						//if (this.DEBUG) log('[DEBUG] VALIDIERUNG ' +  MsgConf.msgID + ': In [' + MSGTEXT_KEY + '] wurde kein gültiger Text definiert .');
                    }
                }
			}
			
			//-----------------------------------------------------
			// 5. Prüfe, ob countEventsDP vorhanden ist
			// Beispiel:
            // countEventsDP: 'javascript.0.FensterUeberwachung.WindowsOpen'
			//-----------------------------------------------------
            
			let countEventsDP = 0;
			if(MsgConf.countEventsDP != undefined && ! this.isLikeEmpty(MsgConf.countEventsDP) ) {
				if(! this.existState(MsgConf.countEventsDP)) {
                    this.logError('msgID: [' + MsgConf.msgID + '] Attribut: [countEventsDP] Datenpunkt: [' + MsgConf.countEventsDP  + '] existiert nicht! Bitte Script-Konfiguration überprüfen.');
				}
			}

                            
			errorCount += this.checkField(MsgConf, 'removeMsgDP');

        }	

        if (errorCount == 0) {
            if (this.DEBUG) this.log('[DEBUG] ' + 'VALIDIERUNG *** ENDE: Prüfung der Script-Konfiguration, Ergebnis: keine Fehler ***');
            return true;
        } else {
            this.logError('Insgesamt ' + errorCount + ' Fehler in der Script-Konfiguration gefunden. Daher wird abgebrochen und das Script nicht weiter ausgeführt.');
            return false;
        }
        
    } 

	// Hilfsfunktion zum Prüfen von Feldern
	checkField(MsgConf, field) {
		
		let errorCount = 0;
		
		if (this.isLikeEmpty(MsgConf[field])) {
			if(field == 'postMsgDP') {
                this.log('HINWEIS: msgID: [' + MsgConf.msgID + '] Attribut: [' + field + ']  wurde nicht gesetzt in Script-Konfiguration');
            }
			//errorCount++;
            return errorCount;
		}

		// 3.a) Prüfung [postMsgDp].dp
		let postMsgDP = MsgConf[field].dp;  // VOrher MsgConf['postMsgDP'].dp;

		if( this.isLikeEmpty(postMsgDP)) { 
			if(!this.existState(postMsgDP)) {
                this.logError('msgID: [' + MsgConf.msgID + '] Attribut: [' + field + '] Datenpunkt: [' + postMsgDP + '] existiert nicht!');
				errorCount++;
			}
		} 
		
		// 3.b) Prüfung [postMsgDp].comp

		let condDP = MsgConf[field].comp;   
		if( condDP == undefined) {
			condDP = '==';
		}
		if( this.isLikeEmpty(condDP)) { 
			this.logError('msgID[' + MsgConf.msgID + '] Attribut: [' + field + '] Operator ' + condDP + ' existiert nicht!');
			errorCount++;
		}
		
		if( ! ( condDP == '!=' || condDP == '==' || condDP == '>' || condDP == '<' || condDP == '<=' || condDP == '>=' ) )
		{
			this.logError('msgID: [' + MsgConf.msgID + '] Attribut: [' + field + '] Operator ' + condDP + ' existiert nicht!');
			errorCount++;
		}
		
		return errorCount;
	}

    // createMessage
    createMessage(objID, hasDelay=true) {

        for(const MsgConf of MESSAGE_EVENTS) {
               
            // We are allowing multiple trigger for one msgID.
            // triggerDP: [{dp: 'javascript.0.FensterUeberwachung.RoomsWithOpenWindows'}, {dp:'javascript.0.FensterUeberwachung.WindowsOpen'}],
            let triggerDPArray = [];
            if (typeof MsgConf.triggerDP == 'string') {
                // If we just have one sensor as string
                triggerDPArray.push(MsgConf.triggerDP);
            } else {
                triggerDPArray = MsgConf.triggerDP;
            }

            for (const triggerDP of triggerDPArray) {

				if(triggerDP == objID) {

					if(this.DEBUG) this.log("Trigger ausgelöst:" + triggerDP);               

					let createMsg = this.checkCondition(objID, MsgConf, 'postMsgDP', hasDelay);
					
					let removeMsg = this.checkCondition(objID, MsgConf, 'removeMsgDP', hasDelay);

					if(createMsg || removeMsg) {

						// erzeugen Nachrichtentext aus Vorgabe und Datenpunkten
						let msgText = '';

						let MSGTEXT_KEYS = (Object.keys(MsgConf).filter(str => str.includes('msgText_'))); // gibt alle Keys mit 'msgText_' als Array zurück, also z.B. ['msgText_1','msgText_2']

						if (this.isLikeEmpty(MSGTEXT_KEYS)) {
							this.logWarn('Konfiguration der Textausgabe ' + MsgConf.msgID + 'Es wurde kein Nachrichtentext definiert (msgText_1, etc.). Bitte Script-Konfiguration überprüfen.');
						} else {
							for (const MSGTEXT_KEY of MSGTEXT_KEYS) {
								let dp = MsgConf[MSGTEXT_KEY].dp;  

								if( ! this.isLikeEmpty(dp)) { 
									if(this.existState(dp)) {

                                        let val = getState(dp).val;
                                        // Aufbereitung States Mapping 
                                        let txtStates = this.getStatesObj(dp);
                                        if (txtStates != null) {
                                            
                                            msgText += this.getStatetxt(dp, val) ;

                                        } else {
                                         
                                            let decimals = MsgConf[MSGTEXT_KEY].decimals;                   
                                            let format = MsgConf[MSGTEXT_KEY].format;  
                                            let formatDate = MsgConf[MSGTEXT_KEY].formatDate;  

                                            if( ! this.isLikeEmpty(decimals) && !this.isLikeEmpty(format)) { 
                                                val = formatValue(val, decimals, format);

                                            } else if( !this.isLikeEmpty(formatDate)) { 
                                                 val = formatDate(new Date(val).getTime(), format);
                                            
                                            } else if (!this.isLikeEmpty(format)) {
                                                val = formatValue(val, 0, format);
                                            }
                                            
                                            msgText += val;  
                                        }                                      
                                        
									} else {
									    this.log('Datenpunkt ' + dp + ' existiert nicht! [' + MsgConf.msgID + '].');
									}
								} 
								
								let text = MsgConf[MSGTEXT_KEY].text;                    
								if( this.isLikeEmpty(text)  ) { 
									//if (DEBUG) log('[DEBUG] VALIDIERUNG ' + LPCONF.name + ': In [' + LP_PERIOD_KEY + '] wurden keine Sekunden zum Ausschalten definiert oder auf 0 gesetzt, daher wird nicht automatisch abgeschaltet.');
								} else {
									msgText += text;
								} 

							}
						}
					
						// erzeugen Anzahl
						let countEventsDP = 0;
						if(MsgConf.countEventsDP != undefined && MsgConf.countEventsDP != '') {
							countEventsDP = getState(MsgConf.countEventsDP).val;
						}

						if(createMsg) {
							this.log("postMessage('" + MsgConf.msgID + "', '" + msgText + "', " + countEventsDP + ")");
							// Erzeugen der Nachricht über MessageHandler
							postMessage(MsgConf.msgID, msgText, countEventsDP); 
						}

						if(removeMsg) {
							this.log("removeMessage('" + MsgConf.msgID + "', '" + msgText + "')");
							// Entfernen der Nachricht über MessageHandler
							removeMessage(MsgConf.msgID, msgText); 

						}
                        
                        if(createMsg && removeMsg) {
                            this.logError('msgID: [' + MsgConf.msgID + '] Die Nachricht mit Nachrichtentext "' + msgText + '" wird gleichzeitig erzeugt und entfernt. Bitte Skript-Konfiguration prüfen!' )
                        }
					}
				} // if
			} // for
        } // for
    } 

    getStatesObj(id) {

        if(!getObject(id)) {
            //log(id + ': kein Objekt', 'warn');
            return null;
        }

        var obj = getObject(id);
        if (!obj.common.states) {
            //log(id + ': keine Zustandtexte', 'warn');
            return null;
        }
        var states = obj.common.states;

        if (typeof states == 'string') {
            var arr = states.split(';');
            states = {};
            for(var i = 0; i < arr.length; i++) {
                var ele = arr[i].split(':');
                states[ele[0]] = ele[1];
            }
        }
        return states;

    }

    getStatetxt(id, val) {
        var states = this.getStatesObj(id);
        if(states) return states[val];
        else return null;
    }
	
	checkCondition(objID, MsgConf, field, hasDelay) {

   		if (this.isLikeEmpty(MsgConf[field])) {
			// if(this.DEBUG) this.logWarn(field + ' wurde nicht gesetzt in Script-Konfiguration.');
			// Wenn postMsgDP nicht definiert, Nachricht erzeugen
			// Wenn removeMsgDP nicht definiert ist, wird die Nachricht NICHT gelöscht
			if(field == 'postMsgDP') {
                return true;
            } else if(field == 'removeMsgDP') {
                return false;
            }
            
		}
		
		let dp = MsgConf[field].dp;

		let createMsg = false;

		let comp = MsgConf[field].comp;   

		if( this.isLikeEmpty(comp)) {
			comp = '==';
		}

		let val = MsgConf[field].val;   

 
		if( val == undefined) {
			createMsg = true;
		} else if(comp == '==') {   
			if( getState(dp).val == val) {
				createMsg = true;
			}
		} else if(comp == '!=') {

			if( getState(dp).val != val) {
				createMsg = true;
			}
		} else if(comp == '>') {
			if( getState(dp).val > val) {
				createMsg = true;
			}
		} else if(comp == '<') {
			if( getState(dp).val < val) {
				createMsg = true;
			}
		} else if(comp == '>=') {
			if( getState(dp).val >= val) {
				createMsg = true;
			}
		} else if(comp == '<=') {
			if( getState(dp).val <= val) {
				createMsg = true;
			}
		}

        if(this.DEBUG) this.log('msgID: [' + MsgConf.msgID + '] Datenpunkt: [' + field + '] dp: [' + dp + '] State dp.val: [' + getState(dp).val + '] comp: [' + comp + '] val: [' + val + '] createMsg:' + createMsg);
		
        //-----------------------------------------------------------		
        // Falls Delay-Zeit vorgegeben: Timer prüfen / setzen 
        //-----------------------------------------------------------
        		
        let delayTime = MsgConf[field].delayTime;   

        if( field == 'postMsgDP' && !this.isLikeEmpty(delayTime) && (delayTime > 0) ) {

            if(hasDelay) {
                if (this.G_DelayTimers[MsgConf.id].isRunning()) {

                    if(createMsg == false) {
                        // Der Trigger ist nicht mehr aktiv, aber der Timer läuft, also Stop den Timer
                        this.G_DelayTimers[MsgConf.id].stop();
                    } else {
                        // Wenn innerhalb des Delays erneut getriggert wird verlängert sich nicht die Zeit!
                        this.log('[DEBUG] ' + MsgConf.msgID + '(' + MsgConf.id + '): Check #1: Delay-Timer ist noch aktiv für ' + Math.round(this.G_DelayTimers[MsgConf.id].getTimeLeft()/1000) + ' Sekunden, also schalten wir nicht und brechen hier ab.');
                    }
                    
                } else {
                    // Timer wird nur bei positiver Auslösung gestartet
                    if(createMsg == true) {
                        log('[DEBUG] ' + MsgConf.msgID + '(' + MsgConf.id + '): Start "Delay"-Timer. Die Nachricht wird nach ' + delayTime + ' Sekunden geprüft und eventuell ausgelöst. ');
                        // Timer-Start
                        this.G_DelayTimers[MsgConf.id].start(function() {

                            log('[DEBUG] ' + MsgConf.msgID + '(' + MsgConf.id + ') "Delay"-Timer ist nach ' + delayTime + ' Sekunden abgelaufen. Die Nachricht ' + objID + ' ausgelöst.');
                            this.G_DelayTimers[MsgConf.id].stop(); // just in case
                            this.createMessage(objID, false); // erzeugen Aktion neue Nachricht ohne Delay
                            

                        }.bind(this), delayTime * 1000);
                    }
                }
                createMsg=false;
            } else {
                this.log('[DEBUG] ' + MsgConf.msgID + '(' + MsgConf.id + '): Nachricht hat kein Delay mehr! ');

            }
        }

	
		//-----------------------------------------------------------		
		// Falls Repeat-Zeit vorgegeben: Timer prüfen / setzen 
		// Wenn innerhalb des laufenden Timers eine neue Nachricht ausgelöst wird,
		// wird der Timer zurückgesetzt.
		//-----------------------------------------------------------
		 
		let repeatTime = MsgConf[field].repeatTime;   

		if( field == 'postMsgDP' && !this.isLikeEmpty(repeatTime) && (repeatTime > 0) ) {

			if (this.G_RepeatTimers[MsgConf.id].isRunning()) {
				// Der Timer ist noch aktiv und wird gestoppt
				this.G_RepeatTimers[MsgConf.id].stop();
				log('[DEBUG] ' + MsgConf.msgID + '(' + MsgConf.id + '): Der "Repeat"-Timer wurde zurückgesetzt, weil die Nachricht zwischenzeitlich ausgelöst wurde. ');
			}
			
			// Timer wird nur bei positiver Auslösung gestartet
			if(createMsg == true) {
				log('[DEBUG] ' + MsgConf.msgID + '(' + MsgConf.id + '): Start "Repeat"-Timer. Die Nachricht wird nach ' + delayTime + ' Sekunden erneut geprüft und eventuell ausgelöst. ');
					// Timer-Start
					this.G_RepeatTimers[MsgConf.id].start(function() {

						log('[DEBUG] ' + MsgConf.msgID + '(' + MsgConf.id + ') "Repeat"-Timer ist nach ' + delayTime + ' Sekunden abgelaufen. Die Nachricht ' + objID + ' ausgelöst.');
						this.G_RepeatTimers[MsgConf.id].stop(); // just in case
						this.createMessage(objID, false); // erzeugen Aktion neue Nachricht ohne Delay

					}.bind(this), delayTime * 1000);
			}
		}

		return createMsg;
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
        return ( $(id).length==0?false:true);
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
    

}   


	/**
	 * Better timer function
	 * Features: Find out time remaining, stop timer easily, check status (running yes/no).
	 * Autor:               Mic (ioBroker) | Mic-M (github)
	 * Version:             0.1 (14 March 2020)
	 * Source:              https://stackoverflow.com/questions/3144711/
	 * -----------------------------------------------
	 * Make a timer:
		  let a = new myTimer();
		  a.start(function() {
		   // Do what ever
		  }, 5000);
	 * Time remaining:      a.getTimeLeft()
	 * Stop (clear) timer:  a.stop()
	 * Is timer running:    a.isRunning()
	 * -----------------------------------------------
	 */
	function myTimer() {
		let fcallback;
		let id;
		let started;
		let remaining = 0;
		let running = false;

		this.start = function(callback, delay) {
			fcallback = callback;
			remaining = delay;
			clearTimeout(id);
			id = null;
			running = true;
			started = Date.now();
			id = setTimeout(fcallback, remaining);
		}

		this.pause = function() {
			running = false;
			clearTimeout(id);
			remaining -= Date.now() - started;
		}

		this.stop = function() {
			running = false;
			clearTimeout(id); id = null;
			remaining = 0;
		}

		this.getTimeLeft = function() {
			if (running) {
				this.pause();
				this.start(fcallback, remaining);
				return remaining;
			} else {
				return 0;
			}
		}

		this.isRunning = function() {
			return running;
		}

	}
    
// create instance and start
var messageStateCreator = new MessageStateCreator();
messageStateCreator.start();



// on script stop, stop instance too
onStop(function () { 
	messageStateCreator.stop(); 
}, 1000 );
    
    
